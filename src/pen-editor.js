const penEditorOwnerDoc = document.currentScript.ownerDocument

class PenEditor extends HTMLElement {
  static debounce(f, delay) {
    let timeout;
    return () => {
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => f.apply(this, args), delay);
    }
  }

  static get observedAttributes() {
    return ['hinted'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(penEditorOwnerDoc.getElementById('pen-editor-ce-template').content.cloneNode(true));
    this.editorElement = document.createElement('div');
    this.shadowRoot.appendChild(this.editorElement);
    this.observer = new MutationObserver(PenEditor.debounce(m => {
      this.dispatchEvent(new CustomEvent('value-changed'));
    }, 200));
  }

  connectedCallback() {
    if (!this.pen) {
      this.pen = new Pen({
        editor: this.editorElement,
        list: this.list,
        linksInNewWindow: this.linksInNewWindow,
        stay: false,
        menuParent: this.shadowRoot,
        docFragment: this.shadowRoot,
        docHead: this.shadowRoot,
      });
      this.hinted = this.hasAttribute('hinted');
      this.value = this.getAttribute('value');
      this.removeAttribute('value')
    } else {
      this.pen.rebuild();
    }
    this.observer.observe(this.editorElement, { childList: true, attributes: true, characterData: true, subtree: true });
  }

  disconnectedCallback() {
    this.observer.disconnect();
    this.pen.destroy();
  }

  get list() {
    const lst = this.getAttribute('list');
    if (lst && lst.length > 0) {
      return lst.split(/\s+/);
    }
    return [
      'bold', 'italic', 'underline', 'createlink', 'insertimage',
      'blockquote', 'h2', 'h3', 'p', 'code', 'insertorderedlist', 'insertunorderedlist', 'inserthorizontalrule',
      'indent', 'outdent'
    ];
  }

  get linksInNewWindow() {
    return this.hasAttribute('links-in-new-window');
  }

  get hinted() {
    return this.editorElement.classList.contains('hinted');
  }

  set hinted(val) {
    if (val) {
      this.editorElement.classList.add('hinted');
    } else {
      this.editorElement.classList.remove('hinted');
    }
  }

  get value() {
    return this.pen && this.pen.getContent();
  }

  set value(val) {
    return this.pen.setContent(val);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'hinted') {
      this.hinted = this.hasAttribute('hinted');
    }
  }
}

customElements.define('pen-editor', PenEditor);
