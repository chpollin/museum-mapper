/**
 * Results Manager - Handles display, filtering, and export of results
 */

export class ResultsManager {
  constructor(app) {
    this.app = app;
    this.filteredResults = [];
    this.currentFilter = 'all';
    this.searchQuery = '';
  }

  init() {
    this.setupFilters();
    this.setupExport();
  }

  setupFilters() {
    const filterSelect = document.getElementById('filter-status');
    const searchInput = document.getElementById('search-input');

    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        this.currentFilter = e.target.value;
        this.filterAndDisplay();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.filterAndDisplay();
      });
    }
  }

  setupExport() {
    document.getElementById('btn-export-all')?.addEventListener('click', () => {
      this.exportResults('all');
    });

    document.getElementById('btn-export-unresolved')?.addEventListener('click', () => {
      this.exportResults('unresolved');
    });
  }

  displayResults() {
    const { results } = this.app.state.data;

    // Update stats
    this.updateStats(results);

    // Filter and display
    this.filteredResults = results;
    this.filterAndDisplay();
  }

  updateStats(results) {
    const stats = {
      ok: results.filter(r => r.status === 'OK').length,
      check: results.filter(r => r.status === 'PRÜFEN').length,
      error: results.filter(r => r.status === 'MUSS_BEARBEITET_WERDEN').length,
      ignore: results.filter(r => r.status === 'IGNORIERT').length
    };

    Object.entries(stats).forEach(([status, count]) => {
      const statElement = document.getElementById(`stat-${status}`);
      if (statElement) {
        statElement.textContent = count.toLocaleString('de-DE');
      }
    });
  }

  filterAndDisplay() {
    let filtered = this.app.state.data.results;

    // Apply status filter
    if (this.currentFilter !== 'all') {
      const statusMap = {
        ok: 'OK',
        check: 'PRÜFEN',
        error: 'MUSS_BEARBEITET_WERDEN',
        ignore: 'IGNORIERT'
      };
      filtered = filtered.filter(r => r.status === statusMap[this.currentFilter]);
    }

    // Apply search filter
    if (this.searchQuery) {
      filtered = filtered.filter(r =>
        r.objectName.toLowerCase().includes(this.searchQuery)
      );
    }

    this.filteredResults = filtered;
    this.renderTable(filtered);
  }

  renderTable(results) {
    const tbody = document.getElementById('results-tbody');
    if (!tbody) return;

    // For performance, only render first 100 rows initially
    const toRender = results.slice(0, 100);

    tbody.innerHTML = toRender.map((result, index) => `
      <tr data-index="${index}" class="status-${result.status.toLowerCase()}">
        <td>${this.escapeHtml(result.objectName)}</td>
        <td>${this.escapeHtml(result.thesaurusTerm)}</td>
        <td>${result.confidence ? result.confidence + '%' : '—'}</td>
        <td><span class="badge ${this.getStatusClass(result.status)}">${result.status}</span></td>
        <td>
          <button class="btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.875rem;" onclick="window.museumMapper.resultsManager.showDetails(${index})">
            Details
          </button>
        </td>
      </tr>
    `).join('');

    if (results.length > 100) {
      tbody.innerHTML += `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-secondary);">
            ${(results.length - 100).toLocaleString('de-DE')} weitere Einträge (verwenden Sie Filter oder Suche)
          </td>
        </tr>
      `;
    }
  }

  getStatusClass(status) {
    const map = {
      'OK': 'ok',
      'PRÜFEN': 'check',
      'MUSS_BEARBEITET_WERDEN': 'error',
      'IGNORIERT': 'ignore'
    };
    return map[status] || 'ignore';
  }

  showDetails(index) {
    const result = this.filteredResults[index];
    if (!result) return;

    const modal = document.getElementById('detail-modal');
    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modal-title');

    if (!modal || !modalBody || !modalTitle) return;

    modalTitle.textContent = result.objectName;
    modalBody.innerHTML = `
      <dl>
        <dt>Objektname</dt>
        <dd>${this.escapeHtml(result.objectName)}</dd>

        <dt>Zugeordneter Begriff</dt>
        <dd><strong>${this.escapeHtml(result.thesaurusTerm)}</strong></dd>

        <dt>CN-Code</dt>
        <dd>${this.escapeHtml(result.cn || '—')}</dd>

        <dt>Term ID</dt>
        <dd>${this.escapeHtml(result.termId || '—')}</dd>

        <dt>Konfidenz</dt>
        <dd>${result.confidence ? result.confidence + '%' : '—'} (${result.method})</dd>

        <dt>Status</dt>
        <dd><span class="badge ${this.getStatusClass(result.status)}">${result.status}</span></dd>
      </dl>

      ${result.reasoning ? `
        <h4>KI-Begründung</h4>
        <p>${this.escapeHtml(result.reasoning)}</p>
      ` : ''}
    `;

    modal.showModal();
  }

  exportResults(type) {
    const { results } = this.app.state.data;
    const toExport = type === 'unresolved'
      ? results.filter(r => r.status === 'MUSS_BEARBEITED_WERDEN')
      : results;

    // Check if SheetJS is loaded
    if (window.XLSX) {
      this.exportAsExcel(toExport, type);
    } else {
      // Fallback to JSON
      this.exportAsJSON(toExport, type);
    }
  }

  exportAsExcel(data, type) {
    const XLSX = window.XLSX;

    // Prepare data for Excel
    const excelData = data.map(r => ({
      'Objektname': r.objectName,
      'Häufigkeit': r.frequency || '',
      'Thesaurus-Begriff': r.thesaurusTerm,
      'CN-Code': r.cn,
      'Term ID': r.termId,
      'Term Master ID': r.termMasterId,
      'Konfidenz': r.confidence ? `${r.confidence}%` : '',
      'Status': r.status,
      'Methode': r.method,
      'Vermerk': r.method.includes('KI') ? 'Thesaurus-Begriff wurde mit Hilfe von KI zugeordnet' : '',
      'Begründung': r.reasoning || ''
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    ws['!cols'] = [
      { wch: 40 },  // Objektname
      { wch: 10 },  // Häufigkeit
      { wch: 25 },  // Thesaurus-Begriff
      { wch: 35 },  // CN-Code
      { wch: 12 },  // Term ID
      { wch: 15 },  // Term Master ID
      { wch: 10 },  // Konfidenz
      { wch: 18 },  // Status
      { wch: 25 },  // Methode
      { wch: 50 },  // Vermerk
      { wch: 50 }   // Begründung
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Mappings');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, -5);
    const filename = `museum-mapper-${type}-${timestamp}.xlsx`;

    // Write file
    XLSX.writeFile(wb, filename);
  }

  exportAsJSON(data, type) {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `museum-mapper-${type}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
