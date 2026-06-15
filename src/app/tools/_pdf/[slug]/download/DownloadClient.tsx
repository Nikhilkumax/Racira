"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

import { useEffect } from "react";
import { useToolWorkflow } from "@/features/pdf/context/ToolWorkflowContext";

import DownloadResult from "@/components/tools/shared/DownloadResult";
import { saveAs } from "file-saver";

const ToolDownloadPage = ({ tool }: { tool: any }) => {
  const { slug } = useParams();
  const router = useRouter();
  const { done, result, reset } = useToolWorkflow();

  // Redirect if no result
  useEffect(() => {
    if (!done || !result) {
      router.replace(`/tools/pdf/${slug}`);
    }
  }, [done, result, slug, router]);

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.data.buffer as ArrayBuffer], { type: result.type });
    saveAs(blob, result.filename);
  };

  const handleReset = () => {
    reset();
    router.push(`/tools/pdf/${slug}`);
  };

  if (!tool || !result) return null;

  return (
    <main className="container py-8 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/tools/pdf" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/tools/pdf/${slug}`} className="hover:text-foreground transition-colors">{tool.name}</Link>
        <span>/</span>
        <span className="text-foreground">Download</span>
      </nav>

      

      {/* Title */}
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="font-bold text-foreground text-2xl sm:text-3xl">{tool.name}</h1>
        <p className="mt-1 text-muted-foreground">Your file is ready for download.</p>
      </div>

      <DownloadResult
        filename={result.filename}
        fileSize={result.data.length}
        toolName={tool.name}
        onDownload={handleDownload}
        onReset={handleReset}
      />
    </main>
  );
};

export default ToolDownloadPage;
