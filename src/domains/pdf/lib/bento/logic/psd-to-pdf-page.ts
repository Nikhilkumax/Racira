import { state } from '../shims/state';
import { downloadFile, formatBytes } from '../utils/helpers';
import { loadPyMuPDF } from '../utils/pymupdf-loader';
import type { PyMuPDFInstance } from '../types';

const ACCEPTED_EXTENSIONS = ['.psd'];
const FILETYPE_NAME = 'PSD';

let pymupdf: PyMuPDFInstance | null = null;

async function ensurePyMuPDF(): Promise<PyMuPDFInstance> {
  if (!pymupdf) {
    pymupdf = (await loadPyMuPDF()) as PyMuPDFInstance;
  }
  return pymupdf;
}

document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const dropZone = document.getElementById('drop-zone');
  const processBtn = document.getElementById('process-btn');
  const fileDisplayArea = document.getElementById('file-display-area');
  const fileControls = document.getElementById('file-controls');
  const addMoreBtn = document.getElementById('add-more-btn');
  const clearFilesBtn = document.getElementById('clear-files-btn');
  const backBtn = document.getElementById('back-to-tools');

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/';
    });
  }

  const updateUI = async () => {
    if (!fileDisplayArea || !processBtn || !fileControls) return;
    if (state.files.length > 0) {
      fileDisplayArea.innerHTML = '';
      for (let index = 0; index < state.files.length; index++) {
        const file = state.files[index];
        const fileDiv = document.createElement('div');
        fileDiv.className =
          'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';
        const infoContainer = document.createElement('div');
        infoContainer.className = 'flex flex-col overflow-hidden';
        const nameSpan = document.createElement('div');
        nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
        nameSpan.textContent = file.name;
        const metaSpan = document.createElement('div');
        metaSpan.className = 'text-xs text-gray-400';
        metaSpan.textContent = formatBytes(file.size);
        infoContainer.append(nameSpan, metaSpan);
        const removeBtn = document.createElement('button');
        removeBtn.className =
          'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
        removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
        removeBtn.onclick = () => {
          state.files = state.files.filter((_, i) => i !== index);
          updateUI();
        };
        fileDiv.append(infoContainer, removeBtn);
        fileDisplayArea.appendChild(fileDiv);
      }

      fileControls.classList.remove('hidden');
      processBtn.classList.remove('hidden');
    } else {
      fileDisplayArea.innerHTML = '';
      fileControls.classList.add('hidden');
      processBtn.classList.add('hidden');
    }
  };

  const resetState = () => {
    state.files = [];
    updateUI();
  };

  const convert = async () => {
    if (state.files.length === 0) {

      return;
    }
    try {

      const mupdf = await ensurePyMuPDF();

      if (state.files.length === 1) {
        const file = state.files[0];

        const pdfBlob = await mupdf.imageToPdf(file, { imageType: 'psd' });
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        downloadFile(pdfBlob, `${baseName}.pdf`);

      } else {

        const pdfBlob = await mupdf.imagesToPdf(state.files);
        downloadFile(pdfBlob, 'psd_to_pdf.pdf');

      }
    } catch (err) {

      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[${FILETYPE_NAME}ToPDF] Error:`, err);

    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      const validFiles = Array.from(files).filter((file) => {
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        return ACCEPTED_EXTENSIONS.includes(ext);
      });
      if (validFiles.length > 0) {
        state.files = [...state.files, ...validFiles];
        updateUI();
      }
    }
  };

  if (fileInput && dropZone) {
    fileInput.addEventListener('change', (e) =>
      handleFileSelect((e.target as HTMLInputElement).files)
    );
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('bg-gray-700');
    });
    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropZone.classList.remove('bg-gray-700');
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('bg-gray-700');
      handleFileSelect(e.dataTransfer?.files ?? null);
    });
    fileInput.addEventListener('click', () => {
      fileInput.value = '';
    });
  }
  if (addMoreBtn) addMoreBtn.addEventListener('click', () => fileInput.click());
  if (clearFilesBtn) clearFilesBtn.addEventListener('click', resetState);
  if (processBtn) processBtn.addEventListener('click', convert);
});
