import re

with open("src/calculators/PmiRemovalDateCalculator.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Original string: "typically in just over three years."
# Replace with: "in exactly 44 months (under four years)."
old_str = "faster—typically in just over three years."
new_str = "faster—in exactly 44 months (under four years)."

if old_str in text:
    text = text.replace(old_str, new_str)
    with open("src/calculators/PmiRemovalDateCalculator.tsx", "w", encoding="utf-8") as f:
        f.write(text)
    print("Successfully replaced.")
else:
    print("Could not find string to replace.")
