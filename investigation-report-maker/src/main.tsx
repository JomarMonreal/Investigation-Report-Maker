import { CssBaseline, ThemeProvider } from "@mui/material";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import theme from "./theme";
import CaseDetailsProvider from "./context/CaseDetailsProvider";
import { PoliceOfficerProvider } from "./context/PoliceOfficerProvider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
          <CaseDetailsProvider>
            <PoliceOfficerProvider> 
               <App />
            </PoliceOfficerProvider>
          </CaseDetailsProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
