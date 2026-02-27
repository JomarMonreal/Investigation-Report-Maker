// src/components/Editor/EditorComponent.tsx
import React from 'react';
import { Editable, ReactEditor } from 'slate-react';
import { Leaf } from './Leaf';
import { toggleFontSize, toggleMark } from '../../utils/slateHelpers';
import type { BaseEditor } from 'slate';
import { Element } from './Element';

const editorStyles = {
  padding: '10px',
  backgroundColor: 'white',
  color: 'black',
  minHeight: '1000px'
} as const;

interface EditorComponentProps {
  editor: BaseEditor & ReactEditor;
}

const EditorComponent: React.FC<EditorComponentProps> = ({ editor }) => {
  const renderElement = React.useCallback((props: Parameters<typeof Element>[0]) => <Element {...props} />, []);
  const renderLeaf = React.useCallback((props: Parameters<typeof Leaf>[0]) => <Leaf {...props} />, []);

  // Handle keydown events for formatting and font size changes
  const onKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    // Check for key combinations (e.g., Ctrl + B for bold, Ctrl + Shift + < for font size down)
    if (event.ctrlKey && event.shiftKey) {
      if (event.key === ',' || event.key === '<') {
        event.preventDefault();
        toggleFontSize(editor, -1); // decrease selected text
      }
      if (event.key === '.' || event.key === '>') {
        event.preventDefault();
        toggleFontSize(editor, 1); // increase selected text
      }
    }

    if (event.ctrlKey) {
      // Bold (Ctrl + B)
      if (event.key === 'b') {
        event.preventDefault();
        toggleMark(editor, 'bold');
      }
      // Italic (Ctrl + I)
      else if (event.key === 'i') {
        event.preventDefault();
        toggleMark(editor, 'italic');
      }
      // Underline (Ctrl + U)
      else if (event.key === 'u') {
        event.preventDefault();
        toggleMark(editor, 'underline');
      }

    }
  }, [editor]);


  return (
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        style={editorStyles}
        onKeyDown={onKeyDown}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
      />
  );
};

export default React.memo(EditorComponent);
