/**
 * Latest News Feed & Pagination Component
 * Reconstructed from Chunk 9011 and Module 9960 in blog.google Webpack bundle
 */

import { BaseComponent } from '../core/BaseComponent.js';
import analyticsDispatcher from '../analytics/AnalyticsDispatcher.js';

export class LatestNewsFeedComponent extends BaseComponent {
  constructor(element) {
    super(element);
    this.page = 1;
    this.isLoading = false;
    this.hasMore = true;
  }

  _elements() {
    this.ui = {
      ...this.loadElements({
        grid: '.uni-latest-news-feed__grid, .uni-article-feed-grid',
        loadMoreBtn: '.uni-latest-news-feed__load-more, button[data-load-more]',
        statusLiveRegion: '.uni-feed-status-announcer'
      })
    };
  }

  _events() {
    if (this.ui.loadMoreBtn) {
      this.ui.loadMoreBtn.addEventListener('click', () => this.loadMoreStories());
    }
  }

  async loadMoreStories() {
    if (this.isLoading || !this.hasMore) return;

    this.isLoading = true;
    const btn = this.ui.loadMoreBtn;
    if (btn) {
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
    }

    // Analytics
    analyticsDispatcher.dispatch({
      event: 'load_more_stories_click',
      category: 'pagination',
      action: 'click',
      label: `Page ${this.page + 1}`,
      contentType: 'feed'
    });

    try {
      // Fetch or simulate additional articles
      await new Promise((resolve) => setTimeout(resolve, 600));

      const newArticles = this.generateSampleArticles(this.page);
      this.appendArticles(newArticles);
      this.page++;

      if (this.page >= 4) {
        this.hasMore = false;
        if (btn) {
          btn.style.display = 'none';
        }
      }

      if (this.ui.statusLiveRegion) {
        this.ui.statusLiveRegion.textContent = `Loaded ${newArticles.length} more stories.`;
      }
    } catch (err) {
      console.error('Error loading more stories:', err);
    } finally {
      this.isLoading = false;
      if (btn && this.hasMore) {
        btn.disabled = false;
        btn.removeAttribute('aria-busy');
      }
    }
  }

  appendArticles(articles) {
    if (!this.ui.grid) return;

    articles.forEach((art) => {
      const card = document.createElement('article');
      card.className = 'uni-flex-card uni-flex-card--vertical';
      card.innerHTML = `
        <a class="uni-flex-card__link" href="${art.url}">
          <div class="uni-flex-card__media">
            <img class="uni-flex-card__image" src="${art.image}" alt="${art.title}" loading="lazy" />
          </div>
          <div class="uni-flex-card__content">
            <span class="uni-flex-card__category font-eyebrow">${art.category}</span>
            <h3 class="uni-flex-card__title font-h4">${art.title}</h3>
            <p class="uni-flex-card__excerpt font-body">${art.excerpt}</p>
            <div class="uni-flex-card__meta font-caption">
              <span class="uni-flex-card__date">${art.date}</span>
              <span class="uni-flex-card__separator">•</span>
              <span class="uni-flex-card__reading-time">${art.readTime}</span>
            </div>
          </div>
        </a>
      `;
      this.ui.grid.appendChild(card);
    });
  }

  generateSampleArticles(page) {
    return [
      {
        title: `Expanding AI capabilities for researchers and developers (Part ${page})`,
        excerpt: 'New open models and developer benchmarks designed to advance scientific exploration.',
        category: 'Technology',
        date: 'Nov 12, 2026',
        readTime: '4 min read',
        image: 'https://storage.googleapis.com/gweb-uniblog-publish-prod/images/SocialShare_gradient.max-1440x810.jpg',
        url: '#'
      },
      {
        title: `What is next for Android accessibility features in 2026`,
        excerpt: 'Intuitive gestures, faster screen readers, and adaptive audio powered by on-device ML.',
        category: 'Products',
        date: 'Nov 10, 2026',
        readTime: '3 min read',
        image: 'https://storage.googleapis.com/gweb-uniblog-publish-prod/images/SocialShare_gradient.max-1440x810.jpg',
        url: '#'
      },
      {
        title: `Sustainable data centers: Reaching 24/7 carbon-free energy`,
        excerpt: 'How Google engineering is matching electricity consumption with local green energy sources.',
        category: 'Initiatives',
        date: 'Nov 08, 2026',
        readTime: '5 min read',
        image: 'https://storage.googleapis.com/gweb-uniblog-publish-prod/images/SocialShare_gradient.max-1440x810.jpg',
        url: '#'
      }
    ];
  }
}

export default LatestNewsFeedComponent;
