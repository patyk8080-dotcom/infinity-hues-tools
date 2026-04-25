(function setupPromptLibrary() {
  const STORAGE_KEY = 'infinity-hues-prompt-library-v1';

  const state = {
    prompts: [],
    search: '',
  };

  const els = {
    form: document.getElementById('prompt-form'),
    title: document.getElementById('prompt-title'),
    category: document.getElementById('prompt-category'),
    content: document.getElementById('prompt-content'),
    feedback: document.getElementById('form-feedback'),
    clearAll: document.getElementById('clear-all'),
    search: document.getElementById('search'),
    list: document.getElementById('prompt-list'),
    empty: document.getElementById('empty-state'),
  };

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prompts));
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      state.prompts = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(state.prompts)) {
        state.prompts = [];
      }
    } catch (error) {
      state.prompts = [];
    }
  }

  function setFeedback(message) {
    els.feedback.textContent = message;
  }

  function addPrompt(event) {
    event.preventDefault();

    const title = els.title.value.trim();
    const category = els.category.value.trim();
    const content = els.content.value.trim();

    if (!title || !content) {
      setFeedback('Título y prompt son obligatorios.');
      return;
    }

    state.prompts.unshift({
      id: crypto.randomUUID(),
      title,
      category,
      content,
      createdAt: new Date().toISOString(),
    });

    saveState();
    els.form.reset();
    setFeedback('Prompt guardado.');
    render();
  }

  function deletePrompt(id) {
    state.prompts = state.prompts.filter((item) => item.id !== id);
    saveState();
    render();
  }

  async function copyPrompt(id) {
    const item = state.prompts.find((prompt) => prompt.id === id);
    if (!item) {
      return;
    }

    try {
      await navigator.clipboard.writeText(item.content);
      setFeedback('Prompt copiado.');
    } catch (error) {
      setFeedback('No se pudo copiar automáticamente.');
    }
  }

  function filteredPrompts() {
    const q = state.search.trim().toLowerCase();
    if (!q) {
      return state.prompts;
    }

    return state.prompts.filter((item) => {
      const haystack = `${item.title} ${item.category} ${item.content}`.toLowerCase();
      return haystack.includes(q);
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function render() {
    const rows = filteredPrompts();

    els.list.innerHTML = rows.map((item) => `
      <article class="item">
        <div class="item-top">
          <div>
            <h3>${escapeHtml(item.title)}</h3>
            <p class="meta">${escapeHtml(item.category || 'Sin categoría')} · ${new Date(item.createdAt).toLocaleDateString('es-ES')}</p>
          </div>
          <div class="actions-row">
            <button type="button" data-action="copy" data-id="${item.id}">Copiar</button>
            <button type="button" data-action="delete" data-id="${item.id}">Eliminar</button>
          </div>
        </div>
        <pre>${escapeHtml(item.content)}</pre>
      </article>
    `).join('');

    els.empty.style.display = rows.length === 0 ? 'block' : 'none';
  }

  function bindEvents() {
    els.form.addEventListener('submit', addPrompt);

    els.clearAll.addEventListener('click', () => {
      state.prompts = [];
      saveState();
      render();
      setFeedback('Biblioteca limpiada.');
    });

    els.search.addEventListener('input', (event) => {
      state.search = event.target.value;
      render();
    });

    els.list.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const button = target.closest('button[data-action][data-id]');
      if (!button) {
        return;
      }

      const action = button.getAttribute('data-action');
      const id = button.getAttribute('data-id');
      if (!action || !id) {
        return;
      }

      if (action === 'copy') {
        copyPrompt(id);
      }

      if (action === 'delete') {
        deletePrompt(id);
      }
    });
  }

  loadState();
  render();
  bindEvents();
})();
