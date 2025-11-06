// src/App.tsx
import React from 'react';
import { CssBaseline, ThemeProvider, Typography, createTheme } from '@mui/material';
import EditorComponent from './components/Editor/EditorComponent';
import { EditorToolbar } from './components/Editor/EditorToolbar';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

const App: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#BBB', display: 'flex'}}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <EditorComponent toolbar={<Typography variant='h5' sx={{ backgroundColor: 'white', padding: 2}}>Insert Details Here</Typography>} isGenerating={true}/>
        <EditorComponent toolbar={<EditorToolbar />} isGenerating={false}/>
      </ThemeProvider>
    </div>

  );
};

export default App;
