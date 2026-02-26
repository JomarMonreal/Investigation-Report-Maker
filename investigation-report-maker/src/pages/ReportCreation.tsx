import * as React from "react";
import { Slate, withReact } from "slate-react";
import { createEditor, Editor, Transforms, type Descendant } from "slate";
import type { CustomElement } from "../utils/slateHelpers";
import EditorComponent from "../components/Editor/EditorComponent";
import DocScaffoldLoad, { type ReportView } from "../components/DocScaffoldLoad";
import { systemPrompt } from "../utils/dummy";
import {
  Menu,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CaseDetailsForm from "../components/CaseDetailsForm";
import { useCaseDetails } from "../hooks/useCaseDetails";
import { usePoliceOfficer } from "../hooks/usePoliceOfficer";

// ✅ Add these imports
import { MessagingProvider } from "../context/MessagingProvider";
import { VirtualFiscalDrawer } from "../components/VirtualFiscalDrawer";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

type ErrorWithStatus = Error & { status?: number };

const isServerUnavailable = (err: unknown): boolean => {
  if (!(err instanceof Error)) return false;
  const withStatus = err as ErrorWithStatus;
  if (typeof withStatus.status === "number" && withStatus.status >= 500) {
    return true;
  }
  const message = err.message.toLowerCase();
  return (
    message.includes("failed to fetch") ||
    message.includes("fetch failed") ||
    message.includes("networkerror") ||
    message.includes("network request failed") ||
    message.includes("load failed") ||
    message.includes("request failed (502)") ||
    message.includes("request failed (503)") ||
    message.includes("request failed (504)")
  );
};

const ReportCreation: React.FC = () => {
  const [title, setTitle] = React.useState<string>("Untitled Report");
  const [view, setView] = React.useState<ReportView>("details");

  // ✅ Drawer state
  const [fiscalOpen, setFiscalOpen] = React.useState<boolean>(false);

  // Slate
  const [resultEditor] = React.useState(() => withReact(createEditor()));
  const initialResultValue = React.useMemo<CustomElement[]>(() => [
    { type: "paragraph", children: [{ text: "Start typing or load a template..." }] },
  ], []);
  const latestResultValueRef = React.useRef<CustomElement[]>(initialResultValue);
  const isGeneratingRef = React.useRef(false);

  const { caseDetails, setCaseDetails, setIsFetching, setSlateValue, isFetching } = useCaseDetails();
  const { policeStation } = usePoliceOfficer();

  // -------------------------------------------------------------------------
  // Generate modal state
  // -------------------------------------------------------------------------
  const [modeDialogOpen, setModeDialogOpen] = React.useState<boolean>(false);

  const handleOpenGenerateDialog = React.useCallback(() => {
    setModeDialogOpen(true);
  }, []);

  const handleCloseGenerateDialog = React.useCallback(() => {
    setModeDialogOpen(false);
  }, []);

  // -------------------------------------------------------------------------
  // Template management (stubbed for now)
  // -------------------------------------------------------------------------
  const handleLoadTemplate = React.useCallback(() => {
    // store only
  }, []);

  const handleClearTemplateCache = React.useCallback(() => {
    // reset cache when chip x is clicked
  }, []);

  const handleSlateChange = React.useCallback((value: Descendant[]) => {
    latestResultValueRef.current = value as CustomElement[];
  }, []);

  const handleOpenFiscalDrawer = React.useCallback(() => {
    setSlateValue(latestResultValueRef.current);
    setFiscalOpen(true);
  }, [setSlateValue]);

  // -------------------------------------------------------------------------
  // AI mode: call your /api/generate endpoint
  // -------------------------------------------------------------------------
  const handleGenerateReportAIMode = React.useCallback(async () => {
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;
    setModeDialogOpen(false);
    try {
      setIsFetching(true);
      const httpResponse = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseDetails, policeStation, systemPrompt }),
      });
      const response = await httpResponse.json().catch(() => null);
      if (!httpResponse.ok) {
        const message =
          response && typeof response.message === "string"
            ? response.message
            : `Request failed (${httpResponse.status})`;
        const error = new Error(message) as ErrorWithStatus;
        error.status = httpResponse.status;
        throw error;
      }
      if (!response || !response.message || typeof response.message.content !== "string") {
        throw new Error("Invalid response from server.");
      }

      const parsed = JSON.parse(response.message.content);
      const nodes = parsed as Descendant[];
      latestResultValueRef.current = nodes as CustomElement[];

      Editor.withoutNormalizing(resultEditor, () => {
        Transforms.select(resultEditor, {
          anchor: Editor.start(resultEditor, []),
          focus: Editor.end(resultEditor, []),
        });
        Transforms.delete(resultEditor);
        Transforms.insertNodes(resultEditor, nodes, { at: [0] });
        Transforms.select(resultEditor, Editor.start(resultEditor, []));
      });

      if (caseDetails.caseTitle && (!title || title === "Untitled Report")) {
        setTitle(caseDetails.caseTitle);
      }

      setView("result");
      setSlateValue(nodes);
    } catch (err) {
      if (isServerUnavailable(err)) {
        await sleep(1000);
      }
      alert(`Failed to generate report: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      isGeneratingRef.current = false;
      setIsFetching(false);
    }
  }, [setIsFetching, caseDetails, policeStation, resultEditor, title, setSlateValue]);

  // -------------------------------------------------------------------------
  // Template load error
  // -------------------------------------------------------------------------
  const handleLoadError = React.useCallback((message: string) => {
    alert(`Template import failed: ${message}`);
  }, []);

  // -------------------------------------------------------------------------
  // Menu (save/load details)
  // -------------------------------------------------------------------------
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleSaveCaseDetails = () => {
    const fileName = `${title || "case-details"}-CaseDetails.json`;
    const json = JSON.stringify(caseDetails, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
    alert("Case details saved as JSON file.");
    handleMenuClose();
  };

  const handleLoadCaseDetails = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        setCaseDetails(json);
        alert("Case details loaded successfully.");
      } catch {
        alert("Failed to load case details. Ensure the file is a valid JSON.");
      }
    };
    reader.onerror = () => {
      alert("Could not read the file.");
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  return (
    <MessagingProvider >
      <>
        {/* ✅ Virtual Fiscal Drawer */}
        <VirtualFiscalDrawer open={fiscalOpen} onClose={() => setFiscalOpen(false)} />

        {/* Generate mode selection dialog */}
        <Dialog open={modeDialogOpen} onClose={handleCloseGenerateDialog} fullWidth maxWidth="sm">
          <DialogTitle>Generate Report</DialogTitle>
          <DialogContent dividers>
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                AI Mode
              </Typography>
              <Typography variant="body2" paragraph>
                Gumamit ng AI upang awtomatikong buuin ang buong ulat mula sa mga detalye ng kaso.
              </Typography>
              <Button variant="contained" fullWidth onClick={handleGenerateReportAIMode} disabled={isFetching}>
                Use AI Mode
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseGenerateDialog} disabled={isFetching}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Main layout */}
        <Slate
          editor={resultEditor}
          initialValue={initialResultValue}
          onChange={handleSlateChange}
        >
          <DocScaffoldLoad
            title={title}
            view={view}
            onViewChange={setView}
            onTitleChange={setTitle}
            onLoadTemplate={handleLoadTemplate}
            onClearPickedTemplate={handleClearTemplateCache}
            onLoadError={handleLoadError}
            onGenerateReport={handleOpenGenerateDialog}
            resultContent={<EditorComponent editor={resultEditor} />}
            detailsContent={<CaseDetailsForm />}
            moreOptions={
              <>
                <input
                  type="file"
                  accept="application/json"
                  style={{ display: "none" }}
                  id="load-case-details"
                  onChange={handleLoadCaseDetails}
                />

                {/* ✅ Open Virtual Fiscal */}
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleOpenFiscalDrawer}
                  sx={{ mr: 1 }}
                >
                  Virtual Fiscal
                </Button>

                <IconButton onClick={handleMenuOpen} aria-label="more options">
                  <MoreVertIcon />
                </IconButton>

                <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
                  <MenuItem onClick={handleSaveCaseDetails}>Save Case Report Detail</MenuItem>
                  <label htmlFor="load-case-details">
                    <MenuItem component="span">Load Case Report Detail</MenuItem>
                  </label>
                </Menu>
              </>
            }
          />
        </Slate>
      </>
    </MessagingProvider>
  );
};

export default ReportCreation;
