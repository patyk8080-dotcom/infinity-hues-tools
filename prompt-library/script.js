(function setupPromptLibrary() {
  const STORAGE_KEY = 'infinity-hues-prompt-library-v1';
  const hasDocument = typeof document !== 'undefined';

  const SAMPLE_PROMPTS = [
    {
      id: crypto.randomUUID(),
      title: 'Analiza este copy para anuncio',
      category: 'Marketing',
      tags: ['ads', 'copy', 'meta'],
      content: 'Actúa como estratega de performance. Evalúa este copy para anuncio en Meta Ads y devuelve: 1) claridad del gancho, 2) objeciones no resueltas, 3) versión mejorada con CTA más fuerte. Texto: {{copy}}',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Outline para ebook en KDP',
      category: 'KDP',
      tags: ['kdp', 'ebook', 'outline'],
      content: 'Eres editor senior de no ficción. Crea un outline de 10 capítulos sobre {{tema}} para un ebook de 20,000 palabras. Incluye objetivo por capítulo, puntos clave y propuesta de título.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Resumen ejecutivo de ideas',
      category: 'Productividad',
      tags: ['resumen', 'decisiones'],
      content: 'Convierte estas notas sueltas en un resumen ejecutivo de máximo 8 bullets con lenguaje claro y orientado a decisión. Notas: {{notas}}',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const state = {
    prompts: [],
    search: '',
    categoryFilter: '',
    editingId: null,
  };

  const getEl = (id) => (hasDocument ? document.getElementById(id) : null);

  const els = {
    form: getEl('prompt-form'),
    formTitle: getEl('form-title'),
    promptId: getEl('prompt-id'),
    title: getEl('prompt-title'),
    category: getEl('prompt-category'),
    tags: getEl('prompt-tags'),
    content: getEl('prompt-content'),
    formMessage: getEl('form-message'),
    cancelEdit: getEl('cancel-edit'),
    exportJson: getEl('export-json'),
    importJson: getEl('import-json'),
    resetLibrary: getEl('reset-library'),
    importMessage: getEl('import-message'),
    searchInput: getEl('search-input'),
    categoryFilter: getEl('category-filter'),
    promptList: getEl('prompt-list'),
    emptyState: getEl('empty-state'),
    promptCount: getEl('prompt-count'),
  };

  function parseTags(value) {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ prompts: state.prompts }));
  }

  function normalizePrompt(prompt) {
    const now = new Date().toISOString();

    return {
      id: typeof prompt.id === 'string' && prompt.id ? prompt.id : crypto.randomUUID(),
      title: typeof prompt.title === 'string' ? prompt.title.trim() : '',
      category: typeof prompt.category === 'string' ? prompt.category.trim() : '',
      tags: Array.isArray(prompt.tags)
        ? prompt.tags.map((tag) => String(tag).trim()).filter(Boolean)
        : [],
      content: typeof prompt.content === 'string' ? prompt.content.trim() : '',
      createdAt: typeof prompt.createdAt === 'string' ? prompt.createdAt : now,
      updatedAt: typeof prompt.updatedAt === 'string' ? prompt.updatedAt : now,
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        state.prompts = SAMPLE_PROMPTS.map((prompt) => ({ ...prompt }));
        saveState();
        return;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.prompts)) {
        throw new Error('Formato inválido');
      }

      const validPrompts = parsed.prompts
        .map(normalizePrompt)
        .filter((prompt) => prompt.title && prompt.content);

      state.prompts = validPrompts.length ? validPrompts : SAMPLE_PROMPTS.map((prompt) => ({ ...prompt }));
      saveState();
    } catch (error) {
      console.warn('No se pudo cargar la biblioteca, se usarán ejemplos.', error);
      state.prompts = SAMPLE_PROMPTS.map((prompt) => ({ ...prompt }));
      saveState();
    }
  }

  function setFormMessage(message, type) {
    els.formMessage.textContent = message;
    els.formMessage.className = `form-message ${type || ''}`.trim();
  }

  function formatDate(value) {
    try {
      return new Date(value).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
    } catch (error) {
      return value;
    }
  }

  function getFilteredPrompts() {
    const search = state.search.toLowerCase();
    const category = state.categoryFilter.toLowerCase();

    return state.prompts.filter((prompt) => {
      const haystack = [prompt.title, prompt.content, prompt.tags.join(' '), prompt.category].join(' ').toLowerCase();
      const matchesSearch = !search || haystack.includes(search);
      const matchesCategory = !category || prompt.category.toLowerCase().includes(category);
      return matchesSearch && matchesCategory;
    });
  }

  function renderList() {
    const filtered = getFilteredPrompts().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    els.promptList.innerHTML = '';

    filtered.forEach((prompt) => {
      const item = document.createElement('li');
      item.className = 'prompt-item';
      item.innerHTML = `
        <div class="prompt-top">
          <div>
            <h3 class="prompt-title">${prompt.title}</h3>
            <p class="prompt-meta">Categoría: ${prompt.category || 'Sin categoría'} · Actualizado: ${formatDate(prompt.updatedAt)}</p>
          </div>
          <div class="prompt-actions">
            <button type="button" class="btn ghost" data-action="edit" data-id="${prompt.id}">Editar</button>
            <button type="button" class="btn danger" data-action="delete" data-id="${prompt.id}">Eliminar</button>
          </div>
        </div>
        <div class="prompt-tags">${prompt.tags.map((tag) => `<span class="tag">#${tag}</span>`).join('')}</div>
        <p class="prompt-content">${prompt.content}</p>
      `;
      els.promptList.appendChild(item);
    });

    els.promptCount.textContent = `${filtered.length} prompt${filtered.length === 1 ? '' : 's'}`;
    els.emptyState.style.display = filtered.length ? 'none' : 'block';
  }

  function clearForm() {
    els.promptId.value = '';
    els.title.value = '';
    els.category.value = '';
    els.tags.value = '';
    els.content.value = '';
    state.editingId = null;
    els.formTitle.textContent = 'Nuevo prompt';
    els.cancelEdit.classList.add('hidden');
  }

  function fillForm(prompt) {
    els.promptId.value = prompt.id;
    els.title.value = prompt.title;
    els.category.value = prompt.category;
    els.tags.value = prompt.tags.join(', ');
    els.content.value = prompt.content;
    state.editingId = prompt.id;
    els.formTitle.textContent = 'Editar prompt';
    els.cancelEdit.classList.remove('hidden');
  }

  function upsertPrompt(event) {
    event.preventDefault();
    const title = els.title.value.trim();
    const content = els.content.value.trim();

    if (!title || !content) {
      setFormMessage('Título y prompt son obligatorios.', 'error');
      return;
    }

    const now = new Date().toISOString();
    const promptData = {
      id: state.editingId || crypto.randomUUID(),
      title,
      category: els.category.value.trim(),
      tags: parseTags(els.tags.value),
      content,
      createdAt: now,
      updatedAt: now,
    };

    const existingIndex = state.prompts.findIndex((prompt) => prompt.id === promptData.id);

    if (existingIndex >= 0) {
      promptData.createdAt = state.prompts[existingIndex].createdAt;
      state.prompts[existingIndex] = promptData;
      setFormMessage('Prompt actualizado correctamente.', 'success');
    } else {
      state.prompts.push(promptData);
      setFormMessage('Prompt guardado correctamente.', 'success');
    }

    saveState();
    clearForm();
    renderList();
  }

  function editPromptById(id) {
    const prompt = state.prompts.find((item) => item.id === id);
    if (!prompt) {
      return;
    }

    fillForm(prompt);
    setFormMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deletePromptById(id) {
    state.prompts = state.prompts.filter((prompt) => prompt.id !== id);
    if (state.editingId === id) {
      clearForm();
    }

    saveState();
    renderList();
    setFormMessage('Prompt eliminado.', 'success');
  }

  function exportJson() {
    const payload = {
      exportedAt: new Date().toISOString(),
      version: 1,
      prompts: state.prompts,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biblioteca-prompts-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    els.importMessage.textContent = 'JSON exportado correctamente.';
  }

  async function importJson(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data.prompts)) {
        throw new Error('El JSON no contiene un array prompts.');
      }

      const importedPrompts = data.prompts
        .map(normalizePrompt)
        .filter((prompt) => prompt.title && prompt.content);

      if (!importedPrompts.length) {
        throw new Error('No hay prompts válidos para importar.');
      }

      state.prompts = importedPrompts;
      saveState();
      renderList();
      clearForm();
      setFormMessage('');
      els.importMessage.textContent = `Importación exitosa: ${importedPrompts.length} prompts.`;
    } catch (error) {
      els.importMessage.textContent = `Error al importar JSON: ${error.message}`;
    } finally {
      event.target.value = '';
    }
  }

  function resetWithExamples() {
    state.prompts = SAMPLE_PROMPTS.map((prompt) => ({ ...prompt, id: crypto.randomUUID() }));
    saveState();
    renderList();
    clearForm();
    setFormMessage('');
    els.importMessage.textContent = 'Biblioteca restaurada con prompts de ejemplo.';
  }

  function bindEvents() {
    els.form.addEventListener('submit', upsertPrompt);
    els.cancelEdit.addEventListener('click', () => {
      clearForm();
      setFormMessage('Edición cancelada.', 'success');
    });

    els.promptList.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const action = target.getAttribute('data-action');
      const id = target.getAttribute('data-id');
      if (!action || !id) {
        return;
      }

      if (action === 'edit') {
        editPromptById(id);
      }

      if (action === 'delete') {
        deletePromptById(id);
      }
    });

    els.searchInput.addEventListener('input', (event) => {
      state.search = event.target.value || '';
      renderList();
    });

    els.categoryFilter.addEventListener('input', (event) => {
      state.categoryFilter = event.target.value || '';
      renderList();
    });

    els.exportJson.addEventListener('click', exportJson);
    els.importJson.addEventListener('change', importJson);
    els.resetLibrary.addEventListener('click', resetWithExamples);
  }

  function init() {
    loadState();
    bindEvents();
    renderList();
  }

  if (hasDocument) {
    init();
  }
})();
