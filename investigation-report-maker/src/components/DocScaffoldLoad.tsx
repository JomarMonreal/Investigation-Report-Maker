import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import DescriptionIcon from "@mui/icons-material/Description";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Chip,
  InputBase,
  Paper,
  Stack,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  TextField
} from "@mui/material";
import * as React from "react";
import { EditorToolbar } from "./Editor/EditorToolbar";
import type { CustomElement } from "../utils/slateHelpers";
import type { IsoDate, Time24h } from "../types/CaseDatails";

import { useCaseDetails } from "../hooks/useCaseDetails";
import css from "./CaseDetailsForm.module.css";

export type ReportView = "result" | "details";

export interface DocScaffoldLoadProps {
  readonly title: string;
  readonly resultContent?: React.ReactNode;
  readonly detailsContent?: React.ReactNode;
  readonly children?: React.ReactNode;
  readonly onTitleChange?: (next: string) => void;

  readonly onLoadTemplate?: (template: CustomElement[], info: { filename: string }) => void;
  readonly onLoadError?: (message: string) => void;
  /** Called when user clicks "x" on the picked-template chip. */
  readonly onClearPickedTemplate?: () => void;

  readonly onGenerateReport?: () => void;

  readonly view?: ReportView;
  readonly onViewChange?: (next: ReportView) => void;

  moreOptions?: React.ReactNode; // New prop for additional menu options
}

const DocScaffoldLoad: React.FC<DocScaffoldLoadProps> = ({
  title,
  resultContent,
  detailsContent,
  children,
  onTitleChange,
  onLoadTemplate,
  onLoadError,
  onClearPickedTemplate,
  onGenerateReport,
  view,
  onViewChange,
  moreOptions // Destructure the new prop
}) => {
  const { caseDetails, setCaseDetails } = useCaseDetails();

  const handleCaseFieldChange = <K extends keyof typeof caseDetails>(
    field: K,
    value: typeof caseDetails[K],
  ): void => {
    setCaseDetails({
      ...caseDetails,
      [field]: value,
    });
  }

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [internalView, setInternalView] = React.useState<ReportView>("result");
  const activeView = view ?? internalView;

  const [pickedTemplateName, setPickedTemplateName] = React.useState<string | null>(null);

  const reportError = React.useCallback(
    (msg: string) => (onLoadError ? onLoadError(msg) : console.error(msg)),
    [onLoadError]
  );

  const handlePickFile = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleClearPickedTemplate = React.useCallback(() => {
    setPickedTemplateName(null);
    onClearPickedTemplate?.(); // notify parent to reset its cache
  }, [onClearPickedTemplate]);

  const parseAsSlate = React.useCallback((text: string): CustomElement[] => {
    const data = JSON.parse(text);
    if (!Array.isArray(data)) throw new Error("Template root must be an array.");
    const ok = data.every(
      (el: { type: string; children: CustomElement[] }) =>
        typeof el === "object" &&
        el !== null &&
        "type" in el &&
        "children" in el &&
        Array.isArray(el.children)
    );
    if (!ok) throw new Error("Template shape is invalid for Slate.");
    return data as CustomElement[];
  }, []);

  const handleFileChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ""; // allow re-selecting the same file later
      if (!file) return;

      setPickedTemplateName(file.name); // show filename; do not auto-apply

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = String(reader.result ?? "");
          const template = parseAsSlate(text);
          onLoadTemplate?.(template, { filename: file.name }); // parent caches it
        } catch (err) {
          reportError(err instanceof Error ? err.message : "Failed to parse template.");
        }
      };
      reader.onerror = () => reportError("Could not read the file.");
      reader.readAsText(file);
    },
    [onLoadTemplate, parseAsSlate, reportError]
  );

  const handleViewChange = React.useCallback(
    (_: React.MouseEvent<HTMLElement>, next: ReportView | null) => {
      if (!next) return;
      onViewChange ? onViewChange(next) : setInternalView(next);
    },
    [onViewChange]
  );

  const body =
    activeView === "result" ? (resultContent ?? children) : (detailsContent ?? null);

  return (
    <Stack spacing={1.5}>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Row 1: Toggle */}
      <Stack direction="row" alignItems="center" justifyContent="space-around">
        <ToggleButtonGroup
          exclusive
          value={activeView}
          onChange={handleViewChange}
          aria-label="Report view"
          size="small"
        >
          <ToggleButton value="result" aria-label="Report Result" sx={{ fontSize: 16, px: 2 }}>
            Report Result
          </ToggleButton>
          <ToggleButton value="details" aria-label="Police Case Report Details" sx={{ fontSize: 16, px: 2 }}>
            Police Case Report Details
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* Row 2: Title + actions */}
      <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
        <InputBase
          inputProps={{ "aria-label": "Document title" }}
          sx={{ fontSize: 20, fontWeight: 700, px: 1, minWidth: 240, borderBottom: 1, borderColor: "divider" }}
          value={title}
          onChange={(e) => onTitleChange?.(e.target.value)}
          placeholder="Enter document title"
        />

        <Stack alignItems="center" direction="row" spacing={1}>
          {activeView === "details" && (
            <>
              {pickedTemplateName ? (
                <Chip
                  icon={<DescriptionIcon />}
                  label={pickedTemplateName}
                  size="small"
                  variant="outlined"
                  onDelete={handleClearPickedTemplate}
                  deleteIcon={<CloseIcon fontSize="small" />}
                  sx={{ maxWidth: 260 }}
                />
              ) : (
                <Tooltip title="Load a JSON template">
                  <Button
                    color="primary"
                    onClick={handlePickFile}
                    startIcon={<FolderOpenIcon />}
                    variant="outlined"
                  >
                    Load template
                  </Button>
                </Tooltip>
              )}

              <Tooltip title="Generate a report from details">
                <Button
                  color="primary"
                  onClick={onGenerateReport}
                  startIcon={<DescriptionIcon />}
                  variant="contained"
                >
                  Generate Report
                </Button>
              </Tooltip>
            </>
          )}

          {moreOptions && <div>{moreOptions}</div>} {/* Render additional menu options if provided */}

        </Stack>
      </Stack>
      <Stack className={css.inlineFields} direction="row" spacing={2}>
        <TextField
          className={css.field}
          label="Report Date (YYYY-MM-DD)"
          value={caseDetails.reportDate}
          onChange={(event) =>
            handleCaseFieldChange('reportDate', event.target.value as IsoDate)
          }
          fullWidth
          size="small"
        />
        <TextField
          className={css.field}
          label="Report Time (HH:MM)"
          value={caseDetails.reportTime}
          onChange={(event) =>
            handleCaseFieldChange('reportTime', event.target.value as Time24h)
          }
          fullWidth
          size="small"
        />
      </Stack>

        <hr  />
      <EditorToolbar />

      <Stack direction="row" spacing={1.5} sx={{ minHeight: 560 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Paper elevation={0} sx={{ border: 1, borderColor: "divider", mx: "auto", p: 4 }}>
            {body}
          </Paper>
        </Box>
      </Stack>

    </Stack>
  );
};

export default DocScaffoldLoad;
