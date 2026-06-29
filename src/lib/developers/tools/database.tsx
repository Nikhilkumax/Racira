import type { ToolDefinition } from "@/components/developers/tools/registry";
import { OptionsBar, OptRow, OptSelect } from "@/components/developers/tools/options-controls";
import { tryParseJSON } from "./helpers";

const SQL_LANGS = [
  { value: "sql", label: "Standard SQL" },
  { value: "mysql", label: "MySQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "sqlite", label: "SQLite" },
  { value: "mariadb", label: "MariaDB" },
  { value: "tsql", label: "T-SQL" },
];

function SqlLangOptions({ options, setOptions }: { options: Record<string, unknown>; setOptions: (n: Record<string, unknown>) => void }) {
  return (
    <OptionsBar>
      <OptSelect value={String(options.lang ?? "sql")} onChange={(v) => setOptions({ ...options, lang: v })} options={SQL_LANGS} />
    </OptionsBar>
  );
}

const sqlFormatter: ToolDefinition = {
  slug: "sql-formatter",
  mode: "text",
  options: SqlLangOptions,
  defaultOptions: { lang: "sql" },
  transform: async ({ input, options }) => {
    const { format } = await import("sql-formatter");
    const out = format(input, { language: String(options.lang ?? "sql") as never });
    return { output: out };
  },
};

const sqlBeautifier: ToolDefinition = { ...sqlFormatter, slug: "sql-beautifier" };

const sqlMinifier: ToolDefinition = {
  slug: "sql-minifier",
  mode: "text",
  transform: ({ input }) => ({
    output: input
      .replace(/--[^\n]*/g, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\s+/g, " ")
      .replace(/\s*([(),])\s*/g, "$1")
      .trim(),
  }),
};

const sqlValidator: ToolDefinition = {
  slug: "sql-validator",
  mode: "text",
  transform: ({ input }) => {
    const issues: string[] = [];
    const parens = (input.match(/\(/g) ?? []).length - (input.match(/\)/g) ?? []).length;
    if (parens !== 0) issues.push(`✗ Parenthesis mismatch (${parens > 0 ? "missing )" : "missing ("})`);
    const keywords = ["SELECT", "INSERT", "UPDATE", "DELETE", "CREATE", "ALTER", "DROP"];
    if (!keywords.some((k) => new RegExp(`\\b${k}\\b`, "i").test(input))) issues.push("⚠ No SQL keyword (SELECT/INSERT/etc.) found");
    if (/select/i.test(input) && !/from/i.test(input) && !/select\s+1|now\(\)|current_date/i.test(input)) issues.push("⚠ SELECT without FROM");
    return { output: issues.length ? issues.join("\n") : "✓ SQL syntax looks plausible (basic check)", info: `${issues.length} issue(s)` };
  },
};

const sqlQueryBuilder: ToolDefinition = {
  slug: "sql-query-builder",
  mode: "custom",
  customRenderer: ({ options, setOptions }) => {
    const o = options as Record<string, string>;
    const fields = o.fields || "*";
    const table = o.table || "users";
    const where = o.where || "";
    const order = o.order || "";
    const limit = o.limit || "";
    let sql = `SELECT ${fields}\nFROM ${table}`;
    if (where) sql += `\nWHERE ${where}`;
    if (order) sql += `\nORDER BY ${order}`;
    if (limit) sql += `\nLIMIT ${limit}`;
    const f = (key: string, label: string) => (
      <input defaultValue={String(o[key] ?? "")} onChange={(e) => setOptions({ ...options, [key]: e.target.value })} placeholder={label} className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm font-mono" />
    );
    return (
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fields</div>
          {f("fields", "id, name, email")}
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-2">Table</div>
          {f("table", "users")}
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-2">WHERE</div>
          {f("where", "active = true")}
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-2">ORDER BY</div>
          {f("order", "created_at DESC")}
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-2">LIMIT</div>
          {f("limit", "100")}
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Generated SQL</div>
          <pre className="text-sm font-mono bg-background p-3 rounded-md whitespace-pre-wrap">{sql}</pre>
        </div>
      </div>
    );
  },
};

const csvToSql: ToolDefinition = {
  slug: "csv-to-sql",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptRow label="Table"><input defaultValue={String(options.table ?? "mytable")} onChange={(e) => setOptions({ ...options, table: e.target.value })} className="h-8 w-40 rounded-md border border-input bg-background px-2 text-sm" /></OptRow>
    </OptionsBar>
  ),
  defaultOptions: { table: "mytable" },
  transform: ({ input, options }) => {
    const lines = input.split(/\r?\n/).filter((l) => l.trim());
    if (!lines.length) throw new Error("CSV needs a header row");
    const parse = (l: string) => l.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const headers = parse(lines[0]);
    const esc = (v: string) => v.includes("'") ? v.replace(/'/g, "''") : v;
    const out = lines.slice(1).map((line) => {
      const cells = parse(line);
      const vals = cells.map((c) => (c === "" || isNaN(Number(c)) ? `'${esc(c)}'` : c)).join(", ");
      return `INSERT INTO ${options.table} (${headers.join(", ")}) VALUES (${vals});`;
    });
    return { output: out.join("\n"), info: `${out.length} rows` };
  },
};

const jsonToSql: ToolDefinition = {
  slug: "json-to-sql",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptRow label="Table"><input defaultValue={String(options.table ?? "mytable")} onChange={(e) => setOptions({ ...options, table: e.target.value })} className="h-8 w-40 rounded-md border border-input bg-background px-2 text-sm" /></OptRow>
    </OptionsBar>
  ),
  defaultOptions: { table: "mytable" },
  transform: ({ input, options }) => {
    const v = tryParseJSON(input);
    const rows = Array.isArray(v) ? v : [v];
    if (!rows.length) return { output: "" };
    const headers = Object.keys(rows[0] as object);
    const esc = (x: unknown) => {
      if (x === null) return "NULL";
      if (typeof x === "number" || typeof x === "boolean") return String(x);
      return `'${String(x).replace(/'/g, "''")}'`;
    };
    const out = rows.map((r) => {
      const obj = r as Record<string, unknown>;
      return `INSERT INTO ${options.table} (${headers.join(", ")}) VALUES (${headers.map((h) => esc(obj[h])).join(", ")});`;
    });
    return { output: out.join("\n"), info: `${out.length} inserts` };
  },
};

const sqlToJson: ToolDefinition = {
  slug: "sql-to-json",
  mode: "text",
  transform: ({ input }) => {
    // Parse INSERT statements → JSON rows
    const rows: Record<string, unknown>[] = [];
    const re = /INSERT\s+INTO\s+\S+\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)\s*;/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(input)) !== null) {
      const cols = m[1].split(",").map((s) => s.trim());
      const rawVals = splitSqlValues(m[2]);
      const row: Record<string, unknown> = {};
      cols.forEach((c, i) => {
        const v = rawVals[i] ?? null;
        row[c] = v === "NULL" ? null : /^\d+$/.test(v) ? Number(v) : v.replace(/^'|'$/g, "");
      });
      rows.push(row);
    }
    if (!rows.length) return { output: "No INSERT statements found.", info: "" };
    return { output: JSON.stringify(rows, null, 2), info: `${rows.length} rows` };
  },
};

function splitSqlValues(s: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inStr = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "'") {
      if (inStr && s[i + 1] === "'") { cur += "'"; i++; }
      else { inStr = !inStr; cur += ch; }
    } else if (ch === "," && !inStr) { out.push(cur.trim()); cur = ""; }
    else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

const mongoQueryBuilder: ToolDefinition = {
  slug: "mongodb-query-builder",
  mode: "custom",
  customRenderer: ({ options, setOptions }) => {
    const o = options as Record<string, string>;
    const field = o.field || "status";
    const op = o.op || "$eq";
    const value = o.value || "active";
    const query = `{ "${field}": { "${op}": ${/^\d+$/.test(value) ? value : `"${value}"`} } }`;
    return (
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="grid sm:grid-cols-3 gap-2">
          <input defaultValue={field} onChange={(e) => setOptions({ ...options, field: e.target.value })} placeholder="field" className="h-8 rounded-md border border-input bg-background px-2 text-sm font-mono" />
          <OptSelect value={op} onChange={(v) => setOptions({ ...options, op: v })} options={["$eq", "$ne", "$gt", "$gte", "$lt", "$lte", "$in", "$regex"].map((x) => ({ value: x, label: x }))} />
          <input defaultValue={value} onChange={(e) => setOptions({ ...options, value: e.target.value })} placeholder="value" className="h-8 rounded-md border border-input bg-background px-2 text-sm font-mono" />
        </div>
        <pre className="text-sm font-mono bg-background p-3 rounded-md">{`db.collection.find(${query})`}</pre>
      </div>
    );
  },
};

const mongoJsonConverter: ToolDefinition = {
  slug: "mongodb-json-converter",
  mode: "text",
  transform: ({ input }) => {
    const v = tryParseJSON(input);
    return { output: `db.collection.find(${JSON.stringify(v, null, 2)})`, info: "Equivalent Mongo query" };
  },
};

const prismaSchemaFormatter: ToolDefinition = {
  slug: "prisma-schema-formatter",
  mode: "text",
  transform: ({ input }) => {
    // Align model fields into columns.
    const blocks = input.split(/(?=model\s+\w+\s*{)/);
    const out = blocks.map((block) => {
      if (!/^model\s/.test(block.trim())) return block;
      const lines = block.split(/\r?\n/);
      const isMatch = (l: string | RegExpExecArray): l is RegExpExecArray => typeof l !== "string";
      const fieldLines = lines.map((l) => {
        const m = /^(\s*)(\w+)\s+(\w+)(.*)$/.exec(l);
        if (!m) return l;
        return m;
      });
      const matched = fieldLines.filter(isMatch);
      const maxName = Math.max(...matched.map((m) => m[2].length), 0);
      const maxType = Math.max(...matched.map((m) => m[3].length), 0);
      return fieldLines.map((l) => {
        if (!isMatch(l)) return l;
        return `${l[1]}${l[2].padEnd(maxName)}  ${l[3].padEnd(maxType)}  ${l[4].trim()}`.trimEnd();
      }).join("\n");
    });
    return { output: out.join("\n") };
  },
};

const schemaVisualizer: ToolDefinition = {
  slug: "schema-visualizer",
  mode: "text",
  transform: ({ input }) => {
    const v = tryParseJSON(input);
    const out: string[] = [];
    const walk = (obj: Record<string, unknown>, path: string) => {
      for (const [k, val] of Object.entries(obj)) {
        const p = path ? `${path}.${k}` : k;
        if (val && typeof val === "object" && !Array.isArray(val)) walk(val as Record<string, unknown>, p);
        else out.push(`${p}: ${Array.isArray(val) ? `array<${typeof val[0]}>` : typeof val}`);
      }
    };
    walk(v as Record<string, unknown>, "");
    return { output: out.join("\n") };
  },
};

const sqlToMongoConverter: ToolDefinition = {
  slug: "sql-to-mongodb-query-converter",
  mode: "text",
  transform: ({ input }) => {
    const sel = /SELECT\s+(.+?)\s+FROM\s+(\w+)/i.exec(input);
    const where = /WHERE\s+(.+?)(?:\s+ORDER|\s+LIMIT|;|$)/i.exec(input);
    const limit = /LIMIT\s+(\d+)/i.exec(input);
    if (!sel) return { output: "Could not parse SELECT/FROM." };
    const fields = sel[1].trim() === "*" ? "" : sel[1].split(",").map((f) => `"${f.trim()}": 1`).join(", ");
    const whereClause = where ? where[1].replace(/(\w+)\s*=\s*'?([^'\s]+)'?/g, '"$1": "$2"') : "";
    const project = fields ? `, { ${fields} }` : "";
    const filter = whereClause ? `{ ${whereClause} }` : "{}";
    return { output: `db.${sel[2]}.find(${filter}${project})${limit ? `.limit(${limit[1]})` : ""}` };
  },
};

const graphqlToRestMapper: ToolDefinition = {
  slug: "graphql-to-rest-mapper",
  mode: "text",
  transform: ({ input }) => {
    const ops = input.match(/\{\s*(\w+)\s*\(([^)]*)\)/g) ?? [];
    const routes = ops.map((op) => {
      const m = /\{\s*(\w+)\s*\(([^)]*)\)/.exec(op);
      if (!m) return "";
      const name = m[1];
      const args = m[2];
      const path = `/api/${name}`;
      const params = args.split(",").map((a) => a.trim().split(/:\s*/)[0]).filter(Boolean);
      return `GET ${path}${params.length ? `?${params.map((p) => `${p}={${p}}`).join("&")}` : ""}`;
    }).filter(Boolean);
    return { output: routes.length ? routes.join("\n") : "No GraphQL operations detected.", info: `${routes.length} REST routes` };
  },
};

export const databaseTools: ToolDefinition[] = [
  sqlFormatter, sqlValidator, sqlMinifier, sqlBeautifier, sqlQueryBuilder, csvToSql,
  jsonToSql, sqlToJson, mongoQueryBuilder, mongoJsonConverter, prismaSchemaFormatter,
  schemaVisualizer, sqlToMongoConverter, graphqlToRestMapper,
];
