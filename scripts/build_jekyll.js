import fs from 'node:fs';
import path from 'node:path';
import { load } from 'js-yaml';
import { Liquid } from 'liquidjs';
import { marked } from 'marked';
import * as sass from 'sass';

const ROOT_DIR = process.cwd();
const OUT_DIRS = [path.join(ROOT_DIR, '_site'), path.join(ROOT_DIR, 'dist')];

// 1. Load config and data
const config = load(fs.readFileSync(path.join(ROOT_DIR, '_config.yml'), 'utf8'));

const dataDir = path.join(ROOT_DIR, '_data');
const siteData = {};
if (fs.existsSync(dataDir)) {
  for (const file of fs.readdirSync(dataDir)) {
    if (file.endsWith('.yml') || file.endsWith('.yaml')) {
      const name = path.basename(file, path.extname(file));
      siteData[name] = load(fs.readFileSync(path.join(dataDir, file), 'utf8'));
    }
  }
}

// 2. Setup Liquid Engine
const engine = new Liquid({
  root: [path.join(ROOT_DIR, '_includes'), path.join(ROOT_DIR, '_layouts')],
  extname: '.html',
  jekyllInclude: true
});

engine.registerFilter('relative_url', function(input) {
  const base = this.context.get(['site', 'baseurl']) || '';
  if (!input) return base;
  return (base + '/' + input).replace(/\/+/g, '/');
});

engine.registerFilter('absolute_url', function(input) {
  const url = this.context.get(['site', 'url']) || 'https://irbox.github.io';
  const base = this.context.get(['site', 'baseurl']) || '';
  const fullBase = (url + '/' + base).replace(/\/+$/, '');
  if (!input) return fullBase;
  return (fullBase + '/' + input).replace(/(https?:\/\/)|(\/)+/g, '$1$2');
});

engine.registerFilter('date_to_xmlschema', function(input) {
  return new Date(input || Date.now()).toISOString();
});

engine.registerFilter('jsonify', function(input) {
  return JSON.stringify(input);
});

engine.registerFilter('slugify', function(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-');
});

engine.registerFilter('url_encode', function(input) {
  return encodeURIComponent(String(input || ''));
});

// Helper to copy recursively
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function build() {
  console.log('🚀 Building authentic Jekyll static site...');

  // 1. Compile SCSS into CSS
  console.log('🎨 Compiling Sass assets...');
  const scssPath = path.join(ROOT_DIR, 'assets/css/style.scss');
  let compiledCss = '';
  if (fs.existsSync(scssPath)) {
    const scssRaw = fs.readFileSync(scssPath, 'utf8').replace(/^---[\s\S]*?---\s*/, '');
    const result = sass.compileString(scssRaw, {
      loadPaths: [path.join(ROOT_DIR, '_sass')],
      style: 'compressed'
    });
    compiledCss = result.css;
    fs.writeFileSync(path.join(ROOT_DIR, 'assets/css/style.css'), compiledCss, 'utf8');
  }

  // 2. Prepare output directories and copy static assets
  for (const outDir of OUT_DIRS) {
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, '.nojekyll'), '');
    
    console.log(`📂 Copying assets to ${path.basename(outDir)}...`);
    copyDirSync(path.join(ROOT_DIR, 'assets'), path.join(outDir, 'assets'));
    copyDirSync(path.join(ROOT_DIR, 'static'), path.join(outDir, 'static'));
    copyDirSync(path.join(ROOT_DIR, 'storage.googleapis.com'), path.join(outDir, 'storage.googleapis.com'));
    copyDirSync(path.join(ROOT_DIR, 'www.gstatic.com'), path.join(outDir, 'www.gstatic.com'));
  }

  // 3. Read posts
  const postsDir = path.join(ROOT_DIR, '_posts');
  const posts = [];
  if (fs.existsSync(postsDir)) {
    for (const file of fs.readdirSync(postsDir)) {
      if (file.endsWith('.md')) {
        const raw = fs.readFileSync(path.join(postsDir, file), 'utf8');
        const parts = raw.split('---');
        const meta = load(parts[1]);
        const body = parts.slice(2).join('---');

        const match = file.match(/^(\d{4})-(\d{2})-(\d{2})-(.*)\.md$/);
        const year = match ? match[1] : '2026';
        const month = match ? match[2] : '11';
        const day = match ? match[3] : '01';
        const slug = match ? match[4] : file.replace('.md', '');

        const category = Array.isArray(meta.categories) ? meta.categories[0] : (meta.category || 'news');
        const permalink = `/${category}/${year}/${month}/${day}/${slug}/`;

        posts.push({
          ...meta,
          id: permalink,
          slug,
          year,
          month,
          day,
          permalink,
          url: permalink,
          rawBody: body,
          content: marked.parse(body)
        });
      }
    }
  }

  // Sort posts descending by date
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  const siteContext = {
    ...config,
    data: siteData,
    posts: posts,
    time: new Date()
  };

  // Helper to render templates through layout hierarchy
  async function renderWithLayout(content, pageMeta, layoutName = 'default') {
    const layoutPath = path.join(ROOT_DIR, '_layouts', `${layoutName}.html`);
    if (!fs.existsSync(layoutPath)) {
      return content;
    }

    const layoutRaw = fs.readFileSync(layoutPath, 'utf8');
    let parentLayout = null;
    let layoutBody = layoutRaw;

    if (layoutRaw.startsWith('---')) {
      const parts = layoutRaw.split('---');
      const layoutMeta = load(parts[1]);
      parentLayout = layoutMeta?.layout;
      layoutBody = parts.slice(2).join('---');
    }

    const context = {
      site: siteContext,
      page: pageMeta,
      content: content
    };

    const rendered = await engine.parseAndRender(layoutBody, context);

    if (parentLayout && parentLayout !== layoutName) {
      return renderWithLayout(rendered, pageMeta, parentLayout);
    }
    return rendered;
  }

  // 4. Render Index (Homepage)
  console.log('📄 Rendering index.html...');
  const indexRaw = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
  let indexMeta = { layout: 'home', title: config.title };
  let indexBody = '';
  if (indexRaw.startsWith('---')) {
    const parts = indexRaw.split('---');
    indexMeta = { ...indexMeta, ...load(parts[1]) };
    indexBody = parts.slice(2).join('---');
  } else {
    indexBody = indexRaw;
  }

  const renderedIndexBody = await engine.parseAndRender(indexBody, { site: siteContext, page: indexMeta });
  const fullIndexHtml = await renderWithLayout(renderedIndexBody, indexMeta, indexMeta.layout || 'home');

  for (const outDir of OUT_DIRS) {
    fs.writeFileSync(path.join(outDir, 'index.html'), fullIndexHtml, 'utf8');
  }

  // 5. Render Categories Page
  if (fs.existsSync(path.join(ROOT_DIR, 'categories.html'))) {
    console.log('📄 Rendering categories.html...');
    const catRaw = fs.readFileSync(path.join(ROOT_DIR, 'categories.html'), 'utf8');
    const parts = catRaw.split('---');
    const catMeta = load(parts[1]);
    const catBody = parts.slice(2).join('---');

    const renderedCatBody = await engine.parseAndRender(catBody, { site: siteContext, page: catMeta });
    const fullCatHtml = await renderWithLayout(renderedCatBody, catMeta, catMeta.layout || 'page');

    for (const outDir of OUT_DIRS) {
      const targetDir = path.join(outDir, 'categories');
      fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(path.join(targetDir, 'index.html'), fullCatHtml, 'utf8');
    }
  }

  // 6. Render About Page
  if (fs.existsSync(path.join(ROOT_DIR, 'about.md'))) {
    console.log('📄 Rendering about.md...');
    const aboutRaw = fs.readFileSync(path.join(ROOT_DIR, 'about.md'), 'utf8');
    const parts = aboutRaw.split('---');
    const aboutMeta = load(parts[1]);
    const aboutBody = parts.slice(2).join('---');

    const htmlContent = marked.parse(aboutBody);
    const fullAboutHtml = await renderWithLayout(htmlContent, aboutMeta, aboutMeta.layout || 'page');

    for (const outDir of OUT_DIRS) {
      const targetDir = path.join(outDir, 'about');
      fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(path.join(targetDir, 'index.html'), fullAboutHtml, 'utf8');
    }
  }

  // 7. Render 404
  if (fs.existsSync(path.join(ROOT_DIR, '404.html'))) {
    console.log('📄 Rendering 404.html...');
    const notFoundRaw = fs.readFileSync(path.join(ROOT_DIR, '404.html'), 'utf8');
    const parts = notFoundRaw.split('---');
    const notFoundMeta = load(parts[1]);
    const notFoundBody = parts.slice(2).join('---');

    const renderedNotFound = await engine.parseAndRender(notFoundBody, { site: siteContext, page: notFoundMeta });
    const fullNotFoundHtml = await renderWithLayout(renderedNotFound, notFoundMeta, notFoundMeta.layout || 'default');

    for (const outDir of OUT_DIRS) {
      fs.writeFileSync(path.join(outDir, '404.html'), fullNotFoundHtml, 'utf8');
    }
  }

  // 8. Render Posts
  console.log(`📝 Rendering ${posts.length} posts...`);
  for (const post of posts) {
    const postPageContext = {
      site: siteContext,
      page: post,
      content: post.content
    };

    const fullPostHtml = await renderWithLayout(post.content, post, post.layout || 'post');

    for (const outDir of OUT_DIRS) {
      const postPath = path.join(outDir, post.permalink, 'index.html');
      fs.mkdirSync(path.dirname(postPath), { recursive: true });
      fs.writeFileSync(postPath, fullPostHtml, 'utf8');
    }
  }

  // 9. Render search.json
  if (fs.existsSync(path.join(ROOT_DIR, 'search.json'))) {
    console.log('🔍 Generating search.json...');
    const searchRaw = fs.readFileSync(path.join(ROOT_DIR, 'search.json'), 'utf8');
    const parts = searchRaw.split('---');
    const searchBody = parts.slice(2).join('---');

    const searchJson = await engine.parseAndRender(searchBody, { site: siteContext, page: {} });

    for (const outDir of OUT_DIRS) {
      fs.writeFileSync(path.join(outDir, 'search.json'), searchJson.trim(), 'utf8');
    }
  }

  console.log('✅ Authentic Jekyll static site built successfully!');
}

build().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
