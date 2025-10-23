# DATA.md
## Input-Datenspezifikation für museum-mapper

### Übersicht

museum-mapper verarbeitet drei Excel-Dateien aus dem TMS (The Museum System) des Kunsthistorischen Museums Wien zur automatisierten Thesaurus-Zuordnung.

---

## 1. WMW_Object_Names_Haeufigkeit.xlsx

### Beschreibung
Vollständige Liste aller Objektnamen aus der Museumsdatenbank mit ihrer Verwendungshäufigkeit.

### Struktur

| Spalte | Datentyp | Beschreibung | Beispiel |
|--------|----------|--------------|----------|
| ObjectName | Text | Objektbezeichnung aus TMS | "Pfeil" |
| AnzahlvonObjectName | Ganzzahl | Häufigkeit der Verwendung | 12662 |

### Statistik

- **Gesamteinträge:** 42.024
- **Einträge ≤12 Vorkommen:** 40.276 (95,8%)
- **Einträge ≥13 Vorkommen:** 1.748 (4,2%)

### Beispieldaten

```
ObjectName                                           | AnzahlvonObjectName
Pfeil                                                | 12662
Speer                                                | 3116
Münze                                                | 2171
Schamanengürtel                                      | 3
Schachtel mit Vögeln und rauchenden Indianern        | 2
Insektensnack                                        | 2
Belugasehnen                                         | 1
Beinknöchel zum Würfeln in Fischhautsack             | 1
Samen des Tabakumba Baumes bei Infektionen im...    | 1
```

### Besonderheiten

**Objektnamen mit hoher Frequenz (Top 10):**
1. Pfeil (12.662x)
2. Speer (3.116x)
3. Münze (2.171x)

**Typische Namensstrukturen:**
- Einfache Begriffe: "Pfeil", "Speer", "Münze"
- Material + Objekt: "Steinbeil", "Kupfergefäß"
- Beschreibende Namen: "Schachtel mit Vögeln und rauchenden Indianern"
- Funktionale Namen: "Samen des Tabakumba Baumes bei Infektionen im Genitalbereich"
- Verkleinerungsformen: "Körbchen", "Schächtelchen"
- Kulturspezifisch: "Schamanengürtel", "Kris, Scheide"

**Nicht-Objektnamen (zu ignorieren):**
- "Als Imitation ausgeschieden"
- "Getauscht gegen Post 4 aus 1928"
- Administrative Vermerke

### Verarbeitungsziel

Alle Einträge mit **≤12 Vorkommen** (40.276 Stück) sollen automatisch zu Thesaurus-Begriffen gemappt werden.

---

## 2. WMW_ObjectName_gruppiert_bis_incl_13x.xlsx

### Beschreibung
Händisch bereinigte Referenz-Mappings für häufig verwendete Objektnamen (≥13 Vorkommen). Diese Datei dient als Training-Data und Qualitätsreferenz.

### Struktur

| Spalte | Datentyp | Beschreibung | Beispiel |
|--------|----------|--------------|----------|
| ObjectName | Text | Original-Objektname | "Ahnenfigur" |
| AnzahlvonObjectName | Ganzzahl | Verwendungshäufigkeit | 57 |
| Begriff bereinigt | Text (optional) | Standardisierter Begriff | "Figur" |

### Statistik

- **Gesamteinträge:** 1.745
- **Mit bereinigtem Begriff:** 1.114 (63,8%)
- **Ohne Bereinigung:** 631 (36,2%)

### Beispieldaten

```
ObjectName              | AnzahlvonObjectName | Begriff bereinigt
Achselschnur            | 72                  | 
Ahle                    | 51                  | 
Ahnenfigur              | 57                  | Figur
Als Imitation ausgeschieden | 81             | *
Amulettkapsel           | 50                  | Amulettbehälter
Steinbeil               | 23                  | Beil
Körbchen                | 18                  | Korb
Ohrgehänge              | 15                  | Ohrschmuck
```

### Bereinigungsregeln (abgeleitet)

**1. Verkleinerungsformen eliminieren:**
- Körbchen → Korb
- Schächtelchen → Schachtel
- Figürchen → Figur

**2. Material entfernen:**
- Steinbeil → Beil
- Kupfergefäß → Gefäß
- Holzschale → Schale

**3. Begriffe vereinheitlichen:**
- Ohrgehänge → Ohrschmuck
- Amulettkapsel → Amulettbehälter

**4. Sonderfälle:**
- `*` = Nicht-Objektname, ignorieren
- Leer = Begriff bereits standardisiert

### Verwendung

Diese Datei wird genutzt für:
1. **Exakte Matches:** Direkte Übernahme bekannter Mappings
2. **Pattern-Learning:** Ableitung von Bereinigungsregeln
3. **Qualitätskontrolle:** Validierung der automatischen Mappings
4. **Training:** Falls ML-basierte Ansätze verwendet werden

---

## 3. WMW_Objektname_Thesaurus.xlsx

### Beschreibung
Aktueller hausinterner Thesaurus mit hierarchischer Struktur. Ziel-Vokabular für alle Mappings.

### Struktur

| Spalte | Datentyp | Beschreibung | Beispiel |
|--------|----------|--------------|----------|
| TermMasterID | Ganzzahl | Eindeutige Master-ID | 1634165 |
| CN | Text | Hierarchie-Code | "AUT.AAA.AAC.AAH.ADL.AAB.AAB" |
| term | Text | Thesaurus-Begriff | "Bekleidung" |
| TermID | Ganzzahl | TMS-interne Term-ID | 2220623 |
| AAT_ID | Text (optional) | Getty AAT-ID | "300037000" |
| Alt_TermID | Ganzzahl (optional) | Alternative Term-ID | 2222529 |

### Statistik

- **Gesamteinträge:** 3.157
- **Mit AAT_ID:** 14 (0,4%)
- **Ohne AAT_ID:** 3.143 (99,6%)
- **Hierarchie-Ebenen:** 2-8 Ebenen tief

### Hierarchie-Prinzip

**CN-Code-Struktur:**
```
AUT.AAA.AAC.AAH.ADL.AAB           → Root: Objektsammlung
    .AAB                          → Bekleidung
        .AAA                      → Militärische Bekleidung
            .AAA                  → Rüstung
            .AAB                  → Uniform
        .AAB                      → Penisfutteral
        .AAC                      → Hose
    .AAD                          → Waffen
        .AAT                      → Armbrust
        .AAW                      → Axt
```

**Regel:**
- Jede 3-Buchstaben-Gruppe = ein Hierarchie-Level
- `.AAA` = erste Unterkategorie
- `.AAB` = zweite Unterkategorie
- `.ABC` = erweiterte Unterkategorie

**Root-Knoten:**
Alle Einträge beginnen mit: `AUT.AAA.AAC.AAH.ADL.AAB`

### Beispieldaten

```
TermMasterID | CN                                  | term                        | TermID  | AAT_ID
1634165      | AUT.AAA.AAC.AAH.ADL.AAB             | Objektsammlung              | 2220616 | 
1634168      | AUT.AAA.AAC.AAH.ADL.AAB.AAB         | Bekleidung                  | 2220623 |
1634169      | AUT.AAA.AAC.AAH.ADL.AAB.AAB.AAA     | Militärische Bekleidung     | 2220624 |
1634170      | AUT.AAA.AAC.AAH.ADL.AAB.AAB.AAA.AAA | Rüstung                     | 2220625 |
1634279      | AUT.AAA.AAC.AAH.ADL.AAB.AAD.AAT     | Armbrust                    | 2220735 | 300037000
1634282      | AUT.AAA.AAC.AAH.ADL.AAB.AAD.AAW     | Axt                         | 2220738 | 300036982
1635920      | AUT.AAA.AAC.AAH.ADL.AAB.AAB.ACK     | Kostüm Accessoire           | 2222527 | 300209273
```

### AAT-ID Beispiele

Bereits vorhandene Getty AAT-IDs:

| term | AAT_ID | AAT-Begriff |
|------|--------|-------------|
| Armbrust | 300037000 | crossbows |
| Axt | 300036982 | axes |
| Bumerang | 300037220 | boomerangs |
| Kostüm Accessoire | 300209273 | costume accessories |
| Livree | 300224239 | liveries |

### MIMO-Bereich (ignorieren)

Ab CN-Code `AUT.AAA.AAC.AAH.ADL.AAB.ABC` beginnt der **MIMO-Thesaurus für Musikinstrumente**.
Dieser Bereich ist sehr umfangreich und spezialisiert und kann für das Mapping ignoriert werden.

### Verwendung

Der Thesaurus dient als:
1. **Ziel-Vokabular:** Alle Mappings müssen zu einem Begriff aus dieser Liste führen
2. **Hierarchie-Quelle:** CN-Codes ermöglichen strukturierte Navigation
3. **TMS-Integration:** TermID und TermMasterID für direkten Import
4. **AAT-Mapping:** Basis für Anwendungsfall 1 (Getty AAT-ID Zuordnung)

---

## Datenbeziehungen

```
WMW_Object_Names_Haeufigkeit (42.024)
        ↓
    Filter: ≤12 Vorkommen
        ↓
    Zu mappende Objekte (40.276)
        ↓
    Mapping-Prozess
    ↓                    ↓
Referenz:          Ziel-Vokabular:
WMW_ObjectName_    WMW_Objektname_
gruppiert...       Thesaurus
(1.745)            (3.157)
        ↓                ↓
    Validierung & Zuordnung
        ↓
    Output: Erweiterte Excel mit Thesaurus-Zuordnung
```

---

## Datenqualität

### Konsistenz

**Häufigkeits-Datei:**
- ✅ Vollständig: alle Objektnamen erfasst
- ✅ Strukturiert: 2 Spalten, konsistent
- ⚠️ Heterogen: verschiedenste Namensformen

**Gruppierte Datei:**
- ✅ Händisch geprüft: hohe Qualität
- ✅ Training-Data: repräsentativ
- ⚠️ Unvollständig: nur 63,8% mit Bereinigung

**Thesaurus:**
- ✅ Hierarchisch strukturiert: klare Logik
- ✅ TMS-kompatibel: IDs vorhanden
- ⚠️ AAT-IDs fehlen: nur 14 von 3.157

### Herausforderungen

**1. Heterogenität der Objektnamen:**
- Länge: 3-100+ Zeichen
- Sprache: Deutsch, teilweise kulturspezifische Begriffe
- Schreibweise: inkonsistent, mit/ohne Artikel
- Struktur: von einfach bis komplex-beschreibend

**2. Thesaurus-Lücken:**
- Neue/spezielle Objekte nicht erfasst
- Kulturspezifische Begriffe fehlen
- Moderne Begriffe (z.B. "Insektensnack")

**3. Mapping-Komplexität:**
- 12,8 Objekte pro Thesaurus-Begriff im Durchschnitt
- Viele 1:1, aber auch 1:viele Beziehungen
- Subjektive Interpretation bei manchen Objekten

---

## Dateiformate

### Akzeptiert

- ✅ Excel 2007+ (.xlsx)
- ✅ Excel 97-2003 (.xls)
- ✅ CSV (.csv) mit UTF-8 Encoding

### Anforderungen

**Encoding:** UTF-8 (für Umlaute und Sonderzeichen)
**Trennzeichen (CSV):** Komma oder Semikolon
**Header-Zeile:** Erforderlich
**Leere Zeilen:** Werden ignoriert

---

## Beispiel-Datensätze für Testing

### Einfache Fälle (hohe Erfolgswahrscheinlichkeit)

```
ObjectName          → Erwarteter Thesaurus-Begriff
Gürtel              → Gürtel
Schachtel           → Schachtel
Korb                → Korb
Beil                → Beil
```

### Mittlere Komplexität

```
ObjectName                    → Erwarteter Thesaurus-Begriff
Schamanengürtel               → Gürtel
Steinbeil                     → Beil
Kupfergefäß                   → Gefäß
Körbchen                      → Korb
```

### Hohe Komplexität

```
ObjectName                                           → Erwarteter Thesaurus-Begriff
Schachtel mit Vögeln und rauchenden Indianern        → Schachtel
Beinmanschetten für Bräutigamshosen                  → Hochzeitskostüm-Bräutigam
Samen des Tabakumba Baumes bei Infektionen im...    → Medizin
```

### Nicht zuordenbar

```
ObjectName                                → Status
Insektensnack                             → MUSS_BEARBEITET_WERDEN
Belugasehnen                              → MUSS_BEARBEITET_WERDEN
Beinknöchel zum Würfeln in Fischhautsack  → MUSS_BEARBEITET_WERDEN
```

### Nicht-Objektnamen

```
ObjectName                              → Status
Als Imitation ausgeschieden             → IGNORIERT
Getauscht gegen Post 4 aus 1928         → IGNORIERT
```