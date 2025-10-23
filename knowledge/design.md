# Design Specification

## Design Principles

**Clarity over aesthetics** - Function first, form follows
**Neutral and accessible** - Works for all museums, not culturally themed
**Fast and lightweight** - No web fonts, minimal CSS, native browser features
**Progressive disclosure** - Show only what's needed per phase

---

## Visual System

### Color Palette

**Warm neutrality - accessible, functional, friendly:**

```css
/* Primary Actions */
--primary: #3b82f6;        /* Blue 500 - warmer, friendlier than 600 */
--primary-hover: #2563eb;  /* Blue 600 */

/* Accent */
--accent: #f59e0b;         /* Amber 500 - warm but not culturally themed */

/* Status Colors */
--status-ok: #10b981;      /* Emerald 500 - warmer than green */
--status-check: #f59e0b;   /* Amber 500 - warmer, more refined than orange */
--status-error: #ef4444;   /* Red 500 - warm red */
--status-ignore: #6b7280;  /* Gray 500 */

/* Neutrals (Stone palette - warmer than Gray) */
--bg-primary: #fefefe;     /* Slightly warm white */
--bg-secondary: #fafaf9;   /* Stone 50 */
--bg-tertiary: #f5f5f4;    /* Stone 100 */
--border: #e7e5e4;         /* Stone 200 */
--text-primary: #1c1917;   /* Stone 900 */
--text-secondary: #78716c; /* Stone 500 */
```

**Rationale:**
- Tailwind colors (tested, WCAG AA compliant)
- Stone palette instead of Gray = warmer, friendlier
- Amber accent = warmth without cultural bias
- Remains neutral enough for any museum

### Typography

**Hybrid approach - personality + performance:**

**Headings: Crimson Pro (academic character, warmth)**
```css
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600&display=swap');

h1, h2, h3, h4, h5, h6 {
  font-family: 'Crimson Pro', Georgia, serif;
  font-weight: 600;
}
```

**Body/UI: System fonts (performance, readability)**
```css
body, input, button, table {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
               Roboto, Helvetica, Arial, sans-serif;
}
```

**Sizes (rem-based for accessibility):**
```css
--text-xs: 0.75rem;   /* 12px - Metadata */
--text-sm: 0.875rem;  /* 14px - Secondary */
--text-base: 1rem;    /* 16px - Body */
--text-lg: 1.125rem;  /* 18px - H3 */
--text-xl: 1.25rem;   /* 20px - H2 */
--text-2xl: 1.5rem;   /* 24px - H1 */
```

**Rationale:**
- Crimson Pro adds personality and academic elegance to headings
- System fonts for body text = instant load, optimal readability
- Only 2 weights (~20KB gzipped) with `display=swap`
- Georgia fallback (serif on all systems)
- Best balance between character and pragmatism

### Spacing

**8px base unit:**
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
```

### Elevation

**Subtle shadows for depth:**
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
```

**Rationale:** Standard Tailwind shadows, subtle, performance-optimized.

---

## Layout

### Container

```css
max-width: 1280px;
margin: 0 auto;
padding: 0 1.5rem;
```

### Header (Fixed)

```
┌─────────────────────────────────────────────┐
│ [Logo] museum-mapper  [Phase: 1/4]   [Help] │
└─────────────────────────────────────────────┘
Height: 64px
Background: white
Border-bottom: 1px var(--border)
```

### Phase Indicator

```
1 Upload → 2 Config → 3 Process → 4 Results
  ●          ○           ○           ○
```

**Visual:**
- Active: Blue circle (--primary)
- Inactive: Gray circle (--text-secondary)
- Completed: Blue with checkmark
- Simple SVG icons, no animations

---

## Components

### 1. File Upload (US-01, US-02, US-03)

**Dropzone:**
```html
<div class="dropzone">
  <svg><!-- Upload icon --></svg>
  <p>Drop files or click to upload</p>
  <p class="text-sm text-secondary">.xlsx, .xls, .csv</p>
</div>
```

**Styles:**
```css
.dropzone {
  border: 2px dashed var(--border);
  border-radius: 8px;
  padding: 3rem;
  text-align: center;
  background: var(--bg-primary);
  cursor: pointer;
}

.dropzone:hover {
  border-color: var(--primary);
  background: var(--bg-secondary);
}
```

**After upload - Validation list:**
```
✓ Objektnamen.xlsx (40,276 entries)
  Columns: ObjectName, AnzahlvonObjectName

✓ Thesaurus.xlsx (3,157 terms)
  Columns: CN, term, TermID, TermMasterID

○ Reference mappings (optional)
  Not uploaded - reduced quality expected
```

**Visual:** Simple list with colored icons, no complex tree.

---

### 2. Configuration (US-04, US-05)

**Mapping method selector:**
```html
<div class="option-card">
  <input type="radio" id="rules" name="method" value="rules">
  <label for="rules">
    <strong>Rules only</strong> (free)
    <span class="meta">~40-50% coverage, ~7 min</span>
  </label>
</div>

<div class="option-card active">
  <input type="radio" id="hybrid" name="method" value="hybrid" checked>
  <label for="hybrid">
    <strong>Hybrid</strong> (recommended)
    <span class="meta">~70-80% coverage, ~45 min, ~€5-10</span>
  </label>
  <input type="password" placeholder="Anthropic API key (sk-ant-...)">
</div>
```

**Styles:**
```css
.option-card {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
}

.option-card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-sm);
}

.option-card.active {
  border-color: var(--primary);
  border-width: 2px;
}
```

**Confidence threshold slider:**
```html
<label>Mark as "OK" above: <strong>80%</strong></label>
<input type="range" min="70" max="95" value="80" step="5">
```

**Rationale:** Native HTML inputs, accessible, keyboard navigable, no custom styling needed.

---

### 3. Processing (US-06, US-07, US-08)

**Progress visualization (dual approach):**

**Primary: Standard progress bar (always visible)**
```html
<div class="progress-bar">
  <div class="progress-fill" style="width: 62%"></div>
</div>
<p>Verarbeitet: 24.971 / 40.276 (62%)</p>
<p class="text-sm text-secondary">Geschätzte Zeit: ~18 Minuten</p>
```

**Styles:**
```css
.progress-bar {
  height: 12px;
  background: var(--bg-tertiary);
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  transition: width 0.3s ease;
}
```

**Secondary: Organic circles (optional visual enhancement for desktop)**
```html
<div class="progress-organic">
  <svg viewBox="0 0 480 24" aria-hidden="true">
    <!-- 20 circles representing 5% each -->
    <circle cx="12" cy="12" r="8" class="filled" />
    <circle cx="36" cy="12" r="8" class="filled" />
    <!-- ... 10 more filled circles ... -->
    <circle cx="300" cy="12" r="8" class="current" />
    <circle cx="324" cy="12" r="8" class="empty" />
    <!-- ... remaining empty circles ... -->
  </svg>
</div>
```

**Styles:**
```css
.progress-organic {
  margin-top: 1rem;
  display: none; /* Hidden on mobile */
}

@media (min-width: 1024px) {
  .progress-organic {
    display: block;
  }
}

.progress-organic svg {
  width: 100%;
  max-width: 480px;
  height: 24px;
}

.progress-organic circle.filled {
  fill: var(--primary);
}

.progress-organic circle.current {
  fill: var(--accent);
  animation: pulse 1.5s ease-in-out infinite;
}

.progress-organic circle.empty {
  fill: var(--border);
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}
```

**Rationale:**
- Standard progress bar = primary indicator (clear, accessible, familiar)
- Organic circles = secondary visual enhancement (personality, engagement)
- Desktop only (performance consideration)
- Both show same information, circles add visual interest without replacing clarity
- `aria-hidden` on SVG since progress bar provides text alternative

**Status distribution:**
```
OK:         ████████████████████ 62% (24,971)
PRÜFEN:     ████████ 22% (8,854)
BEARBEITEN: ████ 12% (4,845)
IGNORIERT:  ██ 4% (1,606)
```

**Visual:** Simple colored bars with percentages, no fancy animations.

**Current item (optional, if not too distracting):**
```html
<div class="current-item">
  <p class="text-sm text-secondary">Currently processing:</p>
  <p>"Schamanengürtel" → <strong>Gürtel</strong></p>
  <p class="text-xs">Confidence: 95% (AI)</p>
</div>
```

**Rationale:** Standard progress bar is familiar, accessible, and performs well. No custom circle animations needed.

---

### 4. Results (US-09, US-10, US-11)

**Summary stats:**
```html
<div class="stats-grid">
  <div class="stat-card ok">
    <div class="stat-number">24,971</div>
    <div class="stat-label">OK</div>
  </div>
  <div class="stat-card check">
    <div class="stat-number">8,854</div>
    <div class="stat-label">PRÜFEN</div>
  </div>
  <div class="stat-card error">
    <div class="stat-number">4,845</div>
    <div class="stat-label">BEARBEITEN</div>
  </div>
  <div class="stat-card ignore">
    <div class="stat-number">1,606</div>
    <div class="stat-label">IGNORIERT</div>
  </div>
</div>
```

**Styles:**
```css
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid;
  background: var(--bg-secondary);
}

.stat-card.ok { border-color: var(--status-ok); }
.stat-card.check { border-color: var(--status-check); }
.stat-card.error { border-color: var(--status-error); }
.stat-card.ignore { border-color: var(--status-ignore); }

.stat-number {
  font-size: 2rem;
  font-weight: 600;
  line-height: 1;
}

.stat-label {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}
```

**Filter & Search:**
```html
<div class="toolbar">
  <select name="filter">
    <option value="all">All</option>
    <option value="ok">OK</option>
    <option value="check">PRÜFEN</option>
    <option value="error">BEARBEITEN</option>
  </select>

  <input type="search" placeholder="Search object name...">
</div>
```

**Table:**
```html
<table class="results-table">
  <thead>
    <tr>
      <th>Object Name</th>
      <th>Thesaurus Term</th>
      <th>Confidence</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr class="status-ok">
      <td>Schamanengürtel</td>
      <td>Gürtel</td>
      <td>95%</td>
      <td><span class="badge ok">OK</span></td>
    </tr>
    <tr class="status-check">
      <td>Schachtel mit Vögeln...</td>
      <td>Schachtel</td>
      <td>88%</td>
      <td><span class="badge check">PRÜFEN</span></td>
    </tr>
    <tr class="status-error">
      <td>Insektensnack</td>
      <td>—</td>
      <td>—</td>
      <td><span class="badge error">BEARBEITEN</span></td>
    </tr>
  </tbody>
</table>
```

**Styles:**
```css
.results-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.results-table th {
  background: var(--bg-tertiary);
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.results-table td {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--border);
}

.results-table tbody tr:hover {
  background: var(--bg-secondary);
  cursor: pointer;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge.ok { background: #dcfce7; color: #166534; }
.badge.check { background: #fed7aa; color: #9a3412; }
.badge.error { background: #fee2e2; color: #991b1b; }
.badge.ignore { background: #f3f4f6; color: #374151; }
```

**Rationale:** Standard HTML table is accessible, sortable with JS, and performs well with 40k rows (with pagination).

---

### 5. Detail Modal (US-10)

```html
<dialog class="detail-modal">
  <div class="modal-header">
    <h3>Schamanengürtel</h3>
    <button class="close">×</button>
  </div>

  <div class="modal-body">
    <dl>
      <dt>Frequency</dt>
      <dd>3 occurrences</dd>

      <dt>Mapped to</dt>
      <dd><strong>Gürtel</strong></dd>

      <dt>CN Code</dt>
      <dd>AUT.AAA.AAC.AAH.ADL.AAB...</dd>

      <dt>Term ID</dt>
      <dd>2220645</dd>

      <dt>Confidence</dt>
      <dd>95% (AI)</dd>

      <dt>Status</dt>
      <dd><span class="badge ok">OK</span></dd>
    </dl>

    <div class="reasoning">
      <h4>AI Reasoning</h4>
      <p>"Schamanengürtel" contains the core object "Gürtel".
         The cultural prefix specifies usage but doesn't change
         the object category.</p>
    </div>
  </div>

  <div class="modal-footer">
    <button class="btn-secondary">Edit mapping</button>
    <button class="btn-primary">Confirm as correct</button>
  </div>
</dialog>
```

**Styles:**
```css
dialog.detail-modal {
  max-width: 600px;
  border: none;
  border-radius: 12px;
  padding: 0;
  box-shadow: var(--shadow-lg);
}

dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border);
  background: var(--bg-secondary);
}
```

**Rationale:** Native `<dialog>` element - accessible, keyboard navigable, built-in backdrop.

---

### 6. Buttons

**Primary:**
```css
.btn-primary {
  background: var(--primary);
  color: white;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary:hover {
  background: var(--primary-hover);
}
```

**Secondary:**
```css
.btn-secondary {
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.btn-secondary:hover {
  background: var(--bg-secondary);
}
```

---

## Interactions

### Animations

**Principle: Only functional animations, no decoration.**

```css
/* Smooth transitions */
* {
  transition: background-color 0.2s ease,
              border-color 0.2s ease,
              transform 0.2s ease,
              opacity 0.2s ease;
}

/* Hover lift */
.card:hover {
  transform: translateY(-2px);
}

/* Modal appear */
dialog[open] {
  animation: fade-in 0.2s ease;
}

@keyframes fade-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
```

**Rationale:** CSS transitions only, no JS animation libraries needed.

---

## Responsive

### Breakpoints

```css
/* Mobile: < 768px */
- Single column layout
- Stack upload cards vertically
- Table becomes cards (vertical list)
- Modal takes full screen

/* Tablet: 768px - 1024px */
- Two column layout where appropriate
- Table stays as table but scrollable
- Normal modal behavior

/* Desktop: > 1024px */
- Full layout as designed
- Table with all columns visible
- Optimal spacing
```

### Mobile considerations

**For v1.0: Desktop-first approach**

Show banner on mobile:
```html
<div class="mobile-warning">
  <p>⚠️ museum-mapper requires a desktop browser for processing.</p>
  <p>Use Chrome, Firefox, or Edge on a computer.</p>
</div>
```

**Rationale:** Processing 40k entries requires desktop resources. Mobile support is nice-to-have, not critical for v1.0.

---

## Accessibility

**WCAG 2.1 AA Compliance:**

- All colors pass contrast ratio 4.5:1 minimum
- Focus indicators on all interactive elements
- Keyboard navigation for all functions
- ARIA labels on icons and complex components
- `<dialog>` element with proper focus trap
- Skip to main content link
- Semantic HTML (headings, landmarks)

```css
/* Visible focus indicator */
*:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

---

## Performance Budget

**Goals:**
- First paint: < 1s
- Interactive: < 2s
- Total CSS: < 12KB (gzipped)
- Web font: ~20KB (Crimson Pro, 2 weights, async loaded)
- No animation libraries (0KB)

**How:**
- Crimson Pro for headings only (~20KB), system fonts for body
- `font-display: swap` for instant text rendering
- Minimal CSS (no framework, custom utility classes only)
- CSS transitions instead of JS animations
- SVG icons (inline, not library)
- Lazy load table rows (virtualization for 40k entries)

---

## Implementation Notes

### CSS Architecture

**Use custom properties for theming:**
```css
:root {
  /* Define all colors, spacing, shadows here */
}

/* Option: dark mode support via media query */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1f2937;
    --text-primary: #f9fafb;
    /* ... */
  }
}
```

**Utility-first approach (like Tailwind, but minimal):**
```css
.text-center { text-align: center; }
.mt-4 { margin-top: 1rem; }
.flex { display: flex; }
.gap-4 { gap: 1rem; }
/* Only create what you actually use */
```

### JavaScript Considerations

**Table virtualization required for 40k rows:**
- Use Intersection Observer to render visible rows only
- Render ~50 rows at a time
- Smooth scroll performance

**Recommended minimal libraries:**
- SheetJS (Excel parsing/writing) - Required
- PapaParse (CSV) - Optional, could use native parsing
- No UI frameworks needed (vanilla JS sufficient)

---

## Summary

This design is:
- **Neutral** - No cultural theming, works for any museum
- **Compact** - Only essential components, no bloat
- **Fast** - System fonts, minimal CSS, no external dependencies
- **Accessible** - WCAG AA compliant, semantic HTML
- **Practical** - Focuses on functionality over aesthetics

**Trade-offs made:**
- ❌ No fancy animations → ✅ Better performance
- ❌ No web fonts → ✅ Instant load
- ❌ No cultural theming → ✅ Universal applicability
- ❌ No mobile processing → ✅ Simpler implementation

**Design philosophy:** Build a reliable tool, not a portfolio piece.
