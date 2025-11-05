// src/components/Editor/EditorToolbar.tsx
import React from 'react';
import { IconButton, Toolbar, AppBar } from '@mui/material';
import BoldIcon from '@mui/icons-material/FormatBold';
import ItalicIcon from '@mui/icons-material/FormatItalic';
import UnderlineIcon from '@mui/icons-material/FormatUnderlined';
import { useSlate } from 'slate-react';
import { toggleMark } from '../../utils/slateHelpers';

export const EditorToolbar: React.FC = () => {
  const editor = useSlate(); // Call useSlate hook at the top level

  return (
    <AppBar position="relative">
      <Toolbar sx={{ backgroundColor: '#DDD' }}>
        <IconButton onClick={() => toggleMark(editor, 'bold')}>
          <BoldIcon />
        </IconButton>
        <IconButton onClick={() => toggleMark(editor, 'italic')}>
          <ItalicIcon />
        </IconButton>
        <IconButton onClick={() => toggleMark(editor, 'underline')}>
          <UnderlineIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};
