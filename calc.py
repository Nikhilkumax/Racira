def calc_amortization(loan, hv, rate, term_years):
    r = rate / 100 / 12
    n = term_years * 12
    pmt = loan * (r * (1 + r)**n) / ((1 + r)**n - 1)
    
    balance = loan
    schedule = []
    for m in range(n + 1):
        schedule.append({
            "month": m,
            "balance": balance,
            "ltv": balance / hv * 100
        })
        if m < n:
            interest = balance * r
            principal = pmt - interest
            balance -= principal
            
    return schedule, pmt

sch_no_app, pmt = calc_amortization(320000, 400000, 6.5, 30)

print(f"Monthly PI: {pmt}")
for m in [1, 12, 60, 120, 122, 180, 360]:
    print(f"LTV at month {m}: {sch_no_app[m]['ltv']:.4f}%")

m_80 = next(s["month"] for s in sch_no_app if s["ltv"] <= 80.0)
m_78 = next(s["month"] for s in sch_no_app if s["ltv"] <= 78.0)

print(f"\nMonth crossing 80%: {m_80}")
print(f"Month crossing 78%: {m_78}")
print(f"Midpoint: {360/2}")

# Scenario 2: Appreciation to 440k
sch_app, _ = calc_amortization(320000, 440000, 6.5, 30)
m_80_app = next(s["month"] for s in sch_app if s["ltv"] <= 80.0)
print(f"\nAppreciation 80% Month: {m_80_app}")
