import pandas as pd
import sys

# Set UTF-8 encoding for output
sys.stdout.reconfigure(encoding='utf-8')

# Load all three files
df1 = pd.read_excel('data/WMW_Object_Names_Haeufigkeit.xlsx')
df2 = pd.read_excel('data/WMW_ObjectName_gruppiert_bis_incl_13x.xlsx')
df3 = pd.read_excel('data/WMW_Objektname_Thesaurus.xlsx')

print("=" * 100)
print("EXTRACTING DIVERSE EXAMPLES FOR DOCUMENTATION")
print("=" * 100)

# Get 30 diverse object name examples
print("\n\n### TABLE 1: DIVERSE OBJECT NAME EXAMPLES (30) ###\n")
print(f"{'#':<4} {'Object Name':<40} {'Category':<25} {'Frequency':<10}")
print("-" * 100)

examples = []

# Top frequent items (5)
for idx, row in df1.head(5).iterrows():
    examples.append((row['ObjectName'], 'High frequency', row['AnzahlvonObjectName']))

# Cultural specific (5)
cultural = df1[df1['ObjectName'].str.contains('Mao|Chinesisch|Japanisch|Afrikanisch|Kris|Kalebasse', case=False, na=False)].head(5)
for idx, row in cultural.iterrows():
    examples.append((row['ObjectName'], 'Cultural-specific', row['AnzahlvonObjectName']))

# Material+Object (5)
material = df1[df1['ObjectName'].str.contains('holz|metall|stein|ton|bronze|gold|silber|eisen', case=False, na=False)].head(5)
for idx, row in material.iterrows():
    examples.append((row['ObjectName'], 'Material+Object', row['AnzahlvonObjectName']))

# Diminutives (5)
diminutives = df1[df1['ObjectName'].str.contains('chen$', case=False, na=False)].head(5)
for idx, row in diminutives.iterrows():
    examples.append((row['ObjectName'], 'Diminutive', row['AnzahlvonObjectName']))

# Compound names (5)
compounds = df1[df1['ObjectName'].str.contains('-', na=False)].head(5)
for idx, row in compounds.iterrows():
    examples.append((row['ObjectName'], 'Compound', row['AnzahlvonObjectName']))

# Long descriptive (5)
long_names = df1[df1['ObjectName'].str.len() > 25].head(5)
for idx, row in long_names.iterrows():
    examples.append((row['ObjectName'], 'Long descriptive', row['AnzahlvonObjectName']))

for i, (name, category, freq) in enumerate(examples[:30], 1):
    print(f"{i:<4} {name:<40} {category:<25} {freq:<10}")

# Get mapping examples
print("\n\n### TABLE 2: REFERENCE MAPPING EXAMPLES (15) ###\n")
print(f"{'#':<4} {'Original Name':<40} {'Mapped To':<30} {'Frequency':<10}")
print("-" * 100)

mappings = []
for idx, row in df2.iterrows():
    if pd.notna(row['Begriff bereinigt']) and row['Begriff bereinigt'] != '*':
        mappings.append((row['ObjectName'], row['Begriff bereinigt'], row['AnzahlvonObjectName']))

for i, (original, mapped, freq) in enumerate(mappings[:15], 1):
    print(f"{i:<4} {original:<40} {mapped:<30} {freq:<10}")

# Get thesaurus hierarchy examples
print("\n\n### TABLE 3: THESAURUS HIERARCHY EXAMPLES (15) ###\n")
print(f"{'#':<4} {'CN Code':<45} {'Term':<35} {'Level':<10}")
print("-" * 100)

# Select diverse hierarchy examples from different categories
hierarchy_examples = []

# Clothing category
clothing = df3[df3['CN'].str.contains('AUT.AAA.AAC.AAH.ADL.AAB.AAB', na=False)].head(5)
for idx, row in clothing.iterrows():
    level = len(row['CN'].split('.'))
    hierarchy_examples.append((row['CN'], row['term'], level))

# Weapons category
weapons = df3[df3['CN'].str.contains('AUT.AAA.AAC.AAH.ADL.AAB.AAD', na=False)].head(5)
for idx, row in weapons.iterrows():
    level = len(row['CN'].split('.'))
    hierarchy_examples.append((row['CN'], row['term'], level))

# Jewelry category
jewelry = df3[df3['CN'].str.contains('AUT.AAA.AAC.AAH.ADL.AAB.AAC', na=False)].head(5)
for idx, row in jewelry.iterrows():
    level = len(row['CN'].split('.'))
    hierarchy_examples.append((row['CN'], row['term'], level))

for i, (cn, term, level) in enumerate(hierarchy_examples[:15], 1):
    print(f"{i:<4} {cn:<45} {term:<35} {level:<10}")

# Additional statistics
print("\n\n### ADDITIONAL STATISTICS ###\n")

# Most common starting letters
print("Top 10 starting letters:")
starting_letters = df1['ObjectName'].str[0].value_counts().head(10)
for letter, count in starting_letters.items():
    print(f"  {letter}: {count} names")

# Frequency distribution
print("\n\nFrequency distribution:")
freq_ranges = [
    (1, 1, "Exactly 1"),
    (2, 9, "2-9"),
    (10, 99, "10-99"),
    (100, 999, "100-999"),
    (1000, 9999, "1000+")
]

for min_freq, max_freq, label in freq_ranges:
    count = len(df1[(df1['AnzahlvonObjectName'] >= min_freq) & (df1['AnzahlvonObjectName'] <= max_freq)])
    print(f"  {label}: {count} object types")

# Mapping types
print("\n\nMapping types in FILE 2:")
total_with_mapping = len(df2[df2['Begriff bereinigt'].notna()])
excluded = len(df2[df2['Begriff bereinigt'] == '*'])
consolidated = total_with_mapping - excluded
no_mapping = len(df2[df2['Begriff bereinigt'].isna()])

print(f"  Consolidated to standard terms: {consolidated}")
print(f"  Excluded from collection: {excluded}")
print(f"  No mapping needed: {no_mapping}")

# Hierarchy depth analysis
print("\n\nThesaurus hierarchy depth:")
df3['depth'] = df3['CN'].str.count(r'\.')
depth_counts = df3['depth'].value_counts().sort_index()
for depth, count in depth_counts.items():
    print(f"  Depth {depth}: {count} terms")

print("\n" + "=" * 100)
print("Extraction complete!")
print("=" * 100)

# Export to CSV for easy import into documentation
df_examples = pd.DataFrame(examples[:30], columns=['ObjectName', 'Category', 'Frequency'])
df_examples.to_csv('data/object_name_examples.csv', index=False, encoding='utf-8')

df_mappings = pd.DataFrame(mappings[:15], columns=['Original', 'MappedTo', 'Frequency'])
df_mappings.to_csv('data/mapping_examples.csv', index=False, encoding='utf-8')

df_hierarchy = pd.DataFrame(hierarchy_examples[:15], columns=['CN_Code', 'Term', 'Level'])
df_hierarchy.to_csv('data/thesaurus_examples.csv', index=False, encoding='utf-8')

print("\n\nCSV files exported:")
print("  - data/object_name_examples.csv")
print("  - data/mapping_examples.csv")
print("  - data/thesaurus_examples.csv")
