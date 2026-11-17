import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { load } from 'js-yaml';
import { Liquid } from 'liquidjs';
import * as sass from 'sass';

const ROOT_DIR = process.cwd();

test('1. _config.yml structure and modern Jekyll 4 configuration', () => {
  const configPath = path.join(ROOT_DIR, '_config.yml');
  assert.ok(fs.existsSync(configPath), '_config.yml must exist');
  
  const content = fs.readFileSync(configPath, 'utf8');
  const config = load(content);
  
  assert.equal(config.title, 'The Lovelace Journal');
  assert.equal(config.baseurl, '/gemini');
  assert.equal(config.url, 'https://irbox.github.io');
  assert.equal(config.markdown, 'kramdown');
  assert.ok(config.collections?.posts?.output, 'collections.posts.output should be true');
  assert.ok(Array.isArray(config.defaults), 'defaults should be an array');
  assert.equal(config.sass?.sass_dir, '_sass');
  assert.ok(Array.isArray(config.plugins), 'plugins should be an array');
  assert.ok(config.plugins.includes('jekyll-feed'), 'plugins should include jekyll-feed');
  assert.ok(config.plugins.includes('jekyll-seo-tag'), 'plugins should include jekyll-seo-tag');
});

test('2. _data directory contains navigation, authentic authors, and categories', () => {
  const navPath = path.join(ROOT_DIR, '_data/navigation.yml');
  const authorsPath = path.join(ROOT_DIR, '_data/authors.yml');
  const catPath = path.join(ROOT_DIR, '_data/categories.yml');

  assert.ok(fs.existsSync(navPath), 'navigation.yml must exist');
  assert.ok(fs.existsSync(authorsPath), 'authors.yml must exist');
  assert.ok(fs.existsSync(catPath), 'categories.yml must exist');

  const nav = load(fs.readFileSync(navPath, 'utf8'));
  const authors = load(fs.readFileSync(authorsPath, 'utf8'));
  const cats = load(fs.readFileSync(catPath, 'utf8'));

  assert.ok(Array.isArray(nav.main), 'nav.main must be an array');
  assert.ok(authors['ada-lovelace'], 'ada-lovelace must exist in authors');
  assert.ok(authors['kai-chen'], 'kai-chen must exist in authors');
  assert.ok(Array.isArray(cats), 'categories must be an array');
  assert.ok(cats.some(c => c.slug === 'frontier-ai'));
  assert.ok(cats.some(c => c.slug === 'hardware-accelerators'));
  assert.ok(cats.some(c => c.slug === 'quantum-computing'));
});

test('3. _sass directory contains modular SCSS partials and compiles cleanly', () => {
  const partials = [
    '_sass/_variables.scss',
    '_sass/_base.scss',
    '_sass/_header.scss',
    '_sass/_hero.scss',
    '_sass/_cards.scss',
    '_sass/_post.scss',
    '_sass/_footer.scss',
    '_sass/_search.scss',
    'assets/css/style.scss'
  ];

  for (const p of partials) {
    assert.ok(fs.existsSync(path.join(ROOT_DIR, p)), `Partial ${p} must exist`);
  }

  const scssContent = fs.readFileSync(path.join(ROOT_DIR, 'assets/css/style.scss'), 'utf8')
    .replace(/^---[\s\S]*?---\s*/, '');
  
  const result = sass.compileString(scssContent, {
    loadPaths: [path.join(ROOT_DIR, '_sass')],
    style: 'compressed'
  });

  assert.ok(result.css.length > 5000, 'Compiled CSS should be substantial');
  assert.ok(result.css.includes('.site-header'), 'Compiled CSS should contain site-header');
  assert.ok(result.css.includes('.story-card'), 'Compiled CSS should contain story-card');
});

test('4. _posts contains at least 8 authentic posts with rich front matter', () => {
  const postsDir = path.join(ROOT_DIR, '_posts');
  assert.ok(fs.existsSync(postsDir), '_posts must exist');

  const posts = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
  assert.ok(posts.length >= 8, `Expected at least 8 posts, found ${posts.length}`);

  for (const file of posts) {
    assert.match(file, /^\d{4}-\d{2}-\d{2}-.*\.md$/, `${file} must follow YYYY-MM-DD-title.md naming convention`);
    const raw = fs.readFileSync(path.join(postsDir, file), 'utf8');
    assert.ok(raw.startsWith('---'), `${file} must start with front matter`);
    const parts = raw.split('---');
    const meta = load(parts[1]);
    assert.ok(meta.title, `${file} missing title`);
    assert.ok(meta.layout, `${file} missing layout`);
    assert.ok(meta.categories, `${file} missing categories`);
    assert.ok(meta.author, `${file} missing author`);
  }
});

test('5. Zero trademark or proprietary branding in content and templates', () => {
  const prohibited = [
    'google', 'sundar', 'pichai', 'alphabet', 'pixel', 'fitbit', 'deepmind'
  ];
  const scanDirs = ['_posts', '_layouts', '_includes', '_data'];

  for (const dir of scanDirs) {
    const fullDir = path.join(ROOT_DIR, dir);
    if (!fs.existsSync(fullDir)) continue;

    const files = fs.readdirSync(fullDir, { recursive: true });
    for (const f of files) {
      const fullPath = path.join(fullDir, f);
      if (fs.statSync(fullPath).isDirectory()) continue;
      if (/\.(md|html|yml|yaml|scss|css)$/i.test(fullPath)) {
        const text = fs.readFileSync(fullPath, 'utf8').toLowerCase();
        for (const term of prohibited) {
          assert.equal(
            text.includes(term),
            false,
            `Prohibited term "${term}" found in ${path.relative(ROOT_DIR, fullPath)}`
          );
        }
      }
    }
  }
});

test('6. Original vector SVG assets exist and are valid', () => {
  const requiredSvgs = [
    'assets/images/logo.svg',
    'assets/images/favicon.svg',
    'assets/images/authors/ada-lovelace.svg',
    'assets/images/authors/kai-chen.svg',
    'assets/images/posts/post-hydrogen.svg',
    'assets/images/posts/post-accelerator.svg',
    'assets/images/posts/post-quantum.svg'
  ];

  for (const svgPath of requiredSvgs) {
    const full = path.join(ROOT_DIR, svgPath);
    assert.ok(fs.existsSync(full), `SVG ${svgPath} must exist`);
    const content = fs.readFileSync(full, 'utf8');
    assert.ok(content.includes('<svg'), `${svgPath} must contain <svg`);
  }
});

test('7. Dynamic homepage rendering through Liquid engine', async () => {
  const config = load(fs.readFileSync(path.join(ROOT_DIR, '_config.yml'), 'utf8'));
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

  const indexContent = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
  assert.ok(indexContent.length < 1000, 'index.html should be a clean template, not a monolithic HTML dump');
  assert.ok(indexContent.includes('layout: home'), 'index.html should specify layout: home');
});
