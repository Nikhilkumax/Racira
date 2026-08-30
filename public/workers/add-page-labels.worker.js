let cpdfLoaded = false;

function loadCpdf(cpdfUrl) {
  if (cpdfLoaded) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (typeof coherentpdf !== 'undefined') {
      cpdfLoaded = true;
      resolve();
      return;
    }
    try {
      self.importScripts(cpdfUrl);
      cpdfLoaded = true;
      resolve();
    } catch (error) {
      reject(new Error('Failed to load CoherentPDF: ' + error.message));
    }
  });
}

const STYLE_MAP = {
  DecimalArabic: () => coherentpdf.decimalArabic,
  LowercaseRoman: () => coherentpdf.lowercaseRoman,
  UppercaseRoman: () => coherentpdf.uppercaseRoman,
  LowercaseLetters: () => coherentpdf.lowercaseLetters,
  UppercaseLetters: () => coherentpdf.uppercaseLetters,
  NoLabelPrefixOnly: () => (coherentpdf.noLabelPrefixOnly ?? 5),
};

function resolveStyle(styleName) {
  const fn = STYLE_MAP[styleName];
  if (!fn) return coherentpdf.decimalArabic;
  return fn();
}

function addPageLabelsInWorker(pdfData, rules, removeExisting) {
  try {
    const uint8Array = new Uint8Array(pdfData);
    const pdf = coherentpdf.fromMemory(uint8Array, '');

    if (removeExisting) {
      coherentpdf.removePageLabels(pdf);
    }

    for (const rule of rules) {
      const trimmedRange = (rule.pageRange || '').trim();
      let range;
      try {
        range = trimmedRange
          ? coherentpdf.parsePagespec(pdf, trimmedRange)
          : coherentpdf.all(pdf);
      } catch (error) {
        self.postMessage({
          status: 'error',
          message: `Invalid page range: "${trimmedRange || 'all pages'}"`,
        });
        coherentpdf.deletePdf(pdf);
        return;
      }

      const startValue = Number.isFinite(rule.startValue)
        ? Math.max(0, Math.floor(rule.startValue))
        : 1;

      coherentpdf.addPageLabels(
        pdf,
        resolveStyle(rule.style),
        rule.prefix || '',
        startValue,
        range,
        rule.progress || false
      );
    }

    const outputBytes = coherentpdf.toMemory(pdf, false, false);
    coherentpdf.deletePdf(pdf);

    if (!outputBytes || outputBytes.length === 0) {
      self.postMessage({
        status: 'error',
        message: 'CoherentPDF produced an empty file.',
      });
      return;
    }

    const buffer = outputBytes.buffer.slice(
      outputBytes.byteOffset,
      outputBytes.byteOffset + outputBytes.byteLength
    );
    self.postMessage({ status: 'success', pdfBytes: buffer }, [buffer]);
  } catch (error) {
    self.postMessage({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to add page labels.',
    });
  }
}

self.onmessage = async function (e) {
  const { cpdfUrl } = e.data;
  if (!cpdfUrl) {
    self.postMessage({
      status: 'error',
      message: 'CoherentPDF URL not provided.',
    });
    return;
  }

  try {
    await loadCpdf(cpdfUrl);
  } catch (error) {
    self.postMessage({ status: 'error', message: error.message });
    return;
  }

  if (e.data.command === 'add-page-labels') {
    addPageLabelsInWorker(e.data.pdfData, e.data.rules, e.data.removeExisting);
  }
};
