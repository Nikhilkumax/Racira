import re, os
lc = {}
for line in open('_scripts/_calcverify/lc.txt', encoding='utf-8'):
    m = re.match(r'"([^"]+)": \(\) => import\("@/domains/calculator/components/([^"]+)"\)', line.strip())
    if m: lc[m.group(1)] = m.group(2) + ".tsx"
print("registered slugs in lazyComponents:", len(lc))
comp_dir = 'src/domains/calculator/components'
missing = [s for s,c in lc.items() if not os.path.exists(os.path.join(comp_dir,c))]
print("registered slugs whose component file is MISSING:", len(missing), missing[:5])
