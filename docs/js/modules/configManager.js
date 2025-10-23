/**
 * Config Manager - Handles configuration UI and state
 */

export class ConfigManager {
  constructor(app) {
    this.app = app;
  }

  init() {
    this.setupMethodSelection();
    this.setupConfidenceSlider();
    this.setupAPIKeyInput();
  }

  setupMethodSelection() {
    const methodCards = document.querySelectorAll('.option-card');

    methodCards.forEach(card => {
      card.addEventListener('click', () => {
        const radio = card.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;

          // Update active state
          methodCards.forEach(c => c.classList.remove('active'));
          card.classList.add('active');

          // Update state
          this.app.state.config.method = radio.value;
        }
      });
    });

    // Listen for radio changes
    document.querySelectorAll('input[name="method"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.app.state.config.method = e.target.value;
      });
    });
  }

  setupConfidenceSlider() {
    const slider = document.getElementById('confidence-threshold');
    const valueDisplay = document.getElementById('threshold-value');

    if (slider && valueDisplay) {
      slider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        valueDisplay.textContent = value;
        this.app.state.config.confidenceThreshold = value;
      });
    }
  }

  setupAPIKeyInput() {
    const apiKeyInput = document.getElementById('api-key');

    if (apiKeyInput) {
      apiKeyInput.addEventListener('input', (e) => {
        this.app.state.config.apiKey = e.target.value.trim();
      });

      // Load saved API key if available
      if (this.app.state.config.apiKey) {
        apiKeyInput.value = this.app.state.config.apiKey;
      }
    }
  }
}
