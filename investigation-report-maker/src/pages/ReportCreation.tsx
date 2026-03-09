import * as React from "react";
import { Slate, withReact } from "slate-react";
import { createEditor, Editor, Transforms, type Descendant } from "slate";
import type { CustomElement } from "../utils/slateHelpers";
import type { PoliceStation } from "../types/CaseDatails";
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
  TextField,
  Typography,
  Stack,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CaseDetailsForm from "../components/CaseDetailsForm";
import { useCaseDetails } from "../hooks/useCaseDetails";
import { usePoliceOfficer } from "../hooks/usePoliceOfficer";
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

type AffidavitKind = "poseur-buyer" | "complainant" | "witness" | "arresting-officer";
type AffiantSelectionKind = "witness" | "arresting-officer";

const AFFIDAVIT_ENDPOINT: Record<AffidavitKind, string> = {
  "poseur-buyer": "/api/generate/poseur-buyer",
  complainant: "/api/generate/complainant",
  witness: "/api/generate/witness",
  "arresting-officer": "/api/generate/arresting-officer",
};

const formatAffidavitKind = (kind: AffidavitKind): string => {
  switch (kind) {
    case "poseur-buyer":
      return "poseur buyer";
    case "complainant":
      return "complainant";
    case "witness":
      return "witness";
    case "arresting-officer":
      return "arresting officer";
    default:
      return "selected";
  }
};

const sanitizeFilenameSegment = (value: string, fallback: string): string => {
  const withoutIllegalChars = value
    .trim()
    .replace(/[<>:"/\\|?*]+/g, "-");
  const withoutControlChars = Array.from(withoutIllegalChars)
    .filter((char) => char.charCodeAt(0) >= 32)
    .join("");
  const normalized = withoutControlChars
    .replace(/\s+/g, " ")
    .trim();
  return normalized.length > 0 ? normalized : fallback;
};

const ReportCreation: React.FC = () => {
  const [title, setTitle] = React.useState<string>("Untitled Report");
  const [view, setView] = React.useState<ReportView>("details");

  const [fiscalOpen, setFiscalOpen] = React.useState<boolean>(false);

  const [resultEditor] = React.useState(() => withReact(createEditor()));
  const initialResultValue = React.useMemo<CustomElement[]>(() => [
    { type: "paragraph", children: [{ text: "Start typing or load a template..." }] },
  ], []);
  const latestResultValueRef = React.useRef<CustomElement[]>(initialResultValue);
  const isGeneratingRef = React.useRef(false);

  const { caseDetails, setCaseDetails, setIsFetching, setSlateValue, isFetching } = useCaseDetails();
  const { policeStation } = usePoliceOfficer();

  const [modeDialogOpen, setModeDialogOpen] = React.useState<boolean>(false);
  const [selectionDialogKind, setSelectionDialogKind] = React.useState<AffiantSelectionKind | null>(null);
  const [selectedWitnessIndex, setSelectedWitnessIndex] = React.useState<number>(0);
  const [selectedArrestingOfficerIndex, setSelectedArrestingOfficerIndex] = React.useState<number>(0);
  const [hasGeneratedReport, setHasGeneratedReport] = React.useState<boolean>(false);

  React.useEffect(() => {
    const maxWitnessIndex = Math.max(caseDetails.witnesses.length - 1, 0);
    if (selectedWitnessIndex > maxWitnessIndex) {
      setSelectedWitnessIndex(maxWitnessIndex);
    }
  }, [caseDetails.witnesses.length, selectedWitnessIndex]);

  React.useEffect(() => {
    const maxOfficerIndex = Math.max(caseDetails.arrestingOfficers.length - 1, 0);
    if (selectedArrestingOfficerIndex > maxOfficerIndex) {
      setSelectedArrestingOfficerIndex(maxOfficerIndex);
    }
  }, [caseDetails.arrestingOfficers.length, selectedArrestingOfficerIndex]);

  const getStationPayload = React.useCallback(
    (): PoliceStation =>
      policeStation && typeof policeStation.address === "object" && policeStation.address
        ? policeStation
        : caseDetails.policeStation,
    [caseDetails.policeStation, policeStation],
  );

  const handleOpenGenerateDialog = React.useCallback(() => {
    setModeDialogOpen(true);
    setSelectionDialogKind(null);
  }, []);

  const handleCloseGenerateDialog = React.useCallback(() => {
    setModeDialogOpen(false);
    setSelectionDialogKind(null);
  }, []);

  const handleCloseSelectionDialog = React.useCallback(() => {
    setSelectionDialogKind(null);
    setModeDialogOpen(true);
  }, []);

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

  const handleGenerateByKind = React.useCallback(async (
    kind: AffidavitKind,
    options?: {
      witnessIndex?: number;
      arrestingOfficerIndex?: number;
    },
  ) => {
    if (isGeneratingRef.current) return;

    const stationPayload = getStationPayload();

    isGeneratingRef.current = true;
    setModeDialogOpen(false);
    setSelectionDialogKind(null);

    try {
      setIsFetching(true);

      const requestPayload: Record<string, unknown> = {
        caseDetails,
        policeStation: stationPayload,
        systemPrompt,
      };
      if (kind === "witness" && typeof options?.witnessIndex === "number") {
        requestPayload.witnessIndex = options.witnessIndex;
      }
      if (kind === "arresting-officer" && typeof options?.arrestingOfficerIndex === "number") {
        requestPayload.arrestingOfficerIndex = options.arrestingOfficerIndex;
      }

      const httpResponse = await fetch(AFFIDAVIT_ENDPOINT[kind], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
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
      setHasGeneratedReport(true);
    } catch (err) {
      if (isServerUnavailable(err)) {
        await sleep(1000);
      }
      alert(`Failed to generate ${formatAffidavitKind(kind)} affidavit: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      isGeneratingRef.current = false;
      setIsFetching(false);
    }
  }, [caseDetails, getStationPayload, resultEditor, setIsFetching, setSlateValue, title]);

  const handleSelectAffidavitKind = React.useCallback((kind: AffidavitKind) => {
    if (kind === "witness") {
      if (caseDetails.witnesses.length === 0) {
        void handleGenerateByKind("witness");
        return;
      }
      setSelectionDialogKind("witness");
      setModeDialogOpen(false);
      return;
    }

    if (kind === "arresting-officer") {
      if (caseDetails.arrestingOfficers.length === 0) {
        void handleGenerateByKind("arresting-officer");
        return;
      }
      setSelectionDialogKind("arresting-officer");
      setModeDialogOpen(false);
      return;
    }

    void handleGenerateByKind(kind);
  }, [caseDetails.arrestingOfficers.length, caseDetails.witnesses.length, handleGenerateByKind]);

  const handleGenerateSelectedAffiant = React.useCallback(() => {
    if (selectionDialogKind === "witness") {
      void handleGenerateByKind("witness", { witnessIndex: selectedWitnessIndex });
      return;
    }
    if (selectionDialogKind === "arresting-officer") {
      void handleGenerateByKind("arresting-officer", {
        arrestingOfficerIndex: selectedArrestingOfficerIndex,
      });
    }
  }, [
    handleGenerateByKind,
    selectedArrestingOfficerIndex,
    selectedWitnessIndex,
    selectionDialogKind,
  ]);

  const handleLoadError = React.useCallback((message: string) => {
    alert(`Template import failed: ${message}`);
  }, []);

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

  const handleSaveGeneratedReport = () => {
    if (!hasGeneratedReport) {
      alert("Generate a report first before saving it as JSON.");
      handleMenuClose();
      return;
    }

    const fileNameBase = sanitizeFilenameSegment(
      title || caseDetails.caseTitle || "generated-report",
      "generated-report",
    );
    const fileName = `${fileNameBase}-GeneratedReport.json`;
    const json = JSON.stringify(latestResultValueRef.current, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
    alert("Generated report saved as JSON file.");
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

  const selectionOptions = React.useMemo(() => {
    if (selectionDialogKind === "witness") {
      return caseDetails.witnesses.map((witness, index) => ({
        label: witness.fullName?.trim() ? `${index + 1}. ${witness.fullName}` : `${index + 1}. Witness (unnamed)`,
        value: index,
      }));
    }
    if (selectionDialogKind === "arresting-officer") {
      return caseDetails.arrestingOfficers.map((officer, index) => ({
        label: officer.fullName?.trim()
          ? `${index + 1}. ${officer.fullName}`
          : `${index + 1}. Arresting Officer (unnamed)`,
        value: index,
      }));
    }
    return [];
  }, [caseDetails.arrestingOfficers, caseDetails.witnesses, selectionDialogKind]);

  const selectedAffiantIndex =
    selectionDialogKind === "witness" ? selectedWitnessIndex : selectedArrestingOfficerIndex;

  return (
    <MessagingProvider>
      <>
        <VirtualFiscalDrawer open={fiscalOpen} onClose={() => setFiscalOpen(false)} />

        <Dialog open={modeDialogOpen} onClose={handleCloseGenerateDialog} fullWidth maxWidth="sm">
          <DialogTitle>Generate Affidavit</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1">
                Select affidavit to generate
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => handleSelectAffidavitKind("complainant")}
                disabled={isFetching}
              >
                Generate affidavit of complainant
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={() => handleSelectAffidavitKind("witness")}
                disabled={isFetching}
              >
                Generate affidavit of witness
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={() => handleSelectAffidavitKind("arresting-officer")}
                disabled={isFetching}
              >
                Generate affidavit of arresting officer
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={() => handleSelectAffidavitKind("poseur-buyer")}
                disabled={isFetching}
              >
                Generate affidavit of poseur buyer
              </Button>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseGenerateDialog} disabled={isFetching}>Close</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={selectionDialogKind !== null}
          onClose={handleCloseSelectionDialog}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            {selectionDialogKind === "witness"
              ? "Select Witness"
              : "Select Arresting Officer"}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1">
                {selectionDialogKind === "witness"
                  ? "Choose which witness affidavit to generate."
                  : "Choose which arresting officer affidavit to generate."}
              </Typography>
              <TextField
                label={selectionDialogKind === "witness" ? "Witness" : "Arresting Officer"}
                select
                fullWidth
                size="small"
                value={selectedAffiantIndex}
                onChange={(event) => {
                  const selectedIndex = Number(event.target.value);
                  if (!Number.isInteger(selectedIndex)) return;
                  if (selectionDialogKind === "witness") {
                    setSelectedWitnessIndex(selectedIndex);
                    return;
                  }
                  if (selectionDialogKind === "arresting-officer") {
                    setSelectedArrestingOfficerIndex(selectedIndex);
                  }
                }}
              >
                {selectionOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              {selectionOptions.length === 0 && (
                <Typography color="text.secondary" variant="body2">
                  No available entries yet. Add one from Case Details first.
                </Typography>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseSelectionDialog} disabled={isFetching}>Back</Button>
            <Button
              variant="contained"
              onClick={handleGenerateSelectedAffiant}
              disabled={isFetching || selectionOptions.length === 0}
            >
              Generate
            </Button>
          </DialogActions>
        </Dialog>

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
                  <MenuItem
                    onClick={handleSaveGeneratedReport}
                    disabled={!hasGeneratedReport || isFetching}
                  >
                    Save Generated Report
                  </MenuItem>
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
