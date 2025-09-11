// Utilities file - Common helper functions

const Utils = {
  // Safe DOM query selector
  querySelector: (selector) => {
    try {
      return document.querySelector(selector);
    } catch (error) {
      console.warn(`Failed to query selector: ${selector}`, error);
      return null;
    }
  },
  
  // Safe DOM query selector all
  querySelectorAll: (selector) => {
    try {
      return document.querySelectorAll(selector);
    } catch (error) {
      console.warn(`Failed to query selector all: ${selector}`, error);
      return [];
    }
  },
  
  // Safe localStorage operations
  getStorageItem: (key, defaultValue = null) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key) || defaultValue;
      }
      return defaultValue;
    } catch (error) {
      console.warn(`Failed to get storage item: ${key}`, error);
      return defaultValue;
    }
  },
  
  setStorageItem: (key, value) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return true;
      }
      return false;
    } catch (error) {
      console.warn(`Failed to set storage item: ${key}`, error);
      return false;
    }
  },
  
  // Safe window operations
  isWindowAvailable: () => typeof window !== 'undefined',
  
  // Validation helpers
  isValidEmail: (email) => {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  },
  
  isValidString: (str, minLength = 1) => {
    return typeof str === 'string' && str.trim().length >= minLength;
  },
  
  // Error handling
  handleError: (error, context = '') => {
    console.error(`Error in ${context}:`, error);
    // Could add user-facing error handling here
  },
  
  // Security: Escape HTML to prevent XSS
  escapeHtml: (text) => {
    if (typeof text !== 'string') return '';
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },
  
  // Debounce function for performance
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Throttle function for performance
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  // Format date
  formatDate: (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.warn('Failed to format date:', error);
      return dateString;
    }
  },
  
  // Generate unique ID
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },
  
  // Check if element is in viewport
  isInViewport: (element) => {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  // Parse simple YAML frontmatter from a Markdown string
  parseFrontmatter: (markdownText) => {
    if (typeof markdownText !== 'string') return { frontmatter: {}, content: '' };

    const fmMatch = markdownText.match(/^---\n([\s\S]*?)\n---\n?/);
    if (!fmMatch) {
      return { frontmatter: {}, content: markdownText };
    }

    const fmBody = fmMatch[1];
    const content = markdownText.slice(fmMatch[0].length);
    const frontmatter = {};

    // Very small YAML subset parser: key: value and key: [a, b], and list under key
    const lines = fmBody.split(/\r?\n/);
    let currentArrayKey = null;
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      if (line.startsWith('- ') && currentArrayKey) {
        const val = line.slice(2).trim();
        frontmatter[currentArrayKey].push(val);
        continue;
      }
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;
      const key = line.slice(0, colonIdx).trim();
      let value = line.slice(colonIdx + 1).trim();

      // Array literal [a, b]
      if (value.startsWith('[') && value.endsWith(']')) {
        const inner = value.slice(1, -1).trim();
        frontmatter[key] = inner ? inner.split(',').map(v => v.trim().replace(/^['"]|['"]$/g, '')) : [];
        currentArrayKey = null;
        continue;
      }

      // Start of block list (value is empty)
      if (value === '' || value === null) {
        frontmatter[key] = [];
        currentArrayKey = key;
        continue;
      }

      // Remove surrounding quotes if present
      value = value.replace(/^['"]|['"]$/g, '');
      frontmatter[key] = value;
      currentArrayKey = null;
    }

    return { frontmatter, content };
  },

  // Convert a subset of Markdown to HTML with Prism-friendly code blocks
  markdownToHtml: (markdownText) => {
    if (typeof markdownText !== 'string') return '';

    // Handle code fences first: ```lang\n...\n```
    let html = markdownText.replace(/```([\w-]+)?\n([\s\S]*?)```/g, (m, lang, code) => {
      const language = (lang || '').trim();
      const escaped = Utils.escapeHtmlForCode(code);
      const classAttr = language ? `language-${language}` : '';
      const preClass = classAttr ? ` class="${classAttr}"` : '';
      const codeClass = classAttr ? ` class="${classAttr}"` : '';
      return `<pre${preClass}><code${codeClass}>${escaped}</code></pre>`;
    });

    // Inline code `code`
    html = html.replace(/`([^`]+)`/g, (m, code) => `<code>${Utils.escapeHtml(code)}</code>`);

    // Headings ###, ##, # (support up to h3 used in posts)
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

    // Bold **text** and italic *text*
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Restrict italics to a single line to avoid spanning across blocks/code
    html = html.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');

    // Unordered lists - lines starting with - or *
    html = html.replace(/^(?:- |\* )(.*(?:\n(?:- |\* ).*)*)/gm, (m) => {
      const items = m.split(/\n/).map(l => l.replace(/^(?:- |\* )/, '').trim()).map(it => `<li>${it}</li>`).join('');
      return `<ul>${items}</ul>`;
    });

    // Protect code blocks from paragraph processing
    const codeBlocks = [];
    html = html.replace(/<pre[\s\S]*?<\/pre>/g, (match) => {
      const placeholder = `@@CODE_BLOCK_${codeBlocks.length}@@`;
      codeBlocks.push(match);
      return placeholder;
    });

    // Paragraphs: wrap remaining non-empty lines/blocks with <p>
    const blocks = html.split(/\n\n+/).map(b => b.trim()).filter(Boolean).map(block => {
      if (/^<h\d|^<ul>|^<p>|^<blockquote>|^<table>|^<img|^<code/.test(block)) return block;
      // Preserve single newlines within a paragraph
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    });

    let result = blocks.join('\n');
    // Restore code blocks
    codeBlocks.forEach((code, i) => {
      result = result.replace(`@@CODE_BLOCK_${i}@@`, code);
    });

    return result;
  },

  // Escape helper for code blocks
  escapeHtmlForCode: (text) => {
    if (typeof text !== 'string') return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },

  // Strip Markdown to plain text for excerpt generation
  stripMarkdown: (markdownText) => {
    if (typeof markdownText !== 'string') return '';
    return markdownText
      .replace(/```[\s\S]*?```/g, '') // remove code fences
      .replace(/`[^`]*`/g, '') // remove inline code
      .replace(/^#{1,6}\s+/gm, '') // remove headings
      .replace(/\*\*|__/g, '') // remove bold markers
      .replace(/\*|_/g, '') // remove italic markers
      .replace(/^(?:- |\* )/gm, '') // remove list markers
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // links -> text
      .replace(/\n+/g, ' ')
      .trim();
  },

  // Generate excerpt from Markdown content with max length
  generateExcerpt: (markdownText, maxLength) => {
    const plain = Utils.stripMarkdown(markdownText);
    if (!plain) return '';
    if (!maxLength || plain.length <= maxLength) return plain;
    const truncated = plain.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated).trim() + '…';
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
} else if (typeof window !== 'undefined') {
  window.Utils = Utils;
}
