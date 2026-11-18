use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use pulldown_cmark::{html, Options as MarkdownOptions, Parser};
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use walkdir::WalkDir;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SiteConfig {
    pub title: String,
    pub tagline: Option<String>,
    pub description: Option<String>,
    pub url: Option<String>,
    pub baseurl: Option<String>,
    pub markdown: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PostMeta {
    pub title: String,
    pub layout: Option<String>,
    pub date: Option<String>,
    pub author: Option<String>,
    pub categories: Option<Vec<String>>,
    pub tags: Option<Vec<String>>,
    pub description: Option<String>,
    pub hero_image: Option<String>,
    pub featured: Option<bool>,
    pub read_time: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct Post {
    pub meta: PostMeta,
    pub slug: String,
    pub year: String,
    pub month: String,
    pub day: String,
    pub permalink: String,
    pub url: String,
    pub content: String,
    pub raw_markdown: String,
}

pub struct LovelaceSSG {
    pub root_dir: PathBuf,
    pub config: SiteConfig,
    pub site_data: HashMap<String, JsonValue>,
    pub posts: Vec<Post>,
}

impl LovelaceSSG {
    pub fn new<P: AsRef<Path>>(root: P) -> Result<Self, Box<dyn std::error::Error>> {
        let root_dir = root.as_ref().to_path_buf();

        // 1. Load _config.yml
        let config_path = root_dir.join("_config.yml");
        let config_str = fs::read_to_string(&config_path)?;
        let yaml_val: serde_yaml::Value = serde_yaml::from_str(&config_str)?;
        let config: SiteConfig = serde_yaml::from_value(yaml_val.clone())?;

        // 2. Load _data/
        let mut site_data = HashMap::new();
        let data_dir = root_dir.join("_data");
        if data_dir.exists() {
            for entry in fs::read_dir(data_dir)? {
                let entry = entry?;
                let path = entry.path();
                if let Some(ext) = path.extension() {
                    if ext == "yml" || ext == "yaml" {
                        let stem = path.file_stem().unwrap().to_string_lossy().to_string();
                        let content = fs::read_to_string(&path)?;
                        let y_val: serde_yaml::Value = serde_yaml::from_str(&content)?;
                        let j_val: JsonValue = serde_json::to_value(y_val)?;
                        site_data.insert(stem, j_val);
                    }
                }
            }
        }

        // 3. Load and parse posts
        let mut posts = Vec::new();
        let posts_dir = root_dir.join("_posts");
        if posts_dir.exists() {
            for entry in fs::read_dir(posts_dir)? {
                let entry = entry?;
                let path = entry.path();
                if path.extension().map_or(false, |e| e == "md") {
                    let file_name = path.file_name().unwrap().to_string_lossy().to_string();
                    let (year, month, day, slug) = parse_post_filename(&file_name);
                    let raw_text = fs::read_to_string(&path)?;
                    let (front_matter_yaml, body) = extract_front_matter(&raw_text);

                    let meta: PostMeta = match serde_yaml::from_str(&front_matter_yaml) {
                        Ok(m) => m,
                        Err(e) => {
                            eprintln!("Warning: Failed to parse front matter in {}: {}", file_name, e);
                            continue;
                        }
                    };

                    let cat = meta.categories.as_ref()
                        .and_then(|c| c.first())
                        .cloned()
                        .unwrap_or_else(|| "news".to_string());
                    let permalink = format!("/{}/{}/{}/{}/{}/", cat, year, month, day, slug);
                    let html_content = markdown_to_html(&body);

                    posts.push(Post {
                        meta,
                        slug,
                        year,
                        month,
                        day,
                        url: permalink.clone(),
                        permalink,
                        content: html_content,
                        raw_markdown: body,
                    });
                }
            }
        }

        // Sort posts descending by date
        posts.sort_by(|a, b| {
            let d_a = a.meta.date.as_deref().unwrap_or(&a.permalink);
            let d_b = b.meta.date.as_deref().unwrap_or(&b.permalink);
            d_b.cmp(d_a)
        });

        Ok(Self {
            root_dir,
            config,
            site_data,
            posts,
        })
    }

    /// Compile SCSS to CSS using pure Rust `grass`
    pub fn compile_sass(&self) -> Result<String, Box<dyn std::error::Error>> {
        let scss_path = self.root_dir.join("assets/css/style.scss");
        if !scss_path.exists() {
            return Ok(String::new());
        }

        let raw = fs::read_to_string(&scss_path)?;
        let (_, scss_body) = extract_front_matter(&raw);

        let sass_dir = self.root_dir.join("_sass");
        let options = grass::Options::default()
            .load_path(&sass_dir)
            .style(grass::OutputStyle::Compressed);

        let css = grass::from_string(scss_body, &options)?;
        Ok(css)
    }

    /// Build entire static site into `_site` and `dist`
    pub fn build(&self) -> Result<(), Box<dyn std::error::Error>> {
        println!("🦀 Lovelace SSG (Rust v{}) building site...", env!("CARGO_PKG_VERSION"));

        // 1. Compile SCSS
        println!("🎨 Compiling modular SCSS with Rust grass engine...");
        let compiled_css = self.compile_sass()?;
        let css_out = self.root_dir.join("assets/css/style.css");
        fs::write(&css_out, &compiled_css)?;

        // 2. Prepare output directories
        let out_dirs = vec![self.root_dir.join("_site"), self.root_dir.join("dist")];
        for out in &out_dirs {
            fs::create_dir_all(out)?;
            fs::write(out.join(".nojekyll"), "")?;

            // Copy assets
            let assets_src = self.root_dir.join("assets");
            let assets_dest = out.join("assets");
            copy_dir_recursive(&assets_src, &assets_dest)?;
        }

        // 3. Create Template Environment
        let mut env = minijinja::Environment::new();
        let baseurl = self.config.baseurl.clone().unwrap_or_default();
        let site_url = self.config.url.clone().unwrap_or_else(|| "https://irbox.github.io".to_string());

        // Register custom filters
        let b1 = baseurl.clone();
        env.add_filter("relative_url", move |val: minijinja::Value| -> minijinja::Value {
            let s = val.as_str().unwrap_or("");
            let url = if s.is_empty() {
                b1.clone()
            } else {
                format!("{}/{}", b1.trim_end_matches('/'), s.trim_start_matches('/'))
            };
            minijinja::Value::from_safe_string(url)
        });

        let b2 = baseurl.clone();
        let u2 = site_url.clone();
        env.add_filter("absolute_url", move |val: minijinja::Value| -> minijinja::Value {
            let s = val.as_str().unwrap_or("");
            let full_base = format!("{}/{}", u2.trim_end_matches('/'), b2.trim_start_matches('/'));
            let url = if s.is_empty() {
                full_base
            } else {
                format!("{}/{}", full_base.trim_end_matches('/'), s.trim_start_matches('/'))
            };
            minijinja::Value::from_safe_string(url)
        });

        env.add_filter("slugify", |val: minijinja::Value| -> String {
            let s = val.as_str().unwrap_or("");
            slugify(s)
        });

        env.add_filter("strip_html", |val: minijinja::Value| -> String {
            let s = val.as_str().unwrap_or("");
            strip_html_tags(s)
        });

        env.add_filter("truncatewords", |val: minijinja::Value, words: usize| -> String {
            let s = val.as_str().unwrap_or("");
            truncate_words(s, words)
        });

        env.add_filter("jsonify", |val: minijinja::Value| -> String {
            serde_json::to_string(&val).unwrap_or_else(|_| "{}".to_string())
        });

        // Load templates from _includes and _layouts
        self.load_templates_into_env(&mut env)?;

        // Prepare Site Context for rendering
        let site_context = self.build_site_context()?;

        // 4. Render Index (Home)
        println!("📄 Rendering index.html...");
        let index_html = self.render_template_file("index.html", &env, &site_context)?;
        for out in &out_dirs {
            fs::write(out.join("index.html"), &index_html)?;
        }

        // 5. Render Core Pages
        let pages = [
            ("categories.html", "categories/index.html"),
            ("research-areas.html", "research-areas/index.html"),
            ("publications.html", "publications/index.html"),
            ("projects.html", "projects/index.html"),
            ("people.html", "people/index.html"),
            ("404.html", "404.html"),
        ];

        for (src_file, dest_rel) in &pages {
            let src_path = self.root_dir.join(src_file);
            if src_path.exists() {
                println!("📄 Rendering {} -> {}...", src_file, dest_rel);
                let rendered = self.render_template_file(src_file, &env, &site_context)?;
                for out in &out_dirs {
                    let dest = out.join(dest_rel);
                    if let Some(parent) = dest.parent() {
                        fs::create_dir_all(parent)?;
                    }
                    fs::write(dest, &rendered)?;
                }
            }
        }

        // 6. Render About (about.md)
        let about_path = self.root_dir.join("about.md");
        if about_path.exists() {
            println!("📄 Rendering about.md...");
            let raw = fs::read_to_string(&about_path)?;
            let (meta_yaml, body) = extract_front_matter(&raw);
            let page_meta: JsonValue = serde_yaml::from_str(&meta_yaml).unwrap_or(JsonValue::Null);
            let html_body = markdown_to_html(&body);

            let mut page_ctx = serde_json::Map::new();
            page_ctx.insert("site".to_string(), site_context.clone());
            page_ctx.insert("page".to_string(), page_meta);
            page_ctx.insert("content".to_string(), JsonValue::String(html_body));

            let rendered_about = self.render_with_layout_hierarchy("page", &JsonValue::Object(page_ctx), &env)?;
            for out in &out_dirs {
                let dest = out.join("about/index.html");
                fs::create_dir_all(dest.parent().unwrap())?;
                fs::write(dest, &rendered_about)?;
            }
        }

        // 7. Render Posts
        println!("📝 Rendering {} research articles...", self.posts.len());
        for post in &self.posts {
            let mut page_ctx = serde_json::Map::new();
            page_ctx.insert("site".to_string(), site_context.clone());
            let post_val = serde_json::to_value(post)?;
            page_ctx.insert("page".to_string(), post_val);
            page_ctx.insert("content".to_string(), JsonValue::String(post.content.clone()));

            let layout = post.meta.layout.as_deref().unwrap_or("post");
            let rendered_post = self.render_with_layout_hierarchy(layout, &JsonValue::Object(page_ctx), &env)?;

            for out in &out_dirs {
                let rel = post.permalink.trim_start_matches('/');
                let dest = out.join(rel).join("index.html");
                fs::create_dir_all(dest.parent().unwrap())?;
                fs::write(dest, &rendered_post)?;
            }
        }

        // 8. Generate search.json
        println!("🔍 Generating search.json inverted index...");
        let search_json = self.generate_search_index()?;
        for out in &out_dirs {
            fs::write(out.join("search.json"), &search_json)?;
        }

        println!("✨ Site build complete! Generated in _site/ and dist/");
        Ok(())
    }

    fn build_site_context(&self) -> Result<JsonValue, Box<dyn std::error::Error>> {
        let mut map = serde_json::Map::new();
        map.insert("title".to_string(), JsonValue::String(self.config.title.clone()));
        if let Some(ref t) = self.config.tagline {
            map.insert("tagline".to_string(), JsonValue::String(t.clone()));
        }
        if let Some(ref d) = self.config.description {
            map.insert("description".to_string(), JsonValue::String(d.clone()));
        }
        if let Some(ref u) = self.config.url {
            map.insert("url".to_string(), JsonValue::String(u.clone()));
        }
        if let Some(ref b) = self.config.baseurl {
            map.insert("baseurl".to_string(), JsonValue::String(b.clone()));
        }

        // Add site.data
        let data_val = serde_json::to_value(&self.site_data)?;
        map.insert("data".to_string(), data_val);

        // Add site.posts
        let posts_val = serde_json::to_value(&self.posts)?;
        map.insert("posts".to_string(), posts_val);

        // Add current year for copyright
        map.insert("time".to_string(), JsonValue::String("2026-11-18".to_string()));

        Ok(JsonValue::Object(map))
    }

    fn load_templates_into_env(&self, env: &mut minijinja::Environment) -> Result<(), Box<dyn std::error::Error>> {
        // Load _includes
        let inc_dir = self.root_dir.join("_includes");
        if inc_dir.exists() {
            for entry in fs::read_dir(inc_dir)? {
                let entry = entry?;
                let path = entry.path();
                if path.extension().map_or(false, |e| e == "html") {
                    let name = path.file_name().unwrap().to_string_lossy().to_string();
                    let content = fs::read_to_string(&path)?;
                    let normalized = normalize_template_syntax(&content);
                    env.add_template_owned(name, normalized)?;
                }
            }
        }

        // Load _layouts
        let lay_dir = self.root_dir.join("_layouts");
        if lay_dir.exists() {
            for entry in fs::read_dir(lay_dir)? {
                let entry = entry?;
                let path = entry.path();
                if path.extension().map_or(false, |e| e == "html") {
                    let name = path.file_stem().unwrap().to_string_lossy().to_string();
                    let content = fs::read_to_string(&path)?;
                    let (_, body) = extract_front_matter(&content);
                    let normalized = normalize_template_syntax(&body);
                    env.add_template_owned(format!("layout:{}", name), normalized)?;
                }
            }
        }

        Ok(())
    }

    fn render_template_file(&self, filename: &str, env: &minijinja::Environment, site_ctx: &JsonValue) -> Result<String, Box<dyn std::error::Error>> {
        let file_path = self.root_dir.join(filename);
        let raw = fs::read_to_string(&file_path)?;
        let (front_matter_yaml, body) = extract_front_matter(&raw);

        let page_meta: JsonValue = if front_matter_yaml.is_empty() {
            JsonValue::Object(serde_json::Map::new())
        } else {
            serde_yaml::from_str(&front_matter_yaml).unwrap_or(JsonValue::Object(serde_json::Map::new()))
        };

        let layout_name = page_meta.get("layout").and_then(|l| l.as_str()).unwrap_or("default").to_string();

        let normalized_body = normalize_template_syntax(&body);
        let anon_tmpl = env.template_from_str(&normalized_body)?;

        let mut ctx = serde_json::Map::new();
        ctx.insert("site".to_string(), site_ctx.clone());
        ctx.insert("page".to_string(), page_meta);

        let rendered_body = anon_tmpl.render(json_to_minijinja(&JsonValue::Object(ctx.clone())))?;

        ctx.insert("content".to_string(), JsonValue::String(rendered_body));

        let full_html = self.render_with_layout_hierarchy(&layout_name, &JsonValue::Object(ctx), env)?;
        Ok(full_html)
    }

    fn render_with_layout_hierarchy(&self, layout_name: &str, ctx: &JsonValue, env: &minijinja::Environment) -> Result<String, Box<dyn std::error::Error>> {
        if layout_name == "null" || layout_name.is_empty() {
            if let Some(content) = ctx.get("content").and_then(|c| c.as_str()) {
                return Ok(content.to_string());
            }
        }

        let tmpl_key = format!("layout:{}", layout_name);
        let tmpl = match env.get_template(&tmpl_key) {
            Ok(t) => t,
            Err(_) => {
                // If layout not found, return content
                return Ok(ctx.get("content").and_then(|c| c.as_str()).unwrap_or("").to_string());
            }
        };

        let rendered = tmpl.render(json_to_minijinja(ctx))?;

        // Check if layout itself has a parent layout
        let layout_path = self.root_dir.join("_layouts").join(format!("{}.html", layout_name));
        if layout_path.exists() {
            let layout_raw = fs::read_to_string(&layout_path)?;
            if layout_raw.starts_with("---") {
                let (meta_yaml, _) = extract_front_matter(&layout_raw);
                if let Ok(meta_val) = serde_yaml::from_str::<serde_yaml::Value>(&meta_yaml) {
                    if let Some(parent) = meta_val.get("layout").and_then(|l| l.as_str()) {
                        if parent != layout_name && parent != "null" {
                            let mut parent_ctx = ctx.as_object().cloned().unwrap_or_default();
                            parent_ctx.insert("content".to_string(), JsonValue::String(rendered));
                            return self.render_with_layout_hierarchy(parent, &JsonValue::Object(parent_ctx), env);
                        }
                    }
                }
            }
        }

        Ok(rendered)
    }

    fn generate_search_index(&self) -> Result<String, Box<dyn std::error::Error>> {
        let baseurl = self.config.baseurl.as_deref().unwrap_or("");
        let mut items = Vec::new();

        // 1. Posts
        for post in &self.posts {
            let cat = post.meta.categories.as_ref()
                .and_then(|c| c.first())
                .cloned()
                .unwrap_or_else(|| "Article".to_string());

            let desc = post.meta.description.clone()
                .unwrap_or_else(|| truncate_words(&strip_html_tags(&post.content), 25));

            let url = format!("{}/{}", baseurl.trim_end_matches('/'), post.permalink.trim_start_matches('/'));

            items.push(serde_json::json!({
                "title": post.meta.title,
                "url": url,
                "category": cat,
                "date": post.meta.date.clone().unwrap_or_default(),
                "description": desc,
            }));
        }

        // 2. Publications
        if let Some(pubs_val) = self.site_data.get("publications") {
            if let Some(pubs_arr) = pubs_val.as_array() {
                for pub_item in pubs_arr {
                    let title = pub_item.get("title").and_then(|t| t.as_str()).unwrap_or("");
                    let id = pub_item.get("id").and_then(|i| i.as_str()).unwrap_or("");
                    let area = pub_item.get("area").and_then(|a| a.as_str()).unwrap_or("Publication");
                    let venue = pub_item.get("venue").and_then(|v| v.as_str()).unwrap_or("");
                    let abstract_text = pub_item.get("abstract").and_then(|a| a.as_str()).unwrap_or("");

                    let url = format!("{}/publications/#{}", baseurl.trim_end_matches('/'), id);

                    items.push(serde_json::json!({
                        "title": title,
                        "url": url,
                        "category": area,
                        "date": venue,
                        "description": truncate_words(abstract_text, 25),
                    }));
                }
            }
        }

        Ok(serde_json::to_string_pretty(&items)?)
    }
}

pub fn json_to_minijinja(val: &serde_json::Value) -> minijinja::Value {
    match val {
        serde_json::Value::Null => minijinja::Value::from(()),
        serde_json::Value::Bool(b) => minijinja::Value::from(*b),
        serde_json::Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                minijinja::Value::from(i)
            } else if let Some(u) = n.as_u64() {
                minijinja::Value::from(u)
            } else if let Some(f) = n.as_f64() {
                minijinja::Value::from(f)
            } else {
                minijinja::Value::from(())
            }
        }
        serde_json::Value::String(s) => minijinja::Value::from(s.as_str()),
        serde_json::Value::Array(arr) => {
            let items: Vec<minijinja::Value> = arr.iter().map(json_to_minijinja).collect();
            minijinja::Value::from(items)
        }
        serde_json::Value::Object(obj) => {
            let pairs: Vec<(String, minijinja::Value)> = obj
                .iter()
                .map(|(k, v)| (k.clone(), json_to_minijinja(v)))
                .collect();
            minijinja::Value::from_pairs(pairs)
        }
    }
}

// Helpers
fn parse_post_filename(file_name: &str) -> (String, String, String, String) {
    let clean = file_name.trim_end_matches(".md");
    let parts: Vec<&str> = clean.splitn(4, '-').collect();
    if parts.len() == 4 && parts[0].len() == 4 && parts[1].len() == 2 && parts[2].len() == 2 {
        (parts[0].to_string(), parts[1].to_string(), parts[2].to_string(), parts[3].to_string())
    } else {
        ("2026".to_string(), "11".to_string(), "01".to_string(), clean.to_string())
    }
}

fn extract_front_matter(content: &str) -> (String, String) {
    if !content.starts_with("---") {
        return (String::new(), content.to_string());
    }

    let rest = &content[3..];
    if let Some(end_idx) = rest.find("---") {
        let front = &rest[..end_idx];
        let body = &rest[end_idx + 3..];
        (front.trim().to_string(), body.trim_start().to_string())
    } else {
        (String::new(), content.to_string())
    }
}

fn markdown_to_html(markdown: &str) -> String {
    let mut options = MarkdownOptions::empty();
    options.insert(MarkdownOptions::ENABLE_TABLES);
    options.insert(MarkdownOptions::ENABLE_FOOTNOTES);
    options.insert(MarkdownOptions::ENABLE_STRIKETHROUGH);
    options.insert(MarkdownOptions::ENABLE_TASKLISTS);

    let parser = Parser::new_ext(markdown, options);
    let mut html_output = String::new();
    html::push_html(&mut html_output, parser);
    html_output
}

fn slugify(text: &str) -> String {
    text.to_lowercase()
        .chars()
        .map(|c| if c.is_alphanumeric() { c } else { '-' })
        .collect::<String>()
        .split('-')
        .filter(|s| !s.is_empty())
        .collect::<Vec<_>>()
        .join("-")
}

fn strip_html_tags(input: &str) -> String {
    let mut out = String::new();
    let mut inside = false;
    for c in input.chars() {
        if c == '<' {
            inside = true;
        } else if c == '>' {
            inside = false;
        } else if !inside {
            out.push(c);
        }
    }
    out
}

fn truncate_words(input: &str, limit: usize) -> String {
    let words: Vec<&str> = input.split_whitespace().collect();
    if words.len() <= limit {
        input.to_string()
    } else {
        format!("{}...", words[..limit].join(" "))
    }
}

fn normalize_template_syntax(content: &str) -> String {
    // 1. Convert `{% include filename.html %}` -> `{% include "filename.html" %}`
    let mut result = String::new();
    let mut chars = content.chars().peekable();
    while let Some(c) = chars.next() {
        if c == '{' && chars.peek() == Some(&'%') {
            chars.next();
            let mut tag = String::new();
            while let Some(tc) = chars.next() {
                if tc == '%' && chars.peek() == Some(&'}') {
                    chars.next();
                    break;
                }
                tag.push(tc);
            }
            let trimmed = tag.trim();
            if trimmed.starts_with("include ") {
                let rest = trimmed[8..].trim();
                if !rest.starts_with('"') && !rest.starts_with('\'') {
                    let parts: Vec<&str> = rest.split_whitespace().collect();
                    if let Some(file) = parts.first() {
                        result.push_str(&format!("{{% include \"{}\" %}}", file));
                        continue;
                    }
                }
            }
            result.push_str(&format!("{{% {} %}}", trimmed));
        } else {
            result.push(c);
        }
    }

    result
}

fn copy_dir_recursive(src: &Path, dest: &Path) -> std::io::Result<()> {
    if !src.exists() {
        return Ok(());
    }
    fs::create_dir_all(dest)?;
    for entry in WalkDir::new(src) {
        let entry = entry?;
        let rel_path = entry.path().strip_prefix(src).unwrap();
        let target = dest.join(rel_path);
        if entry.file_type().is_dir() {
            fs::create_dir_all(&target)?;
        } else if entry.file_type().is_file() {
            fs::copy(entry.path(), &target)?;
        }
    }
    Ok(())
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = std::env::args().collect();
    let command = args.get(1).map(|s| s.as_str()).unwrap_or("build");

    let ssg = LovelaceSSG::new(".")?;

    match command {
        "build" => {
            ssg.build()?;
        }
        "check" => {
            println!("🔍 Running Lovelace SSG integrity checks...");
            assert!(!ssg.posts.is_empty(), "Posts cannot be empty");
            println!("✅ Loaded {} articles.", ssg.posts.len());
            println!("✅ Loaded {} data tables.", ssg.site_data.len());
            let css = ssg.compile_sass()?;
            assert!(!css.is_empty(), "SCSS must compile to non-empty CSS");
            println!("✅ Pure Rust SCSS compilation verified ({} bytes).", css.len());
            println!("✅ All integrity checks passed!");
        }
        _ => {
            eprintln!("Usage: lovelace-ssg [build|check]");
        }
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_slugify() {
        assert_eq!(slugify("Frontier AI & Reasoning"), "frontier-ai-reasoning");
        assert_eq!(slugify("Hardware-Accelerators"), "hardware-accelerators");
    }

    #[test]
    fn test_extract_front_matter() {
        let text = "---\ntitle: Test\nlayout: post\n---\nHello World";
        let (front, body) = extract_front_matter(text);
        assert_eq!(front, "title: Test\nlayout: post");
        assert_eq!(body, "Hello World");
    }

    #[test]
    fn test_markdown_to_html() {
        let md = "# Title\n\nThis is a **test**.";
        let html = markdown_to_html(md);
        assert!(html.contains("<h1>Title</h1>"));
        assert!(html.contains("<strong>test</strong>"));
    }

    #[test]
    fn test_ssg_loading_and_sass() {
        let ssg = LovelaceSSG::new(".").expect("SSG must initialize");
        assert!(!ssg.posts.is_empty(), "SSG must load posts");
        assert!(ssg.posts.len() >= 8, "Must have at least 8 posts");
        assert!(ssg.site_data.contains_key("navigation"));
        assert!(ssg.site_data.contains_key("publications"));
        assert!(ssg.site_data.contains_key("projects"));

        let css = ssg.compile_sass().expect("SCSS must compile with grass");
        assert!(!css.is_empty());
        assert!(css.contains(".site-header"));
    }
}
