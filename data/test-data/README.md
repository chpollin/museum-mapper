# Test-Daten für museum-mapper

Kleine Testdateien zum Durchlaufen der verschiedenen Mapping-Szenarien.

## Dateien

### 1. test_objects.csv
Enthält 20 Testfälle, die alle Regel-Szenarien abdecken:
- Exakte Matches
- Verkleinerungsformen
- Material-Präfixe
- Keyword-Extraktion
- Fuzzy-Matching
- Nicht-Objekte
- Komplexe Fälle für AI

### 2. test_thesaurus.csv
Minimaler Thesaurus mit 15 Begriffen aus verschiedenen Kategorien

### 3. test_reference.csv
5 Referenz-Mappings für bekannte Zuordnungen

## Erwartete Ergebnisse

### Nur Regelbasiert (~65% OK):
- **OK (≥80%)**: 13 Einträge
- **PRÜFEN (50-79%)**: 4 Einträge
- **BEARBEITEN (<50%)**: 2 Einträge
- **IGNORIERT**: 1 Eintrag

### Hybrid (Regeln + AI) (~85% OK):
- **OK (≥80%)**: 17 Einträge
- **PRÜFEN (50-79%)**: 1 Eintrag
- **BEARBEITEN (<50%)**: 1 Eintrag
- **IGNORIERT**: 1 Eintrag

## Test-Szenarien

| # | Objektname | Erwartetes Mapping | Regel | Konfidenz |
|---|------------|-------------------|-------|-----------|
| 1 | Pfeil | Pfeil | Exakt | 100% |
| 2 | Körbchen | Korb | Verkleinerungsform | 90% |
| 3 | Steinbeil | Beil | Material-Präfix | 85% |
| 4 | Schamanengürtel | Gürtel | Keyword | 75% |
| 5 | Pfeile | Pfeil | Fuzzy | ~80% |
| 6 | Ahnenfigur | Figur | Referenz | 100% |
| 7 | Als Imitation ausgeschieden | — | Nicht-Objekt | 0% |
| 8 | Schachtel mit Vögeln und... | Schachtel | Keyword | 75% |
| 9 | Insektensnack | ? | AI | variable |
| 10 | Rituelles Zeremonialgewand | Kleidung | AI | variable |

## Verwendung

1. **App öffnen**: https://chpollin.github.io/museum-mapper/
2. **Upload**:
   - Objects: `test_objects.csv`
   - Thesaurus: `test_thesaurus.csv`
   - Reference: `test_reference.csv` (optional)
3. **Konfiguration**:
   - Methode wählen (Regeln / Hybrid)
   - Schwelle: 80% (Standard)
4. **Verarbeiten** und Ergebnisse prüfen
5. **Export** als Excel und vergleichen mit erwarteten Werten

## Debugging

Öffnen Sie die Browser-Konsole (F12) um detaillierte Logs zu sehen:
- `✓ Built reference map with X mappings`
- `Processing X objects`
- `Using method: rules / hybrid`
- Stats nach Verarbeitung
