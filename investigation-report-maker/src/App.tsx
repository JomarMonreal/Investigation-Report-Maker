import ArticleIcon from "@mui/icons-material/Article";
import DescriptionIcon from "@mui/icons-material/Description";
import HomeIcon from "@mui/icons-material/Home";
import {
  AppBar,
  Box,
  Container,
  IconButton,
  Toolbar,
  Tooltip,
  Typography
} from "@mui/material";
import * as React from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import ReportCreation from "./pages/ReportCreation";
import TemplateCreation from "./pages/TemplateCreation";

const App: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <AppBar position="sticky" elevation={0} color="inherit" sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Toolbar sx={{ gap: 1 }}>
          <Tooltip title="Home">
            <IconButton color="primary" onClick={() => navigate("/")}>
              <HomeIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Police Report Maker
          </Typography>
          <Typography variant="body1" sx={{ mr: 1, color: "text.secondary" }}>
            Create templates and generate reports
          </Typography>
          <Tooltip title="Template Creation">
            <IconButton onClick={() => navigate("/templates/new")}>
              <DescriptionIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Report Creation">
            <IconButton onClick={() => navigate("/reports/new")}>
              <ArticleIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1, width: "100%" }}>
        <Routes>
          <Route element={<Home />} path="/" />
          <Route element={<TemplateCreation />} path="/templates/new" />
          <Route element={<ReportCreation />} path="/reports/new" />
        </Routes>
      </Container>
    </Box>
  );
};

export default App;
