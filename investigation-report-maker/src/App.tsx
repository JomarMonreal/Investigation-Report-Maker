// src/App.tsx
import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import EditorComponent from './components/Editor/EditorComponent';

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
        <EditorComponent />
      </ThemeProvider>
    </div>

  );
};

export default App;
