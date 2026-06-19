import re

new_content = """<h2>Advanced Features</h2>
            <p>This calculator includes several advanced features designed for precision modeling. For instance, the Loan Start Date selector allows you to synchronize the amortization math with your exact mortgage anniversary, ensuring the projected month-by-month timeline perfectly matches your servicer's schedule. You can also specify an exact Manual PMI Rate if you already know your premium from your Closing Disclosure, ensuring down-to-the-penny accuracy on your total lifetime PMI cost.</p>
            <p>Another powerful feature is the Expected Annual Appreciation input. Rather than assuming your home's value remains static, you can model how rising local property values can aggressively pull forward your eligibility date for borrower-requested cancellation. The calculator dynamically applies this growth rate to calculate your true current LTV month over month.</p>
            <p>Finally, the Extra Monthly Principal tool demonstrates the compounding power of overpayments. By inputting an extra monthly payment, the calculator instantly recalculates your amortization curve, showing you exactly how many months early you will cross the 80% and 78% thresholds and exactly how many dollars you will save in avoided PMI premiums.</p>"""

with open("src/calculators/PmiRemovalDateCalculator.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Replace the specific section
# We'll find <h2>Advanced Features</h2> and replace until <h2>Practical Examples</h2>
start_marker = "<h2>Advanced Features</h2>"
end_marker = "<h2>Practical Examples</h2>"

start_idx = text.find(start_marker)
end_idx = text.find(end_marker)

if start_idx != -1 and end_idx != -1:
    text = text[:start_idx] + new_content + "\n            " + text[end_idx:]
    with open("src/calculators/PmiRemovalDateCalculator.tsx", "w", encoding="utf-8") as f:
        f.write(text)
    print("Successfully replaced.")
else:
    print("Could not find markers.")
