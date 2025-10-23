/**
 * Phase Manager - Handles navigation between the 4 phases
 */

export class PhaseManager {
  constructor() {
    this.currentPhase = 1;
    this.phases = [1, 2, 3, 4];
  }

  init() {
    // Show initial phase
    this.goToPhase(1);
  }

  goToPhase(phaseNumber) {
    if (!this.phases.includes(phaseNumber)) {
      console.error('Invalid phase number:', phaseNumber);
      return;
    }

    this.currentPhase = phaseNumber;

    // Update phase sections
    document.querySelectorAll('.phase-section').forEach(section => {
      section.classList.remove('active');
      section.hidden = true;
    });

    const activeSection = document.getElementById(`phase-${phaseNumber}`);
    if (activeSection) {
      activeSection.classList.add('active');
      activeSection.hidden = false;
    }

    // Update phase navigation
    document.querySelectorAll('.phase-item').forEach((item, index) => {
      item.classList.remove('active', 'completed');

      const phase = index + 1;
      if (phase < phaseNumber) {
        item.classList.add('completed');
      } else if (phase === phaseNumber) {
        item.classList.add('active');
      }
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  canProceed(fromPhase) {
    // Validation logic for each phase
    switch (fromPhase) {
      case 1:
        // Check if required files are uploaded
        return this.validatePhase1();
      case 2:
        // Check if configuration is valid
        return this.validatePhase2();
      case 3:
        // Processing complete
        return true;
      default:
        return false;
    }
  }

  validatePhase1() {
    // Check if objects and thesaurus files are uploaded
    const objectsUploaded = document.getElementById('status-objects')?.hidden === false;
    const thesaurusUploaded = document.getElementById('status-thesaurus')?.hidden === false;
    return objectsUploaded && thesaurusUploaded;
  }

  validatePhase2() {
    // Always valid for now, validation happens in startProcessing
    return true;
  }
}
