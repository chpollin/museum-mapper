# museum-mapper

**Live Demo:** https://[your-username].github.io/museum-mapper/

## GitHub Pages Setup

Um GitHub Pages zu aktivieren:

1. Gehen Sie zu **Settings** > **Pages**
2. Unter **Source** wählen Sie **Deploy from a branch**
3. Unter **Branch** wählen Sie **main** und **/docs**
4. Klicken Sie auf **Save**
5. Nach einigen Minuten ist die Seite unter `https://[your-username].github.io/museum-mapper/` verfügbar

## Entwicklung

Die Anwendung läuft komplett im Browser, keine Backend-Infrastruktur erforderlich.

### Struktur

```
docs/
├── index.html          # Haupt-HTML-Datei
├── css/
│   └── styles.css      # Design-System & Styles
├── js/
│   ├── app.js         # Haupt-Anwendung
│   └── modules/
│       ├── phaseManager.js      # Phasen-Navigation
│       ├── fileUploader.js      # Datei-Upload & Parsing
│       ├── configManager.js     # Konfiguration
│       ├── mappingProcessor.js  # Mapping-Engine
│       ├── resultsManager.js    # Ergebnis-Anzeige
│       └── uiManager.js         # UI-Interaktionen
└── assets/             # Bilder, Icons (wenn benötigt)
```

### Technologien

- **Vanilla JavaScript** (ES6 Modules)
- **SheetJS** (Excel-Parsing, via CDN)
- **Anthropic Claude API** (optional, für KI-Mapping)
- **CSS Custom Properties** (Design-System)
- **Native Dialog API** (Modals)

### Status

✅ **Implementiert:**
- HTML-Grundgerüst mit 4-Phasen-Navigation
- Design-System basierend auf design.md
- File Upload mit Drag & Drop
- Konfigurations-Interface
- Progress-Tracking
- Ergebnis-Tabelle mit Filter/Suche

⏳ **In Entwicklung:**
- Regelbasierte Mapping-Engine
- AI-Integration (Claude Haiku 4.5)
- Excel-Export
- Tabellen-Virtualisierung

## Lokale Entwicklung

Da die App komplett client-seitig läuft, kann sie direkt im Browser geöffnet werden:

```bash
# Einfach die index.html öffnen
open docs/index.html

# Oder mit einem lokalen Server (empfohlen für ES6 Modules)
cd docs
python -m http.server 8000
# Dann öffnen: http://localhost:8000
```

## Lizenz

MIT
