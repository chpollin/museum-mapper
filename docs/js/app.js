/**
 * museum-mapper - Main Application
 * Client-side thesaurus mapping tool for museums
 */

import { PhaseManager } from './modules/phaseManager.js';
import { FileUploader } from './modules/fileUploader.js';
import { ConfigManager } from './modules/configManager.js';
import { MappingProcessor } from './modules/mappingProcessor.js';
import { ResultsManager } from './modules/resultsManager.js';
import { UIManager } from './modules/uiManager.js';

class MuseumMapper {
  constructor() {
    this.state = {
      files: {
        objects: null,
        thesaurus: null,
        reference: null
      },
      config: {
        method: 'hybrid',
        apiKey: '',
        confidenceThreshold: 80
      },
      data: {
        objects: [],
        thesaurus: [],
        reference: [],
        results: []
      },
      processing: {
        isRunning: false,
        progress: 0,
        currentItem: null
      }
    };

    this.phaseManager = new PhaseManager();
    this.fileUploader = new FileUploader(this);
    this.configManager = new ConfigManager(this);
    this.mappingProcessor = new MappingProcessor(this);
    this.resultsManager = new ResultsManager(this);
    this.uiManager = new UIManager(this);

    this.init();
  }

  init() {
    console.log('🏛️ museum-mapper initialized');

    // Initialize all modules
    this.phaseManager.init();
    this.fileUploader.init();
    this.configManager.init();
    this.resultsManager.init();
    this.uiManager.init();

    // Setup event listeners
    this.setupEventListeners();

    // Load saved state from sessionStorage if available
    this.loadState();
  }

  setupEventListeners() {
    // Help button
    document.getElementById('btn-help')?.addEventListener('click', () => {
      this.uiManager.showHelpModal();
    });

    // Phase navigation
    document.getElementById('btn-continue-1')?.addEventListener('click', () => {
      this.phaseManager.goToPhase(2);
    });

    document.getElementById('btn-back-2')?.addEventListener('click', () => {
      this.phaseManager.goToPhase(1);
    });

    document.getElementById('btn-start-processing')?.addEventListener('click', () => {
      this.startProcessing();
    });

    document.getElementById('btn-restart')?.addEventListener('click', () => {
      this.restart();
    });

    // Save state before page unload
    window.addEventListener('beforeunload', () => {
      this.saveState();
    });
  }

  async startProcessing() {
    if (this.state.processing.isRunning) return;

    // Validate configuration
    if (this.state.config.method === 'hybrid' && !this.state.config.apiKey) {
      alert('Bitte geben Sie einen Anthropic API-Key ein oder wählen Sie "Nur Regelbasiert".');
      return;
    }

    // Go to processing phase
    this.phaseManager.goToPhase(3);

    // Start processing
    this.state.processing.isRunning = true;
    await this.mappingProcessor.process();
    this.state.processing.isRunning = false;

    // Go to results phase
    this.phaseManager.goToPhase(4);
    this.resultsManager.displayResults();
  }

  restart() {
    if (confirm('Möchten Sie wirklich eine neue Verarbeitung starten? Alle aktuellen Daten gehen verloren.')) {
      this.state = {
        files: { objects: null, thesaurus: null, reference: null },
        config: { method: 'hybrid', apiKey: '', confidenceThreshold: 80 },
        data: { objects: [], thesaurus: [], reference: [], results: [] },
        processing: { isRunning: false, progress: 0, currentItem: null }
      };
      this.phaseManager.goToPhase(1);
      this.fileUploader.reset();
      sessionStorage.clear();
    }
  }

  saveState() {
    try {
      sessionStorage.setItem('museum-mapper-state', JSON.stringify({
        config: this.state.config,
        phase: this.phaseManager.currentPhase
      }));
    } catch (error) {
      console.warn('Could not save state:', error);
    }
  }

  loadState() {
    try {
      const saved = sessionStorage.getItem('museum-mapper-state');
      if (saved) {
        const data = JSON.parse(saved);
        this.state.config = { ...this.state.config, ...data.config };
        // Don't auto-restore phase, always start at upload
      }
    } catch (error) {
      console.warn('Could not load state:', error);
    }
  }

  updateState(updates) {
    this.state = { ...this.state, ...updates };
    this.saveState();
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.museumMapper = new MuseumMapper();
  });
} else {
  window.museumMapper = new MuseumMapper();
}
