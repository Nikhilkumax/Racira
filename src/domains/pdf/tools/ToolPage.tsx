"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState, useCallback, useRef, type ComponentType } from "react";
import { tools } from "@/domains/pdf/registry/tools";
import { getToolConfig } from "@/domains/pdf/registry/tool-config";
import { getToolSeo } from "@/domains/pdf/registry/tool-seo";
import { useToolWorkflow } from "@/lib/pdf/ToolWorkflowContext";
import { usePdfEditor } from "@/domains/pdf/hooks/usePdfEditor";

import ToolPageHeader from "@/components/tools/shared/ToolPageHeader";
import ToolWorkArea from "@/domains/pdf/components/tool/ToolWorkArea";
import RelatedTools from "@/domains/pdf/components/tool/RelatedTools";
import SeoContent from "@/domains/pdf/components/tool/SeoContent";

/**
 * Custom page components for tools that need a dedicated UI
 * beyond the generic upload/process/download flow.
 * Lazy-loaded to avoid bloating the main bundle.
 */
const CUSTOM_PAGES: Record<string, React.LazyExoticComponent<ComponentType>> = {
  "sign-pdf": dynamic(() => import("@/domains/pdf/tools/SignPdfTool"), {
    ssr: false,
    loading: () => <div className="text-center py-12 text-muted-foreground">Loading tool…</div>,
  }) as React.LazyExoticComponent<ComponentType>,
  "pdf-layers": dynamic(() => import("@/domains/pdf/tools/PdfLayersTool"), {
    ssr: false,
    loading: () => <div className="text-center py-12 text-muted-foreground">Loading tool…</div>,
  }) as React.LazyExoticComponent<ComponentType>,
  "edit-pdf-text": dynamic(() => import("@/domains/pdf/tools/EditPdfTool"), {
    ssr: false,
    loading: () => <div className="text-center py-12 text-muted-foreground">Loading tool…</div>,
  }) as React.LazyExoticComponent<ComponentType>,
  "bookmark-pdf": dynamic(() => import("@/domains/pdf/tools/BookmarkPdfTool"), {
    ssr: false,
    loading: () => <div className="text-center py-12 text-muted-foreground">Loading tool…</div>,
  }) as React.LazyExoticComponent<ComponentType>,
  "scanner-effect": dynamic(() => import("@/domains/pdf/tools/ScannerEffectTool"), {
    ssr: false,
    loading: () => <div className="text-center py-12 text-muted-foreground">Loading tool…</div>,
  }) as React.LazyExoticComponent<ComponentType>,
  "table-of-contents": dynamic(() => import("@/domains/pdf/tools/TableOfContentsTool"), {
    ssr: false,
    loading: () => <div className="text-center py-12 text-muted-foreground">Loading tool…</div>,
  }) as React.LazyExoticComponent<ComponentType>,
  "edit-attachments": dynamic(() => import("@/domains/pdf/tools/EditAttachmentsTool"), {
    ssr: false,
    loading: () => <div className="text-center py-12 text-muted-foreground">Loading tool…</div>,
  }) as React.LazyExoticComponent<ComponentType>,
  "add-page-labels": dynamic(() => import("@/domains/pdf/tools/AddPageLabelsTool"), {
    ssr: false,
    loading: () => <div className="text-center py-12 text-muted-foreground">Loading tool…</div>,
  }) as React.LazyExoticComponent<ComponentType>,
  "compare-pdfs": dynamic(() => import("@/domains/pdf/tools/ComparePdfsTool"), {
    ssr: false,
    loading: () => <div className="text-center py-12 text-muted-foreground">Loading tool…</div>,
  }) as React.LazyExoticComponent<ComponentType>,
  "pdf-multi-tool": dynamic(() => import("@/domains/pdf/tools/PdfMultiTool"), {
    ssr: false,
    loading: () => <div className="text-center py-12 text-muted-foreground">Loading tool…</div>,
  }) as React.LazyExoticComponent<ComponentType>,
  "redact": dynamic(() => import("@/domains/pdf/tools/RedactTool"), {
    ssr: false,
    loading: () => <div className="text-center py-12 text-muted-foreground">Loading tool…</div>,
  }) as React.LazyExoticComponent<ComponentType>,
  "form-field-extract": dynamic(() => import("@/domains/pdf/tools/FormCreatorExtractionTool"), {
    ssr: false,
    loading: () => <div className="text-center py-12 text-muted-foreground">Loading tool…</div>,
  }) as React.LazyExoticComponent<ComponentType>,
};

import MergePdfOptions from "@/domains/pdf/components/tool-options/MergePdfOptions";
import SplitPdfOptions from "@/domains/pdf/components/tool-options/SplitPdfOptions";
import CompressPdfOptions from "@/domains/pdf/components/tool-options/CompressPdfOptions";
import RotatePdfOptions from "@/domains/pdf/components/tool-options/RotatePdfOptions";
import RemovePagesOptions from "@/domains/pdf/components/tool-options/RemovePagesOptions";
import OrganizePagesOptions from "@/domains/pdf/components/tool-options/OrganizePagesOptions";
import PageNumbersOptions from "@/domains/pdf/components/tool-options/PageNumbersOptions";
import HeadersFootersOptions from "@/domains/pdf/components/tool-options/HeadersFootersOptions";
import AddTextOptions from "@/domains/pdf/components/tool-options/AddTextOptions";
import WatermarkOptions from "@/domains/pdf/components/tool-options/WatermarkOptions";
import CropPdfOptions from "@/domains/pdf/components/tool-options/CropPdfOptions";
import ImageToPdfOptions from "@/domains/pdf/components/tool-options/ImageToPdfOptions";
import PdfToJpgOptions from "@/domains/pdf/components/tool-options/PdfToJpgOptions";
import LockPdfOptions from "@/domains/pdf/components/tool-options/LockPdfOptions";
import UnlockPdfOptions from "@/domains/pdf/components/tool-options/UnlockPdfOptions";
import RestrictPdfOptions from "@/domains/pdf/components/tool-options/RestrictPdfOptions";
import InfoPdfOptions from "@/domains/pdf/components/tool-options/InfoPdfOptions";
import NUpOptions from "@/domains/pdf/components/tool-options/NUpOptions";
import RepeatPagesOptions from "@/domains/pdf/components/tool-options/RepeatPagesOptions";
import ResizePagesOptions from "@/domains/pdf/components/tool-options/ResizePagesOptions";
import DefaultToolOptions from "@/domains/pdf/components/tool-options/DefaultToolOptions";

/**
 * Unified single-page tool experience.
 *
 * Replaces the old 3-step wizard (upload → edit → download) with a single
 * scrollable page following the spec order:
 *   Breadcrumb → h1 → Tool UI Card → Related Tools → SEO Content
 *
 * The tool UI card (ToolWorkArea) manages its own state machine:
 *   IDLE → FILES_SELECTED → PROCESSING → COMPLETE / ERROR
 */
const ToolPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const tool = tools.find((t) => (t as any).slug === slug);

  const {
    files,
    processing,
    done,
    error,
    result,
    reset,
    removeFile,
    reorderFiles,
    addFiles,
    toolOptions,
    setToolOptions,
    setDone,
    setResult,
    process: workflowProcess,
  } = useToolWorkflow();

  // PDF editor hook for page-level tools (rotate, organize, remove, split, watermark, crop, page-numbers)
  const editor = usePdfEditor();
  const editorLoaded = useRef(false);

  // Reset on slug change
  useEffect(() => {
    reset();
    editor.resetEditor();
    editorLoaded.current = false;
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Editor-tools file loading ──────────────────────────────
  const isEditorTool = slug
    ? ["split", "delete-pages", "organize-pages", "rotate", "add-text", "headers-footers", "add-watermark", "crop-pages"].includes(slug)
    : false;

  useEffect(() => {
    if (isEditorTool && files.length > 0 && !editorLoaded.current) {
      editorLoaded.current = true;
      editor.loadFile(files[0]);
    }
  }, [isEditorTool, files, editor.loadFile]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Not found ─────────────────────────────────────────────
  if (!tool) {
    return (
      <div className="racira-page-container py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground">Tool not found</h1>
        <Link href="/pdf" className="mt-4 inline-block text-primary hover:underline">
          Back to all PDF tools
        </Link>
      </div>
    );
  }

  const config = getToolConfig(tool);
  const seo = getToolSeo(tool);

  // ── Per-tool options children for ToolWorkArea ──────────────
  const renderOptions = () => {
    if (!slug || files.length === 0) return null;

    // Editor tools need special process handling (use editor bytes directly)
    if (isEditorTool) {
      const handleProcess = async () => {
        if (!slug) return;
        const needsEngine = ["add-text", "headers-footers", "add-watermark", "crop-pages", "split"].includes(slug);
        if (needsEngine) {
          await workflowProcess(slug);
        } else {
          // Editor already has the result built from page operations
          const bytes = editor.getDownloadBytes();
          if (!bytes) return;
          const filename =
            slug === "split" ? "split.pdf"
            : slug === "delete-pages" ? "pages-removed.pdf"
            : slug === "organize-pages" ? "organized.pdf"
            : slug === "rotate" ? "rotated.pdf"
            : "result.pdf";
          setResult({ data: bytes, filename, type: "application/pdf" });
          setDone(true);
        }
      };

      const handleReset = () => {
        editor.resetEditor();
        editorLoaded.current = false;
        reset();
      };

      switch (slug) {
        case "split": return (
            <SplitPdfOptions
              pageCount={editor.totalPages || null}
              selectedPages={new Set()}
              onSelectionChange={() => {}}
              onChange={setToolOptions}
              onProcess={handleProcess}
              onReset={handleReset}
              processing={processing || editor.processing}
            />
          );
        case "rotate": return (
            <RotatePdfOptions
              pageCount={editor.totalPages || null}
              onChange={setToolOptions}
              onProcess={handleProcess}
              onReset={handleReset}
              processing={processing || editor.processing}
              onRotateAll={editor.rotateAllPages}
            />
          );
        case "delete-pages": return (
            <RemovePagesOptions
              pageCount={editor.totalPages || null}
              selectedPages={editor.removedPages}
              onSelectionChange={(pages) =>
                editor.setRemovedByVisualIndices(pages)
              }
              onProcess={handleProcess}
              onReset={handleReset}
              processing={processing || editor.processing}
            />
          );
        case "organize-pages": return (
            <OrganizePagesOptions
              pageCount={editor.totalPages || null}
              onChange={setToolOptions}
              onProcess={handleProcess}
              onReset={handleReset}
              processing={processing || editor.processing}
            />
          );
        case "add-text": return (
            <AddTextOptions
              pageCount={editor.totalPages || null}
              onChange={setToolOptions}
              onProcess={handleProcess}
              onReset={handleReset}
              processing={processing}
            />
          );
        case "headers-footers": return (
            <HeadersFootersOptions
              pageCount={editor.totalPages || null}
              onChange={setToolOptions}
              onProcess={handleProcess}
              onReset={handleReset}
              processing={processing}
            />
          );
        case "add-watermark": return (
            <WatermarkOptions
              pageCount={editor.totalPages || null}
              onChange={setToolOptions}
              onProcess={handleProcess}
              onReset={handleReset}
              processing={processing}
            />
          );
        case "crop-pages": return (
            <CropPdfOptions
              pageCount={editor.totalPages || null}
              onChange={setToolOptions}
              onProcess={handleProcess}
              onReset={handleReset}
              processing={processing}
            />
          );
      }
    }

    // File-level tools (merge, image-to-pdf)
    const handleReset = () => {
      reset();
    };

    switch (slug) {
      case "merge": {
        const totalSize = files.reduce((s, f) => s + f.size, 0);
        return (
          <MergePdfOptions
            fileCount={files.length}
            totalSize={totalSize}
            onProcess={() => workflowProcess(slug!)}
            onReset={handleReset}
            processing={processing}
          />
        );
      }
      case "image-to-pdf": {
        const totalSize = files.reduce((s, f) => s + f.size, 0);
        return (
          <ImageToPdfOptions
            fileCount={files.length}
            totalSize={totalSize}
            onProcess={() => workflowProcess(slug!)}
            onReset={handleReset}
            processing={processing}
          />
        );
      }
      case "pdf-to-image": {
        const totalSize = files.reduce((s, f) => s + f.size, 0);
        return (
          <PdfToJpgOptions
            pageCount={null}
            fileCount={files.length}
            totalSize={totalSize}
            onProcess={() => workflowProcess(slug!)}
            onReset={handleReset}
            processing={processing}
          />
        );
      }
      case "compress": {
        const totalSize = files.reduce((s, f) => s + f.size, 0);
        return (
          <CompressPdfOptions
            fileCount={files.length}
            totalSize={totalSize}
            onProcess={() => workflowProcess(slug!)}
            onReset={handleReset}
            processing={processing}
          />
        );
      }
      
      case "protect": return (
          <LockPdfOptions
            onChange={setToolOptions}
            onProcess={() => workflowProcess(slug!)}
            onReset={handleReset}
            processing={processing}
            actionLabel={tool.name}
          />
        );
      case "unlock": return (
          <UnlockPdfOptions
            onChange={setToolOptions}
            onProcess={() => workflowProcess(slug!)}
            onReset={handleReset}
            processing={processing}
            actionLabel={tool.name}
          />
        );
      case "permission-editor": return (
          <RestrictPdfOptions
            onChange={setToolOptions}
            onProcess={() => workflowProcess(slug!)}
            onReset={handleReset}
            processing={processing}
          />
        );
      case "n-up-layout": return (
          <NUpOptions
            onChange={setToolOptions}
            onProcess={() => workflowProcess(slug!)}
            onReset={handleReset}
            processing={processing}
          />
        );
      case "clone-pages": return (
          <RepeatPagesOptions
            onChange={setToolOptions}
            onProcess={() => workflowProcess(slug!)}
            onReset={handleReset}
            processing={processing}
          />
        );
      case "uniform-page-size": return (
          <ResizePagesOptions
            onChange={setToolOptions}
            onProcess={() => workflowProcess(slug!)}
            onReset={handleReset}
            processing={processing}
          />
        );
      case "file-info":
      case "page-dimensions":
      case "encryption-strength-checker":
      case "permission-editor":
      case "signature-presence-checker":
      case "viewer":
      case "certificate-inspector":
      case "imposition-layout":
      case "merge-with-toc":
      case "view-metadata":
      case "font-inspector":
      case "structure-inspector":
      case "pdfua-basic-checker":
      case "version-detector":
      case "integrity-verifier":
      case "pdfa-structural-checker":
      case "bookmark-navigator": return (
          <InfoPdfOptions
            onProcess={() => workflowProcess(slug!)}
            onReset={handleReset}
            processing={processing}
            actionLabel={tool.name}
            description={tool.description}
          />
        );
    }

    // Generic fallback for any tool that just requires "Process" button
    return (
      <DefaultToolOptions
        tool={tool}
        onChange={setToolOptions}
        onProcess={() => workflowProcess(slug!)}
        onReset={handleReset}
        processing={processing}
      />
    );
  };

  // ── Custom page override ───────────────────────────────────
  const CustomPage = slug ? CUSTOM_PAGES[slug] : undefined;
  if (CustomPage) {
    return (
      <main className="pb-16">
        <ToolPageHeader
          breadcrumbItems={[
            { label: "Home", href: "/" },
            { label: "PDF Tools", href: "/pdf" },
            { label: tool.subCategory || "PDF Tools", href: "/pdf" },
            { label: tool.name, href: null },
          ]}
          title={tool.name}
        />
        <div className="racira-page-container">
          <CustomPage />
          <RelatedTools
            currentSlug={tool.slug}
            currentCategory={config.category}
          />
          <SeoContent seo={seo} />
        </div>
      </main>
    );
  }

  // ── Page render ─────────────────────────────────────────────
  return (
    <main className="pb-16">
      {/* SECTION 1–2: Breadcrumb + title */}
      <ToolPageHeader
        breadcrumbItems={[
          { label: "Home", href: "/" },
          { label: "PDF Tools", href: "/pdf" },
          { label: tool.subCategory || "PDF Tools", href: "/pdf" },
          { label: tool.name, href: null },
        ]}
        title={tool.name}
      />

      {/* SECTION 3: Tool UI Card */}
      <div className="racira-page-container">
        <ToolWorkArea tool={tool} config={config}>
          {renderOptions()}
        </ToolWorkArea>

        {/* SECTION 4: Related Tools */}
        <RelatedTools
          currentSlug={tool.slug}
          currentCategory={config.category}
        />

        {/* SECTION 5: SEO Content */}
        <SeoContent seo={seo} />
      </div>
    </main>
  );
};

export default ToolPage;
