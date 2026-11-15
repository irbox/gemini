/**
 * Accessible Video Player & Newsflash Controller
 * Reconstructed from Chunk 4995 and Module 1486 in blog.google Webpack bundle
 */

import { BaseComponent } from '../core/BaseComponent.js';
import analyticsDispatcher from '../analytics/AnalyticsDispatcher.js';

export class VideoPlayerComponent extends BaseComponent {
  constructor(element) {
    super(element);
    this.isPlaying = false;
    this.isMuted = true;
  }

  _elements() {
    this.ui = {
      ...this.loadElements({
        video: 'video',
        playBtn: '.uni-video-player__play-btn, .uni-player-control--play',
        muteBtn: '.uni-video-player__mute-btn, .uni-player-control--mute',
        caption: '.uni-video-player__caption',
        progress: '.uni-video-player__progress'
      })
    };
  }

  _events() {
    const video = this.ui.video;
    if (!video) return;

    if (this.ui.playBtn) {
      this.ui.playBtn.addEventListener('click', () => this.togglePlay());
    }

    if (this.ui.muteBtn) {
      this.ui.muteBtn.addEventListener('click', () => this.toggleMute());
    }

    video.addEventListener('play', () => {
      this.isPlaying = true;
      this.updatePlayState();
      this.trackMedia('play');
    });

    video.addEventListener('pause', () => {
      this.isPlaying = false;
      this.updatePlayState();
      this.trackMedia('pause');
    });

    video.addEventListener('timeupdate', () => {
      if (this.ui.progress && video.duration) {
        const percent = (video.currentTime / video.duration) * 100;
        this.ui.progress.style.width = `${percent}%`;
      }
    });

    video.addEventListener('ended', () => {
      this.isPlaying = false;
      this.updatePlayState();
      this.trackMedia('complete');
    });
  }

  togglePlay() {
    const video = this.ui.video;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }

  toggleMute() {
    const video = this.ui.video;
    if (!video) return;

    video.muted = !video.muted;
    this.isMuted = video.muted;
    if (this.ui.muteBtn) {
      this.ui.muteBtn.setAttribute('aria-pressed', String(!this.isMuted));
      this.ui.muteBtn.classList.toggle('uni-player-control--muted', this.isMuted);
    }
  }

  updatePlayState() {
    if (this.ui.playBtn) {
      this.ui.playBtn.setAttribute('aria-pressed', String(this.isPlaying));
      this.ui.playBtn.classList.toggle('uni-player-control--playing', this.isPlaying);
    }
  }

  trackMedia(action) {
    analyticsDispatcher.dispatch({
      event: `video_${action}`,
      category: 'video',
      action,
      label: this.el.dataset.title || 'Video Player',
      contentType: 'video'
    });
  }
}

export default VideoPlayerComponent;
