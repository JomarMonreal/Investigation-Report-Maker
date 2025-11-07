// src/components/Editor/EditorComponent.tsx
import React from 'react';
import { Editable, ReactEditor } from 'slate-react';
import { Leaf } from './Leaf';
import { toggleFontSize, toggleMark } from '../../utils/slateHelpers';
import type { BaseEditor } from 'slate';
import { Element } from './Element';


const EditorComponent = ({ editor }: {editor :BaseEditor & ReactEditor}) => {

  // Handle keydown events for formatting and font size changes
  const onKeyDown = (event: React.KeyboardEvent) => {
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
  };


  return (
      <Editable
        renderElement={(props) => <Element {...props} />}
        renderLeaf={(props) => <Leaf {...props} />}
        style={{
          padding: '10px',
          backgroundColor: 'white',
          color: 'black',
          minHeight: '1000px'
        }}
        onKeyDown={onKeyDown}
      />
  );
};

export default EditorComponent;
