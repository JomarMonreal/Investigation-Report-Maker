// src/components/Editor/EditorComponent.tsx
import ollama from 'ollama';
import React, { useState, type ReactNode } from 'react';
import { createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { Box, Container, Button } from '@mui/material';
import { Leaf } from './Leaf';
import { initialValue, toggleFontSize, toggleMark } from '../../utils/slateHelpers';
import { informalReport, JSONFormat } from '../../utils/dummy';


const EditorComponent = ({ toolbar, isGenerating }: {toolbar?: ReactNode, isGenerating: boolean}) => {
  const [editor] = useState(() => withReact(createEditor()));
  const [value, setValue] = useState(initialValue);

  const handleChange = (newValue: any) => {
    setValue(newValue);
  };

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

  

  const handleSubmit = async () => {
    const response = await ollama.chat({
      model: 'qwen3:1.7b',
      messages: [


        {role: 'system', content: "You are an AI assistant that corrects grammar and spelling for forensic reports. You will be given details about an incident and your rsponse should be a formatted forensic report. Here is the format:" + JSONFormat},
        {role: 'user', content: informalReport}
      ]
    })

    setValue(JSON.parse(response.message.content).content)
  }


  return (
    <Slate editor={editor} initialValue={value} onChange={handleChange}>
      <Container style={{ alignSelf: 'stretch', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '20px'}}>
        { toolbar }
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
        {
          isGenerating &&
          <Button variant="contained" onClick={handleSubmit}> Generate Report </Button>
        }
      </Container>
    </Slate>
  );
};

export default EditorComponent;
