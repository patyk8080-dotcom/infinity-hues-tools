(function setupLinkLibrary() {
  const STORAGE_KEY = 'infinity-hues-link-library-v1';

  const SAMPLE_LINKS = [
    {
      id: crypto.randomUUID(),
      title: 'Guía oficial de HTML - MDN',
      url: 'https://developer.mozilla.org/es/docs/Web/HTML',
      category: 'Desarrollo',
      tags: ['html', 'referencia'],
      notes: 'Referencia base para etiquetas, estructura y semántica.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Google Search Central',
      url: 'https://developers.google.com/search',
      category: 'SEO',
      tags: ['seo', 'guías'],
      notes: 'Buenas prácticas para indexación y calidad técnica.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Canva Design School',
      url: 'https://www.canva.com/learn/',
      category: 'Diseño',
      tags: ['diseño', 'contenido'],
      notes: 'Ideas de diseño visual aplicables a creatividades.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const state = {
    links: [],
    editingId: null,
    search: '',
    categoryFilter: '',
  };

  const els = {
    form: document.getElementById('link-form'),
    linkId: document.getElementById('link-id'),
    title: document.getElementById('link-title'),
    url: document.getElementById('link-url'),
    category: document.getElementById('link-category'),
    tags: document.getElementById('link-tags'),
    notes: document.getElementById('link-notes'),
    formTitle: document.getElementById('form-title'),
    submitBtn: document.getElementById('submit-btn'),
    cancelEdit: document.getElementById('cancel-edit'),
    formFeedback: document.getElementById('form-feedback'),
    searchInput: document.getElementById('search-input'),
    categoryFilter: document.getElementById('category-filter'),
    exportJsonBtn: document.getElementById('export-json'),
    exportCsvBtn: document.getElementById('export-csv'),
    importJsonInput: document.getElementById('import-json'),
    toolbarFeedback: document.getElementById('toolbar-feedback'),
    linksBody: document.getElementById('links-body'),
    emptyState: document.getElementById('empty-state'),
  };

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ links: state.links }));
  }

  function normalizeUrl(value) {
    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }

    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }

    return `https://${trimmed}`;
  }

  function splitTags(value) {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        state.links = SAMPLE_LINKS;
        saveState();
        return;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.links)) {
        state.links = SAMPLE_LINKS;
        saveState();
        return;
      }

      state.links = parsed.links
        .map((item) => sanitizeLink(item))
        .filter(Boolean);

      if (state.links.length === 0) {
        state.links = SAMPLE_LINKS;
        saveState();
      }
    } catch (error) {
      console.warn('No se pudo cargar la biblioteca. Se inicializa con ejemplos.', error);
      state.links = SAMPLE_LINKS;
      saveState();
    }
  }

  function sanitizeLink(item) {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const title = typeof item.title === 'string' ? item.title.trim() : '';
    const rawUrl = typeof item.url === 'string' ? item.url.trim() : '';
    const url = normalizeUrl(rawUrl);

    if (!title || !url) {
      return null;
    }

    return {
      id: typeof item.id === 'string' && item.id ? item.id : crypto.randomUUID(),
      title,
      url,
      category: typeof item.category === 'string' ? item.category.trim() : '',
      tags: Array.isArray(item.tags) ? item.tags.map((tag) => String(tag).trim()).filter(Boolean) : splitTags(String(item.tags || '')),
      notes: typeof item.notes === 'string' ? item.notes.trim() : '',
      createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
      updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : new Date().toISOString(),
    };
  }

  function setFeedback(el, message, isError) {
    el.textContent = message;
    el.classList.toggle('error', Boolean(isError));
  }

  function clearForm() {
    state.editingId = null;
    els.linkId.value = '';
    els.title.value = '';
    els.url.value = '';
    els.category.value = '';
    els.tags.value = '';
    els.notes.value = '';
    els.formTitle.textContent = 'Nuevo link';
    els.submitBtn.textContent = 'Guardar link';
    els.cancelEdit.hidden = true;
    setFeedback(els.formFeedback, '', false);
  }

  function startEdit(id) {
    const item = state.links.find((link) => link.id === id);
    if (!item) {
      return;
    }

    state.editingId = id;
    els.linkId.value = id;
    els.title.value = item.title;
    els.url.value = item.url;
    els.category.value = item.category;
    els.tags.value = item.tags.join(', ');
    els.notes.value = item.notes;
    els.formTitle.textContent = 'Editar link';
    els.submitBtn.textContent = 'Guardar cambios';
    els.cancelEdit.hidden = false;
    setFeedback(els.formFeedback, 'Modo edición activo.', false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function upsertLink(event) {
    event.preventDefault();
    setFeedback(els.formFeedback, '', false);

    const title = els.title.value.trim();
    const url = normalizeUrl(els.url.value);

    if (!title || !url) {
      setFeedback(els.formFeedback, 'Título y URL son obligatorios.', true);
      return;
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Protocolo no permitido');
      }
    } catch (error) {
      setFeedback(els.formFeedback, 'La URL no es válida.', true);
      return;
    }

    const now = new Date().toISOString();
    const payload = {
      id: state.editingId || crypto.randomUUID(),
      title,
      url: parsedUrl.toString(),
      category: els.category.value.trim(),
      tags: splitTags(els.tags.value),
      notes: els.notes.value.trim(),
      createdAt: now,
      updatedAt: now,
    };

    if (state.editingId) {
      const index = state.links.findIndex((link) => link.id === state.editingId);
      if (index === -1) {
        setFeedback(els.formFeedback, 'No se encontró el link a editar.', true);
        return;
      }

      payload.createdAt = state.links[index].createdAt;
      state.links[index] = payload;
      setFeedback(els.formFeedback, 'Link actualizado.', false);
    } else {
      state.links.unshift(payload);
      setFeedback(els.formFeedback, 'Link guardado.', false);
    }

    saveState();
    clearForm();
    render();
  }

  function deleteLink(id) {
    const index = state.links.findIndex((link) => link.id === id);
    if (index < 0) {
      return;
    }

    state.links.splice(index, 1);
    saveState();
    render();
    setFeedback(els.toolbarFeedback, 'Link eliminado.', false);
  }

  function duplicateLink(id) {
    const item = state.links.find((link) => link.id === id);
    if (!item) {
      return;
    }

    const now = new Date().toISOString();
    state.links.unshift({
      ...item,
      id: crypto.randomUUID(),
      title: `${item.title} (copia)`,
      createdAt: now,
      updatedAt: now,
    });

    saveState();
    render();
    setFeedback(els.toolbarFeedback, 'Link duplicado.', false);
  }

  async function copyUrl(id) {
    const item = state.links.find((link) => link.id === id);
    if (!item) {
      return;
    }

    try {
      await navigator.clipboard.writeText(item.url);
      setFeedback(els.toolbarFeedback, 'URL copiada.', false);
    } catch (error) {
      setFeedback(els.toolbarFeedback, 'No se pudo copiar la URL automáticamente.', true);
    }
  }

  async function copyCard(id) {
    const item = state.links.find((link) => link.id === id);
    if (!item) {
      return;
    }

    const text = [
      `Título: ${item.title}`,
      `URL: ${item.url}`,
      `Categoría: ${item.category || 'Sin categoría'}`,
      `Tags: ${item.tags.length > 0 ? item.tags.join(', ') : 'Sin tags'}`,
      `Notas: ${item.notes || 'Sin notas'}`,
      `Actualizado: ${new Date(item.updatedAt).toLocaleString('es-ES')}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setFeedback(els.toolbarFeedback, 'Ficha completa copiada.', false);
    } catch (error) {
      setFeedback(els.toolbarFeedback, 'No se pudo copiar la ficha automáticamente.', true);
    }
  }

  function filteredLinks() {
    const search = state.search.toLowerCase().trim();
    const category = state.categoryFilter.trim().toLowerCase();

    return state.links.filter((link) => {
      const passesCategory = !category || link.category.toLowerCase() === category;
      if (!passesCategory) {
        return false;
      }

      if (!search) {
        return true;
      }

      const haystack = [
        link.title,
        link.url,
        link.category,
        link.tags.join(' '),
        link.notes,
      ].join(' ').toLowerCase();

      return haystack.includes(search);
    });
  }

  function escapeHtml(value) {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function renderCategories() {
    const categories = [...new Set(state.links.map((link) => link.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const previous = state.categoryFilter;

    els.categoryFilter.innerHTML = '<option value="">Todas</option>';
    categories.forEach((category) => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      els.categoryFilter.appendChild(option);
    });

    els.categoryFilter.value = categories.includes(previous) ? previous : '';
    state.categoryFilter = els.categoryFilter.value;
  }

  function renderTable() {
    const results = filteredLinks();

    els.linksBody.innerHTML = results.map((link) => `
      <tr>
        <td class="title-cell">
          <strong>${escapeHtml(link.title)}</strong>
          <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.url)}</a>
          <div class="meta">Actualizado: ${new Date(link.updatedAt).toLocaleDateString('es-ES')}</div>
        </td>
        <td>${escapeHtml(link.category || '—')}</td>
        <td>${escapeHtml(link.tags.join(', ') || '—')}</td>
        <td>
          <div class="row-actions" data-id="${link.id}">
            <button type="button" data-action="open">Abrir</button>
            <button type="button" data-action="copy-url">Copiar URL</button>
            <button type="button" data-action="copy-card">Copiar ficha</button>
            <button type="button" data-action="edit">Editar</button>
            <button type="button" data-action="duplicate">Duplicar</button>
            <button type="button" class="danger" data-action="delete">Eliminar</button>
          </div>
        </td>
      </tr>
    `).join('');

    els.emptyState.style.display = results.length === 0 ? 'block' : 'none';
  }

  function render() {
    renderCategories();
    renderTable();
  }

  function exportJson() {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      links: state.links,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `biblioteca-links-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);

    setFeedback(els.toolbarFeedback, 'JSON exportado.', false);
  }

  function csvCell(value) {
    const safe = String(value ?? '').replaceAll('"', '""');
    return `"${safe}"`;
  }

  function exportCsv() {
    const header = ['title', 'url', 'category', 'tags', 'notes', 'createdAt', 'updatedAt'];
    const rows = state.links.map((link) => [
      link.title,
      link.url,
      link.category,
      link.tags.join('|'),
      link.notes,
      link.createdAt,
      link.updatedAt,
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map(csvCell).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `biblioteca-links-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);

    setFeedback(els.toolbarFeedback, 'CSV exportado.', false);
  }

  async function importJsonFile(file) {
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const sourceLinks = Array.isArray(parsed) ? parsed : parsed.links;

      if (!Array.isArray(sourceLinks)) {
        throw new Error('El JSON no contiene un array de links');
      }

      const sanitized = sourceLinks.map((item) => sanitizeLink(item)).filter(Boolean);
      if (sanitized.length === 0) {
        throw new Error('No se encontraron links válidos para importar');
      }

      state.links = sanitized;
      saveState();
      render();
      setFeedback(els.toolbarFeedback, `Importación completa: ${sanitized.length} links.`, false);
    } catch (error) {
      setFeedback(els.toolbarFeedback, `Error al importar JSON: ${error.message}`, true);
    } finally {
      els.importJsonInput.value = '';
    }
  }

  function handleTableAction(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const button = target.closest('button[data-action]');
    const container = target.closest('.row-actions[data-id]');

    if (!button || !container) {
      return;
    }

    const action = button.getAttribute('data-action');
    const id = container.getAttribute('data-id');

    if (!action || !id) {
      return;
    }

    if (action === 'open') {
      const item = state.links.find((link) => link.id === id);
      if (item) {
        window.open(item.url, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    if (action === 'copy-url') {
      copyUrl(id);
      return;
    }

    if (action === 'copy-card') {
      copyCard(id);
      return;
    }

    if (action === 'edit') {
      startEdit(id);
      return;
    }

    if (action === 'duplicate') {
      duplicateLink(id);
      return;
    }

    if (action === 'delete') {
      deleteLink(id);
    }
  }

  function bindEvents() {
    els.form.addEventListener('submit', upsertLink);
    els.cancelEdit.addEventListener('click', clearForm);

    els.searchInput.addEventListener('input', (event) => {
      state.search = event.target.value;
      renderTable();
    });

    els.categoryFilter.addEventListener('change', (event) => {
      state.categoryFilter = event.target.value;
      renderTable();
    });

    els.exportJsonBtn.addEventListener('click', exportJson);
    els.exportCsvBtn.addEventListener('click', exportCsv);

    els.importJsonInput.addEventListener('change', (event) => {
      const [file] = event.target.files || [];
      importJsonFile(file);
    });

    els.linksBody.addEventListener('click', handleTableAction);
  }

  loadState();
  clearForm();
  render();
  bindEvents();
})();
