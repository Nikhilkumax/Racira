"use client";
import { RotateCcw, HardDrive, GitBranch, AlertTriangle } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
const GitRepoSizeCalculator = () => {
  const [fileCount, setFileCount] = useState("500");
  const [avgFileSize, setAvgFileSize] = useState("50"); // KB
  const [commitCount, setCommitCount] = useState("1000");
  const [avgChangePerCommit, setAvgChangePerCommit] = useState("5"); // %
  const [binaryFileCount, setBinaryFileCount] = useState("10");
  const [avgBinarySize, setAvgBinarySize] = useState("5"); // MB

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const files = parseFloat(fileCount) || 0;
    const fileSizeKB = parseFloat(avgFileSize) || 0;
    const commits = parseFloat(commitCount) || 0;
    const changePct = (parseFloat(avgChangePerCommit) || 0) / 100;
    
    const binaryFiles = parseFloat(binaryFileCount) || 0;
    const binarySizeMB = parseFloat(avgBinarySize) || 0;

    // Source code calculations
    const initialSourceSizeMB = (files * fileSizeKB) / 1024;
    // Git compresses text very well (often 70% reduction in object store)
    const compressedSourceSizeMB = initialSourceSizeMB * 0.3;
    
    // Growth from commits. Each commit adds deltas. 
    // Roughly: (Total Size * % Changed) * Compress Ratio * Number of Commits
    const sourceGrowthMB = (initialSourceSizeMB * changePct) * 0.3 * commits;

    // Binary file calculations (Git does not delta-compress binaries well)
    // A changed binary often results in a full copy being stored.
    // Assume 10% of commits touch a binary file
    const binaryCommits = commits * 0.10;
    const binaryTotalMB = (binaryFiles * binarySizeMB) + (binaryFiles * binarySizeMB * binaryCommits);

    const totalRepoSizeMB = compressedSourceSizeMB + sourceGrowthMB + binaryTotalMB;
    const cloneSizeMB = totalRepoSizeMB; // Clone pulls the entire .git directory
    
    const workingTreeSizeMB = initialSourceSizeMB + (binaryFiles * binarySizeMB);

    setResults({
      cloneSizeMB,
      workingTreeSizeMB,
      sourceGrowthMB,
      binaryTotalMB,
      isBloated: binaryTotalMB > (cloneSizeMB * 0.5) && binaryTotalMB > 100
    });
  };

  const reset = () => {
    setFileCount("500");
    setAvgFileSize("50");
    setCommitCount("1000");
    setAvgChangePerCommit("5");
    setBinaryFileCount("10");
    setAvgBinarySize("5");
  };

  const faqs = [
    { question: "Why is my .git folder so large?", answer: "The .git folder contains the entire history of your project. Every commit you've ever made, including files you've deleted or overwritten, is stored there. If you ever committed a large binary file (like an MP4 or a database dump), it stays in the history forever, bloating the repository." },
    { question: "How does Git compress files?", answer: "Git uses zlib to compress files (blobs) and creates 'deltas' (differences between file versions) in 'packfiles'. It is highly efficient at compressing plain text source code, often reducing it to 30% of its original size." },
    { question: "How do I fix a bloated repository?", answer: "If large files were accidentally committed, you must use tools like 'git filter-repo' or 'BFG Repo-Cleaner' to rewrite your Git history and purge the large files from all past commits. Moving forward, use Git LFS (Large File Storage) for binaries." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Git Repository Size Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Git Repo Size Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <GitBranch className="h-5 w-5 text-primary" /> Repository Data
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Number of Files</label>
                      <input type="number" value={fileCount} onChange={(e) => setFileCount(e.target.value)} className="input-calc" min="0" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Avg Size (KB)</label>
                      <input type="number" value={avgFileSize} onChange={(e) => setAvgFileSize(e.target.value)} className="input-calc" min="0" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Total Commits</label>
                      <input type="number" value={commitCount} onChange={(e) => setCommitCount(e.target.value)} className="input-calc" min="0" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">% Changed</label>
                      <div className="relative">
                         <input type="number" value={avgChangePerCommit} onChange={(e) => setAvgChangePerCommit(e.target.value)} className="input-calc" min="0" max="100" />
                         <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 mt-2">
                     <h3 className="text-sm font-bold text-foreground mb-4">Binary Assets (Images, Video, Zips)</h3>
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Binary Count</label>
                         <input type="number" value={binaryFileCount} onChange={(e) => setBinaryFileCount(e.target.value)} className="input-calc" min="0" />
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Avg Size (MB)</label>
                         <input type="number" value={avgBinarySize} onChange={(e) => setAvgBinarySize(e.target.value)} className="input-calc" min="0" />
                       </div>
                     </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center justify-center gap-2 font-bold text-sm">
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </div>
                </section>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">
                     <HardDrive className="h-5 w-5 text-primary" /> Size Estimates
                  </h2>
                  
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center mb-6">
                     <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Total Clone Size (.git folder)</p>
                     <p className="text-5xl font-black text-foreground">{results.cloneSizeMB > 1024 ? (results.cloneSizeMB/1024).toFixed(2) : results.cloneSizeMB.toFixed(1)} <span className="text-2xl font-normal text-muted-foreground">{results.cloneSizeMB > 1024 ? 'GB' : 'MB'}</span></p>
                     <p className="text-xs text-muted-foreground mt-2">What users download when running `git clone`</p>
                  </div>

                  <div className="space-y-4 flex-1">
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Working Directory Size</span>
                        <span className="font-bold">{results.workingTreeSizeMB.toFixed(1)} MB</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Historical Source Deltas</span>
                        <span className="font-bold">{results.sourceGrowthMB.toFixed(1)} MB</span>
                     </div>
                     <div className="flex justify-between text-sm pb-4 border-b border-border">
                        <span className="text-muted-foreground">Binary History Blob Size</span>
                        <span className="font-bold text-rose-500">{results.binaryTotalMB.toFixed(1)} MB</span>
                     </div>
                     
                     {results.isBloated && (
                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-700 p-4 rounded-xl text-sm flex items-start gap-2 mt-4">
                          <AlertTriangle className="h-5 w-5 shrink-0" />
                          <div>
                            <strong>Binary Bloat Detected</strong>
                            <p className="mt-1 opacity-90">Binary files represent more than 50% of your repository size. Git cannot efficiently delta-compress binaries. Consider using Git LFS (Large File Storage) for these assets.</p>
                          </div>
                        </div>
                     )}
                  </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">The Mechanics of Git Storage</h2>
              <p>Git is incredibly efficient at storing source code. Instead of saving a full copy of a file every time you make a commit, it uses compression and deltas. A delta only stores the lines of text that changed between commits. This allows a repository with thousands of commits to remain remarkably small.</p>
              
              <h3>The Problem with Binaries</h3>
              <p>Git's delta compression breaks down when dealing with binary files (like images, compiled binaries, videos, or PDFs). Because these files are not line-based text, changing a single pixel in an image usually changes the entire binary structure of the file.</p>
              <p>Consequently, Git often stores a complete, uncompressed copy of the binary file for every commit it was changed in. Over time, this leads to immense repository bloat, causing `git clone` and `git fetch` operations to become painfully slow.</p>

              <h3>The Solution: Git LFS</h3>
              <p>Git Large File Storage (LFS) solves this by replacing large files in your repository with tiny text pointers. The actual file contents are stored on a remote server. When you clone a repository, Git LFS only downloads the versions of the large files needed for your currently checked-out commit, rather than downloading the entire history of every large file.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/git-repo-size" />
          <PopularCalculators exclude="/calculator/git-repo-size-calculator" />
        </div>
      </div>
    </>
  );
};

export default GitRepoSizeCalculator;

