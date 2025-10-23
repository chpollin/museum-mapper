# Requirements

## Epic: Automated Museum Thesaurus Mapping System

**Goal:** Enable museum staff to automatically map 40,000+ heterogeneous object names to standardized thesaurus terms with 70-85% accuracy, reducing manual work from 300+ hours to 4 days.

**Success Metrics:**
- 70-85% correct mappings (hybrid approach)
- Processing time: ~45 minutes for 40,000 entries (hybrid mode)
- Cost: ~5-10 EUR per run (with AI)
- User can correct and export results

---

## User Stories

### 1. Data Upload & Validation

**US-01: Upload Object Names**
```
As a museum curator
I want to upload an Excel/CSV file with object names
So that I can start the mapping process without technical knowledge

Acceptance Criteria:
- Supports .xlsx, .xls, .csv formats
- Drag & drop or file selection
- Validates required columns: ObjectName, AnzahlvonObjectName
- Shows error message if structure is invalid
- Displays record count after successful upload
```

**US-02: Upload Thesaurus**
```
As a museum curator
I want to upload the museum's thesaurus file
So that object names can be mapped to our standardized vocabulary

Acceptance Criteria:
- Validates columns: CN, term, TermID, TermMasterID
- Parses hierarchical CN-codes correctly
- Shows number of thesaurus terms loaded
- Warns if critical fields are missing
```

**US-03: Load Reference Mappings**
```
As a museum curator
I want to upload previously curated mappings
So that known mappings are reused automatically

Acceptance Criteria:
- Accepts file with: ObjectName, Begriff bereinigt
- Creates lookup table for exact matches
- Shows number of reference mappings loaded
- Optional: if not provided, system continues without
```

---

### 2. Mapping Configuration

**US-04: Select Mapping Strategy**
```
As a museum curator
I want to choose between rule-based only or hybrid (rules + AI)
So that I can balance cost vs. accuracy

Acceptance Criteria:
- Radio buttons: "Rules only" | "Rules + AI (recommended)"
- Shows expected accuracy: 40-50% vs. 70-85%
- Shows estimated cost: 0 EUR vs. 5-25 EUR
- Default: Rules + AI
```

**US-05: Configure AI (Optional)**
```
As a museum curator
I want to enter my Anthropic API key
So that I can use AI-powered mapping

Acceptance Criteria:
- Input field with password masking
- "Where to get API key?" help link
- Validates key format (starts with "sk-ant-")
- Key stored only in browser (sessionStorage)
- Optional: if empty, only rule-based mapping runs
```

---

### 3. Mapping Execution

**US-06: Process Mappings**
```
As a museum curator
I want to click "Process" and see live progress
So that I know the system is working

Acceptance Criteria:
- Shows progress bar with percentage
- Displays current step: "Applying rules..." | "Querying AI..." | "Finalizing..."
- Shows processed/total records
- Estimated time remaining
- Disables upload/config during processing
- Error handling with clear messages
```

**US-07: Rule-Based Mapping**
```
As a system
I want to apply pattern-matching rules first
So that common cases are resolved quickly and cost-free

Rules Applied:
1. Exact match in reference mappings → direct assignment
2. Remove diminutives: "Körbchen" → "Korb"
3. Remove materials: "Steinbeil" → "Beil"
4. Keyword extraction: "Schachtel mit Vögeln..." → "Schachtel"
5. Fuzzy match against thesaurus terms (Levenshtein distance)

Output:
- Mapped term + confidence score (0-100%)
- Status: OK (>80%) | PRÜFEN (50-80%) | MUSS_BEARBEITET_WERDEN (<50%)
- Method: "regel-basiert"
```

**US-08: AI-Powered Mapping**
```
As a system
I want to send unresolved/low-confidence entries to Claude Haiku 4.5
So that complex object names are mapped intelligently

Acceptance Criteria:
- Only processes entries with confidence <80%
- Batch requests (max 50 entries per call)
- Uses prompt caching to reduce costs
- Prompt includes: object name, thesaurus list, examples
- Parses AI response: term + reasoning
- Assigns confidence based on AI certainty
- Fallback: if AI fails, keeps rule-based result
```

---

### 4. Results Review & Correction

**US-09: View Mapping Results**
```
As a museum curator
I want to see all mappings in a sortable table
So that I can quickly assess quality

Acceptance Criteria:
- Table columns: ObjectName | ThesaurusBegriff | CN | TermID | Confidence | Status
- Color coding:
  - Green: OK (confidence >80%)
  - Yellow: PRÜFEN (50-80%)
  - Red: MUSS_BEARBEITET_WERDEN (<50%)
- Sortable by any column
- Search/filter by ObjectName or Status
```

**US-10: Manual Correction**
```
As a museum curator
I want to manually edit incorrect mappings
So that I can fix errors before export

Acceptance Criteria:
- Click on ThesaurusBegriff cell to edit
- Dropdown with autocomplete from thesaurus
- Selecting new term auto-fills CN, TermID, TermMasterID
- Updates status to "manuell korrigiert"
- Shows count of manually corrected entries
```

**US-11: Quality Statistics**
```
As a museum curator
I want to see mapping quality statistics
So that I can assess if results are ready for export

Acceptance Criteria:
- Dashboard shows:
  - Total entries processed
  - OK: X entries (Y%)
  - PRÜFEN: X entries (Y%)
  - MUSS_BEARBEITET_WERDEN: X entries (Y%)
  - Manually corrected: X entries
- Average confidence score
- If AI used: API cost estimate
```

---

### 5. Export & Integration

**US-12: Export Results**
```
As a museum curator
I want to download the enriched data in multiple formats
So that I can import it into our museum system (TMS)

Acceptance Criteria:
- Export formats: Excel (.xlsx) | CSV | JSON
- Excel includes all original columns + new columns:
  - ThesaurusBegriff
  - CN
  - TermID
  - TermMasterID
  - Konfidenz
  - Status
  - Methode (regel-basiert | KI | manuell)
  - Vermerk: "Thesaurus-Begriff wurde mit Hilfe von KI zugeordnet"
- Filename: "museum-mapper-results-YYYY-MM-DD-HHmm.xlsx"
```

**US-13: Export Unresolved Entries**
```
As a museum curator
I want to export only entries marked MUSS_BEARBEITET_WERDEN
So that I can focus manual work on problematic cases

Acceptance Criteria:
- Separate download button: "Export Unresolved"
- Contains only red-flagged entries
- Includes reason: "Kein Thesaurus-Match gefunden"
- Filename: "museum-mapper-unresolved-YYYY-MM-DD.xlsx"
```

---

## Non-Functional Requirements

### NFR-01: Performance
- Process 100-200 entries/second (rule-based) → ~3-7 minutes for 40k entries
- Process 20-40 entries/second (with AI) → ~15-30 minutes for 40k entries
- Maximum total time: 45 minutes for 40,000 entries (hybrid mode)
- UI remains responsive during processing (Web Workers)

### NFR-02: Privacy & Security
- All processing happens client-side in browser
- No data uploaded to any server (except Anthropic API if enabled)
- API key stored only in sessionStorage, never persisted
- DSGVO compliant

### NFR-03: Usability
- No installation required (browser-based)
- Works in Chrome, Firefox, Edge (latest versions)
- Clear error messages in German
- Help tooltips for all configuration options
- Responsive design (desktop focus)

### NFR-04: Reliability
- Validates all inputs before processing
- Graceful error handling (API failures, malformed data)
- Progress saved in browser (can reload page without losing work)
- Maximum file size: 50 MB

### NFR-05: Cost Efficiency
- Rule-based processing: 0 EUR
- AI processing: 5-25 EUR per 40,000 entries
- Uses Claude Haiku 4.5 (cheapest model)
- Prompt caching reduces API calls by 80%

---

## Technical Constraints

- **No backend:** 100% client-side processing
- **Browser APIs:** FileReader, Web Workers (for background processing)
- **Libraries:** SheetJS (Excel), PapaParse (CSV), Anthropic SDK (with `dangerouslyAllowBrowser: true`)
- **AI Provider:** Anthropic Claude API (Haiku 4.5) with CORS support via `anthropic-dangerous-direct-browser-access: true` header
- **Hosting:** GitHub Pages (static site)
- **Browser Requirements:** Modern browsers with ES6+ support (Chrome 90+, Firefox 88+, Edge 90+)

---

## Future Enhancements (Out of Scope for v1.0)

- Getty AAT-ID automatic assignment
- Re-training on corrected data
- Multi-language support
- Batch processing multiple files
- Workflow: assign mappings to multiple curators
- Integration with other museum systems (MuseumPlus, Axiell)
