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

## Status: v1.0 Planning Phase

**Phase 1: Prototype** ✏️ (current)
- [x] Conception & specification
- [x] Data analysis
- [ ] Rule-based engine implementation
- [ ] UI/UX implementation

**Phase 2: AI Integration** 🔜
- [ ] Claude Haiku 4.5 API integration
- [ ] Prompt engineering
- [ ] Batch processing
- [ ] Testing with real data

---

## Getting Started (Planned)

1. Open `https://your-username.github.io/museum-mapper`
2. Upload your object names file (.xlsx, .csv)
3. Upload your thesaurus file
4. Optional: Add Anthropic API key for AI mapping
5. Click "Process"
6. Review results, make corrections
7. Download enriched data

---

## License

MIT (to be added)

---

**museum-mapper** – Better tools for museums.
