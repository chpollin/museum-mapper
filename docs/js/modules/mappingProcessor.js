/**
 * Mapping Processor - Core mapping logic (rules + AI)
 */

import { RuleEngine } from './ruleEngine.js';
import { AIClient } from './aiClient.js';

export class MappingProcessor {
  constructor(app) {
    this.app = app;
    this.ruleEngine = new RuleEngine();
    this.stats = {
      ok: 0,
      check: 0,
      error: 0,
      ignore: 0
    };
  }

  async process() {
    console.log('🔄 Starting mapping process...');

    const { objects, thesaurus, reference } = this.app.state.data;
    const { method, apiKey, confidenceThreshold } = this.app.state.config;

    // Build reference map for fast lookup
    const referenceMap = this.buildReferenceMap(reference);

    // Filter objects (≤12 occurrences as per requirements)
    const objectsToMap = objects.filter(obj => {
      const count = parseInt(obj.AnzahlvonObjectName) || 0;
      return count <= 12;
    });

    console.log(`Processing ${objectsToMap.length} objects`);
    console.log(`Using method: ${method}`);
    console.log(`Reference mappings: ${referenceMap.size}`);
    console.log(`Thesaurus terms: ${thesaurus.length}`);

    const results = [];
    const lowConfidenceForAI = [];
    let processed = 0;

    this.stats = { ok: 0, check: 0, error: 0, ignore: 0 };

    // Phase 1: Apply rule-based mapping
    for (const obj of objectsToMap) {
      processed++;

      // Check if it's a non-object (administrative note)
      if (this.ruleEngine.isNonObject(obj.ObjectName)) {
        results.push({
          objectName: obj.ObjectName,
          frequency: obj.AnzahlvonObjectName,
          thesaurusTerm: '—',
          cn: '',
          termId: '',
          termMasterId: '',
          confidence: 0,
          status: 'IGNORIERT',
          method: 'Regel: Nicht-Objekt',
          reasoning: 'Administrativer Vermerk, kein Objekt'
        });
        this.stats.ignore++;
        this.updateProgress(processed, objectsToMap.length);
        continue;
      }

      // Apply rule engine
      const mapping = this.ruleEngine.mapObject(
        obj.ObjectName,
        thesaurus,
        referenceMap
      );

      let result;

      if (mapping.term) {
        // Find full thesaurus entry
        const thesaurusEntry = thesaurus.find(t =>
          t.term.toLowerCase() === mapping.term.toLowerCase()
        );

        result = {
          objectName: obj.ObjectName,
          frequency: obj.AnzahlvonObjectName,
          thesaurusTerm: mapping.term,
          cn: thesaurusEntry?.CN || '',
          termId: thesaurusEntry?.TermID || '',
          termMasterId: thesaurusEntry?.TermMasterID || '',
          confidence: mapping.confidence,
          status: this.getStatus(mapping.confidence, confidenceThreshold),
          method: mapping.method,
          reasoning: mapping.reasoning
        };

        // Track stats
        if (result.status === 'OK') this.stats.ok++;
        else if (result.status === 'PRÜFEN') this.stats.check++;
        else this.stats.error++;

        // If confidence is low and AI is enabled, mark for AI processing
        if (method === 'hybrid' && mapping.confidence < confidenceThreshold) {
          lowConfidenceForAI.push({ obj, result, index: results.length });
        }

      } else {
        // No match found
        result = {
          objectName: obj.ObjectName,
          frequency: obj.AnzahlvonObjectName,
          thesaurusTerm: '—',
          cn: '',
          termId: '',
          termMasterId: '',
          confidence: 0,
          status: 'MUSS_BEARBEITET_WERDEN',
          method: 'Keine Regel',
          reasoning: 'Kein Thesaurus-Match gefunden'
        };
        this.stats.error++;

        // Mark for AI processing if enabled
        if (method === 'hybrid') {
          lowConfidenceForAI.push({ obj, result, index: results.length });
        }
      }

      results.push(result);
      this.updateProgress(processed, objectsToMap.length);

      // Yield to browser every 100 items
      if (processed % 100 === 0) {
        await this.sleep(0);
      }
    }

    // Phase 2: AI processing for low-confidence items
    if (method === 'hybrid' && apiKey && lowConfidenceForAI.length > 0) {
      console.log(`🤖 Processing ${lowConfidenceForAI.length} items with AI...`);
      await this.processWithAI(lowConfidenceForAI, results, thesaurus, apiKey, confidenceThreshold);
    }

    this.app.state.data.results = results;
    console.log('✓ Processing complete');
    console.log('Stats:', this.stats);
  }

  buildReferenceMap(reference) {
    const map = new Map();
    if (!reference || reference.length === 0) return map;

    for (const ref of reference) {
      const begriff = ref['Begriff bereinigt'];
      if (begriff && begriff.trim() && begriff !== '*') {
        map.set(ref.ObjectName, begriff.trim());
      }
    }

    return map;
  }

  async processWithAI(items, results, thesaurus, apiKey, confidenceThreshold) {
    const aiClient = new AIClient(apiKey);

    // Extract objects to process
    const objectsToProcess = items.map(item => item.obj);

    try {
      // Process with AI (batches of 20)
      const aiResults = await aiClient.processBatch(objectsToProcess, thesaurus, 20);

      // Update results with AI mappings
      for (let i = 0; i < aiResults.length; i++) {
        const aiResult = aiResults[i];
        const item = items[i];
        const resultIndex = item.index;

        if (aiResult.term && aiResult.confidence >= 50) {
          // Find full thesaurus entry
          const thesaurusEntry = thesaurus.find(t =>
            t.term.toLowerCase() === aiResult.term.toLowerCase()
          );

          if (thesaurusEntry) {
            // Update the result with AI mapping
            results[resultIndex] = {
              ...results[resultIndex],
              thesaurusTerm: aiResult.term,
              cn: thesaurusEntry.CN || '',
              termId: thesaurusEntry.TermID || '',
              termMasterId: thesaurusEntry.TermMasterID || '',
              confidence: aiResult.confidence,
              status: this.getStatus(aiResult.confidence, confidenceThreshold),
              method: 'KI (Claude Haiku 4.5)',
              reasoning: aiResult.reasoning
            };

            // Update stats
            const oldStatus = results[resultIndex].status;
            const newStatus = this.getStatus(aiResult.confidence, confidenceThreshold);

            // Adjust stats counters
            if (oldStatus === 'OK') this.stats.ok--;
            else if (oldStatus === 'PRÜFEN') this.stats.check--;
            else if (oldStatus === 'MUSS_BEARBEITET_WERDEN') this.stats.error--;

            if (newStatus === 'OK') this.stats.ok++;
            else if (newStatus === 'PRÜFEN') this.stats.check++;
            else if (newStatus === 'MUSS_BEARBEITET_WERDEN') this.stats.error++;
          }
        }
      }

      console.log('✓ AI processing complete');
      console.log('Updated stats:', this.stats);

    } catch (error) {
      console.error('AI processing failed:', error);
      alert(`KI-Verarbeitung fehlgeschlagen:\n${error.message}\n\nDie regelbasierten Ergebnisse bleiben erhalten.`);
    }
  }

  getStatus(confidence, threshold) {
    if (confidence >= threshold) return 'OK';
    if (confidence >= 50) return 'PRÜFEN';
    return 'MUSS_BEARBEITET_WERDEN';
  }

  updateProgress(current, total) {
    const percentage = Math.round((current / total) * 100);

    // Update progress bar
    const fill = document.getElementById('progress-fill');
    const percentageDisplay = document.getElementById('progress-percentage');
    const progressText = document.getElementById('progress-text');

    if (fill) fill.style.width = `${percentage}%`;
    if (percentageDisplay) percentageDisplay.textContent = `${percentage}%`;
    if (progressText) {
      progressText.textContent = `Verarbeitet: ${current.toLocaleString('de-DE')} / ${total.toLocaleString('de-DE')} (${percentage}%)`;
    }

    // Update status bars with real stats
    const okPercent = total > 0 ? (this.stats.ok / total) * 100 : 0;
    const checkPercent = total > 0 ? (this.stats.check / total) * 100 : 0;
    const errorPercent = total > 0 ? (this.stats.error / total) * 100 : 0;
    const ignorePercent = total > 0 ? (this.stats.ignore / total) * 100 : 0;

    this.updateStatusBar('ok', okPercent, this.stats.ok);
    this.updateStatusBar('check', checkPercent, this.stats.check);
    this.updateStatusBar('error', errorPercent, this.stats.error);
    this.updateStatusBar('ignore', ignorePercent, this.stats.ignore);
  }

  updateStatusBar(status, percentage, count) {
    const fill = document.getElementById(`status-${status}-fill`);
    const value = document.getElementById(`status-${status}-value`);

    if (fill) fill.style.width = `${percentage}%`;
    if (value) {
      value.textContent = `${count.toLocaleString('de-DE')} (${Math.round(percentage)}%)`;
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
