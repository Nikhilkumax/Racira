"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

import { Upload } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { useToolWorkflow } from "@/features/pdf/context/ToolWorkflowContext";
import ServerToolNotice from "@/components/tools/shared/ServerToolNotice";

const IMAGE_TOOLS = ["jpg-to-pdf", "scan-to-pdf"];
const SERVER_TOOLS = [
  "pdf-to-word", "pdf-to-excel", "pdf-to-powerpoint",
  "word-to-pdf", "excel-to-pdf", "powerpoint-to-pdf", "html-to-pdf",
  "ocr-pdf", "sign-pdf", "edit-pdf", "add-text", "add-image",
  "redact-pdf", "protect-pdf", "unlock-pdf",
];

const ToolUploadPage = ({ tool }: { tool: any }) => {
  const { slug } = useParams();
  const router = useRouter();
  const { files, addFiles, reset } = useToolWorkflow();
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => { reset(); }, [slug, reset]);

  const isImageTool = slug ? IMAGE_TOOLS.includes(slug as string) : false;
  const isServerTool = slug ? SERVER_TOOLS.includes(slug as string) : false;
  const acceptTypes = isImageTool ? "image/jpeg,image/png,.jpg,.jpeg,.png" : ".pdf";

  useEffect(() => {
    if (files.length > 0 && slug) router.replace(`/tools/pdf/${slug}/edit`);
  }, [files.length, slug, router]);

  const handleFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    await addFiles(fileList);
  }, [addFiles]);

  if (!tool) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground">Tool not found</h1>
        <Link href="/tools/pdf" className="mt-4 inline-block text-primary hover:underline">Back to Home</Link>
      </div>
    );
  }

  // Show professional notice for server-required tools
  if (isServerTool) {
    return <ServerToolNotice tool={tool} />;
  }

  const Icon = tool.icon;

  return (
    <main className="container py-8 max-w-3xl">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/tools/pdf" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground">{tool.name}</span>
      </nav>

      <div className="text-center mb-8 animate-fade-in">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 text-primary mb-4">
          <Icon className="h-7 w-7" />
        </div>
        <h1 className="font-bold text-foreground text-2xl sm:text-3xl">{tool.name}</h1>
        <p className="mt-1 text-muted-foreground">{tool.description}</p>
      </div>

      <div
        className={`relative rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
          dragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50"
        }`}
        style={{ boxShadow: "var(--card-shadow)" }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
      >
        <input
          type="file"
          accept={acceptTypes}
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <p className="font-medium text-foreground">
          {isImageTool ? "Drop images here or click to upload" : "Drop PDF files here or click to upload"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Max file size: 100 MB · {isImageTool ? "JPG, PNG files" : "PDF files only"}
        </p>
      </div>

      <p className="text-center text-[11px] text-muted-foreground mt-3">
        🔒 Your files are processed securely and never uploaded to any server.
      </p>
    </main>
  );
};

export default ToolUploadPage;
