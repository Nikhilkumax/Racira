/**
 * Form field extraction engine — ported from BentoPDF's form-creator-extraction.ts.
 * Extracts all interactive form fields from a PDF using pdf-lib.
 * Pure processing, no DOM coupling.
 */
import {
  PDFArray,
  PDFButton,
  PDFCheckBox,
  PDFDict,
  PDFDocument,
  PDFDropdown,
  PDFName,
  PDFOptionList,
  PDFRadioGroup,
  PDFRef,
  PDFSignature,
  PDFString,
  PDFTextField,
  PDFWidgetAnnotation,
  TextAlignment,
} from 'pdf-lib';

export interface ExtractedField {
  id: string;
  type: string;
  name: string;
  defaultValue: string;
  required: boolean;
  readOnly: boolean;
  tooltip: string;
  pageIndex: number;
  // Position in PDF coordinates (not canvas)
  x: number;
  y: number;
  width: number;
  height: number;
  // Type-specific properties
  checked?: boolean;
  exportValue?: string;
  options?: string[];
  combCells?: number;
  maxLength?: number;
  alignment?: string;
  multiline?: boolean;
  groupName?: string;
}

export interface ExtractionResult {
  fields: ExtractedField[];
  fieldNames: string[];
}

type SupportedPdfField =
  | PDFTextField
  | PDFCheckBox
  | PDFRadioGroup
  | PDFDropdown
  | PDFOptionList
  | PDFButton
  | PDFSignature;

function isSupportedPdfField(field: unknown): field is SupportedPdfField {
  return (
    field instanceof PDFTextField ||
    field instanceof PDFCheckBox ||
    field instanceof PDFRadioGroup ||
    field instanceof PDFDropdown ||
    field instanceof PDFOptionList ||
    field instanceof PDFButton ||
    field instanceof PDFSignature
  );
}

function getFieldType(field: SupportedPdfField): string {
  if (field instanceof PDFTextField) return 'text';
  if (field instanceof PDFCheckBox) return 'checkbox';
  if (field instanceof PDFRadioGroup) return 'radio';
  if (field instanceof PDFDropdown) return 'dropdown';
  if (field instanceof PDFOptionList) return 'optionlist';
  if (field instanceof PDFButton) return 'button';
  return 'signature';
}

function getTooltip(widget: PDFWidgetAnnotation): string {
  const tooltip = widget.dict.get(PDFName.of('TU'));
  if (!(tooltip instanceof PDFString)) return '';
  try {
    return tooltip.decodeText();
  } catch {
    return '';
  }
}

function getPageAnnotationRefs(pdfDoc: PDFDocument, pageIndex: number): PDFRef[] {
  const page = pdfDoc.getPages()[pageIndex];
  const annots = page.node.get(PDFName.of('Annots'));
  if (!annots) return [];

  const annotsArray = annots instanceof PDFArray
    ? annots
    : pdfDoc.context.lookupMaybe(annots, PDFArray);
  if (!annotsArray) return [];

  return annotsArray
    .asArray()
    .map((entry) => {
      if (entry instanceof PDFRef) return entry;
      return pdfDoc.context.getObjectRef(entry) ?? null;
    })
    .filter((entry): entry is PDFRef => entry instanceof PDFRef);
}

function resolveWidgetPageIndex(pdfDoc: PDFDocument, widget: PDFWidgetAnnotation): number | null {
  const pdfPages = pdfDoc.getPages();
  const pageRef = widget.P();

  if (pageRef instanceof PDFRef) {
    for (let i = 0; i < pdfPages.length; i++) {
      if (pdfPages[i].ref === pageRef) return i;
    }
  }

  for (let i = 0; i < pdfPages.length; i++) {
    const annotRefs = getPageAnnotationRefs(pdfDoc, i);
    for (const ref of annotRefs) {
      const dict = pdfDoc.context.lookupMaybe(ref, PDFDict);
      if (dict === widget.dict) return i;
    }
  }

  return null;
}

function buildBaseField(
  pdfField: SupportedPdfField,
  fieldType: string,
  widget: PDFWidgetAnnotation,
  pageIndex: number,
  id: string,
  pdfDoc: PDFDocument,
): ExtractedField {
  const rect = widget.getRectangle();
  const page = pdfDoc.getPages()[pageIndex];
  const { height: pageHeight } = page.getSize();

  return {
    id,
    type: fieldType,
    x: rect.x,
    y: pageHeight - rect.y - rect.height,
    width: rect.width,
    height: rect.height,
    name: pdfField.getName(),
    defaultValue: '',
    required: pdfField.isRequired(),
    readOnly: pdfField.isReadOnly(),
    tooltip: getTooltip(widget),
    combCells: 0,
    maxLength: 0,
    alignment: 'left',
    pageIndex,
  };
}

/**
 * Extract all interactive form fields from a PDF.
 * @param bytes - The PDF file as Uint8Array
 * @returns ExtractionResult with all fields found
 */
export async function extractFormFields(bytes: Uint8Array): Promise<ExtractionResult> {
  const pdfDoc = await PDFDocument.load(bytes);
  const form = pdfDoc.getForm();
  const fieldNames: string[] = [];
  const fields: ExtractedField[] = [];
  let counter = 0;

  for (const rawField of form.getFields()) {
    if (!isSupportedPdfField(rawField)) continue;

    const name = rawField.getName();
    const widgets = rawField.acroField.getWidgets();
    if (widgets.length === 0) continue;

    if (rawField instanceof PDFRadioGroup) {
      const options = rawField.getOptions();
      for (let wi = 0; wi < widgets.length; wi++) {
        const widget = widgets[wi];
        const pageIndex = resolveWidgetPageIndex(pdfDoc, widget);
        if (pageIndex === null) continue;

        counter++;
        const base = buildBaseField(rawField, 'radio', widget, pageIndex, `field_${counter}`, pdfDoc);
        fields.push({
          ...base,
          checked: false,
          exportValue: options[wi] || 'Yes',
          groupName: name,
        });
      }
      fieldNames.push(name);
      continue;
    }

    const widget = widgets[0];
    const pageIndex = resolveWidgetPageIndex(pdfDoc, widget);
    if (pageIndex === null) continue;

    counter++;
    const base = buildBaseField(rawField, getFieldType(rawField), widget, pageIndex, `field_${counter}`, pdfDoc);

    // Apply type-specific details
    if (rawField instanceof PDFTextField) {
      try { base.defaultValue = rawField.getText() || ''; } catch { }
      try { base.multiline = rawField.isMultiline(); } catch { }
      try {
        const ml = rawField.getMaxLength();
        if (ml !== undefined) {
          if (rawField.isCombed()) base.combCells = ml;
          else base.maxLength = ml;
        }
      } catch { }
      try {
        const a = rawField.getAlignment();
        if (a === TextAlignment.Center) base.alignment = 'center';
        else if (a === TextAlignment.Right) base.alignment = 'right';
      } catch { }
    } else if (rawField instanceof PDFCheckBox) {
      try { base.checked = rawField.isChecked(); } catch { base.checked = false; }
      base.exportValue = 'Yes';
    } else if (rawField instanceof PDFDropdown || rawField instanceof PDFOptionList) {
      try { base.options = rawField.getOptions(); } catch { }
      try { const sel = rawField.getSelected(); if (sel.length > 0) base.defaultValue = sel[0]; } catch { }
    } else if (rawField instanceof PDFButton) {
      base.defaultValue = 'Button';
    }

    fields.push(base);
    fieldNames.push(name);
  }

  return { fields, fieldNames };
}
