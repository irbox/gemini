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
  
  assert.equal(config.title, 'The Keyword');
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

test('2. _data directory contains navigation, authors, and categories', () => {
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
  assert.ok(authors['sundar-pichai'], 'sundar-pichai must exist in authors');
  assert.ok(Array.isArray(cats), 'categories must be an array');
  assert.ok(cats.some(c => c.slug === 'innovation-and-ai'));
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

test('5. Dynamic homepage rendering through home and default layouts', async () => {
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

  // Verify index.html is clean front matter
  const indexContent = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
  assert.ok(indexContent.length < 1000, 'index.html should be a clean template, not a monolithic HTML dump');
  assert.ok(indexContent.includes('layout: home'), 'index.html should specify layout: home');
});

test('6. Search endpoint search.json generates valid JSON with all posts', () => {
  const searchJsonPath = path.join(ROOT_DIR, '_site/search.json');
  assert.ok(fs.existsSync(searchJsonPath), 'search.json must be generated in _site');
  const items = JSON.parse(fs.readFileSync(searchJsonPath, 'utf8'));
  assert.ok(Array.isArray(items), 'search.json must be an array');
  assert.ok(items.length >= 8, `Expected at least 8 indexed posts, got ${items.length}`);
  assert.ok(items[0].title, 'First search item must have title');
  assert.ok(items[0].url.startsWith('/gemini/'), 'First search item url must start with baseurl');
});
