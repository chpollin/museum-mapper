import pandas as pd
import json
from collections import Counter

# File 1: WMW_Object_Names_Haeufigkeit.xlsx
print("=" * 80)
print("FILE 1: WMW_Object_Names_Haeufigkeit.xlsx")
print("=" * 80)

df1 = pd.read_excel('data/WMW_Object_Names_Haeufigkeit.xlsx')
print(f"\nTotal rows: {len(df1)}")
print(f"Columns: {list(df1.columns)}")
print("\nFirst 50 rows:")
print(df1.head(50).to_string())

print("\n\nFull dataset statistics:")
print(df1.describe())

# Analyze patterns in first 50 rows
first_50 = df1.head(50)

print("\n\n--- CATEGORIZING OBJECT NAMES ---\n")

# Try to categorize names
simple_names = []
diminutives = []
material_object = []
long_descriptive = []

for idx, row in first_50.iterrows():
    name = str(row[df1.columns[0]])  # First column should be the name
    length = len(name)

    # Categorize
    if any(dim in name.lower() for dim in ['chen', 'lein', 'erl', 'l', 'li']):
        diminutives.append((name, row[df1.columns[1]] if len(df1.columns) > 1 else 'N/A'))
    elif ',' in name or '+' in name or 'aus' in name.lower() or any(mat in name.lower() for mat in ['holz', 'metall', 'glas', 'keramik', 'ton', 'eisen', 'blech', 'stein']):
        material_object.append((name, row[df1.columns[1]] if len(df1.columns) > 1 else 'N/A'))
    elif length > 30 or len(name.split()) > 3:
        long_descriptive.append((name, row[df1.columns[1]] if len(df1.columns) > 1 else 'N/A'))
    elif length < 20 and len(name.split()) <= 2:
        simple_names.append((name, row[df1.columns[1]] if len(df1.columns) > 1 else 'N/A'))

print("SIMPLE NAMES:")
for name, freq in simple_names[:10]:
    print(f"  {name} (freq: {freq})")

print("\nDIMINUTIVES:")
for name, freq in diminutives[:10]:
    print(f"  {name} (freq: {freq})")

print("\nMATERIAL+OBJECT COMBINATIONS:")
for name, freq in material_object[:10]:
    print(f"  {name} (freq: {freq})")

print("\nLONG DESCRIPTIVE NAMES:")
for name, freq in long_descriptive[:10]:
    print(f"  {name} (freq: {freq})")

print("\n" + "=" * 80)
print("FILE 2: WMW_ObjectName_gruppiert_bis_incl_13x.xlsx")
print("=" * 80)

df2 = pd.read_excel('data/WMW_ObjectName_gruppiert_bis_incl_13x.xlsx')
print(f"\nTotal rows: {len(df2)}")
print(f"Columns: {list(df2.columns)}")
print("\nFirst 30 rows:")
print(df2.head(30).to_string())

print("\n\nBEFORE/AFTER MAPPING EXAMPLES:")
if len(df2.columns) >= 2:
    for idx, row in df2.head(20).iterrows():
        before = row[df2.columns[0]]
        after = row[df2.columns[1]]
        print(f"  {before} -> {after}")

print("\n" + "=" * 80)
print("FILE 3: WMW_Objektname_Thesaurus.xlsx")
print("=" * 80)

df3 = pd.read_excel('data/WMW_Objektname_Thesaurus.xlsx')
print(f"\nTotal rows: {len(df3)}")
print(f"Columns: {list(df3.columns)}")
print("\nFirst 30 rows:")
print(df3.head(30).to_string())

print("\n\nTHESAURUS STRUCTURE EXAMPLES:")
print("(showing hierarchy and CN-Code relationships)")
for idx, row in df3.head(30).iterrows():
    print(f"Row {idx}:")
    for col in df3.columns:
        if pd.notna(row[col]):
            print(f"  {col}: {row[col]}")
    print()

# Export samples to JSON for documentation
output = {
    "file1_summary": {
        "total_rows": len(df1),
        "columns": list(df1.columns),
        "first_50_samples": df1.head(50).to_dict('records')
    },
    "file2_summary": {
        "total_rows": len(df2),
        "columns": list(df2.columns),
        "first_30_samples": df2.head(30).to_dict('records')
    },
    "file3_summary": {
        "total_rows": len(df3),
        "columns": list(df3.columns),
        "first_30_samples": df3.head(30).to_dict('records')
    }
}

with open('data/excel_analysis.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False, default=str)

print("\n" + "=" * 80)
print("Analysis complete! Data exported to data/excel_analysis.json")
print("=" * 80)
