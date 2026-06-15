"use client";

import { useRouter, useParams } from "next/navigation";

import { useEffect, useState, useCallback, useRef } from "react";
import { useToolWorkflow } from "@/features/pdf/context/ToolWorkflowContext";
import { usePdfEditor } from "@/features/pdf/hooks/usePdfEditor";
import ToolLayout from "@/components/tools/shared/ToolLayout";
import LivePreviewPanel from "@/features/pdf/components/LivePreviewPanel";
import FilePreviewPanel from "@/components/tools/shared/FilePreviewPanel";
import MergePdfOptions from "@/features/pdf/components/tool-options/MergePdfOptions";
import SplitPdfOptions from "@/features/pdf/components/tool-options/SplitPdfOptions";
import CompressPdfOptions from "@/features/pdf/components/tool-options/CompressPdfOptions";
import RotatePdfOptions from "@/features/pdf/components/tool-options/RotatePdfOptions";
import RemovePagesOptions from "@/features/pdf/components/tool-options/RemovePagesOptions";
import OrganizePagesOptions from "@/features/pdf/components/tool-options/OrganizePagesOptions";
import PageNumbersOptions from "@/features/pdf/components/tool-options/PageNumbersOptions";
import WatermarkOptions from "@/features/pdf/components/tool-options/WatermarkOptions";
import CropPdfOptions from "@/features/pdf/components/tool-options/CropPdfOptions";
import ImageToPdfOptions from "@/features/pdf/components/tool-options/ImageToPdfOptions";
import PdfToJpgOptions from "@/features/pdf/components/tool-options/PdfToJpgOptions";
import DefaultToolOptions from "@/features/pdf/components/tool-options/DefaultToolOptions";

const IMAGE_TOOLS = ["jpg-to-pdf", "scan-to-pdf"];

// Tools that use the live PDF editor (single-file, page-level editing)
const EDITOR_TOOLS = [
  "split-pdf", "remove-pages", "organize-pages", "rotate-pdf",
  "page-numbers", "add-watermark", "crop-pdf",
];

// Tools that use file-level preview (multi-file)
const FILE_TOOLS = ["merge-pdf", "jpg-to-pdf", "scan-to-pdf"];

const ToolEditPage = ({ tool }: { tool: any }) => {
  const params = useParams();
  const slug = params?.slug as string | undefined;
  const router = useRouter();
  const {
    files, pageCount, toolOptions, processing, done, error, result,
    setToolOptions, process, reset, removeFile, reorderFiles, addFiles,
    setResult, setDone,
  } = useToolWorkflow();

  const editor = usePdfEditor();
  const editorInitialized = useRef(false);

  const isImageTool = slug ? IMAGE_TOOLS.includes(slug) : false;
  const isEditorTool = slug ? EDITOR_TOOLS.includes(slug) : false;
  const isFileTool = slug ? FILE_TOOLS.includes(slug) : false;
  const acceptTypes = isImageTool ? "image/jpeg,image/png,.jpg,.jpeg,.png" : ".pdf";

  const [splitSelectedPages, setSplitSelectedPages] = useState<Set<number>>(new Set());
  const [totalPageCount, setTotalPageCount] = useState<number | null>(pageCount);

  // Load file into editor for editor tools
  useEffect(() => {
    if (isEditorTool && files.length > 0 && !editorInitialized.current) {
      editorInitialized.current = true;
      editor.loadFile(files[0]);
    }
  }, [isEditorTool, files, editor.loadFile]);

  // Redirect to upload if no files
  useEffect(() => {
    if (files.length === 0) router.replace(`/tools/pdf/${slug}`);
  }, [files.length, slug, router]);

  // Navigate to download on done
  useEffect(() => {
    if (done && slug) router.push(`/tools/pdf/${slug}/download`);
  }, [done, slug, router]);

  // Update total page count from editor
  useEffect(() => {
    if (isEditorTool && editor.totalPages > 0) {
      setTotalPageCount(editor.totalPages);
    }
  }, [isEditorTool, editor.totalPages]);

  // Process handler for editor tools — uses workingPdfBytes directly
  const handleEditorProcess = useCallback(async () => {
    if (!slug) return;
    const bytes = editor.getDownloadBytes();
    if (!bytes) return;

    // For tools that need additional processing (watermark, page numbers, crop)
    const needsExtraProcessing = ["page-numbers", "add-watermark", "crop-pdf"].includes(slug);

    if (needsExtraProcessing) {
      await process(slug);
    } else {
      // For organize, rotate, remove — the editor already has the result
      const filename = slug === "split-pdf" ? "split.pdf"
        : slug === "remove-pages" ? "pages-removed.pdf"
        : slug === "organize-pages" ? "organized.pdf"
        : slug === "rotate-pdf" ? "rotated.pdf"
        : "result.pdf";

      setResult({
        data: bytes,
        filename,
        type: "application/pdf",
      });
      setDone(true);
    }
  }, [slug, editor, process, setResult, setDone]);

  // Process handler for file tools
  const handleFileProcess = useCallback(async () => {
    if (!slug) return;
    await process(slug);
  }, [slug, process]);

  const handleProcess = isEditorTool ? handleEditorProcess : handleFileProcess;

  const handleReset = useCallback(() => {
    editor.resetEditor();
    editorInitialized.current = false;
    reset();
    router.push(`/tools/pdf/${slug}`);
  }, [editor, reset, slug, router]);

  // Page select for split tool
  const handleSplitPageSelect = useCallback((visualIndex: number) => {
    setSplitSelectedPages(prev => {
      const next = new Set(prev);
      if (next.has(visualIndex)) next.delete(visualIndex); else next.add(visualIndex);
      return next;
    });
  }, []);

  // Page select for remove tool
  const handleRemovePageSelect = useCallback((visualIndex: number) => {
    editor.toggleRemovePage(visualIndex);
  }, [editor]);

  if (!tool || files.length === 0) return null;

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  // Build the left panel based on tool type
  const buildLeftPanel = () => {
    if (isEditorTool) {
      const showRotate = ["rotate-pdf", "organize-pages"].includes(slug || "");
      const enableDrag = ["organize-pages"].includes(slug || "");
      const isRemoveTool = slug === "remove-pages";
      const isSplitTool = slug === "split-pdf";

      return (
        <LivePreviewPanel
          thumbs={editor.thumbs}
          loading={editor.loading}
          removedPages={isRemoveTool ? editor.removedPages : undefined}
          selectedPages={isSplitTool ? splitSelectedPages : undefined}
          selectionStyle={isRemoveTool ? "remove" : "select"}
          showRotate={showRotate}
          enableDragReorder={enableDrag}
          onReorder={enableDrag ? editor.reorderPages : undefined}
          onSelect={
            isRemoveTool ? handleRemovePageSelect
            : isSplitTool ? handleSplitPageSelect
            : undefined
          }
          onRotate={showRotate ? editor.rotatePage : undefined}
        />
      );
    }

    // File-level preview for merge, image tools, etc.
    return (
      <FilePreviewPanel
        files={files}
        onAddFiles={addFiles}
        onRemoveFile={removeFile}
        onReorderFiles={["merge-pdf", "jpg-to-pdf", "scan-to-pdf"].includes(slug || "") ? reorderFiles : undefined}
        acceptTypes={acceptTypes}
        mode="files"
        onPageCountLoaded={setTotalPageCount}
      />
    );
  };

  const renderOptionsPanel = () => {
    switch (slug) {
      case "merge-pdf":
        return <MergePdfOptions fileCount={files.length} totalSize={totalSize} onProcess={handleProcess} onReset={handleReset} processing={processing} />;
      case "split-pdf":
        return <SplitPdfOptions pageCount={editor.totalPages || totalPageCount || pageCount} selectedPages={splitSelectedPages} onSelectionChange={setSplitSelectedPages} onChange={setToolOptions} onProcess={handleProcess} onReset={handleReset} processing={processing || editor.processing} />;
      case "compress-pdf":
      case "reduce-pdf-size":
        return <CompressPdfOptions fileCount={files.length} totalSize={totalSize} onProcess={handleProcess} onReset={handleReset} processing={processing} />;
      case "rotate-pdf":
        return <RotatePdfOptions pageCount={editor.totalPages || totalPageCount || pageCount} onChange={setToolOptions} onProcess={handleProcess} onReset={handleReset} processing={processing || editor.processing} onRotateAll={editor.rotateAllPages} />;
      case "remove-pages":
        return <RemovePagesOptions pageCount={editor.totalPages || totalPageCount || pageCount} selectedPages={editor.removedPages} onSelectionChange={(pages) => editor.setRemovedByVisualIndices(pages)} onProcess={handleProcess} onReset={handleReset} processing={processing || editor.processing} />;
      case "organize-pages":
        return <OrganizePagesOptions pageCount={editor.totalPages || totalPageCount || pageCount} onChange={setToolOptions} onProcess={handleProcess} onReset={handleReset} processing={processing || editor.processing} />;
      case "page-numbers":
        return <PageNumbersOptions pageCount={editor.totalPages || totalPageCount || pageCount} onChange={setToolOptions} onProcess={handleProcess} onReset={handleReset} processing={processing} />;
      case "add-watermark":
        return <WatermarkOptions pageCount={editor.totalPages || totalPageCount || pageCount} onChange={setToolOptions} onProcess={handleProcess} onReset={handleReset} processing={processing} />;
      case "crop-pdf":
        return <CropPdfOptions pageCount={editor.totalPages || totalPageCount || pageCount} onChange={setToolOptions} onProcess={handleProcess} onReset={handleReset} processing={processing} />;
      case "jpg-to-pdf":
      case "scan-to-pdf":
        return <ImageToPdfOptions fileCount={files.length} totalSize={totalSize} onProcess={handleProcess} onReset={handleReset} processing={processing} />;
      case "pdf-to-jpg":
        return <PdfToJpgOptions pageCount={totalPageCount || pageCount} fileCount={files.length} totalSize={totalSize} onProcess={handleProcess} onReset={handleReset} processing={processing} />;
      default:
        return <DefaultToolOptions tool={tool} onProcess={handleProcess} onReset={handleReset} processing={processing} />;
    }
  };

  return (
    <ToolLayout
      tool={tool}
      slug={slug || ""}
      leftPanel={buildLeftPanel()}
      rightPanel={renderOptionsPanel()}
    />
  );
};

export default ToolEditPage;
