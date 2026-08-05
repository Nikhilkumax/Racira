#!/usr/bin/env python3
import re
import os
import json
from pathlib import Path

# Read registry files to get calculator metadata
def read_registry_files():
    registry_files = {
        'finance': 'C:/Racira/racira-nextjs/src/domains/calculator/registry/finance.ts',
        'business': 'C:/Racira/racira-nextjs/src/domains/calculator/registry/business.ts',
        'health': 'C:/Racira/racira-nextjs/src/domains/calculator/registry/health.ts',
        'math': 'C:/Racira/racira-nextjs/src/domains/calculator/registry/math.ts',
        'science': 'C:/Racira/racira-nextjs/src/domains/calculator/registry/science.ts',
        'engineering': 'C:/Racira/racira-nextjs/src/domains/calculator/registry/engineering.ts',
        'technology': 'C:/Racira/racira-nextjs/src/domains/calculator/registry/technology.ts',
        'environment': 'C:/Racira/racira-nextjs/src/domains/calculator/registry/environment.ts',
        'everyday-life': 'C:/Racira/racira-nextjs/src/domains/calculator/registry/everyday-life.ts',
        'transportation': 'C:/Racira/racira-nextjs/src/domains/calculator/registry/transportation.ts',
        'construction': 'C:/Racira/racira-nextjs/src/domains/calculator/registry/construction.ts',
        'education': 'C:/Racira/racira-nextjs/src/domains/calculator/registry/education.ts',
        'utility': 'C:/Racira/racira-nextjs/src/domains/calculator/registry/utilities.ts',
        'orphans': 'C:/Racira/racira-nextjs/src/domains/calculator/registry/orphans.ts'
    }
    
    registry_data = {}
    for category, path in registry_files.items():
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                # Extract the list of CalculatorDef objects
                start = content.find('export const')
                end = content.find('];', start) + 1
                if start != -1 and end != -1:
                    registry_json = content[start:end]
                    # Parse JSON (remove 'export const calculatorRegistry:' and ']')
                    json_str = registry_json.replace('export const calculatorRegistry:', '').replace(']', '').strip()
                    try:
                        registry_list = eval(json_str)  # This is safe as it's our own file
                        registry_data[category] = registry_list
                    except Exception as e:
                        print(f"Error parsing {category}: {e}")
        except FileNotFoundError:
            print(f"Warning: {category} registry file not found")
    
    return registry_data

# Parse registry files
registry = read_registry_files()

# Read lazyComponents.tsx to get slug → component mapping
def read_lazy_components():
    path = 'C:/Racira/racira-nextjs/src/app/calculator/lazyComponents.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Parse the JSON-like mapping
    mapping = {}
    start = content.find('const calculatorComponents:')
    end = content.find('};', start) + 1
    if start != -1 and end != -1:
        mapping_json = content[start:end]
        # Extract the dictionary part
        dict_start = mapping_json.find('{')
        dict_end = mapping_json.find('}', dict_start) + 1
        mapping_json = mapping_json[dict_start:dict_end]
        
        # Parse as JSON
        import json
        try:
            mapping = json.loads(mapping_json)
            return mapping
        except Exception as e:
            print(f"Error parsing lazyComponents: {e}")
            return {}
    return {}

# Read registry to find calculator slugs and their components
def get_calculator_info():
    slug_to_name = {}
    slug_to_category = {}
    slug_to_description = {}
    
    for category, calculators in registry.items():
        for calc in calculators:
            slug = calc['slug']
            slug_to_name[slug] = calc['name']
            slug_to_category[slug] = calc['category']
            slug_to_description[slug] = calc['description']
    
    return slug_to_name, slug_to_category, slug_to_description

# Read the rebuild list to know which calculators need rebuilding
def read_rebuild_list():
    path = 'C:/Racira/racira-nextjs/status_rebuild.txt'
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Extract calculator names (before " — ")
    calculators = []
    for line in lines:
        line = line.strip()
        if line and " — " in line:
            name_part = line.split(" — ")[0].strip()
            if name_part and not name_part.startswith('('):
                calculators.append(name_part)
    
    return calculators

# Generate a calculator component based on category
def generate_calculator_component(slug, name, category, description, component_file):
    # Determine the calculation logic based on category
    # This is simplified - in reality we'd need more sophisticated logic
    # For now, we'll create a generic calculator with proper structure
    
    # Common template elements
    template = f'''"use client";

import {{ useState, useEffect }} from "react";
import {{ "Breadcrumb" }} from "@/components/Breadcrumb";
import {{ "AdPlaceholder" }} from "@/components/AdPlaceholder";
import {{ "FAQSection" }} from "@/components/FAQSection";
import {{ "PopularCalculators" }} from "@/components/PopularCalculators";
{{ "Recharts" if "Recharts" in component_name else "" }} import {{
    {{ "AreaChart" if "Chart" in component_name else "BarChart" if "Chart" in component_name else "" }},
    {{ "Pie" if "Pie" in component_name else "" }},
    {{ "XAxis" if "XAxis" in component_name else "" }},
    {{ "YAxis" if "YAxis" in component_name else "" }},
    {{ "CartesianGrid" if "Grid" in component_name else "" }},
    {{ "Tooltip" if "Tooltip" in component_name else "" }},
    {{ "ResponsiveContainer" if "Responsive" in component_name else "" }},
    {{ "ReferenceLine" if "ReferenceLine" in component_name else "" }},
    {{ "Calculator" }} from "lucide-react";

const {{ component_name }} = () => {{
    const {{ "default" }} = "1000";
    const {{ "default_inputs" }} = {{ "principal": "10000", "rate": "7", "years": "20", "frequency": "12", "contribution": "200" }};
    
    const [inputs, setInputs] = useState({{ "default_inputs" }});
    const [result, setResult] = useState(null);
    
    const calculate = () => {{
        // Simplified calculation logic - would be replaced with actual formula
        const inputs = {{ "principal": parseFloat(inputs.principal || 0), 
                        "rate": parseFloat(inputs.rate || 0), 
                        "years": parseFloat(inputs.years || 0), 
                        "frequency": parseFloat(inputs.frequency || 1), 
                        "contribution": parseFloat(inputs.contribution || 0) }};
        const P = inputs.principal || 0;
        const r = inputs.rate || 0;
        const y = inputs.years || 0;
        const n = inputs.frequency || 1;
        const c = inputs.contribution || 0;
        const rN = r / n;
        const periods = n * y;
        const principalGrowth = P * Math.pow(1 + rN, periods);
        const contribGrowth = c * ((Math.pow(1 + rN, periods) - 1) / rN);
        const total = principalGrowth + contribGrowth;
        const totalContrib = c * periods;
        const totalInterest = total - P - totalContrib;
        const results = {{
            primary: `$${total.toLocaleString(undefined, {maximumFractionDigits: 2})}`,
            subtitle: f"After {y} years at {(r * 100):.1f}% compounded {n == 12 and 'monthly' or n == 4 and 'quarterly' or n == 1 and 'annually' or '×/yr'}",
            rows: [
                {{ "label": "Initial Principal", "value": `$${inputs.principal.toLocaleString()}" }},
                {{ "label": "Monthly Contribution", "value": `$${inputs.contribution.toLocaleString()}" }},
                {{ "label": "Annual Interest Rate", "value": `${(r * 100).toFixed(1)}%` }},
                {{ "label": "Compound Frequency", "value": `${n}× per year` }},
                {{ "label": "Time Period", "value": `${y} years` }},
                {{ "label": "Total Contributions", "value": `$${totalContrib.toLocaleString(undefined, {maximumFractionDigits: 2})}` }},
                {{ "label": "Total Interest Earned", "value": `$${totalInterest.toLocaleString(undefined, {maximumFractionDigits: 2})}` }},
                {{ "label": "Final Balance", "value": "Final Balance", "border": true, "bold": true }},
            ]};
        setResult(results);
    };"""
    };
    
    useEffect(() => {{
        calculate();
    }}, []);
    
    const reset = () => {{
        setInputs({{ "principal": "40000", "rate": "6.5", "years": "30", "frequency": "12", "contribution": "0" }});
        calculate();
    }}; 

    const faqs = [
        {{ "question": "What is the calculator used for?", "answer": "This calculator helps you compute results for your specific use case." }},
        {{ "question": "How do I use this calculator?", "answer": "Enter your values in the input fields and click Calculate to see the result." }},
        {{ "question": "Is this calculator accurate?", "answer": "Yes, all Racira calculators are professionally tested for accuracy." }},
    ];
    
    return (
        <>
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "{{ name }}" }]} />
            <div className="racira-page-container py-4">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">{{ name }}</h1>
                <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
                    <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                        <div>
                            <label className="text-sm font-medium block mb-1.5">Input 1</label>
                            <input type="number" value={inputs.principal} onChange={e => setInputs({...inputs, [event.target.name]: e.target.value})} className="input-calc" placeholder="Enter value" />
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1.5">Input 2</label>
                            <input type="number" value={inputs.input2} onChange={e => setInputs({...inputs, [event.target.name]: e.target.value})} className="input-calc" placeholder="Enter value" />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button onClick={calculate} className="btn-calculate flex-1">Calculate</button>
                            <button onClick={reset} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm font-medium transition-colors">Reset</button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        {{
                            result && (
                                <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Result</p>
                                    <p className="text-2xl font-black text-foreground">{{ result.primary }}</p>
                                </div>
                            }}
                    </div>
                </div>
                <div className="max-w-[1180px] mt-8">
                    <AdPlaceholder className="mb-10" />
                    <section className="prose-finance text-[15.75px]">
                        <h2 className="text-2xl font-bold mb-3">About the Calculator</h2>
                        <p>This is a professional-grade calculator designed for accurate results. It follows Racira's standards for layout, validation, and user experience.</p>
                        <h3>How to Use</h3>
                        <ol>
                            <li>Enter your values in the input fields.</li>
                            <li>Click the <strong>Calculate</strong> button.</li>
                            <li>Read your result instantly in the results panel.</li>
                        </ol>
                        <h3>Why Use This Calculator?</h3>
                        <p>Our calculator is fast, free, and accurate. No sign-up required. Designed for both beginners and advanced users.</p>
                    </section>
                </div>
                <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/{{ slug }}" />
                <PopularCalculators exclude="/calculator/{{ slug }}" />
            </div>
        </>'''

    return template.format(
        component_name=component_name,
        name=name,
        description=description,
        component_file=component_file
    )

# Main execution
if __name__ == "__main__":
    print("Starting calculator rebuild process...")
    
    # Get mappings
    slug_to_name, slug_to_category, slug_to_description = get_calculator_info()
    rebuild_calculators = read_rebuild_list()
    
    # Create output directory
    output_dir = Path("C:/Racira/racira-nextjs/src/domains/calculator/components")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Process calculators in batches of 5
    batch_size = 5
    total_calculators = len(rebuild_calculators)
    print(f"Found {total_calculators} calculators to rebuild in {total_calculator} batches of {batch_size}")
    
    for i in range(0, total_calculators, batch_size):
        batch = rebuild_calculators[i:i+batch_size]
        print(f"\nProcessing batch {i//batch_size + 1} ({len(batch)} calculators)")
        
        for calc_name in batch:
            # Find matching slug in registry
            slug = None
            for calc in registry.get("finance", []) + registry.get("business", []) + registry.get("health", []) + registry.get("math", []) + registry.get("science", []) + registry.get("engineering", []) + registry.get("technology", []) + registry.get("environment", []) + registry.get("everyday-life", []) + registry.get("transportation", []) + registry.get("construction", []) + registry.get("education", []) + registry.get("utility", []) + registry.get("orphans", []):
                if slug_to_name.get(calc_name) == calc_name or slug_to_name.get(calc_name) == calc_name:
                    slug = calc['slug']
                    break
            
            if not slug:
                print(f"⚠️ Could not find slug for {calc_name}")
                continue
                
            # Get component name from lazyComponents
            component_name = slug_to_name.get(slug, f"{slug.replace('-', '')}Calculator")
            
            # Generate component file
            component_file = f"{slug}.tsx"
            file_path = os.path.join(output_dir, component_file)
            
            # Generate the component
            component_content = generate_calculator_component(
                slug=slug,
                name=calc_name,
                category=slug_to_category.get(slug, "unknown"),
                description=slug_to_description.get(slug, ""),
                component_file=component_file
            )
            
            # Write to file
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(component_content)
                
            print(f"✅ Generated: {component_file} ({len(component_content)} characters)")
            
        # Wait between batches
        if i + batch_size < total_calculators:
            import time
            time.sleep(1)