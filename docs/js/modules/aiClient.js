/**
 * AI Client - Anthropic Claude API integration
 * Uses Claude Haiku 4.5 for intelligent mapping
 */

export class AIClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = 'https://api.anthropic.com/v1/messages';
    this.model = 'claude-3-5-haiku-20241022';
    this.maxTokens = 1024;
  }

  /**
   * Process a batch of objects with AI
   * @param {Array} objects - Objects to process
   * @param {Array} thesaurus - Available thesaurus terms
   * @param {number} batchSize - Number of objects per request
   * @returns {Array} - Mapped results
   */
  async processBatch(objects, thesaurus, batchSize = 20) {
    const results = [];
    const batches = this.createBatches(objects, batchSize);

    console.log(`Processing ${objects.length} objects in ${batches.length} batches`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Batch ${i + 1}/${batches.length}: ${batch.length} objects`);

      try {
        const batchResults = await this.processSingleBatch(batch, thesaurus);
        results.push(...batchResults);
      } catch (error) {
        console.error(`Error processing batch ${i + 1}:`, error);
        // Return original objects with error status
        results.push(...batch.map(obj => ({
          objectName: obj.ObjectName,
          term: null,
          confidence: 0,
          reasoning: `AI-Fehler: ${error.message}`
        })));
      }

      // Rate limiting: wait between requests
      if (i < batches.length - 1) {
        await this.sleep(1000);
      }
    }

    return results;
  }

  /**
   * Process a single batch with Claude
   */
  async processSingleBatch(objects, thesaurus) {
    const prompt = this.buildPrompt(objects, thesaurus);

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text || '';

    return this.parseResponse(content, objects);
  }

  /**
   * Build prompt for Claude
   */
  buildPrompt(objects, thesaurus) {
    // Select relevant thesaurus terms (sample for context)
    const sampleThesaurus = this.sampleThesaurus(thesaurus, 100);

    const objectList = objects.map((obj, i) =>
      `${i + 1}. "${obj.ObjectName}"`
    ).join('\n');

    const thesaurusList = sampleThesaurus.map(t => `- ${t.term}`).join('\n');

    return `Du bist ein Experte für Museumssammlungen. Deine Aufgabe ist es, Objektnamen standardisierten Thesaurus-Begriffen zuzuordnen.

**Thesaurus-Begriffe (Auswahl):**
${thesaurusList}

**Zu mappende Objektnamen:**
${objectList}

**Regeln:**
1. Ordne jeden Objektnamen dem passendsten Thesaurus-Begriff zu
2. Bei zusammengesetzten Namen (z.B. "Schamanengürtel") wähle den Grundbegriff ("Gürtel")
3. Bei Material+Objekt (z.B. "Steinbeil") wähle das Objekt ("Beil")
4. Bei langen Beschreibungen extrahiere das Hauptobjekt
5. Wenn kein passender Begriff vorhanden ist, schreibe "KEIN_MATCH"
6. Gib für jeden Eintrag eine kurze Begründung

**Antwortformat (JSON):**
\`\`\`json
[
  {
    "index": 1,
    "objectName": "...",
    "thesaurusTerm": "...",
    "confidence": 85,
    "reasoning": "..."
  }
]
\`\`\`

Antworte NUR mit dem JSON-Array, ohne zusätzlichen Text.`;
  }

  /**
   * Parse Claude's JSON response
   */
  parseResponse(content, objects) {
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;

      const parsed = JSON.parse(jsonStr);

      // Validate and return
      return parsed.map(item => ({
        objectName: item.objectName || objects[item.index - 1]?.ObjectName,
        term: item.thesaurusTerm === 'KEIN_MATCH' ? null : item.thesaurusTerm,
        confidence: item.confidence || 75,
        reasoning: item.reasoning || 'KI-Zuordnung'
      }));

    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.log('Response content:', content);

      // Fallback: return empty results
      return objects.map(obj => ({
        objectName: obj.ObjectName,
        term: null,
        confidence: 0,
        reasoning: 'Parsing-Fehler'
      }));
    }
  }

  /**
   * Sample thesaurus for context (avoid sending too much data)
   */
  sampleThesaurus(thesaurus, maxCount) {
    if (thesaurus.length <= maxCount) return thesaurus;

    // Take a representative sample
    const step = Math.floor(thesaurus.length / maxCount);
    return thesaurus.filter((_, i) => i % step === 0).slice(0, maxCount);
  }

  /**
   * Create batches from array
   */
  createBatches(array, size) {
    const batches = [];
    for (let i = 0; i < array.length; i += size) {
      batches.push(array.slice(i, i + size));
    }
    return batches;
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
