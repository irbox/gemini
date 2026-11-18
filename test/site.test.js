import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();

test('1. Package.json structure and scripts', () => {
  const pkgPath = path.join(ROOT_DIR, 'package.json');
  assert.ok(fs.existsSync(pkgPath), 'package.json must exist');
  
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  assert.equal(pkg.name, 'google-research');
  assert.ok(pkg.scripts?.build, 'build script must exist');
  assert.ok(pkg.scripts?.test, 'test script must exist');
});

test('2. _data directory contains authentic Google Research taxonomy', () => {
  const dataFiles = [
    '_data/navigation.json',
    '_data/research_areas.json',
    '_data/publications.json',
    '_data/projects.json',
    '_data/people.json',
    '_data/blog.json'
  ];

  for (const df of dataFiles) {
    const full = path.join(ROOT_DIR, df);
    assert.ok(fs.existsSync(full), `${df} must exist`);
    const parsed = JSON.parse(fs.readFileSync(full, 'utf8'));
    assert.ok(parsed, `${df} must be valid JSON`);
  }

  const areas = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, '_data/research_areas.json'), 'utf8'));
  assert.ok(Array.isArray(areas) && areas.length >= 3, 'research_areas must contain 3 core pillars');

  const pubs = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, '_data/publications.json'), 'utf8'));
  assert.ok(Array.isArray(pubs) && pubs.length >= 6, 'publications must contain at least 6 landmark papers');
  assert.ok(pubs.some(p => p.title.includes('Attention Is All You Need')), 'Attention Is All You Need must be in publications');
  assert.ok(pubs.some(p => p.title.includes('Willow')), 'Willow Quantum paper must be in publications');

  const projs = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, '_data/projects.json'), 'utf8'));
  assert.ok(Array.isArray(projs) && projs.length >= 4, 'projects must contain at least 4 flagship projects');

  const people = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, '_data/people.json'), 'utf8'));
  assert.ok(Array.isArray(people) && people.length >= 6, 'people must contain at least 6 research leaders');
  assert.ok(people.some(p => p.name === 'Jeff Dean'), 'Jeff Dean must be in people');
  assert.ok(people.some(p => p.name === 'Demis Hassabis'), 'Demis Hassabis must be in people');
});

test('3. CSS and static assets exist and are populated', () => {
  const assets = [
    'gr/static/css/googleresearch.css',
    'gr/static/css/glue-material.min.css',
    'gr/static/css/modern-custom.css',
    'gr/static/js/modern-components.js',
    'gr/static/assets/icons/glue-icons.svg'
  ];

  for (const a of assets) {
    const full = path.join(ROOT_DIR, a);
    assert.ok(fs.existsSync(full), `${a} must exist`);
    const stat = fs.statSync(full);
    assert.ok(stat.size > 500, `${a} must have meaningful content`);
  }
});

test('4. All primary pages exist and render clean semantic HTML', () => {
  const pages = [
    'index.html',
    'research-areas/index.html',
    'pubs/index.html',
    'resources/our-projects/index.html',
    'people/index.html',
    'blog/index.html',
    'programs-and-events/index.html',
    '404.html'
  ];

  for (const page of pages) {
    const full = path.join(ROOT_DIR, page);
    assert.ok(fs.existsSync(full), `${page} must exist`);
    const html = fs.readFileSync(full, 'utf8');
    assert.ok(html.includes('<!DOCTYPE html>'), `${page} must contain DOCTYPE`);
    assert.ok(html.includes('Google Research'), `${page} must include Google Research branding`);
    assert.ok(html.includes('role="banner"'), `${page} must contain semantic banner role`);
    assert.ok(html.includes('role="contentinfo"'), `${page} must contain semantic contentinfo role`);
  }
});

test('5. Modern Web Guidance compliance: Navigation and Dialog', () => {
  const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
  assert.ok(indexHtml.includes('<header class="site-header"'), 'Header must follow modern-web-guidance navbar class');
  assert.ok(indexHtml.includes('<nav class="site-nav" aria-label="Primary">'), 'Nav must be a semantic primary landmark');
  assert.ok(indexHtml.includes('popovertarget="site-mobile-menu"'), 'Must use declarative popovertarget for mobile menu');
  assert.ok(indexHtml.includes('popover="auto"'), 'Must use native popover="auto"');
  assert.ok(indexHtml.includes('<dialog class="search-modal"'), 'Must use native <dialog> element for search');
  assert.ok(indexHtml.includes('closedby="any"'), 'Must configure closedby="any" on search dialog');
});

test('6. Dist directory and search index generation', () => {
  const distPages = [
    'dist/index.html',
    'dist/research-areas/index.html',
    'dist/pubs/index.html',
    'dist/resources/our-projects/index.html',
    'dist/people/index.html',
    'dist/blog/index.html',
    'dist/programs-and-events/index.html',
    'dist/404.html',
    'dist/search.json',
    'dist/.nojekyll'
  ];

  for (const dp of distPages) {
    const full = path.join(ROOT_DIR, dp);
    assert.ok(fs.existsSync(full), `${dp} must exist in dist`);
  }

  const searchJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'dist/search.json'), 'utf8'));
  assert.ok(searchJson.length >= 25, 'search.json should index at least 25 research entries');
});
