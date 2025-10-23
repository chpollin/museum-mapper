import pandas as pd
import re
from collections import defaultdict

# Load all three files
df1 = pd.read_excel('data/WMW_Object_Names_Haeufigkeit.xlsx')
df2 = pd.read_excel('data/WMW_ObjectName_gruppiert_bis_incl_13x.xlsx')
df3 = pd.read_excel('data/WMW_Objektname_Thesaurus.xlsx')

print("=" * 100)
print("COMPREHENSIVE DATA ANALYSIS - MUSEUM MAPPER PROJECT")
print("=" * 100)

# ========================================
# FILE 1: Object Names with Frequency
# ========================================
print("\n\n### FILE 1: WMW_Object_Names_Haeufigkeit.xlsx ###")
print(f"Total unique object names: {len(df1)}")
print(f"Total object count (sum of frequencies): {df1['AnzahlvonObjectName'].sum()}")
print(f"Average frequency: {df1['AnzahlvonObjectName'].mean():.2f}")
print(f"Median frequency: {df1['AnzahlvonObjectName'].median():.2f}")

# Categorize all names in the dataset
categories = {
    'simple': [],
    'diminutives': [],
    'compounds': [],
    'material_object': [],
    'descriptive': [],
    'long_names': [],
    'cultural_specific': []
}

for idx, row in df1.head(100).iterrows():
    name = str(row['ObjectName'])
    freq = row['AnzahlvonObjectName']

    # Diminutives (German diminutive suffixes)
    if re.search(r'(chen|lein|erl)$', name, re.IGNORECASE):
        categories['diminutives'].append((name, freq))

    # Compounds (hyphenated or with "und")
    elif '-' in name or ' und ' in name or '+' in name:
        categories['compounds'].append((name, freq))

    # Material + Object
    elif any(mat in name.lower() for mat in ['holz', 'metall', 'glas', 'keramik', 'ton', 'eisen', 'blech', 'stein', 'bronze', 'silber', 'gold']):
        categories['material_object'].append((name, freq))

    # Cultural specific
    elif any(cult in name.lower() for cult in ['mao', 'chinesisch', 'japanisch', 'indisch', 'afrikanisch', 'kris', 'kalebasse']):
        categories['cultural_specific'].append((name, freq))

    # Long descriptive names
    elif len(name) > 25:
        categories['long_names'].append((name, freq))

    # Descriptive (multiple words)
    elif len(name.split()) > 1 and len(name.split()) <= 3:
        categories['descriptive'].append((name, freq))

    # Simple single-word names
    elif len(name.split()) == 1 and len(name) <= 15:
        categories['simple'].append((name, freq))

print("\n\n### OBJECT NAME CATEGORIES (from top 100) ###\n")

print("1. SIMPLE NAMES (single word, short):")
for name, freq in categories['simple'][:15]:
    print(f"   - {name:<30} (frequency: {freq:>5})")

print("\n2. DIMINUTIVES (German diminutive forms):")
for name, freq in categories['diminutives'][:15]:
    print(f"   - {name:<30} (frequency: {freq:>5})")

print("\n3. COMPOUND NAMES (hyphenated or combined):")
for name, freq in categories['compounds'][:15]:
    print(f"   - {name:<30} (frequency: {freq:>5})")

print("\n4. MATERIAL+OBJECT COMBINATIONS:")
for name, freq in categories['material_object'][:15]:
    print(f"   - {name:<30} (frequency: {freq:>5})")

print("\n5. DESCRIPTIVE NAMES (multi-word):")
for name, freq in categories['descriptive'][:15]:
    print(f"   - {name:<30} (frequency: {freq:>5})")

print("\n6. CULTURAL-SPECIFIC NAMES:")
for name, freq in categories['cultural_specific'][:15]:
    print(f"   - {name:<30} (frequency: {freq:>5})")

print("\n7. LONG DESCRIPTIVE NAMES:")
for name, freq in categories['long_names'][:15]:
    print(f"   - {name:<30} (frequency: {freq:>5})")

# Top 25 most frequent objects
print("\n\n### TOP 25 MOST FREQUENT OBJECT NAMES ###")
for idx, row in df1.head(25).iterrows():
    print(f"{idx+1:>2}. {row['ObjectName']:<35} {row['AnzahlvonObjectName']:>6} occurrences")

# ========================================
# FILE 2: Grouped/Cleaned Mappings
# ========================================
print("\n\n" + "=" * 100)
print("### FILE 2: WMW_ObjectName_gruppiert_bis_incl_13x.xlsx ###")
print(f"Total rows: {len(df2)}")

# Extract mapping examples
print("\n\n### CLEANING MAPPINGS (Before -> After) ###")
mappings_with_cleanup = []
mappings_excluded = []

for idx, row in df2.iterrows():
    original = row['ObjectName']
    cleaned = row['Begriff bereinigt']
    freq = row['AnzahlvonObjectName']

    if pd.notna(cleaned):
        if cleaned == '*':
            mappings_excluded.append((original, freq))
        else:
            mappings_with_cleanup.append((original, cleaned, freq))

print("\n1. CONSOLIDATED MAPPINGS (variants mapped to standard terms):")
for original, cleaned, freq in mappings_with_cleanup[:20]:
    print(f"   {original:<35} -> {cleaned:<25} (freq: {freq})")

print("\n2. EXCLUDED ITEMS (marked with *):")
for original, freq in mappings_excluded[:10]:
    print(f"   {original:<35} EXCLUDED (freq: {freq})")

# Objects with no cleanup needed
no_cleanup = df2[df2['Begriff bereinigt'].isna()].head(20)
print("\n3. OBJECTS REQUIRING NO CLEANUP (kept as-is):")
for idx, row in no_cleanup.iterrows():
    print(f"   {row['ObjectName']:<35} (freq: {row['AnzahlvonObjectName']})")

# ========================================
# FILE 3: Thesaurus with CN Codes
# ========================================
print("\n\n" + "=" * 100)
print("### FILE 3: WMW_Objektname_Thesaurus.xlsx ###")
print(f"Total thesaurus entries: {len(df3)}")

# Analyze CN code hierarchy
cn_levels = defaultdict(list)
for idx, row in df3.iterrows():
    cn = str(row['CN'])
    level = len(cn.split('.'))
    cn_levels[level].append((cn, row['term'], row['TermID']))

print(f"\nHierarchy depth distribution:")
for level in sorted(cn_levels.keys()):
    print(f"  Level {level}: {len(cn_levels[level])} entries")

print("\n\n### THESAURUS HIERARCHY EXAMPLES ###")

# Example 1: Clothing hierarchy
print("\n1. CLOTHING HIERARCHY (Bekleidung):")
clothing_entries = df3[df3['CN'].str.contains('AUT.AAA.AAC.AAH.ADL.AAB.AAB', na=False)].head(25)
for idx, row in clothing_entries.iterrows():
    level = len(row['CN'].split('.')) - 6  # Base level offset
    indent = "  " * level
    print(f"{indent}{row['CN']:<45} {row['term']:<30} (ID: {row['TermID']})")

# Example 2: Find another major category
print("\n2. SEARCHING FOR WEAPONS CATEGORY:")
weapons = df3[df3['term'].str.contains('Waffe|Schwert|Dolch|Messer', case=False, na=False)].head(20)
for idx, row in weapons.iterrows():
    print(f"  {row['CN']:<45} {row['term']:<30} (ID: {row['TermID']})")

# Example 3: Show parent-child relationships
print("\n3. PARENT-CHILD RELATIONSHIPS (showing hierarchical structure):")
base_cn = "AUT.AAA.AAC.AAH.ADL.AAB.AAB.AAL"  # Kopfbedeckung (headwear)
headwear = df3[df3['CN'].str.startswith(base_cn, na=False)].head(15)
for idx, row in headwear.iterrows():
    depth = row['CN'].count('.') - base_cn.count('.')
    indent = "  " * depth
    symbol = "└─" if depth > 0 else "▪"
    print(f"{indent}{symbol} {row['term']:<30} (CN: {row['CN']}, ID: {row['TermID']})")

# ========================================
# STATISTICS SUMMARY
# ========================================
print("\n\n" + "=" * 100)
print("### COMPREHENSIVE STATISTICS ###")
print("=" * 100)

print(f"""
FILE 1 - Object Names with Frequency:
  - Total unique object names: {len(df1):,}
  - Total objects in collection: {df1['AnzahlvonObjectName'].sum():,}
  - Most frequent object: {df1.iloc[0]['ObjectName']} ({df1.iloc[0]['AnzahlvonObjectName']:,} instances)
  - Objects appearing once: {len(df1[df1['AnzahlvonObjectName'] == 1]):,}
  - Objects appearing 10+ times: {len(df1[df1['AnzahlvonObjectName'] >= 10]):,}
  - Objects appearing 100+ times: {len(df1[df1['AnzahlvonObjectName'] >= 100]):,}

FILE 2 - Cleaned Mappings:
  - Total object types processed: {len(df2):,}
  - Objects requiring consolidation: {len(mappings_with_cleanup):,}
  - Objects excluded from collection: {len(mappings_excluded):,}
  - Objects needing no cleanup: {len(df2[df2['Begriff bereinigt'].isna()]):,}

FILE 3 - Thesaurus Structure:
  - Total thesaurus terms: {len(df3):,}
  - Hierarchy levels: {len(cn_levels)}
  - Average depth: {sum(len(row['CN'].split('.')) for _, row in df3.iterrows()) / len(df3):.1f}
  - Unique TermMasterIDs: {df3['TermMasterID'].nunique():,}
  - Terms with AAT mappings: {df3['AAT_ID'].notna().sum():,}
""")

# Pattern analysis
print("\n### NAMING PATTERNS DETECTED ###")
patterns = {
    'With hyphen': len(df1[df1['ObjectName'].str.contains('-', na=False)]),
    'With comma': len(df1[df1['ObjectName'].str.contains(',', na=False)]),
    'Multiple words': len(df1[df1['ObjectName'].str.contains(' ', na=False)]),
    'Single word': len(df1[~df1['ObjectName'].str.contains(' ', na=False)]),
    'Contains numbers': len(df1[df1['ObjectName'].str.contains(r'\d', na=False)]),
    'Starts with capital': len(df1[df1['ObjectName'].str.match(r'^[A-ZÄÖÜ]', na=False)]),
}

for pattern, count in patterns.items():
    percentage = (count / len(df1)) * 100
    print(f"  {pattern:<25}: {count:>6} ({percentage:>5.1f}%)")

print("\n" + "=" * 100)
print("Analysis complete!")
print("=" * 100)
