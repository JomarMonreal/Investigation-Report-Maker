// src/components/Editor/EditorComponent.tsx
import React, { useState } from 'react';
import { createEditor, Editor, Transforms } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { Box, Container } from '@mui/material';
import { EditorToolbar } from './EditorToolbar';
import { Leaf } from './Leaf';
import { initialValue, toggleMark } from '../../utils/slateHelpers';


const EditorComponent: React.FC = () => {
  const [editor] = useState(() => withReact(createEditor()));
  const [value, setValue] = useState(initialValue);

  const handleChange = (newValue: any) => {
    setValue(newValue);
  };

// Handle keydown events for formatting and font size changes
  const onKeyDown = (event: React.KeyboardEvent) => {
    // Check for key combinations (e.g., Ctrl + B for bold, Ctrl + Shift + < for font size down)
    if (event.ctrlKey && event.shiftKey) {
      // Handle font size down (Ctrl + Shift + <)
      if (event.key === ',' || event.key === '<') {
        event.preventDefault();
        adjustFontSize(editor, -1); // Decrease font size
      }

      // Handle font size up (Ctrl + Shift + >)
      if (event.key === '.' || event.key === '>') {
        event.preventDefault();
        adjustFontSize(editor, 1); // Increase font size
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

const adjustFontSize = (editor: any, change: number) => {
  // Find all text nodes (CustomText)
  const [match] = Editor.nodes(editor, {
    match: (n: any) => n.text !== undefined,
  });

  console.log('Match:', match);

  if (match) {
    const [node, path] = match;

    // Parse the numeric part of fontSize, default to 16 if not set
    const currentSize = node.fontSize ? parseInt(node.fontSize.replace('px', '')) : 16;
    const newSize = Math.max(8, currentSize + change); // Minimum font size 8px

    // Set the new fontSize on the specific node
    Transforms.setNodes(
      editor,
      { fontSize: `${newSize}px` }, // Make sure it's a string again
      { at: path }
    );
  }
};

  return (
    <Slate editor={editor} initialValue={value} onChange={handleChange}>
      <Container style={{ alignSelf: 'stretch', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '20px'}}>
        <EditorToolbar />
        <Box sx={{ flex: 1, overflow: 'auto', marginTop: '20px' }}>
          <Editable
            placeholder="Start typing..."
            renderLeaf={(props) => <Leaf {...props} />}
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              borderRadius: '5px',
              marginTop: '20px',
              backgroundColor: 'white',
              color: 'black',
              minHeight: '1000px'
            }}
            onKeyDown={onKeyDown}
          />
        </Box>
      </Container>
    </Slate>
  );
};

export default EditorComponent;
