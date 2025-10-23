/**
 * File Uploader - Handles file uploads and validation
 */

export class FileUploader {
  constructor(app) {
    this.app = app;
    this.parsers = {
      xlsx: null,  // Will be loaded from CDN
      csv: null    // Will be loaded from CDN
    };
  }

  init() {
    this.loadLibraries();
    this.setupDropzones();
  }

  async loadLibraries() {
    // Load SheetJS for Excel parsing
    const script = document.createElement('script');
    script.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
    script.onload = () => {
      this.parsers.xlsx = window.XLSX;
      console.log('✓ SheetJS loaded');
    };
    document.head.appendChild(script);

    // For CSV, we'll use native parsing or PapaParse if needed
    this.parsers.csv = this.parseCSV.bind(this);
  }

  setupDropzones() {
    const dropzones = [
      { id: 'dropzone-objects', fileId: 'file-objects', type: 'objects' },
      { id: 'dropzone-thesaurus', fileId: 'file-thesaurus', type: 'thesaurus' },
      { id: 'dropzone-reference', fileId: 'file-reference', type: 'reference' }
    ];

    dropzones.forEach(({ id, fileId, type }) => {
      const dropzone = document.getElementById(id);
      const fileInput = document.getElementById(fileId);

      if (!dropzone || !fileInput) return;

      // Click to upload
      dropzone.addEventListener('click', () => fileInput.click());

      // File input change
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) this.handleFile(file, type);
      });

      // Drag and drop
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-over');
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('drag-over');
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) this.handleFile(file, type);
      });
    });
  }

  async handleFile(file, type) {
    console.log(`📁 Uploading ${type}:`, file.name);

    // Validate file type
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      alert('Bitte laden Sie eine Excel- oder CSV-Datei hoch.');
      return;
    }

    try {
      // Parse file
      const data = await this.parseFile(file);

      // Validate structure
      const validation = this.validateData(data, type);

      if (!validation.valid) {
        alert(`Fehler in ${file.name}:\n${validation.error}`);
        return;
      }

      // Store in state
      this.app.state.files[type] = file;
      this.app.state.data[type] = data;

      // Update UI
      this.showUploadStatus(type, file.name, data.length, validation.columns);

      // Enable continue button if ready
      this.checkReadyToProceed();

    } catch (error) {
      console.error('Error parsing file:', error);
      alert(`Fehler beim Verarbeiten von ${file.name}:\n${error.message}`);
    }
  }

  async parseFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'csv') {
      const text = await file.text();
      return this.parseCSV(text);
    } else {
      // Excel
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            if (!this.parsers.xlsx) {
              throw new Error('SheetJS not loaded yet');
            }
            const data = new Uint8Array(e.target.result);
            const workbook = this.parsers.xlsx.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = this.parsers.xlsx.utils.sheet_to_json(firstSheet);
            resolve(json);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
    }
  }

  parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(/[,;]/);

    return lines.slice(1).map(line => {
      const values = line.split(/[,;]/);
      const obj = {};
      headers.forEach((header, i) => {
        obj[header.trim()] = values[i]?.trim() || '';
      });
      return obj;
    });
  }

  validateData(data, type) {
    if (!data || data.length === 0) {
      return { valid: false, error: 'Datei ist leer' };
    }

    const requiredColumns = {
      objects: ['ObjectName', 'AnzahlvonObjectName'],
      thesaurus: ['CN', 'term', 'TermID', 'TermMasterID'],
      reference: ['ObjectName', 'Begriff bereinigt']
    };

    const required = requiredColumns[type];
    if (!required) return { valid: true, columns: Object.keys(data[0]) };

    const columns = Object.keys(data[0]);
    const missing = required.filter(col => !columns.includes(col));

    if (missing.length > 0) {
      // Check if user uploaded wrong file type
      let suggestion = '';
      if (type === 'thesaurus' && columns.includes('Begriff bereinigt')) {
        suggestion = '\n\nHinweis: Dies sieht aus wie eine Referenz-Datei. Bitte laden Sie sie im "Referenz-Mappings" Feld hoch.';
      } else if (type === 'objects' && columns.includes('term')) {
        suggestion = '\n\nHinweis: Dies sieht aus wie eine Thesaurus-Datei. Bitte laden Sie sie im "Thesaurus" Feld hoch.';
      } else if (type === 'reference' && columns.includes('TermID')) {
        suggestion = '\n\nHinweis: Dies sieht aus wie eine Thesaurus-Datei. Bitte laden Sie sie im "Thesaurus" Feld hoch.';
      }

      return {
        valid: false,
        error: `Fehlende Spalten für ${type}: ${missing.join(', ')}${suggestion}`
      };
    }

    return { valid: true, columns };
  }

  showUploadStatus(type, filename, count, columns) {
    const statusDiv = document.getElementById(`status-${type}`);
    const dropzone = document.getElementById(`dropzone-${type}`);

    if (!statusDiv || !dropzone) return;

    // Hide dropzone, show status
    dropzone.style.display = 'none';
    statusDiv.hidden = false;

    statusDiv.innerHTML = `
      <div class="status-icon status-success">✓</div>
      <div class="status-content">
        <p class="status-filename">${filename}</p>
        <p class="status-info">${count.toLocaleString('de-DE')} Einträge</p>
        <p class="status-columns">Spalten: ${columns.join(', ')}</p>
      </div>
    `;
  }

  checkReadyToProceed() {
    const objectsReady = this.app.state.files.objects !== null;
    const thesaurusReady = this.app.state.files.thesaurus !== null;

    const continueBtn = document.getElementById('btn-continue-1');
    if (continueBtn) {
      continueBtn.disabled = !(objectsReady && thesaurusReady);
    }
  }

  reset() {
    // Reset file inputs
    ['file-objects', 'file-thesaurus', 'file-reference'].forEach(id => {
      const input = document.getElementById(id);
      if (input) input.value = '';
    });

    // Show dropzones, hide status
    ['objects', 'thesaurus', 'reference'].forEach(type => {
      const dropzone = document.getElementById(`dropzone-${type}`);
      const status = document.getElementById(`status-${type}`);
      if (dropzone) dropzone.style.display = '';
      if (status) status.hidden = true;
    });

    // Disable continue button
    const continueBtn = document.getElementById('btn-continue-1');
    if (continueBtn) continueBtn.disabled = true;
  }
}
