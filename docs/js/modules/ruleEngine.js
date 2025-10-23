/**
 * Rule Engine - Pattern-based mapping logic
 * Implements rules from requirements.md US-07
 */

export class RuleEngine {
  constructor() {
    // German diminutive suffixes
    this.diminutives = ['chen', 'lein', 'el', 'erl', 'le'];

    // Common material prefixes
    this.materials = [
      'stein', 'holz', 'kupfer', 'bronze', 'eisen', 'gold', 'silber',
      'ton', 'keramik', 'glas', 'leder', 'stoff', 'wolle', 'seide',
      'bambus', 'elfenbein', 'knochen', 'metall', 'papier'
    ];

    // Keywords to extract from long descriptions
    this.objectKeywords = [
      'schachtel', 'korb', 'gürtel', 'pfeil', 'speer', 'beil', 'axt',
      'figur', 'maske', 'schmuck', 'kette', 'armband', 'ring',
      'gefäß', 'schale', 'teller', 'becher', 'flasche',
      'waffe', 'schwert', 'messer', 'dolch', 'lanze',
      'instrument', 'trommel', 'flöte', 'harfe',
      'textil', 'tuch', 'decke', 'teppich', 'kleidung',
      'werkzeug', 'hammer', 'meißel', 'säge'
    ];
  }

  /**
   * Apply all rules to an object name
   * @param {string} objectName - The object name to process
   * @param {Array} thesaurus - Array of thesaurus terms
   * @param {Map} referenceMap - Reference mappings (ObjectName -> Begriff)
   * @returns {Object} - { term, confidence, method, reasoning }
   */
  mapObject(objectName, thesaurus, referenceMap) {
    // Step 1: Check reference mappings (exact match)
    if (referenceMap && referenceMap.has(objectName)) {
      return {
        term: referenceMap.get(objectName),
        confidence: 100,
        method: 'Referenz',
        reasoning: 'Exakte Übereinstimmung in Referenz-Mappings'
      };
    }

    // Step 2: Check for exact match in thesaurus
    const exactMatch = thesaurus.find(t =>
      t.term.toLowerCase() === objectName.toLowerCase()
    );
    if (exactMatch) {
      return {
        term: exactMatch.term,
        confidence: 100,
        method: 'Exakt',
        reasoning: 'Exakte Übereinstimmung im Thesaurus'
      };
    }

    // Step 3: Apply normalization rules
    let normalized = objectName.toLowerCase().trim();

    // Remove diminutives
    const diminutiveResult = this.removeDiminutive(normalized);
    if (diminutiveResult.changed) {
      const match = this.findInThesaurus(diminutiveResult.term, thesaurus);
      if (match) {
        return {
          term: match.term,
          confidence: 90,
          method: 'Regel: Verkleinerungsform',
          reasoning: `"${objectName}" → "${diminutiveResult.term}" (Verkleinerungsform entfernt)`
        };
      }
    }

    // Remove material prefix
    const materialResult = this.removeMaterial(normalized);
    if (materialResult.changed) {
      const match = this.findInThesaurus(materialResult.term, thesaurus);
      if (match) {
        return {
          term: match.term,
          confidence: 85,
          method: 'Regel: Material',
          reasoning: `"${objectName}" → "${materialResult.term}" (Material "${materialResult.material}" entfernt)`
        };
      }
    }

    // Step 4: Extract keyword from long descriptions
    const keywordResult = this.extractKeyword(normalized);
    if (keywordResult.keyword) {
      const match = this.findInThesaurus(keywordResult.keyword, thesaurus);
      if (match) {
        return {
          term: match.term,
          confidence: 75,
          method: 'Regel: Keyword',
          reasoning: `Keyword "${keywordResult.keyword}" aus "${objectName}" extrahiert`
        };
      }
    }

    // Step 5: Fuzzy matching
    const fuzzyMatch = this.fuzzyMatch(normalized, thesaurus);
    if (fuzzyMatch && fuzzyMatch.confidence >= 70) {
      return {
        term: fuzzyMatch.term,
        confidence: fuzzyMatch.confidence,
        method: 'Regel: Fuzzy-Match',
        reasoning: `Ähnlichkeit zu "${fuzzyMatch.term}" (${fuzzyMatch.confidence}%)`
      };
    }

    // No match found
    return {
      term: null,
      confidence: 0,
      method: 'Keine Regel',
      reasoning: 'Kein Thesaurus-Match gefunden'
    };
  }

  /**
   * Remove diminutive suffix (Körbchen → Korb)
   */
  removeDiminutive(term) {
    for (const suffix of this.diminutives) {
      if (term.endsWith(suffix) && term.length > suffix.length + 2) {
        let base = term.slice(0, -suffix.length);

        // Handle umlaut changes (Körbchen → Korb)
        base = base.replace(/ö/g, 'o')
                   .replace(/ä/g, 'a')
                   .replace(/ü/g, 'u');

        return { term: base, changed: true, suffix };
      }
    }
    return { term, changed: false };
  }

  /**
   * Remove material prefix (Steinbeil → Beil)
   */
  removeMaterial(term) {
    for (const material of this.materials) {
      if (term.startsWith(material)) {
        const withoutMaterial = term.slice(material.length);
        if (withoutMaterial.length >= 3) {
          return {
            term: withoutMaterial,
            changed: true,
            material
          };
        }
      }
    }
    return { term, changed: false };
  }

  /**
   * Extract keyword from long description
   */
  extractKeyword(term) {
    // Sort keywords by length (longest first) for better matching
    const sorted = [...this.objectKeywords].sort((a, b) => b.length - a.length);

    for (const keyword of sorted) {
      if (term.includes(keyword)) {
        return { keyword, found: true };
      }
    }
    return { keyword: null, found: false };
  }

  /**
   * Find term in thesaurus (case-insensitive)
   */
  findInThesaurus(term, thesaurus) {
    return thesaurus.find(t =>
      t.term.toLowerCase() === term.toLowerCase()
    );
  }

  /**
   * Fuzzy matching using Levenshtein distance
   */
  fuzzyMatch(term, thesaurus) {
    let bestMatch = null;
    let bestScore = 0;

    for (const entry of thesaurus) {
      const distance = this.levenshteinDistance(
        term.toLowerCase(),
        entry.term.toLowerCase()
      );

      const maxLen = Math.max(term.length, entry.term.length);
      const similarity = Math.round((1 - distance / maxLen) * 100);

      if (similarity > bestScore && similarity >= 70) {
        bestScore = similarity;
        bestMatch = entry;
      }
    }

    return bestMatch ? {
      term: bestMatch.term,
      confidence: bestScore
    } : null;
  }

  /**
   * Levenshtein distance algorithm
   */
  levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = [];

    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    return matrix[len1][len2];
  }

  /**
   * Check if object name is a non-object (administrative note)
   */
  isNonObject(objectName) {
    const nonObjectPatterns = [
      /als imitation/i,
      /getauscht/i,
      /ausgeschieden/i,
      /dublette/i,
      /post \d+/i,
      /inventar/i,
      /nicht vorhanden/i
    ];

    return nonObjectPatterns.some(pattern => pattern.test(objectName));
  }
}
