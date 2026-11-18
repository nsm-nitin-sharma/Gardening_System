/**
 * harness/client_sandbox.js
 * Lightweight Headless DOM & LocalStorage Environment using Node.js node:vm
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const WORKSPACE_ROOT = path.resolve(__dirname, '..', '..');

class MockLocalStorage {
  constructor() {
    this._store = new Map();
  }
  getItem(key) {
    const k = String(key);
    return this._store.has(k) ? this._store.get(k) : null;
  }
  setItem(key, value) {
    this._store.set(String(key), String(value));
  }
  removeItem(key) {
    this._store.delete(String(key));
  }
  clear() {
    this._store.clear();
  }
  get length() {
    return this._store.size;
  }
  key(index) {
    return Array.from(this._store.keys())[index] || null;
  }
}

class MockDOMElement {
  constructor(tagName, id = '', doc = null) {
    this.tagName = (tagName || 'div').toUpperCase();
    this.id = id;
    this.className = '';
    this.ownerDocument = doc;
    this.attributes = new Map();
    this.style = {};
    this.children = [];
    this.parentNode = null;
    this._listeners = new Map();
    this._innerHTML = '';
    this._value = '';

    const self = this;
    this.classList = {
      _classes: new Set(),
      add(...classes) {
        classes.forEach(c => {
          if (c) self.classList._classes.add(String(c).trim());
        });
        self.className = Array.from(self.classList._classes).join(' ');
      },
      remove(...classes) {
        classes.forEach(c => self.classList._classes.delete(String(c).trim()));
        self.className = Array.from(self.classList._classes).join(' ');
      },
      contains(cls) {
        return self.classList._classes.has(String(cls).trim());
      },
      toggle(cls, force) {
        if (force !== undefined) {
          if (force) this.add(cls); else this.remove(cls);
          return force;
        }
        if (this.contains(cls)) {
          this.remove(cls);
          return false;
        }
        this.add(cls);
        return true;
      }
    };
  }

  get value() {
    return this._value;
  }
  set value(v) {
    this._value = String(v ?? '');
  }

  get innerHTML() {
    return this._innerHTML;
  }
  set innerHTML(html) {
    this._innerHTML = String(html || '');
    this.children = [];
    this._parseChildElements(this._innerHTML);
  }

  get textContent() {
    return this._innerHTML.replace(/<[^>]*>/g, '').trim();
  }
  set textContent(text) {
    this._innerHTML = String(text ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    this.children = [];
  }

  setAttribute(name, value) {
    const valStr = String(value);
    this.attributes.set(name, valStr);
    if (name === 'id') {
      this.id = valStr;
      if (this.ownerDocument) {
        this.ownerDocument._elementsById.set(this.id, this);
      }
    }
    if (name === 'class') {
      this.className = valStr;
      this.classList._classes = new Set(valStr.split(/\s+/).filter(Boolean));
    }
    if (name === 'value') {
      this._value = valStr;
    }
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  removeAttribute(name) {
    this.attributes.delete(name);
    if (name === 'id') this.id = '';
    if (name === 'class') {
      this.className = '';
      this.classList._classes.clear();
    }
  }

  appendChild(child) {
    if (!child) return child;
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parentNode = null;
    }
    return child;
  }

  remove() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }

  addEventListener(type, listener) {
    if (!this._listeners.has(type)) this._listeners.set(type, []);
    this._listeners.get(type).push(listener);
  }

  removeEventListener(type, listener) {
    if (!this._listeners.has(type)) return;
    const arr = this._listeners.get(type);
    const idx = arr.indexOf(listener);
    if (idx !== -1) arr.splice(idx, 1);
  }

  dispatchEvent(event) {
    event.target = this;
    event.currentTarget = this;
    if (this._listeners.has(event.type)) {
      this._listeners.get(event.type).forEach(fn => fn.call(this, event));
    }
    if (this.parentNode && event.bubbles) {
      this.parentNode.dispatchEvent(event);
    }
    return !event.defaultPrevented;
  }

  click() {
    const event = {
      type: 'click',
      target: this,
      bubbles: true,
      defaultPrevented: false,
      preventDefault() { this.defaultPrevented = true; },
      stopPropagation() {}
    };
    this.dispatchEvent(event);
  }

  querySelector(selector) {
    const list = this.querySelectorAll(selector);
    return list.length > 0 ? list[0] : null;
  }

  querySelectorAll(selector) {
    const results = [];
    const checkElement = (el) => {
      if (!el) return;
      if (matchesSelector(el, selector)) {
        results.push(el);
      }
      for (const ch of el.children) {
        checkElement(ch);
      }
    };
    for (const ch of this.children) {
      checkElement(ch);
    }
    return results;
  }

  _parseChildElements(html) {
    if (!this.ownerDocument) return;
    // Regex matches HTML tags with attributes
    const tagRegex = /<([a-zA-Z0-9\-]+)(\s+[^>]*)?(\/?>)/gi;
    let match;
    while ((match = tagRegex.exec(html)) !== null) {
      const tag = match[1];
      const attrStr = match[2] || '';
      const el = new MockDOMElement(tag, '', this.ownerDocument);

      const attrRegex = /([a-zA-Z0-9\-]+)(?:=(?:["']([^"']*)["']|([^\s>]+)))?/gi;
      let attrMatch;
      while ((attrMatch = attrRegex.exec(attrStr)) !== null) {
        const attrName = attrMatch[1];
        const attrVal = attrMatch[2] !== undefined ? attrMatch[2] : (attrMatch[3] !== undefined ? attrMatch[3] : '');
        el.setAttribute(attrName, attrVal);
      }

      this.appendChild(el);
      if (el.id) {
        this.ownerDocument._elementsById.set(el.id, el);
      }
    }
  }
}

function matchesSelector(el, selector) {
  if (!el || !selector) return false;
  const s = selector.trim();
  if (s.startsWith('#')) {
    return el.id === s.slice(1);
  }
  if (s.startsWith('.')) {
    return el.classList && el.classList.contains(s.slice(1));
  }
  if (/^[a-zA-Z0-9\-]+$/.test(s)) {
    return el.tagName.toLowerCase() === s.toLowerCase();
  }
  // Attribute selector [attr] or [attr="val"]
  const attrMatch = /^([a-zA-Z0-9\-]*)\[([a-zA-Z0-9\-]+)(?:=["']?([^"']*)["']?)?\]$/.exec(s);
  if (attrMatch) {
    const tag = attrMatch[1];
    const attr = attrMatch[2];
    const val = attrMatch[3];
    if (tag && el.tagName.toLowerCase() !== tag.toLowerCase()) return false;
    if (!el.hasAttribute(attr)) return false;
    if (val !== undefined) {
      return el.getAttribute(attr) === val;
    }
    return true;
  }
  return false;
}

class MockDocument {
  constructor() {
    this._elementsById = new Map();
    this.documentElement = new MockDOMElement('html', '', this);
    this.head = new MockDOMElement('head', '', this);
    this.body = new MockDOMElement('body', '', this);
    this.documentElement.appendChild(this.head);
    this.documentElement.appendChild(this.body);
    this._listeners = new Map();

    // Pre-populate core slots required by index.html and app.js
    const slotIds = [
      'appRoot',
      'navbarLinksSlot',
      'navbarAuthSlot',
      'themeToggleBtn',
      'tourGuideBtn',
      'cloudStatusBadge',
      'modalOverlay',
      'modalSlot',
      'toastContainer',
      'onboardingOverlay',
      'onboardingSlot'
    ];
    slotIds.forEach(id => {
      const el = new MockDOMElement('div', id, this);
      this._elementsById.set(id, el);
      this.body.appendChild(el);
    });
  }

  getElementById(id) {
    if (!this._elementsById.has(id)) {
      const el = new MockDOMElement('div', id, this);
      this._elementsById.set(id, el);
      this.body.appendChild(el);
    }
    return this._elementsById.get(id);
  }

  createElement(tagName) {
    return new MockDOMElement(tagName, '', this);
  }

  querySelector(selector) {
    if (selector.startsWith('#')) {
      return this.getElementById(selector.slice(1));
    }
    return this.documentElement.querySelector(selector);
  }

  querySelectorAll(selector) {
    return this.documentElement.querySelectorAll(selector);
  }

  addEventListener(type, listener) {
    if (!this._listeners.has(type)) this._listeners.set(type, []);
    this._listeners.get(type).push(listener);
  }

  removeEventListener(type, listener) {
    if (!this._listeners.has(type)) return;
    const arr = this._listeners.get(type);
    const idx = arr.indexOf(listener);
    if (idx !== -1) arr.splice(idx, 1);
  }

  dispatchEvent(event) {
    if (this._listeners.has(event.type)) {
      this._listeners.get(event.type).forEach(fn => fn.call(this, event));
    }
  }
}

class ClientSandbox {
  constructor() {
    this._appJsCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app.js'), 'utf8');
    this.reset();
  }

  reset() {
    this.localStorage = new MockLocalStorage();
    this.document = new MockDocument();
    const self = this;

    this.window = {
      localStorage: this.localStorage,
      document: this.document,
      location: {
        protocol: 'file:',
        href: 'file:///c:/project/index.html',
        pathname: '/index.html',
        hash: '',
        search: ''
      },
      navigator: {
        userAgent: 'HeadlessGardeningClientSandbox/1.0',
        onLine: true
      },
      fetchCount: 0,
      xhrCount: 0,
      alerts: [],
      prompts: [],
      scrollTo: () => {},
      print: () => {},
      addEventListener: (type, fn) => this.document.addEventListener(type, fn),
      removeEventListener: (type, fn) => this.document.removeEventListener(type, fn),
      dispatchEvent: (event) => this.document.dispatchEvent(event),
      setTimeout: (fn, delay, ...args) => setTimeout(fn, delay, ...args),
      clearTimeout: (id) => clearTimeout(id),
      setInterval: (fn, delay, ...args) => setInterval(fn, delay, ...args),
      clearInterval: (id) => clearInterval(id),
      alert: (msg) => { self.window.alerts.push(String(msg)); },
      prompt: (msg, def) => { self.window.prompts.push({ msg, def }); return null; },
      fetch: (...args) => {
        self.window.fetchCount++;
        return Promise.reject(new Error('Network access disabled in offline file:// sandbox'));
      },
      XMLHttpRequest: function() {
        self.window.xhrCount++;
        this.open = () => {};
        this.send = () => {};
      }
    };

    this.context = {
      window: this.window,
      document: this.document,
      localStorage: this.localStorage,
      location: this.window.location,
      navigator: this.window.navigator,
      console: {
        log: () => {},
        warn: () => {},
        error: () => {},
        info: () => {},
        debug: () => {}
      },
      setTimeout: this.window.setTimeout,
      clearTimeout: this.window.clearTimeout,
      setInterval: this.window.setInterval,
      clearInterval: this.window.clearInterval,
      Date: Date,
      JSON: JSON,
      Math: Math,
      String: String,
      Number: Number,
      Boolean: Boolean,
      Array: Array,
      Object: Object,
      RegExp: RegExp,
      Error: Error
    };
    this.context.globalThis = this.context;
    vm.createContext(this.context);

    // Bridge hooks to expose lexical declarations onto window and context
    const bridgeHook = `
;
window.db = (typeof db !== "undefined") ? db : null;
window.STORAGE_KEY = (typeof STORAGE_KEY !== "undefined") ? STORAGE_KEY : null;
window.AppDatabase = (typeof AppDatabase !== "undefined") ? AppDatabase : null;
window.getDefaultData = (typeof getDefaultData !== "undefined") ? getDefaultData : null;
window.navigate = (typeof navigate !== "undefined") ? navigate : null;
window.loginUser = (typeof loginUser !== "undefined") ? loginUser : null;
window.logoutUser = (typeof logoutUser !== "undefined") ? logoutUser : null;
window.registerUser = (typeof registerUser !== "undefined") ? registerUser : null;
window.getCurrentUser = (typeof getCurrentUser !== "undefined") ? getCurrentUser : null;
window.toggleTheme = (typeof toggleTheme !== "undefined") ? toggleTheme : null;
window.initTheme = (typeof initTheme !== "undefined") ? initTheme : null;
window.openOnboarding = (typeof openOnboarding !== "undefined") ? openOnboarding : null;
window.closeOnboarding = (typeof closeOnboarding !== "undefined") ? closeOnboarding : null;
window.nextOnboardingStep = (typeof nextOnboardingStep !== "undefined") ? nextOnboardingStep : null;
window.prevOnboardingStep = (typeof prevOnboardingStep !== "undefined") ? prevOnboardingStep : null;
window.goToOnboardingStep = (typeof goToOnboardingStep !== "undefined") ? goToOnboardingStep : null;
window.onboardingQuickLogin = (typeof onboardingQuickLogin !== "undefined") ? onboardingQuickLogin : null;
window.showToast = (typeof showToast !== "undefined") ? showToast : null;
window.getSvgIcon = (typeof getSvgIcon !== "undefined") ? getSvgIcon : null;
window.filterTips = (typeof filterTips !== "undefined") ? filterTips : null;
window.filterTipsByCategory = (typeof filterTipsByCategory !== "undefined") ? filterTipsByCategory : null;
window.moderateTip = (typeof moderateTip !== "undefined") ? moderateTip : null;
window.handleModerationSubmit = (typeof handleModerationSubmit !== "undefined") ? handleModerationSubmit : null;
window.toggleUserStatus = (typeof toggleUserStatus !== "undefined") ? toggleUserStatus : null;
window.toggleUserRole = (typeof toggleUserRole !== "undefined") ? toggleUserRole : null;
window.updateProjectStatus = (typeof updateProjectStatus !== "undefined") ? updateProjectStatus : null;
window.handleAddLogSubmit = (typeof handleAddLogSubmit !== "undefined") ? handleAddLogSubmit : null;
window.handleNewProjectSubmit = (typeof handleNewProjectSubmit !== "undefined") ? handleNewProjectSubmit : null;
window.handleNewTipSubmit = (typeof handleNewTipSubmit !== "undefined") ? handleNewTipSubmit : null;
window.handleNewDiscussionSubmit = (typeof handleNewDiscussionSubmit !== "undefined") ? handleNewDiscussionSubmit : null;
window.handleSettingsSave = (typeof handleSettingsSave !== "undefined") ? handleSettingsSave : null;
window.handleProfileUpdate = (typeof handleProfileUpdate !== "undefined") ? handleProfileUpdate : null;
window.addCommentToTopic = (typeof addCommentToTopic !== "undefined") ? addCommentToTopic : null;
window.openNewProjectModal = (typeof openNewProjectModal !== "undefined") ? openNewProjectModal : null;
window.openAddLogModal = (typeof openAddLogModal !== "undefined") ? openAddLogModal : null;
window.openNewTipModal = (typeof openNewTipModal !== "undefined") ? openNewTipModal : null;
window.openNewDiscussionModal = (typeof openNewDiscussionModal !== "undefined") ? openNewDiscussionModal : null;
window.closeModal = (typeof closeModal !== "undefined") ? closeModal : null;
`;
    vm.runInContext(this._appJsCode + bridgeHook, this.context);

    // Bind primary handles
    this.db = this.context.window.db;
    this.STORAGE_KEY = this.context.window.STORAGE_KEY;
    this.AppDatabase = this.context.window.AppDatabase;
  }

  navigate(route, param = null) {
    if (typeof this.context.window.navigate === 'function') {
      this.context.window.navigate(route, param);
    }
    return this.document.getElementById('appRoot').innerHTML;
  }

  loginAs(email, password) {
    if (typeof this.context.window.loginUser === 'function') {
      return this.context.window.loginUser(email, password);
    }
    return { success: false };
  }

  logout() {
    if (typeof this.context.window.logoutUser === 'function') {
      this.context.window.logoutUser();
    }
  }

  getCurrentUser() {
    if (typeof this.context.window.getCurrentUser === 'function') {
      return this.context.window.getCurrentUser();
    }
    return null;
  }

  toggleTheme() {
    if (typeof this.context.window.toggleTheme === 'function') {
      this.context.window.toggleTheme();
    }
  }

  getTheme() {
    return this.document.documentElement.getAttribute('data-theme') || 'light';
  }

  readWorkspaceFile(relativePath) {
    const fullPath = path.join(WORKSPACE_ROOT, relativePath);
    return fs.readFileSync(fullPath, 'utf8');
  }

  readWorkspaceFileLines(relativePath) {
    return this.readWorkspaceFile(relativePath).split(/\r?\n/);
  }
}

module.exports = new ClientSandbox();
