# museum-mapper

**AI-powered thesaurus mapping for museum collections**

---

## Was ist museum-mapper?

museum-mapper ist ein browserbasiertes Tool zur automatisierten Zuordnung von Objektnamen zu standardisierten Thesaurus-Begriffen in Museumsdatenbanken.

Entwickelt für das **Kunsthistorische Museum Wien (KHM)**, skalierbar für alle Museen mit ähnlichen Anforderungen.

---

## Das Problem

Museen verwalten tausende Objektnamen in heterogener Form:
- "Schamanengürtel", "Körbchen", "Steinbeil"
- "Schachtel mit Vögeln und rauchenden Indianern"
- Verkleinerungsformen, Material-Kombinationen, beschreibende Namen

Diese müssen zu standardisierten Thesaurus-Begriffen gemappt werden:
- Schamanengürtel → **Gürtel**
- Körbchen → **Korb**
- Steinbeil → **Beil**

**Manuell:** 300+ Stunden Arbeit für 40.000 Einträge
**Mit museum-mapper:** 4 Arbeitstage (90% Zeitersparnis)

---

## Die Lösung

### Hybrid-Ansatz: Regeln + KI

**Stufe 1: Regelbasiert (kostenlos)**
- Pattern-Matching für Material + Objekt
- Keyword-Extraktion
- Verkleinerungsformen normalisieren
- Referenz-Mapping aus 1.745 händisch bereinigten Einträgen

**Stufe 2: KI-gestützt (optional)**
- Claude Haiku 4.5 für komplexe Fälle
- Kosten: 5-25 € für 40.000 Einträge
- Batch-Processing mit Prompt Caching

### Ergebnis

| Methode | Abdeckung | Kosten |
|---------|-----------|--------|
| Nur Regeln | 40-50% korrekt | 0 € |
| Hybrid | 70-80% korrekt | 5-10 € |
| Komplett KI | 80-85% korrekt | 15-25 € |

---

## Features

### ✅ Upload & Processing
- Excel/CSV Upload via Drag & Drop
- Automatische Struktur-Validierung
- Live-Verarbeitung im Browser
- Keine Server erforderlich

### ✅ Intelligentes Mapping
- Regelbasierte Engine für häufige Muster
- Optionale KI-Integration (Claude Haiku 4.5)
- Batch-Processing für große Datenmengen
- Konfidenz-Score pro Zuordnung

### ✅ Qualitätskontrolle
- Farbcodierte Status: OK / PRÜFEN / MUSS_BEARBEITET_WERDEN
- Interaktive Vorschau mit Filter und Suche
- Manuelle Korrektur-Möglichkeit
- Detailliertes Mapping-Log

### ✅ Export & Integration
- Excel/CSV/JSON Export
- TMS-kompatibles Format (TermID, TermMasterID)
- Statistik-Report
- Separate Liste für manuelle Nachbearbeitung

### ✅ DSGVO-konform
- Alle Daten bleiben im Browser
- Keine Server-Speicherung
- Optionale API-Nutzung (BYOK = Bring Your Own Key)

---

## Technologie

### Stack
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Typography:** Crimson Pro (headings), System Fonts (body)
- **Libraries:** SheetJS (Excel), PapaParse (CSV), Anthropic SDK
- **AI:** Claude Haiku 4.5 API (optional, CORS-enabled)
- **Hosting:** GitHub Pages (kostenlos, statisch)

### Architektur
```
Excel Upload → Browser Processing → Enhanced Excel Download
              ↓
         [Optional: Claude Haiku 4.5 API]
```

### Performance
- Verarbeitung: ~100-200 Einträge/Sekunde (regelbasiert) → ~3-7 Min. für 40k
- API: ~20-40 Einträge/Sekunde (mit KI) → ~15-30 Min. für 40k
- Total: ~45 Minuten für 40.000 Einträge (Hybrid-Modus)

---

## Use Case: KHM Wien

### Input-Daten
- **40.276 Objektnamen** (≤12 Vorkommen)
- **3.157 Thesaurus-Begriffe** (hierarchisch)
- **1.745 Referenz-Mappings** (Training-Data)

### Mapping-Beispiele

| ObjectName | Thesaurus-Begriff | Konfidenz | Status |
|------------|-------------------|-----------|--------|
| Schamanengürtel | Gürtel | 95% | OK |
| Schachtel mit Vögeln... | Schachtel | 88% | PRÜFEN |
| Insektensnack | - | - | MUSS_BEARBEITET_WERDEN |

### Output
Erweiterte Excel-Datei mit:
- Thesaurus-Begriff
- CN-Code (Hierarchie)
- TermID (für TMS-Import)
- Konfidenz-Score
- Status-Klassifikation
- Vermerk: "Thesaurus-Begriff wurde mit Hilfe von KI zugeordnet"

---

## Installation & Nutzung

### Deployment
1. Repository klonen
2. Auf GitHub Pages deployen
3. URL: `username.github.io/museum-mapper`

### Verwendung
1. Excel-Datei hochladen (Spalten: ObjectName, AnzahlvonObjectName)
2. Thesaurus-Datei hochladen (Spalten: CN, term, TermID)
3. Optional: Anthropic API-Key eingeben
4. "Verarbeiten" klicken
5. Ergebnis herunterladen


## Status & Roadmap

### Phase 1: Prototyp
- [1] Konzeption & Spezifikation
- [1] Datenanalyse
- [0] Regelbasierte Engine implementieren
- [0] UI/UX Design

### Phase 2: KI-Integration
- [0] Claude Haiku 4.5 API-Anbindung
- [0] Prompt-Engineering
- [0] Batch-Processing
- [0] Getty AAT-ID Mapping

---

## Anwendungsfälle

### Primär: KHM Wien
- 40.276 Objektnamen → Thesaurus-Mapping
- TMS-Integration
- Getty AAT-ID Zuordnung (zukünftig)

### Sekundär: Andere Museen
- Anpassbar auf verschiedene Thesauri
- Export-Templates für unterschiedliche Systeme
- Open Source für Community-Beiträge

### Erweiterungen
- Automatisches Re-Training auf korrigierten Daten
- Mehrsprachige Thesaurus-Verwaltung
- Normdaten-Integration (GND, Wikidata)

---

## Links

- **GitHub:** `github.com/chpollin/museum-mapper`

---

**museum-mapper** – Weil Museen bessere Tools verdienen.