(function setupLinkLibrary() {
  const STORAGE_KEY = 'infinity-hues-link-library-v1';
  const hasDocument = typeof document !== 'undefined';

  const SAMPLE_LINKS = [
    {
      id: crypto.randomUUID(),
      title: 'MDN Web Docs',
      url: 'https://developer.mozilla.org/',
      category: 'Desarrollo',
      tags: ['referencia', 'frontend'],
      notes: 'Documentación completa de tecnologías web.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Can I Use',
      url: 'https://caniuse.com/',
      category: 'Desarrollo',
      tags: ['compatibilidad', 'css', 'js'],
      notes: 'Compatibilidad de APIs y features por navegador.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Google Fonts',
      url: 'https://fonts.google.com/',
      category: 'Diseño',
      tags: ['tipografía', 'ui'],
      notes: 'Biblioteca de fuentes para interfaces y branding.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const state = {
    links: [],
    search: '',
    categoryFilter: '',
    editingId: null,
  };

  const getEl = (id) => (hasDocument ? document.getElementById(id) : null);

  const els = {
    form: getEl('link-form'),
    formTitle: getEl('form-title'),
    linkId: getEl('link-id'),
    title: getEl('link-title'),
    url: getEl('link-url'),
    category: getEl('link-category'),
    tags: getEl('link-tags'),
    notes: getEl('link-notes'),
    formMessage: getEl('form-message'),
    cancelEdit: getEl('cancel-edit'),
    exportJson: getEl('export-json'),
    importJson: getEl('import-json'),
    exportCsv: getEl('export-csv'),
    resetLibrary: getEl('reset-library'),
    importMessage: getEl('import-message'),
    searchInput: getEl('search-input'),
    categoryFilter: getEl('category-filter'),
    linkList: getEl('link-list'),
    emptyState: getEl('empty-state'),
    linkCount: getEl('link-count'),
  };

  function parseTags(value) {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ links: state.links }));
  }

  function normalizeUrl(url) {
    const trimmed = String(url || '').trim();
    if (!trimmed) {
      return '';
    }

    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }

    return `https://${trimmed}`;
  }

  function isValidUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (error) {
      return false;
    }
  }

  function normalizeLink(link) {
    const now = new Date().toISOString();
    const safeUrl = normalizeUrl(link.url);

    return {
      id: typeof link.id === 'string' && link.id ? link.id : crypto.randomUUID(),
      title: typeof link.title === 'string' ? link.title.trim() : '',
      url: safeUrl,
      category: typeof link.category === 'string' ? link.category.trim() : '',
      tags: Array.isArray(link.tags)
        ? link.tags.map((tag) => String(tag).trim()).filter(Boolean)
        : [],
      notes: typeof link.notes === 'string' ? link.notes.trim() : '',
      createdAt: typeof link.createdAt === 'string' ? link.createdAt : now,
      updatedAt: typeof link.updatedAt === 'string' ? link.updatedAt : now,
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        state.links = SAMPLE_LINKS.map((link) => ({ ...link }));
        saveState();
        return;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.links)) {
        throw new Error('Formato inválido');
      }

      const validLinks = parsed.links
        .map(normalizeLink)
        .filter((link) => link.title && link.url && isValidUrl(link.url));

      state.links = validLinks.length ? validLinks : SAMPLE_LINKS.map((link) => ({ ...link }));
      saveState();
    } catch (error) {
      console.warn('No se pudo cargar la biblioteca, se usarán ejemplos.', error);
      state.links = SAMPLE_LINKS.map((link) => ({ ...link }));
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

  function escapeCsv(value) {
    const safe = String(value ?? '').replace(/"/g, '""');
    return `"${safe}"`;
  }

  function getFilteredLinks() {
    const search = state.search.toLowerCase();
    const category = state.categoryFilter.toLowerCase();

    return state.links.filter((link) => {
      const haystack = [link.title, link.url, link.notes, link.tags.join(' '), link.category].join(' ').toLowerCase();
      const matchesSearch = !search || haystack.includes(search);
      const matchesCategory = !category || link.category.toLowerCase().includes(category);
      return matchesSearch && matchesCategory;
    });
  }

  function createLinkCard(link) {
    const item = document.createElement('li');
    item.className = 'link-item';
    item.innerHTML = `
      <div class="link-top">
        <div>
          <h3 class="link-title"><a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.title}</a></h3>
          <p class="link-meta">${link.url} · Categoría: ${link.category || 'Sin categoría'} · Actualizado: ${formatDate(link.updatedAt)}</p>
        </div>
        <div class="link-actions">
          <button type="button" class="btn ghost" data-action="open" data-id="${link.id}">Abrir</button>
          <button type="button" class="btn ghost" data-action="copy-url" data-id="${link.id}">Copiar URL</button>
          <button type="button" class="btn ghost" data-action="copy-card" data-id="${link.id}">Copiar ficha</button>
          <button type="button" class="btn ghost" data-action="duplicate" data-id="${link.id}">Duplicar</button>
          <button type="button" class="btn ghost" data-action="edit" data-id="${link.id}">Editar</button>
          <button type="button" class="btn danger" data-action="delete" data-id="${link.id}">Eliminar</button>
        </div>
      </div>
      <div class="link-tags">${link.tags.map((tag) => `<span class="tag">#${tag}</span>`).join('')}</div>
      <p class="link-notes">${link.notes || 'Sin notas.'}</p>
    `;
    return item;
  }

  function renderList() {
    const filtered = getFilteredLinks().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    els.linkList.innerHTML = '';

    filtered.forEach((link) => {
      els.linkList.appendChild(createLinkCard(link));
    });

    els.linkCount.textContent = `${filtered.length} link${filtered.length === 1 ? '' : 's'}`;
    els.emptyState.style.display = filtered.length ? 'none' : 'block';
  }

  function clearForm() {
    els.linkId.value = '';
    els.title.value = '';
    els.url.value = '';
    els.category.value = '';
    els.tags.value = '';
    els.notes.value = '';
    state.editingId = null;
    els.formTitle.textContent = 'Nuevo link';
    els.cancelEdit.classList.add('hidden');
  }

  function fillForm(link) {
    els.linkId.value = link.id;
    els.title.value = link.title;
    els.url.value = link.url;
    els.category.value = link.category;
    els.tags.value = link.tags.join(', ');
    els.notes.value = link.notes;
    state.editingId = link.id;
    els.formTitle.textContent = 'Editar link';
    els.cancelEdit.classList.remove('hidden');
  }

  function upsertLink(event) {
    event.preventDefault();
    const title = els.title.value.trim();
    const rawUrl = els.url.value.trim();
    const normalizedUrl = normalizeUrl(rawUrl);

    if (!title || !normalizedUrl) {
      setFormMessage('Título y URL son obligatorios.', 'error');
      return;
    }

    if (!isValidUrl(normalizedUrl)) {
      setFormMessage('URL inválida. Usa un enlace http o https.', 'error');
      return;
    }

    const now = new Date().toISOString();
    const linkData = {
      id: state.editingId || crypto.randomUUID(),
      title,
      url: normalizedUrl,
      category: els.category.value.trim(),
      tags: parseTags(els.tags.value),
      notes: els.notes.value.trim(),
      createdAt: now,
      updatedAt: now,
    };

    const existingIndex = state.links.findIndex((link) => link.id === linkData.id);

    if (existingIndex >= 0) {
      linkData.createdAt = state.links[existingIndex].createdAt;
      state.links[existingIndex] = linkData;
      setFormMessage('Link actualizado correctamente.', 'success');
    } else {
      state.links.push(linkData);
      setFormMessage('Link guardado correctamente.', 'success');
    }

    saveState();
    clearForm();
    renderList();
  }

  function editLinkById(id) {
    const link = state.links.find((item) => item.id === id);
    if (!link) {
      return;
    }

    fillForm(link);
    setFormMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deleteLinkById(id) {
    state.links = state.links.filter((link) => link.id !== id);
    if (state.editingId === id) {
      clearForm();
    }

    saveState();
    renderList();
    els.importMessage.textContent = 'Link eliminado.';
  }

  function duplicateLinkById(id) {
    const link = state.links.find((item) => item.id === id);
    if (!link) {
      return;
    }

    const now = new Date().toISOString();
    const duplicate = {
      ...link,
      id: crypto.randomUUID(),
      title: `Copia de ${link.title}`,
      createdAt: now,
      updatedAt: now,
    };

    state.links.unshift(duplicate);
    saveState();
    renderList();
    fillForm(duplicate);
    els.importMessage.textContent = 'Copia creada. Puedes editarla y guardarla.';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openLinkById(id) {
    const link = state.links.find((item) => item.id === id);
    if (!link) {
      return;
    }

    window.open(link.url, '_blank', 'noopener,noreferrer');
  }

  async function copyUrlById(id) {
    const link = state.links.find((item) => item.id === id);
    if (!link) {
      return;
    }

    try {
      await navigator.clipboard.writeText(link.url);
      els.importMessage.textContent = `URL copiada: ${link.title}`;
    } catch (error) {
      els.importMessage.textContent = 'No se pudo copiar automáticamente la URL.';
    }
  }

  async function copyCardById(id) {
    const link = state.links.find((item) => item.id === id);
    if (!link) {
      return;
    }

    const fullCard = [
      `Título: ${link.title}`,
      `URL: ${link.url}`,
      `Categoría: ${link.category || 'Sin categoría'}`,
      `Etiquetas: ${link.tags.length ? link.tags.join(', ') : 'Sin etiquetas'}`,
      `Notas: ${link.notes || 'Sin notas'}`,
      `Actualizado: ${formatDate(link.updatedAt)}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(fullCard);
      els.importMessage.textContent = `Ficha copiada: ${link.title}`;
    } catch (error) {
      els.importMessage.textContent = 'No se pudo copiar automáticamente la ficha.';
    }
  }

  function exportJson() {
    const payload = {
      exportedAt: new Date().toISOString(),
      version: 1,
      links: state.links,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biblioteca-links-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    els.importMessage.textContent = 'JSON exportado correctamente.';
  }

  function exportCsv() {
    const header = ['title', 'url', 'category', 'tags', 'notes', 'createdAt', 'updatedAt'];
    const rows = state.links.map((link) => [
      link.title,
      link.url,
      link.category,
      link.tags.join(', '),
      link.notes,
      link.createdAt,
      link.updatedAt,
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map(escapeCsv).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biblioteca-links-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    els.importMessage.textContent = 'CSV exportado correctamente.';
  }

  async function importJson(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data.links)) {
        throw new Error('El JSON no contiene un array links.');
      }

      const importedLinks = data.links
        .map(normalizeLink)
        .filter((link) => link.title && link.url && isValidUrl(link.url));

      if (!importedLinks.length) {
        throw new Error('No hay links válidos para importar.');
      }

      state.links = importedLinks;
      saveState();
      renderList();
      clearForm();
      setFormMessage('');
      els.importMessage.textContent = `Importación exitosa: ${importedLinks.length} links.`;
    } catch (error) {
      els.importMessage.textContent = `Error al importar JSON: ${error.message}`;
    } finally {
      event.target.value = '';
    }
  }

  function resetWithExamples() {
    state.links = SAMPLE_LINKS.map((link) => ({ ...link, id: crypto.randomUUID() }));
    saveState();
    renderList();
    clearForm();
    setFormMessage('');
    els.importMessage.textContent = 'Biblioteca restaurada con links de ejemplo.';
  }

  function bindEvents() {
    els.form.addEventListener('submit', upsertLink);
    els.cancelEdit.addEventListener('click', () => {
      clearForm();
      setFormMessage('Edición cancelada.', 'success');
    });

    els.linkList.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const action = target.getAttribute('data-action');
      const id = target.getAttribute('data-id');
      if (!action || !id) {
        return;
      }

      if (action === 'open') {
        openLinkById(id);
      }

      if (action === 'copy-url') {
        copyUrlById(id);
      }

      if (action === 'copy-card') {
        copyCardById(id);
      }

      if (action === 'duplicate') {
        duplicateLinkById(id);
      }

      if (action === 'edit') {
        editLinkById(id);
      }

      if (action === 'delete') {
        deleteLinkById(id);
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
    els.exportCsv.addEventListener('click', exportCsv);
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
