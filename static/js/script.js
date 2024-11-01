// Constants
const SELECTORS = {
  menuToggle: '#menu-toggle',
  navMenu: '#nav-menu',
  closeMenu: '#close-menu',
  loginForm: '#login-form',
  loginDialog: '#loginDialog',
  signupDialog: '#signupDialog',
  martialArtsButtons: '#martialArtsButtons',
  contentArea: '#contentArea',
  backToTop: '#back-to-top'
};

// Utility functions
const utils = {
  getElement: (selector) => document.querySelector(selector),
  getAllElements: (selector) => document.querySelectorAll(selector),
  
  convertRGBToHex: (rgb) => {
    const [r, g, b] = rgb.match(/\d+/g).map(Number);
    return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
  },
  
  getContrastColor: (hexcolor) => {
    const hex = hexcolor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
  }
};

// Menu functionality
class Menu {
  constructor() {
    this.toggle = utils.getElement(SELECTORS.menuToggle);
    this.nav = utils.getElement(SELECTORS.navMenu);
    this.closeBtn = utils.getElement(SELECTORS.closeMenu);
    this.scrollPosition = 0;
    this.init();
  }

  init() {
    if (!this.toggle || !this.nav || !this.closeBtn) return;

    this.toggle.addEventListener('click', () => this.toggleMenu());
    this.closeBtn.addEventListener('click', () => this.closeMenu());
    document.addEventListener('click', (e) => this.handleOutsideClick(e));
  }

  toggleMenu() {
    const isOpen = this.nav.style.right === '0px';
    
    if (!isOpen) {
      // Opening menu
      this.scrollPosition = window.pageYOffset;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${this.scrollPosition}px`;
      document.body.style.width = '100%';
      this.nav.style.right = '0';
    } else {
      // Closing menu
      this.closeMenu();
    }
    
    this.toggle.setAttribute('aria-expanded', !isOpen);
    this.nav.setAttribute('aria-hidden', isOpen);
  }

  closeMenu() {
    this.nav.style.right = '-100%';
    this.toggle.setAttribute('aria-expanded', 'false');
    this.nav.setAttribute('aria-hidden', 'true');
    
    // Restore scroll position with smooth behavior
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('position');
    document.body.style.removeProperty('top');
    document.body.style.removeProperty('width');
    window.scrollTo({
      top: this.scrollPosition,
      behavior: 'smooth'
    });
  }

  handleOutsideClick(event) {
    if (!this.nav.contains(event.target) && !this.toggle.contains(event.target)) {
      this.closeMenu();
    }
  }
}

// Authentication handling
class Auth {
  constructor() {
    this.form = utils.getElement(SELECTORS.loginForm);
    this.init();
  }

  init() {
    if (!this.form) return;
    
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });
  }

  handleLogin() {
    const username = utils.getElement('#username').value;
    const password = utils.getElement('#password').value;
    
    let message = '';
    if (!username || !password) {
      message = 'Both username and password are required.';
    } else if (username === "admin" && password === "pass") {
      message = "Login successful!";
    } else {
      message = "Login failed!";
    }
    
    utils.getElement('#message').textContent = message;
  }
}

// Dialog management
class DialogManager {
  constructor() {
    this.loginDialog = utils.getElement(SELECTORS.loginDialog);
    this.signupDialog = utils.getElement(SELECTORS.signupDialog);
    this.init();
  }

  init() {
    const loginBtn = utils.getElement('.login-btn');
    const signupBtn = utils.getElement('.signup-btn');
    const closeButtons = utils.getAllElements('.dialog .close');

    if (loginBtn) {
      loginBtn.addEventListener('click', () => this.openDialog(this.loginDialog));
    }
    
    if (signupBtn) {
      signupBtn.addEventListener('click', () => this.openDialog(this.signupDialog));
    }

    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const dialog = button.closest('.dialog');
        if (dialog) this.closeDialog(dialog);
      });
    });

    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('dialog')) {
        this.closeDialog(e.target);
      }
    });
  }

  openDialog(dialog) {
    if (dialog) dialog.style.display = 'block';
  }

  closeDialog(dialog) {
    if (dialog) dialog.style.display = 'none';
  }
}

// Content loader
class ContentLoader {
  constructor() {
    this.contentArea = utils.getElement(SELECTORS.contentArea);
    this.buttonsContainer = utils.getElement(SELECTORS.martialArtsButtons);
    this.loadedFiles = new Map(); // Cache for loaded content
    this.init();
  }

  init() {
    if (this.buttonsContainer) {
      this.buttonsContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' && e.target.dataset.art) {
          const artType = e.target.dataset.art;
          this.loadContent(artType);
        }
      });
    }
  }

  async loadContent(art) {
    if (!this.contentArea) return;
    
    // Show loading state
    this.contentArea.innerHTML = '<p>Loading...</p>';
    
    try {
      let content;
      
      // Check cache first
      if (this.loadedFiles.has(art)) {
        content = this.loadedFiles.get(art);
      } else {
        // Fetch and cache if not already loaded
        const response = await fetch(`content/${art}.md`);
        if (!response.ok) {
          throw new Error(`Failed to load ${art}.md: ${response.status}`);
        }
        content = await response.text();
        this.loadedFiles.set(art, content);
      }
      
      // Parse and display content
      if (typeof marked !== 'undefined') {
        this.contentArea.innerHTML = marked.parse(content);
        // Initialize smooth scrolling after content is loaded
        this.initializeSmoothScroll();
      } else {
        console.warn('Marked library not found - displaying raw markdown');
        this.contentArea.innerHTML = `<pre>${content}</pre>`;
      }
    } catch (error) {
      console.error('Content loading error:', error);
      this.contentArea.innerHTML = `
        <div class="error-message">
          <p>Error loading content. Please try again later.</p>
          <p class="error-details">${error.message}</p>
        </div>`;
    }
  }

  initializeSmoothScroll() {
    const links = this.contentArea.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').slice(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          // Update URL without jumping
          history.pushState(null, null, `#${targetId}`);
        }
      });
    });
  }
}

// Button styling
class ButtonStyler {
  constructor() {
    this.init();
  }

  init() {
    this.applyContrastColors();
    this.init3DEffects();
  }

  applyContrastColors() {
    utils.getAllElements('.btn-custom').forEach(button => {
      const bgColor = window.getComputedStyle(button).backgroundColor;
      const hexColor = utils.convertRGBToHex(bgColor);
      button.style.color = utils.getContrastColor(hexColor);
    });
  }

  init3DEffects() {
    utils.getAllElements('.button-3d').forEach(button => {
      button.addEventListener('mousedown', () => {
        button.style.transform = 'translateY(4px)';
      });
      ['mouseup', 'mouseout'].forEach(event => {
        button.addEventListener(event, () => {
          button.style.transform = 'translateY(0)';
        });
      });
    });
  }
}

// Back to top functionality
class BackToTop {
  constructor() {
    this.button = utils.getElement(SELECTORS.backToTop);
    this.init();
  }

  init() {
    if (!this.button) return;
    
    window.addEventListener('scroll', () => this.toggleVisibility());
    this.button.addEventListener('click', () => this.scrollToTop());
  }

  toggleVisibility() {
    const scrolled = document.documentElement.scrollTop || document.body.scrollTop;
    this.button.style.display = scrolled > 20 ? 'block' : 'none';
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Smooth scrolling for all anchor links
class SmoothScroll {
  constructor() {
    this.init();
  }

  init() {
    // Handle all clicks on links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      // Check if it's a hash link, either #something or same-page-url#something
      if (!href || (!href.includes('#'))) return;

      // Get the hash part only
      const hash = href.split('#')[1];
      if (!hash) return;

      const targetElement = document.getElementById(hash);
      if (!targetElement) return;

      e.preventDefault();
      
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      
      // Update URL without jumping
      history.pushState(null, null, `#${hash}`);
    });

    // Handle initial hash in URL
    if (window.location.hash) {
      setTimeout(() => {
        const hash = window.location.hash.slice(1);
        const targetElement = document.getElementById(hash);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    }
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Menu();
  new Auth();
  new DialogManager();
  new ContentLoader();
  new ButtonStyler();
  new BackToTop();
  new SmoothScroll();
});
