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
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
} else if (typeof window !== 'undefined') {
  window.Utils = Utils;
}
