# Test-Plan für museum-mapper

## Detaillierte Test-Szenarien

### Test 1: Nur Regelbasiert (ohne AI)

**Erwartete Mappings:**

| # | ObjectName | Erwarteter Begriff | Regel | Konfidenz | Status |
|---|------------|-------------------|-------|-----------|--------|
| 1 | Pfeil | Pfeil | Exakt | 100% | OK |
| 2 | Speer | Speer | Exakt | 100% | OK |
| 3 | Körbchen | Korb | Referenz | 100% | OK |
| 4 | Schächtelchen | Schachtel | Verkleinerungsform | 90% | OK |
| 5 | Steinbeil | Beil | Referenz | 100% | OK |
| 6 | Holzschale | Schale | Material-Präfix | 85% | OK |
| 7 | Kupfergefäß | Gefäß | Material-Präfix | 85% | OK |
| 8 | Schamanengürtel | Gürtel | Referenz | 100% | OK |
| 9 | Ritueller Gürtel | Gürtel | Keyword | 75% | PRÜFEN |
| 10 | Schachtel mit Vögeln... | Schachtel | Keyword | 75% | PRÜFEN |
| 11 | Korb für rituelle... | Korb | Keyword | 75% | PRÜFEN |
| 12 | Pfeile | Pfeil | Fuzzy | ~80% | OK |
| 13 | Guertel | Gürtel | Fuzzy | ~85% | OK |
| 14 | Ahnenfigur | Figur | Referenz | 100% | OK |
| 15 | Zeremonialmaske | Maske | Referenz | 100% | OK |
| 16 | Rituelles Zeremonialgewand | Kleidung | Keyword | 75% | PRÜFEN |
| 17 | Insektensnack | — | Keine Regel | 0% | BEARBEITEN |
| 18 | Als Imitation... | — | Nicht-Objekt | 0% | IGNORIERT |
| 19 | Getauscht... | — | Nicht-Objekt | 0% | IGNORIERT |
| 20 | Belugasehnen... | — | Keine Regel | 0% | BEARBEITEN |

**Erwartete Statistik:**
- **OK**: 13 (65%)
- **PRÜFEN**: 4 (20%)
- **BEARBEITEN**: 2 (10%)
- **IGNORIERT**: 2 (10%) - davon 1 tatsächlich nicht-objekt

---

### Test 2: Hybrid (Regeln + AI)

**Zusätzliche AI-Verbesserungen:**

Die AI sollte diese Low-Confidence-Fälle verbessern:

| ObjectName | Regel-Ergebnis | AI-Verbesserung | Neue Konfidenz |
|------------|----------------|-----------------|----------------|
| Ritueller Gürtel | Gürtel (75%) | Gürtel (90%) | OK |
| Rituelles Zeremonialgewand | Kleidung (75%) | Kleidung (85%) | OK |
| Insektensnack | — (0%) | ? (variabel) | ? |
| Belugasehnen... | — (0%) | ? (variabel) | ? |

**Erwartete Statistik nach AI:**
- **OK**: 16-17 (80-85%)
- **PRÜFEN**: 1-2 (5-10%)
- **BEARBEITEN**: 1-2 (5-10%)
- **IGNORIERT**: 1 (5%)

---

## Schritt-für-Schritt Testanleitung

### Vorbereitung

1. **App öffnen**: https://chpollin.github.io/museum-mapper/
2. **Test-Dateien bereithalten**:
   - `test_objects.csv`
   - `test_thesaurus.csv`
   - `test_reference.csv`

### Test A: Regelbasiert

**Phase 1: Upload**
1. Objects: `test_objects.csv` hochladen
2. Thesaurus: `test_thesaurus.csv` hochladen
3. Reference: `test_reference.csv` hochladen
4. Erwartung: ✓ "Weiter zur Konfiguration" Button wird aktiv

**Phase 2: Konfiguration**
1. Methode: **"Nur Regelbasiert"** wählen
2. Konfidenz-Schwelle: 80% (Standard)
3. "Verarbeitung starten" klicken

**Phase 3: Verarbeitung**
1. Browser-Konsole öffnen (F12)
2. Beobachten:
   ```
   🔄 Starting mapping process...
   Processing 20 objects
   Using method: rules
   ✓ Built reference map with 5 mappings
   Thesaurus terms: 15
   ✓ Processing complete
   Stats: {ok: 13, check: 4, error: 2, ignore: 1}
   ```

**Phase 4: Ergebnisse**
1. Statistik prüfen:
   - OK: ~13 (65%)
   - PRÜFEN: ~4 (20%)
   - BEARBEITEN: ~2 (10%)
   - IGNORIERT: ~1 (5%)

2. Einzelne Einträge prüfen:
   - "Pfeil" → Status OK, 100%, Methode "Exakt"
   - "Körbchen" → Status OK, 100%, Methode "Referenz"
   - "Steinbeil" → Status OK, 100%, Methode "Referenz"
   - "Schamanengürtel" → Status OK, 100%, Methode "Referenz"
   - "Ritueller Gürtel" → Status PRÜFEN, 75%, Methode "Regel: Keyword"

3. Detail-Modal testen:
   - Auf Zeile klicken
   - Begründung lesen
   - CN-Code, TermID prüfen

**Phase 5: Export**
1. "Alle exportieren" klicken
2. Excel-Datei öffnen
3. Spalten prüfen:
   - Objektname ✓
   - Thesaurus-Begriff ✓
   - CN-Code ✓
   - Term ID ✓
   - Konfidenz ✓
   - Status ✓
   - Methode ✓
   - Begründung ✓

---

### Test B: Hybrid (mit AI)

**Voraussetzung:** Anthropic API Key

**Phase 1-2: Wie Test A**
- Gleiche Dateien hochladen

**Phase 2: Konfiguration**
1. Methode: **"Hybrid (Regeln + KI)"** wählen
2. API Key eingeben: `sk-ant-api03-...`
3. Konfidenz-Schwelle: 80%
4. "Verarbeitung starten" klicken

**Phase 3: Verarbeitung**
1. Konsole beobachten:
   ```
   🔄 Starting mapping process...
   Processing 20 objects
   Using method: hybrid
   ✓ Built reference map with 5 mappings
   🤖 Processing X items with AI...
   Batch 1/1: X objects
   ✓ AI processing complete
   Updated stats: {ok: 17, check: 1, error: 1, ignore: 1}
   ✓ Processing complete
   ```

**Phase 4: Ergebnisse**
1. Statistik prüfen (sollte besser sein als Test A):
   - OK: ~17 (85%)
   - PRÜFEN: ~1 (5%)
   - BEARBEITEN: ~1 (5%)
   - IGNORIERT: ~1 (5%)

2. AI-verbesserte Einträge prüfen:
   - "Ritueller Gürtel" → Jetzt "OK" statt "PRÜFEN"?
   - "Rituelles Zeremonialgewand" → AI-Begründung lesen

**Phase 5: Export**
1. Export Excel
2. Prüfen: "Vermerk" Spalte enthält "Thesaurus-Begriff wurde mit Hilfe von KI zugeordnet" bei AI-Einträgen

---

## Erfolgs-Kriterien

### ✅ Regelbasiert muss:
- [ ] 20 Objekte verarbeiten
- [ ] 5 Referenz-Mappings laden
- [ ] Mindestens 60% OK erzielen
- [ ] Verkleinerungsformen erkennen (Körbchen → Korb)
- [ ] Material-Präfixe entfernen (Steinbeil → Beil)
- [ ] Keywords extrahieren (Ritueller Gürtel → Gürtel)
- [ ] Nicht-Objekte ignorieren
- [ ] Excel mit allen Spalten exportieren

### ✅ Hybrid muss zusätzlich:
- [ ] AI-Verarbeitung für Low-Confidence-Items starten
- [ ] Mindestens 80% OK erzielen
- [ ] AI-Begründungen anzeigen
- [ ] "KI-Vermerk" im Export setzen
- [ ] Kosten loggen (sollte < €0.10 sein)

---

## Bekannte Edge-Cases

Diese sollten korrekt behandelt werden:

1. **Nicht-Objekte**:
   - "Als Imitation ausgeschieden" → IGNORIERT
   - "Getauscht gegen Post 4" → IGNORIERT

2. **Keine Matches**:
   - "Insektensnack" → BEARBEITEN (moderner Begriff)
   - "Belugasehnen..." → BEARBEITEN (sehr spezifisch)

3. **Fuzzy-Matching**:
   - "Pfeile" → "Pfeil" (Plural)
   - "Guertel" → "Gürtel" (Tippfehler)

4. **Keyword-Extraktion**:
   - "Schachtel mit Vögeln..." → "Schachtel"
   - "Korb für rituelle Zwecke" → "Korb"

---

## Fehlersuche

Falls Tests fehlschlagen:

### Problem: "Processing 0 objects"
**Ursache:** Falsche Datei als Objects hochgeladen
**Lösung:** Sicherstellen dass `test_objects.csv` als **Objects** hochgeladen wird

### Problem: "Reference mappings: 0"
**Ursache:** Reference-Datei nicht hochgeladen oder falsch
**Lösung:** `test_reference.csv` als **Reference** hochladen

### Problem: Crash bei Verarbeitung
**Ursache:** Undefined term im Thesaurus
**Lösung:** Neueste Version von GitHub laden (Bugfix vorhanden)

### Problem: AI-Fehler
**Ursache:** API-Key ungültig oder Rate-Limit
**Lösung:** API-Key prüfen, 1 Minute warten

---

## Performance-Erwartungen

- **Upload**: < 1 Sekunde
- **Regelbasiert**: < 1 Sekunde (20 Objekte)
- **Hybrid**: 5-10 Sekunden (20 Objekte, 1 API-Call)
- **Export**: < 1 Sekunde
