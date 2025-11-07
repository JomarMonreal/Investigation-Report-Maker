import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    background: { default: "#fafafa", paper: "#ffffff" },
    primary: { main: "#1a73e8" },
    secondary: { main: "#5f6368" }
  },
  shape: { borderRadius: 10 },
  typography: {
    button: { textTransform: "none", fontWeight: 600 },
    fontFamily: [
      "Inter",
      "Segoe UI",
      "Roboto",
      "Helvetica Neue",
      "Arial",
      "sans-serif"
    ].join(",")
  }
});

export default theme;
