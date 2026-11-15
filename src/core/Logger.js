/**
 * Google Glue Debug Logger
 * Reconstructed from Module 398 in blog.google Webpack bundle
 */
export class Logger {
  constructor({ active = false, stream = console, title = '' } = {}) {
    this.active = false;
    this.stream = stream;
    this.title = title;
    if (active) {
      this.activate();
    }
  }

  activate() {
    this.active = true;
    this.log('Logger activated');
  }

  deactivate() {
    this.active = false;
  }

  log(...args) {
    if (this.active) {
      if (this.title) args.unshift(this.title);
      this.stream.log(...args);
    }
  }

  info(...args) {
    if (this.active) {
      if ('info' in this.stream) {
        this.stream.info(...args);
      } else {
        this.stream.log('[INFO]', ...args);
      }
    }
  }

  warn(...args) {
    if (this.active) {
      if ('warn' in this.stream) {
        this.stream.warn(...args);
      } else {
        this.stream.log('[WARNING]:', ...args);
      }
    }
  }

  error(...args) {
    if (this.active) {
      if ('error' in this.stream) {
        this.stream.error(...args);
      } else {
        this.stream.log('[ERROR]:', ...args);
      }
    }
  }
}
