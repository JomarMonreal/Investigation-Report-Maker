import * as React from "react";
import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField
} from "@mui/material";
import type { PoliceCaseDetails, CasePriority } from "../types/PoliceCaseDetails";

export interface PoliceCaseDetailsFormProps {
  readonly value: PoliceCaseDetails;
  readonly onChange: (next: PoliceCaseDetails) => void;
  readonly disabled?: boolean;
}

const required = (s: string) => s.trim().length > 0;

const priorities: CasePriority[] = ["Low", "Medium", "High", "Critical"];

export const PoliceCaseDetailsForm: React.FC<PoliceCaseDetailsFormProps> = ({
  value,
  onChange,
  disabled
}) => {
  const [touched, setTouched] = React.useState<Record<keyof PoliceCaseDetails, boolean>>({});

  const setField = <K extends keyof PoliceCaseDetails>(key: K, next: PoliceCaseDetails[K]) =>
    onChange({ ...value, [key]: next });

  const touch = (k: keyof PoliceCaseDetails) =>
    setTouched((t) => ({ ...t, [k]: true }));

  const err = (k: keyof PoliceCaseDetails) =>
    touched[k] && !required(String(value[k] ?? ""));

  return (
    <Box component="form" noValidate autoComplete="off">
      <Stack spacing={2}>
        {/* Alphabetical by label for quick scanning */}
        <TextField
          label="Assigned Officer"
          value={value.assignedOfficer}
          onChange={(e) => setField("assignedOfficer", e.target.value)}
          onBlur={() => touch("assignedOfficer")}
          error={!!err("assignedOfficer")}
          helperText={err("assignedOfficer") ? "Required" : " "}
          disabled={disabled}
          fullWidth
        />

        <TextField
          label="Badge Number"
          value={value.badgeNumber}
          onChange={(e) => setField("badgeNumber", e.target.value)}
          onBlur={() => touch("badgeNumber")}
          error={!!err("badgeNumber")}
          helperText={err("badgeNumber") ? "Required" : " "}
          disabled={disabled}
          fullWidth
        />

        <TextField
          label="Case Number"
          value={value.caseNumber}
          onChange={(e) => setField("caseNumber", e.target.value)}
          onBlur={() => touch("caseNumber")}
          error={!!err("caseNumber")}
          helperText={err("caseNumber") ? "Required" : " "}
          disabled={disabled}
          fullWidth
        />

        <TextField
          label="Case Title"
          value={value.caseTitle}
          onChange={(e) => setField("caseTitle", e.target.value)}
          onBlur={() => touch("caseTitle")}
          error={!!err("caseTitle")}
          helperText={err("caseTitle") ? "Required" : " "}
          disabled={disabled}
          fullWidth
        />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Date"
            type="date"
            value={value.date}
            onChange={(e) => setField("date", e.target.value)}
            onBlur={() => touch("date")}
            error={!!err("date")}
            helperText={err("date") ? "Required" : " "}
            disabled={disabled}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Time"
            type="time"
            value={value.time}
            onChange={(e) => setField("time", e.target.value)}
            onBlur={() => touch("time")}
            error={!!err("time")}
            helperText={err("time") ? "Required" : " "}
            disabled={disabled}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Stack>

        <TextField
          label="Contact Number"
          value={value.contactNumber}
          onChange={(e) => setField("contactNumber", e.target.value)}
          onBlur={() => touch("contactNumber")}
          error={!!err("contactNumber")}
          helperText={err("contactNumber") ? "Required" : " "}
          disabled={disabled}
          fullWidth
        />

        <TextField
          label="Evidence Summary"
          value={value.evidenceSummary}
          onChange={(e) => setField("evidenceSummary", e.target.value)}
          disabled={disabled}
          fullWidth
          multiline
          minRows={2}
        />

        <TextField
          label="Incident Type"
          value={value.incidentType}
          onChange={(e) => setField("incidentType", e.target.value)}
          onBlur={() => touch("incidentType")}
          error={!!err("incidentType")}
          helperText={err("incidentType") ? "Required" : " "}
          disabled={disabled}
          fullWidth
        />

        <TextField
          label="Involved Parties"
          value={value.involvedParties}
          onChange={(e) => setField("involvedParties", e.target.value)}
          disabled={disabled}
          fullWidth
          multiline
          minRows={2}
          placeholder="List names; separate by commas or new lines."
        />

        <TextField
          label="Location"
          value={value.location}
          onChange={(e) => setField("location", e.target.value)}
          onBlur={() => touch("location")}
          error={!!err("location")}
          helperText={err("location") ? "Required" : " "}
          disabled={disabled}
          fullWidth
        />

        <FormControl fullWidth disabled={disabled} error={!!err("priority")}>
          <InputLabel id="priority-label">Priority</InputLabel>
          <Select
            labelId="priority-label"
            label="Priority"
            value={value.priority}
            onChange={(e) => setField("priority", e.target.value as CasePriority)}
            onBlur={() => touch("priority")}
          >
            {priorities.map((p) => (
              <MenuItem key={p} value={p}>{p}</MenuItem>
            ))}
          </Select>
          <FormHelperText>{err("priority") ? "Required" : " "}</FormHelperText>
        </FormControl>

        <TextField
          label="Reporting Person"
          value={value.reportingPerson}
          onChange={(e) => setField("reportingPerson", e.target.value)}
          onBlur={() => touch("reportingPerson")}
          error={!!err("reportingPerson")}
          helperText={err("reportingPerson") ? "Required" : " "}
          disabled={disabled}
          fullWidth
        />

        {/* Big narrative box */}
        <TextField
          label="Narrative / Case Details"
          value={value.narrative}
          onChange={(e) => setField("narrative", e.target.value)}
          disabled={disabled}
          fullWidth
          multiline
          minRows={8}
          placeholder="Provide a clear, chronological account of the incident. Include who, what, when, where, why, and how."
        />
      </Stack>
    </Box>
  );
};
