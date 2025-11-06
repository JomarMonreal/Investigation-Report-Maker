// src/components/Editor/EditorComponent.tsx
import ollama from 'ollama';
import React, { useState } from 'react';
import { createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { Box, Container, Button } from '@mui/material';
import { EditorToolbar } from './EditorToolbar';
import { Leaf } from './Leaf';
import { initialValue, toggleFontSize, toggleMark } from '../../utils/slateHelpers';


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

  const informalReport = "Date/time: Nov 5, 2025 around 8:45 in the evening\
    place: Rizal street corner Mabini ave Brgy Maligalig Los Banos Laguna\
    Type: Robbery and assault (physical)\
    \
    So the victim, name Juan Dela Cruz, 27 years old male, said he was just walking home from work when two guys came near him. They was holding something sharp, like a knife or bolo, and told him to give his things. He tried to refuse but one of them hit him in the arm then they grab his phone and wallet that had about 2k pesos. After that they ride a black motorcycle no plate number, go fast toward Lopez ave side.\
    \
    Police from Los Banos station went there maybe 10 mins after. Victim was still bleeding small wounds in arm and was brought to RHU for treatement. CCTV in nearby sari sari store and one tricycle terminal was check if it got the suspect. They still doing follow up investigation and patrol for any suspect match the desciption.\
    \
    Report by: PO2 Maria Sntos\
    Los Banos police"

        const JSONFormat = `{"content": [
{
"type": "heading",
"level": 1,
"children": [{ "text": "Investigation Report" }]
},
{
"type": "paragraph",
"children": [
{ "text": "Case Number: " },
{ "text": "2025-1123", "bold": true },
{ "text": "\nDate: " },
{ "text": "November 4, 2025", "bold": true }
]
},
{
"type": "paragraph",
"children": [
{ "text": "Investigating Officer: " },
{ "text": "Detective Jane Doe", "italic": true }
]
},
{
"type": "paragraph",
"children": [
{
"text": "Summary: On November 3, 2025, at approximately 22:30 hours, officers responded to a reported burglary at 123 Elm Street. Upon arrival, the premises were secured and initial evidence collected. Witness statements were taken, and CCTV footage was retrieved from neighboring properties."
}
]
},
{
"type": "heading",
"level": 2,
"children": [{ "text": "Evidence Collected" }]
},
{
"type": "paragraph",
"children": [
{ "text": "1. Fingerprints from the front door handle.\n" },
{ "text": "2. CCTV footage from neighbor residence.\n" },
{ "text": "3. Footwear impressions in the backyard soil.\n" }
]
},
{
"type": "heading",
"level": 2,
"children": [{ "text": "Witness Statements" }]
},
{
"type": "paragraph",
"children": [
{
"text": "Witness John Smith reported seeing a suspicious individual leaving the property around 22:15 hours. The description matches a male, approximately 6 feet tall, wearing a dark hoodie."
}
]
},
{
"type": "heading",
"level": 2,
"children": [{ "text": "Conclusion" }]
},
{
"type": "paragraph",
"children": [
{
"text": "The investigation is ongoing. Evidence has been documented and forwarded to the forensics department. Further interviews will be conducted as leads are developed."
}
]
}
]`

  const handleSubmit = async () => {
    const response = await ollama.chat({
      model: 'qwen3:1.7b',
      messages: [


        {role: 'system', content: "You are an AI assistant that corrects grammar and spelling for forensic reports. You will be given details about an incident and your rsponse should be a formatted forensic report. Here is the format:" + JSONFormat},
        {role: 'user', content: informalReport}
      ]
    })

    console.log(response.message.content)
  }


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
        <Button variant="contained" onClick={handleSubmit}> Generate Report </Button>
      </Container>
    </Slate>
  );
};

export default EditorComponent;
