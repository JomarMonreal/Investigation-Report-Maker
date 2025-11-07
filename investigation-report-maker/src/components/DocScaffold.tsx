import MoreVertIcon from "@mui/icons-material/MoreVert";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { Save } from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Tooltip
} from "@mui/material";
import * as React from "react";
import { EditorToolbar } from "./Editor/EditorToolbar";
import type { CustomElement } from "../utils/slateHelpers";

export interface DocScaffoldProps {
  readonly title: string;
  readonly children?: React.ReactNode; // typically your EditorComponent
  readonly onSaveTemplate?: () => void;
  readonly onTitleChange?: (next: string) => void;

  /** Fired after a JSON template is loaded and parsed. */
  readonly onLoadTemplate?: (template: CustomElement[], info: { filename: string }) => void;
  /** Optional error sink for load failures. */
  readonly onLoadError?: (message: string) => void;
}

const DocScaffold: React.FC<DocScaffoldProps> = ({
  title,
  children,
  onSaveTemplate,
  onTitleChange,
  onLoadTemplate,
  onLoadError
}) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const reportError = React.useCallback(
    (msg: string) => (onLoadError ? onLoadError(msg) : console.error(msg)),
    [onLoadError]
  );

  const parseAsSlate = React.useCallback((text: string): CustomElement[] => {
    const data = JSON.parse(text);
    if (!Array.isArray(data)) throw new Error("Template root must be an array.");
    const ok = data.every(
      (el) =>
        typeof el === "object" &&
        el !== null &&
        "type" in el &&
        "children" in el &&
        Array.isArray((el as any).children)
    );
    if (!ok) throw new Error("Template shape is invalid for Slate.");
    return data as CustomElement[];
  }, []);

  const handlePickFile = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ""; // allow re-selecting the same file later
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = String(reader.result ?? "");
          const template = parseAsSlate(text);
          onLoadTemplate?.(template, { filename: file.name });
        } catch (err) {
          reportError(err instanceof Error ? err.message : "Failed to parse template.");
        }
      };
      reader.onerror = () => reportError("Could not read the file.");
      reader.readAsText(file);
    },
    [onLoadTemplate, parseAsSlate, reportError]
  );

  return (
    <Stack spacing={1.5}>
      {/* Hidden file input for loading templates */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Title Row */}
      <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
        <Stack alignItems="center" direction="row" spacing={1.25}>
          <InputBase
            inputProps={{ "aria-label": "Document title" }}
            sx={{ fontSize: 20, fontWeight: 700, px: 1, minWidth: 240, borderBottom: 1, borderColor: "divider" }}
            value={title}
            onChange={(e) => onTitleChange?.(e.target.value)}
            placeholder="Enter document title"
          />
        </Stack>

        <Stack alignItems="center" direction="row" spacing={1}>
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

          <Tooltip title="Save current content as a JSON template">
            <Button
              color="primary"
              onClick={onSaveTemplate}
              startIcon={<Save />}
              variant="contained"
            >
              Save as template
            </Button>
          </Tooltip>

          <Tooltip title="More">
            <IconButton aria-label="More actions">
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <EditorToolbar />

      {/* Body */}
      <Stack direction="row" spacing={1.5} sx={{ minHeight: 560 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Paper elevation={0} sx={{ border: 1, borderColor: "divider", mx: "auto", p: 4 }}>
            {children}
          </Paper>
        </Box>
      </Stack>
    </Stack>
  );
};

export default DocScaffold;
