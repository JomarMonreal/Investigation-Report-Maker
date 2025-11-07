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
    children: [
      {
        text: 'Police Incident Report',
        bold: true,
        fontSize: '20px',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Case No.:',
        bold: true,
      },
      { text: ' PR-2025-1106-0412   ' },
      {
        text: 'Date/Time Filed:',
        bold: true,
      },
      { text: ' November 6, 2025, 04:12 AM' },
    ],
  },

  // A. Summary
  {
    type: 'heading',
    level: 2,
    children: [{ text: 'A. Summary', bold: true, fontSize: '16px' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          'Officers responded to a reported vehicle burglary in a residential parking lot. A suspect was detained nearby and property was recovered. No injuries reported.',
      },
    ],
  },

  // B. Incident Details
  {
    type: 'heading',
    level: 2,
    children: [{ text: 'B. Incident Details', bold: true, fontSize: '16px' }],
  },
  {
    type: 'paragraph',
    children: [
      { text: 'Type:', bold: true },
      { text: ' Vehicle Burglary (Felony)   ' },
      { text: 'Statute:', bold: true },
      { text: ' 487(a) PC   ' },
      { text: 'Incident Date/Time:', bold: true },
      { text: ' November 6, 2025, approx. 02:55 AM   ' },
      { text: 'Location:', bold: true },
      { text: ' 1200 Block, Oakview Apartments, Lot B' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          'Upon arrival, officers observed a sedan with a shattered rear passenger window. Glass fragments were on the ground. A backpack and a laptop were reported missing by the vehicle owner.',
      },
    ],
  },

  // C. Involved Parties
  {
    type: 'heading',
    level: 2,
    children: [{ text: 'C. Involved Parties', bold: true, fontSize: '16px' }],
  },
  {
    type: 'paragraph',
    children: [
      { text: 'Victim:', bold: true },
      { text: ' Morgan, Alex (DOB: 1991-03-17) — ' },
      { text: 'Contact:', bold: true },
      { text: ' (555) 201-8890; ' },
      { text: 'Address:', bold: true },
      { text: ' 1242 Oakview Dr., Unit 3C' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      { text: 'Suspect:', bold: true },
      { text: ' Rivera, Jordan (DOB: 1997-09-05) — ' },
      { text: 'Description:', bold: true },
      { text: ' M, approx. 5’10”, dark hoodie, jeans; ' },
      { text: 'Status:', bold: true },
      { text: ' Detained/Arrested' },
    ],
  },

  // D. Witness Statements
  {
    type: 'heading',
    level: 2,
    children: [{ text: 'D. Witness Statements', bold: true, fontSize: '16px' }],
  },
  {
    type: 'paragraph',
    children: [
      { text: 'Witness 1:', bold: true },
      { text: ' Taylor, Casey — ' },
      {
        text:
          'stated they heard glass breaking at approximately 02:55 AM and saw an individual wearing a dark hoodie reach into a silver sedan. The individual left on foot toward Maple Street.',
        italic: true,
      },
    ],
  },

  // E. Evidence Collected
  {
    type: 'heading',
    level: 2,
    children: [{ text: 'E. Evidence Collected', bold: true, fontSize: '16px' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          '1) Photograph set (vehicle damage, glass on pavement). 2) Surveillance video request submitted to Oakview Apartments management. 3) Recovered property: black backpack with company logo; silver 13-inch laptop with minor dent (serial recorded). 4) Latent prints lifted from door handle.',
      },
    ],
  },

  // F. Actions Taken
  {
    type: 'heading',
    level: 2,
    children: [{ text: 'F. Actions Taken', bold: true, fontSize: '16px' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          'Officers canvassed the area and located the suspect two blocks east, carrying a black backpack matching the victim’s description. A field show-up was conducted; the victim positively identified the backpack and laptop as theirs. Suspect was searched incident to arrest; no weapons found.',
      },
    ],
  },

  // G. Disposition
  {
    type: 'heading',
    level: 2,
    children: [{ text: 'G. Disposition', bold: true, fontSize: '16px' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          'Suspect booked at Central Station on felony burglary. Property logged and will be returned to the victim upon release by evidence. Case forwarded to the District Attorney for review.',
      },
    ],
  },

  // H. Reporting Officer
  {
    type: 'heading',
    level: 2,
    children: [{ text: 'H. Reporting Officer', bold: true, fontSize: '16px' }],
  },
  {
    type: 'paragraph',
    children: [
      { text: 'Reporting Officer:', bold: true },
      { text: ' Ptl. Riley Chen, Badge #4721   ' },
      { text: 'Supervisor Review:', bold: true },
      { text: ' Sgt. Dana Price, #3109   ' },
      { text: 'Report Completed:', bold: true },
      { text: ' November 6, 2025, 04:12 AM' },
    ],
  },

  // Footer
  {
    type: 'paragraph',
    children: [
      {
        text:
          'This is a fictional report for testing and demonstration purposes only.',
        italic: true,
        fontSize: '12px',
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
