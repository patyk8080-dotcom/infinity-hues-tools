(function setupPlaylistTimer() {
  const STORAGE_KEY = 'infinity-hues-playlist-timer-v1';
  const hasDocument = typeof document !== 'undefined';

  const state = {
    songs: [],
    targetSeconds: 60 * 60,
  };

  const getEl = (id) => (hasDocument ? document.getElementById(id) : null);

  const els = {
    form: getEl('song-form'),
    songName: getEl('song-name'),
    minutes: getEl('minutes'),
    seconds: getEl('seconds'),
    targetMinutes: getEl('target-minutes'),
    formError: getEl('form-error'),
    clearAll: getEl('clear-all'),
    historyBody: getEl('history-body'),
    emptyState: getEl('empty-state'),
    totalTime: getEl('total-time'),
    remainingTime: getEl('remaining-time'),
    progressPercent: getEl('progress-percent'),
    progressBar: getEl('progress-bar'),
    statusPill: getEl('status-pill'),
    songCount: getEl('song-count'),
    copySummary: getEl('copy-summary'),
    copyFeedback: getEl('copy-feedback'),
  };

  function parseIntegerOrZero(value) {
    if (value === '' || value === null || value === undefined) {
      return 0;
    }

    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatTime(totalSeconds) {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.songs)) {
        state.songs = parsed.songs
          .filter((song) => typeof song.durationSeconds === 'number' && song.durationSeconds > 0)
          .map((song) => ({
            name: typeof song.name === 'string' ? song.name : '',
            durationSeconds: Math.floor(song.durationSeconds),
          }));
      }

      if (typeof parsed.targetSeconds === 'number' && parsed.targetSeconds >= 60) {
        state.targetSeconds = Math.floor(parsed.targetSeconds);
      }
    } catch (error) {
      console.warn('No se pudo cargar el estado guardado.', error);
    }
  }

  function getTotalSeconds() {
    return state.songs.reduce((sum, song) => sum + song.durationSeconds, 0);
  }

  function getStatus(total, target) {
    if (total < target) {
      return { label: 'Falta música', className: 'under' };
    }

    if (total === target) {
      return { label: 'Perfecto', className: 'exact' };
    }

    return { label: 'Te pasaste', className: 'over' };
  }

  function renderHistory() {
    els.historyBody.innerHTML = '';

    let runningTotal = 0;

    state.songs.forEach((song, index) => {
      runningTotal += song.durationSeconds;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${song.name.trim() || '—'}</td>
        <td>${formatTime(song.durationSeconds)}</td>
        <td>${formatTime(runningTotal)}</td>
        <td><button class="btn delete-btn" data-index="${index}" type="button">Eliminar</button></td>
      `;

      els.historyBody.appendChild(row);
    });

    els.emptyState.style.display = state.songs.length === 0 ? 'block' : 'none';
    els.songCount.textContent = `${state.songs.length} canción${state.songs.length === 1 ? '' : 'es'}`;
  }

  function renderSummary() {
    const total = getTotalSeconds();
    const target = state.targetSeconds;
    const remaining = Math.max(0, target - total);
    const completion = target > 0 ? (total / target) * 100 : 0;
    const status = getStatus(total, target);

    els.totalTime.textContent = formatTime(total);
    els.remainingTime.textContent = formatTime(remaining);
    els.progressPercent.textContent = `${completion.toFixed(1)}%`;
    els.progressBar.style.width = `${Math.min(completion, 100)}%`;

    els.statusPill.textContent = status.label;
    els.statusPill.className = `status-pill ${status.className}`;
  }

  function render() {
    renderHistory();
    renderSummary();
  }

  function clearFormSongInputs() {
    els.songName.value = '';
    els.minutes.value = '';
    els.seconds.value = '';
  }

  function addSong(event) {
    event.preventDefault();
    els.formError.textContent = '';

    const name = els.songName.value.trim();
    const minutes = parseIntegerOrZero(els.minutes.value);
    const seconds = parseIntegerOrZero(els.seconds.value);

    if (minutes < 0) {
      els.formError.textContent = 'Los minutos no pueden ser negativos.';
      return;
    }

    if (seconds < 0 || seconds > 59) {
      els.formError.textContent = 'Los segundos deben estar entre 0 y 59.';
      return;
    }

    const durationSeconds = minutes * 60 + seconds;

    if (durationSeconds === 0) {
      els.formError.textContent = 'No puedes añadir una canción de 00:00.';
      return;
    }

    state.songs.push({ name, durationSeconds });

    saveState();
    render();
    clearFormSongInputs();
  }

  function updateTargetDuration() {
    const targetMinutes = parseIntegerOrZero(els.targetMinutes.value);

    if (targetMinutes <= 0) {
      els.targetMinutes.value = String(Math.floor(state.targetSeconds / 60));
      return;
    }

    state.targetSeconds = targetMinutes * 60;
    saveState();
    renderSummary();
  }

  function removeSongAt(index) {
    if (index < 0 || index >= state.songs.length) {
      return;
    }

    state.songs.splice(index, 1);
    saveState();
    render();
  }

  async function copySummaryToClipboard() {
    const total = getTotalSeconds();
    const target = state.targetSeconds;
    const status = getStatus(total, target).label;

    const lines = [];
    lines.push('Infinity Hues Playlist Timer');
    lines.push(`Objetivo: ${formatTime(target)}`);
    lines.push('');

    if (state.songs.length === 0) {
      lines.push('Sin canciones añadidas.');
    } else {
      lines.push('Canciones:');
      let running = 0;

      state.songs.forEach((song, idx) => {
        running += song.durationSeconds;
        const label = song.name.trim() || 'Sin nombre';
        lines.push(`${idx + 1}. ${label} - ${formatTime(song.durationSeconds)} (acumulado ${formatTime(running)})`);
      });
    }

    lines.push('');
    lines.push(`Total acumulado: ${formatTime(total)}`);
    lines.push(`Tiempo restante: ${formatTime(Math.max(0, target - total))}`);
    lines.push(`Estado final: ${status}`);

    const summaryText = lines.join('\n');

    try {
      await navigator.clipboard.writeText(summaryText);
      els.copyFeedback.textContent = 'Resumen copiado al portapapeles.';
    } catch (error) {
      els.copyFeedback.textContent = 'No se pudo copiar automáticamente. Puedes copiarlo manualmente.';
      console.error(error);
    }
  }

  function clearAllSongs() {
    state.songs = [];
    saveState();
    render();
    els.copyFeedback.textContent = '';
  }

  function bindEvents() {
    els.form.addEventListener('submit', addSong);
    els.targetMinutes.addEventListener('change', updateTargetDuration);
    els.targetMinutes.addEventListener('blur', updateTargetDuration);

    els.historyBody.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (target.matches('button[data-index]')) {
        const index = Number.parseInt(target.getAttribute('data-index') || '-1', 10);
        removeSongAt(index);
      }
    });

    els.clearAll.addEventListener('click', clearAllSongs);
    els.copySummary.addEventListener('click', copySummaryToClipboard);
  }

  function init() {
    loadState();
    els.targetMinutes.value = String(Math.floor(state.targetSeconds / 60));
    bindEvents();
    render();
  }

  if (hasDocument) {
    init();
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseIntegerOrZero, formatTime, getStatus };
  }
})();
