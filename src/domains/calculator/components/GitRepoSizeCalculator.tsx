"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface GitSizeResult {
  files: number;
  avgFileKb: number;
  commits: number;
  avgCommitKb: number;
  compressPct: number;
  workingTreeMb: number;
  gitObjectsMb: number;
  totalMb: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmtMb(mb: number): string {
  return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
}

function calcGitSize(files: number, avgFileKb: number, commits: number, avgCommitKb: number, compressPct: number): GitSizeResult {
  const workingTreeMb = (files * avgFileKb) / 1024;
  const gitObjectsMb = (commits * avgCommitKb * (compressPct / 100)) / 1024;
  const totalMb = workingTreeMb + gitObjectsMb;

  const breakdown = [
    { label: "Files in Working Tree", value: `${files.toLocaleString()} files` },
    { label: "Average File Size", value: `${avgFileKb} KB` },
    { label: "Working Tree Size", value: fmtMb(workingTreeMb) },
    { label: "Commits in History", value: `${commits.toLocaleString()} commits` },
    { label: "Avg Commit Change Size", value: `${avgCommitKb} KB` },
    { label: "Pack Compression", value: `${compressPct}%` },
    { label: ".git Object Store", value: fmtMb(gitObjectsMb) },
    { label: "Estimated Clone Size", value: fmtMb(totalMb) },
  ];
  const summaryStats = [
    { label: "Clone Size", value: fmtMb(totalMb) },
    { label: "Working Tree", value: fmtMb(workingTreeMb) },
    { label: ".git Objects", value: fmtMb(gitObjectsMb) },
    { label: "Files", value: `${files.toLocaleString()}` },
    { label: "Commits", value: `${commits.toLocaleString()}` },
    { label: "Avg File", value: `${avgFileKb} KB` },
    { label: "Avg Commit", value: `${avgCommitKb} KB` },
    { label: "Compression", value: `${compressPct}%` },
  ];
  const chartData = [
    { name: "Working Tree", value: Math.round(workingTreeMb), fill: "hsl(var(--primary))" },
    { name: ".git Objects", value: Math.round(gitObjectsMb), fill: "#8b5cf6" },
  ];
  return { files, avgFileKb, commits, avgCommitKb, compressPct, workingTreeMb, gitObjectsMb, totalMb, breakdown, summaryStats, chartData };
}

const DEFAULTS = { files: "1500", avgFile: "50", commits: "2000", avgCommit: "20", compress: "60" };

export default function GitRepoSizeCalculator() {
  const [files, setFiles] = useState(DEFAULTS.files);
  const [avgFile, setAvgFile] = useState(DEFAULTS.avgFile);
  const [commits, setCommits] = useState(DEFAULTS.commits);
  const [avgCommit, setAvgCommit] = useState(DEFAULTS.avgCommit);
  const [compress, setCompress] = useState(DEFAULTS.compress);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<GitSizeResult | null>(null);

  const fl = parseInt(files) || 0;
  const af = parseFloat(avgFile) || 0;
  const cm = parseInt(commits) || 0;
  const ac = parseFloat(avgCommit) || 0;
  const cp = parseFloat(compress) || 0;
  const errs: string[] = [];
  if (fl < 1 || fl > 1000000) errs.push("File count must be 1–1,000,000.");
  if (af <= 0) errs.push("Average file size must be greater than 0.");
  if (cm < 1 || cm > 1000000) errs.push("Commit count must be 1–1,000,000.");
  if (ac < 0) errs.push("Avg commit change size cannot be negative.");
  if (cp < 10 || cp > 100) errs.push("Compression must be between 10% and 100%.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcGitSize(fl, af, cm, ac, cp)); };
  const reset = () => {
    setFiles(DEFAULTS.files); setAvgFile(DEFAULTS.avgFile); setCommits(DEFAULTS.commits); setAvgCommit(DEFAULTS.avgCommit); setCompress(DEFAULTS.compress);
    setResult(calcGitSize(1500, 50, 2000, 20, 60));
  };
  useEffect(() => { setResult(calcGitSize(1500, 50, 2000, 20, 60)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "Why is a repo clone bigger than my files?", answer: "A clone includes the entire commit history and every changed blob, not just the current checkout. The .git directory often rivals or exceeds the working tree size on long-lived projects." },
    { question: "How does pack compression work?", answer: "Git stores commits as deltas against previous versions and zlib-compresses them, typically cutting raw history to 40–70% of its uncompressed size. Large binary files defeat this — they don't delta well." },
    { question: "How can I shrink a large repo?", answer: "Remove large binaries with git-filter-repo or BFG, shallow-clone with --depth, use sparse checkout, or split monorepos. GitHub also limits individual files to 100 MB." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Git Repository Size Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Git Repository Size Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Files in Working Tree</label>
                <div className={inp}><input type="number" value={files} onChange={e => setFiles(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Average File Size</label>
                <div className={inp}><input type="number" value={avgFile} onChange={e => setAvgFile(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">KB</span></div>
              </div>
              <div>
                <label className={lbl}>Commits in History</label>
                <div className={inp}><input type="number" value={commits} onChange={e => setCommits(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Avg Commit Change Size</label>
                <div className={inp}><input type="number" value={avgCommit} onChange={e => setAvgCommit(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">KB</span></div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAdv(o => !o)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 self-start"
            >
              Advanced Options
              <span className={`transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Storage Efficiency</div>
                  <div>
                    <label className={lbl}>Pack Compression Factor</label>
                    <div className={inp}><input type="number" value={compress} onChange={e => setCompress(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                    <p className="text-xs text-muted-foreground mt-1.5">Share of raw commit data remaining after delta + zlib compression.</p>
                  </div>
                </div>
              </div>
            )}
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Clone Size</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmtMb(result.totalMb)}</div>
                <div className="text-sm text-muted-foreground mt-1">{fmtMb(result.workingTreeMb)} working tree + {fmtMb(result.gitObjectsMb)} history</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Working Tree`, fmtMb(result.workingTreeMb)], [".git Objects", fmtMb(result.gitObjectsMb)], ["History Share", `${((result.gitObjectsMb / Math.max(result.totalMb, 0.001)) * 100).toFixed(0)}%`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Size Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 7 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 7 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 7 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">What You Download</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}MB`} />
                    <Tooltip formatter={(v: number) => [`${v} MB`, ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What a Clone Contains</h2>
            <p>Cloning a repository downloads two things: the current working tree and the entire .git object database. This <strong>git repository size calculator</strong> estimates the clone size as working tree (files × average size) plus packed history (commits × average change size × compression factor).</p>
            <h2 className="text-2xl font-bold mb-3">Why History Dominates</h2>
            <p>Every commit stores a snapshot of the changes it introduced. Git delta-compresses similar versions and zlib-compresses everything, but repositories with long histories, generated artifacts, or committed binaries grow without bound — history rarely shrinks once pushed.</p>
            <h2 className="text-2xl font-bold mb-3">Keeping Repos Lean</h2>
            <p>Use .gitignore aggressively, keep binaries in package registries or object storage, and prune history with filter-repo when it bloats. CI caches and shallow clones for ephemeral jobs reduce the download cost further.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/git-repo-size-calculator" />
          <PopularCalculators exclude="/calculator/git-repo-size-calculator" />
        </div>
      </div>
    </>
  );
}
