// src/utils/slateHelpers.ts
import { Editor, Transforms } from 'slate';

// Define types for Slate elements and text
export type CustomElement = { type: 'paragraph' | 'heading'; level?: number; children: CustomText[] };
export type CustomText = { text: string; bold?: boolean; italic?: boolean; underline?: boolean; fontSize?: string };

// Initial editor content
export const initialValue: CustomElement[] = [
  {
    type: 'paragraph',
    children: [{ text: 'Welcome to your Google Docs-like editor!' }],
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
