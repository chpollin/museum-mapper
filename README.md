# museum-mapper

**AI-powered thesaurus mapping for museum collections**

Browser-based tool to automatically map 40,000+ heterogeneous object names to standardized thesaurus terms.

---

## Quick Facts

- **Target:** Kunsthistorisches Museum Wien (KHM), scalable for any museum
- **Problem:** Map 40,276 object names to 3,157 thesaurus terms
- **Solution:** Hybrid approach (rules + AI)
- **Time saving:** 300+ hours → 4 days (90%)
- **Accuracy:** 70-85% (hybrid mode)
- **Cost:** ~€5-10 per 40k entries
- **Processing:** ~45 minutes for 40k entries

---

## Technology

**100% client-side processing, no backend required**

- Vanilla JavaScript, HTML5, CSS3
- SheetJS (Excel), PapaParse (CSV), Anthropic SDK
- Crimson Pro font (headings), System fonts (body)
- Claude Haiku 4.5 API (optional, CORS-enabled)
- GitHub Pages hosting (free, static)

---

## Features

✅ **Upload & Validation** - Drag & drop Excel/CSV
✅ **Smart Mapping** - Rules + AI with confidence scores
✅ **Quality Control** - Color-coded status (OK / CHECK / EDIT)
✅ **Manual Correction** - Interactive table with editing
✅ **Export** - Excel/CSV/JSON, TMS-compatible format
✅ **Privacy** - All data stays in browser (GDPR compliant)

---

## Documentation

- **[project.md](knowledge/project.md)** - Detailed project overview
- **[requirements.md](knowledge/requirements.md)** - User stories & acceptance criteria
- **[design.md](knowledge/design.md)** - UI/UX specification
- **[data.md](knowledge/data.md)** - Input data structure & examples

---

## Status: v1.0 ✅ Ready for Production

**Phase 1: Prototype** ✅ Completed
- [x] Conception & specification
- [x] Data analysis
- [x] Rule-based engine implementation
- [x] UI/UX implementation

**Phase 2: AI Integration** ✅ Completed
- [x] Claude Haiku 4.5 API integration
- [x] Prompt engineering
- [x] Batch processing
- [x] Excel export with TMS format

**Phase 3: Future Enhancements** 🔜
- [ ] Getty AAT-ID automatic assignment
- [ ] Multi-language support
- [ ] Batch file processing
- [ ] Advanced analytics dashboard

---

## Getting Started

### Live Demo

Visit: **https://chpollin.github.io/museum-mapper/**

### Usage

1. **Upload Files**
   - Object names (.xlsx/.csv) - Required
   - Thesaurus (.xlsx/.csv) - Required
   - Reference mappings (.xlsx/.csv) - Optional

2. **Configure Mapping**
   - Choose method: "Nur Regelbasiert" (free) or "Hybrid" (rules + AI)
   - For hybrid: Enter your [Anthropic API key](https://console.anthropic.com/)
   - Adjust confidence threshold (default: 80%)

3. **Process**
   - Click "Verarbeitung starten"
   - Watch real-time progress
   - See status distribution (OK / PRÜFEN / BEARBEITEN)

4. **Review & Export**
   - Filter and search results
   - Click on rows to see details and AI reasoning
   - Export as Excel (.xlsx) with TMS-compatible format

### Mapping Rules

The app applies these rules automatically:

1. **Reference lookup** - Exact matches from your reference file (100% confidence)
2. **Diminutive removal** - "Körbchen" → "Korb" (90% confidence)
3. **Material prefix removal** - "Steinbeil" → "Beil" (85% confidence)
4. **Keyword extraction** - Finds main object in long descriptions (75% confidence)
5. **Fuzzy matching** - Levenshtein distance for typos (70%+ confidence)
6. **AI enhancement** - Claude Haiku 4.5 for complex cases (variable confidence)

### Expected Results

- **Rules only**: 40-50% OK, ~7 minutes
- **Hybrid (recommended)**: 70-80% OK, ~45 minutes, ~€5-10
- All results include confidence scores and reasoning

---

## License

MIT (to be added)

---

**museum-mapper** – Better tools for museums.
