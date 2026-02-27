import * as React from "react";
import { Slate, withReact } from "slate-react";
import { createEditor, Editor, Transforms, type Descendant } from "slate";
import type { CustomElement } from "../utils/slateHelpers";
import type {
  CaseDetails,
  Officer,
  PhilippineAddress,
  PoliceStation,
  PoseurBuyer,
  Witness,
} from "../types/CaseDatails";
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

type AffidavitKind = "poseur-buyer" | "complainant" | "witness";

const AFFIDAVIT_ENDPOINT: Record<AffidavitKind, string> = {
  "poseur-buyer": "/api/generate/poseur-buyer",
  complainant: "/api/generate/complainant",
  witness: "/api/generate/witness",
};

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_24H_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

const hasText = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const addRequiredText = (missing: string[], label: string, value: unknown): void => {
  if (!hasText(value)) {
    missing.push(label);
  }
};

const addRequiredDate = (missing: string[], label: string, value: unknown): void => {
  if (!hasText(value) || !ISO_DATE_RE.test(value.trim())) {
    missing.push(`${label} (YYYY-MM-DD)`);
  }
};

const addRequiredTime = (missing: string[], label: string, value: unknown): void => {
  if (!hasText(value) || !TIME_24H_RE.test(value.trim())) {
    missing.push(`${label} (HH:MM 24-hour)`);
  }
};

const validateAddress = (
  missing: string[],
  address: PhilippineAddress | undefined,
  labelPrefix: string,
): void => {
  addRequiredText(missing, `${labelPrefix} barangay`, address?.barangay);
  addRequiredText(missing, `${labelPrefix} city/municipality`, address?.cityOrMunicipality);
  addRequiredText(missing, `${labelPrefix} province`, address?.province);
};

const validateOfficer = (
  missing: string[],
  officer: Officer | PoseurBuyer | undefined,
  labelPrefix: string,
): void => {
  addRequiredText(missing, `${labelPrefix} full name`, officer?.fullName);
  addRequiredText(missing, `${labelPrefix} address`, officer?.address);
  addRequiredText(missing, `${labelPrefix} rank/position`, officer?.rankOrPosition);
  addRequiredText(missing, `${labelPrefix} unit/station`, officer?.unitOrStation);
  addRequiredText(missing, `${labelPrefix} badge number`, officer?.badgeNumber);
};

const validateWitness = (
  missing: string[],
  witness: Witness,
  witnessNumber: number,
): void => {
  const prefix = `Witness ${witnessNumber}`;
  addRequiredText(missing, `${prefix} full name`, witness.fullName);
  addRequiredText(missing, `${prefix} address`, witness.address);
  addRequiredText(missing, `${prefix} location during incident`, witness.locationDuringIncident);
  addRequiredText(missing, `${prefix} observation narrative`, witness.observationNarrative);
};

const validatePoliceStation = (
  missing: string[],
  station: PoliceStation | undefined,
): void => {
  addRequiredText(missing, "Police station name", station?.name);
  validateAddress(missing, station?.address, "Police station address");
};

const validateCaseDetailsForAffidavit = (
  details: CaseDetails,
  station: PoliceStation,
  kind: AffidavitKind,
): string[] => {
  const missing: string[] = [];

  addRequiredText(missing, "Case number", details.caseNumber);
  addRequiredText(missing, "Case title", details.caseTitle);
  addRequiredDate(missing, "Incident date", details.incidentDate);
  addRequiredTime(missing, "Incident time", details.incidentTime);
  addRequiredText(missing, "Incident type", details.incidentType);
  addRequiredText(missing, "Investigating unit", details.investigatingUnit);
  validateAddress(missing, details.incidentLocation, "Incident location");

  validateOfficer(missing, details.assignedOfficer, "Assigned officer");

  addRequiredText(missing, "Complainant full name", details.complainant?.fullName);
  addRequiredText(missing, "Complainant address", details.complainant?.address);

  addRequiredText(missing, "Evidence summary", details.evidenceSummary);
  addRequiredText(missing, "Incident summary", details.incidentSummary);
  addRequiredText(missing, "Full narrative", details.narrative);

  validatePoliceStation(missing, station);

  if (kind === "witness") {
    if (!Array.isArray(details.witnesses) || details.witnesses.length === 0) {
      missing.push("At least one witness");
    } else {
      details.witnesses.forEach((witness, index) => {
        validateWitness(missing, witness, index + 1);
      });
    }
  }

  if (kind === "poseur-buyer") {
    if (!details.poseurBuyer) {
      missing.push("Poseur buyer details");
    } else {
      validateOfficer(missing, details.poseurBuyer, "Poseur buyer");
    }
  }

  return Array.from(new Set(missing));
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

  const handleOpenGenerateDialog = React.useCallback(() => {
    setModeDialogOpen(true);
  }, []);

  const handleCloseGenerateDialog = React.useCallback(() => {
    setModeDialogOpen(false);
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

  const handleGenerateByKind = React.useCallback(async (kind: AffidavitKind) => {
    if (isGeneratingRef.current) return;

    const stationPayload =
      policeStation && typeof policeStation.address === "object" && policeStation.address
        ? policeStation
        : caseDetails.policeStation;

    const missing = validateCaseDetailsForAffidavit(caseDetails, stationPayload, kind);
    if (missing.length > 0) {
      setModeDialogOpen(false);
      setView("details");
      alert(
        `Please fill out these required fields first:\n\n${missing
          .map((field) => `- ${field}`)
          .join("\n")}`,
      );
      return;
    }

    isGeneratingRef.current = true;
    setModeDialogOpen(false);

    try {
      setIsFetching(true);

      const httpResponse = await fetch(AFFIDAVIT_ENDPOINT[kind], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseDetails, policeStation: stationPayload, systemPrompt }),
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
      alert(`Failed to generate ${kind} affidavit: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      isGeneratingRef.current = false;
      setIsFetching(false);
    }
  }, [caseDetails, policeStation, resultEditor, setIsFetching, setSlateValue, title]);

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
                onClick={() => void handleGenerateByKind("complainant")}
                disabled={isFetching}
              >
                Generate affidavit of complainant
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={() => void handleGenerateByKind("witness")}
                disabled={isFetching}
              >
                Generate affidavit of witness
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={() => void handleGenerateByKind("poseur-buyer")}
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
