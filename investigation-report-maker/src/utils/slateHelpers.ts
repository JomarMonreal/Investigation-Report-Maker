// src/utils/slateHelpers.ts
import { Editor, Transforms } from 'slate';

// Define types for Slate elements and text
export type CustomElement = { type: 'paragraph' | 'heading'; level?: number; children: CustomText[] };
export type CustomText = { text: string; bold?: boolean; italic?: boolean; underline?: boolean; fontSize?: string };

// Initial editor content
export const initialValue: CustomElement[] = [
  {
    type: 'heading',
    level: 1,
    children: [{ text: 'Investigation Report' }],
  },
  {
    type: 'paragraph',
    children: [
      { text: 'Case Number: ' },
      { text: '2025-1123', bold: true },
      { text: '\nDate: ' },
      { text: 'November 4, 2025', bold: true },
    ],
  },
  {
    type: 'paragraph',
    children: [
      { text: 'Investigating Officer: ' },
      { text: 'Detective Jane Doe', italic: true },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          'Summary: On November 3, 2025, at approximately 22:30 hours, officers responded to a reported burglary at 123 Elm Street. Upon arrival, the premises were secured and initial evidence collected. Witness statements were taken, and CCTV footage was retrieved from neighboring properties.',
      },
    ],
  },
  {
    type: 'heading',
    level: 2,
    children: [{ text: 'Evidence Collected' }],
  },
  {
    type: 'paragraph',
    children: [
      { text: '1. Fingerprints from the front door handle.\n' },
      { text: '2. CCTV footage from neighbor residence.\n' },
      { text: '3. Footwear impressions in the backyard soil.\n' },
    ],
  },
  {
    type: 'heading',
    level: 2,
    children: [{ text: 'Witness Statements' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          'Witness John Smith reported seeing a suspicious individual leaving the property around 22:15 hours. The description matches a male, approximately 6 feet tall, wearing a dark hoodie.',
      },
    ],
  },
  {
    type: 'heading',
    level: 2,
    children: [{ text: 'Conclusion' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          'The investigation is ongoing. Evidence has been documented and forwarded to the forensics department. Further interviews will be conducted as leads are developed.',
      },
    ],
  },
];

// Helper functions to toggle text marks and blocks
export const toggleMark = (editor: Editor, format: string) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

export const isMarkActive = (editor: Editor, format: string) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n[format] === true,
  });
  return !!match;
};

export const toggleBlock = (editor: Editor, type: string, level?: number) => {
  const isActive = isBlockActive(editor, type, level);
  Transforms.unwrapNodes(editor, {
    match: (n) => Editor.isBlock(editor, n),
    split: true,
  });

  const newProperties = { type, ...(level ? { level } : {}) };
  if (isActive) {
    Transforms.setNodes(editor, { type: 'paragraph' });
  } else {
    Transforms.setNodes(editor, newProperties);
  }
};

export const toggleFontSize = (editor: Editor, change: number) => {
  if (!editor.selection) return;

  const marks = Editor.marks(editor) || {};
  const currentSize = marks.fontSize
    ? parseInt(marks.fontSize.replace('px', ''))
    : 16;

  const newSize = Math.max(8, currentSize + change);

  Editor.addMark(editor, 'fontSize', `${newSize}px`);
};

export const isBlockActive = (editor: Editor, type: string, level?: number) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === type && (level ? n.level === level : true),
  });
  return !!match;
};
