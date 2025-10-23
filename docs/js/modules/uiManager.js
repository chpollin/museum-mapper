/**
 * UI Manager - Handles modals and UI interactions
 */

export class UIManager {
  constructor(app) {
    this.app = app;
  }

  init() {
    this.setupModals();
  }

  setupModals() {
    // Help modal
    const helpBtn = document.querySelector('.btn-help');
    const helpModal = document.getElementById('help-modal');
    const helpClose = document.getElementById('help-close');

    if (helpBtn && helpModal) {
      helpBtn.addEventListener('click', () => helpModal.showModal());
    }

    if (helpClose && helpModal) {
      helpClose.addEventListener('click', () => helpModal.close());
    }

    // Detail modal
    const detailModal = document.getElementById('detail-modal');
    const detailClose = document.getElementById('modal-close');

    if (detailClose && detailModal) {
      detailClose.addEventListener('click', () => detailModal.close());
    }

    // Close modals on backdrop click
    [helpModal, detailModal].forEach(modal => {
      if (modal) {
        modal.addEventListener('click', (e) => {
          const rect = modal.getBoundingClientRect();
          if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
          ) {
            modal.close();
          }
        });
      }
    });
  }

  showHelpModal() {
    const modal = document.getElementById('help-modal');
    if (modal) modal.showModal();
  }

  showNotification(message, type = 'info') {
    // Simple notification (could be enhanced with a toast library)
    console.log(`[${type.toUpperCase()}] ${message}`);
    // TODO: Implement visual notification
  }
}
