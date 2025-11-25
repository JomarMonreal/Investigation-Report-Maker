import * as React from "react";
import {
  Box,
  Button,
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

  const setField = React.useCallback(<K extends keyof PoliceCaseDetails>(key: K, next: PoliceCaseDetails[K]) => {
    onChange({ ...value, [key]: next });
  }, [onChange, value]); // Memoized to prevent re-creation on every render

  const touch = (k: keyof PoliceCaseDetails) =>
    setTouched((t) => ({ ...t, [k]: true }));

  const err = (k: keyof PoliceCaseDetails) =>
    touched[k] && !required(String(value[k] ?? ""));

  const addOfficerEvent = () => {
    setField("officerEvents", [
      ...value.officerEvents,
      { time: "", location: "", action: "", peopleInvolved: "", materialsUsed: "" }
    ]);
  };

  const removeOfficerEvent = (index: number) => {
    const updatedEvents = value.officerEvents.filter((_, i) => i !== index);
    setField("officerEvents", updatedEvents);
  };

  React.useEffect(() => {
    if (value.officerEvents.length === 0) {
      setField("officerEvents", [
        { time: "", location: "", action: "", peopleInvolved: "", materialsUsed: "" }
      ]);
    }
  }, [value.officerEvents.length, setField]); // Added missing dependencies

  return (
    <Box component="form" noValidate autoComplete="off">
      <Stack spacing={2}>
        {/* Officer Details */}
        <TextField
          label="Assigned Officer"
          value={value.assignedOfficer}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("assignedOfficer", e.target.value)}
          onBlur={() => touch("assignedOfficer")}
          error={!!err("assignedOfficer")}
          helperText={err("assignedOfficer") ? "Required" : " "}
          disabled={disabled}
          fullWidth
        />

        <TextField
          label="Badge Number"
          value={value.badgeNumber}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("badgeNumber", e.target.value)}
          onBlur={() => touch("badgeNumber")}
          error={!!err("badgeNumber")}
          helperText={err("badgeNumber") ? "Required" : " "}
          disabled={disabled}
          fullWidth
        />

        <TextField
          label="Arresting Officer Age"
          type="number"
          value={value.arrestingOfficerAge}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("arrestingOfficerAge", Number(e.target.value))}
          onBlur={() => touch("arrestingOfficerAge")}
          error={!!err("arrestingOfficerAge")}
          helperText={err("arrestingOfficerAge") ? "Required" : " "}
          disabled={disabled}
          fullWidth
        />

        <TextField
          label="Arresting Officer Station"
          value={value.arrestingOfficerStation}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("arrestingOfficerStation", e.target.value)}
          onBlur={() => touch("arrestingOfficerStation")}
          error={!!err("arrestingOfficerStation")}
          helperText={err("arrestingOfficerStation") ? "Required" : " "}
          disabled={disabled}
          fullWidth
        />

        <TextField
          label="Arresting Officer Home Address"
          value={value.arrestingOfficerHomeAddress}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("arrestingOfficerHomeAddress", e.target.value)}
          onBlur={() => touch("arrestingOfficerHomeAddress")}
          error={!!err("arrestingOfficerHomeAddress")}
          helperText={err("arrestingOfficerHomeAddress") ? "Required" : " "}
          disabled={disabled}
          fullWidth
        />

        <TextField
          label="Administering Officer"
          value={value.administeringOfficer}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("administeringOfficer", e.target.value)}
          onBlur={() => touch("administeringOfficer")}
          error={!!err("administeringOfficer")}
          helperText={err("administeringOfficer") ? "Required" : " "}
          disabled={disabled}
          fullWidth
        />

        {/* Case Details */}
        <TextField
          label="Case Number"
          value={value.caseNumber}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("caseNumber", e.target.value)}
          onBlur={() => touch("caseNumber")}
          error={!!err("caseNumber")}
          helperText={err("caseNumber") ? "Required" : " "}
          disabled={disabled}
          fullWidth
        />

        <TextField
          label="Case Title"
          value={value.caseTitle}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("caseTitle", e.target.value)}
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("date", e.target.value)}
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("time", e.target.value)}
            onBlur={() => touch("time")}
            error={!!err("time")}
            helperText={err("time") ? "Required" : " "}
            disabled={disabled}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Stack>

        <TextField
          label="Incident Type"
          value={value.incidentType}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("incidentType", e.target.value)}
          onBlur={() => touch("incidentType")}
          error={!!err("incidentType")}
          helperText={err("incidentType") ? "Required" : " "}
          disabled={disabled}
          fullWidth
        />

        <TextField
          label="Location"
          value={value.location}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("location", e.target.value)}
          onBlur={() => touch("location")}
          error={!!err("location")}
          helperText={err("location") ? "Required" : " "}
          disabled={disabled}
          fullWidth
        />

        <TextField
          label="Contact Number"
          value={value.contactNumber}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("contactNumber", e.target.value)}
          onBlur={() => touch("contactNumber")}
          error={!!err("contactNumber")}
          helperText={err("contactNumber") ? "Required" : " "}
          disabled={disabled}
          fullWidth
        />

        <TextField
          label="Involved Parties"
          value={value.involvedParties}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("involvedParties", e.target.value)}
          disabled={disabled}
          fullWidth
          multiline
          minRows={2}
          placeholder="List names; separate by commas or new lines."
        />

        <FormControl fullWidth disabled={disabled} error={!!err("priority")}>
          <InputLabel id="priority-label">Priority</InputLabel>
          <Select
            labelId="priority-label"
            label="Priority"
            value={value.priority}
            onChange={(e: React.ChangeEvent<{ value: unknown }>) => setField("priority", e.target.value as CasePriority)}
            onBlur={() => touch("priority")}
          >
            {priorities.map((p) => (
              <MenuItem key={p} value={p}>{p}</MenuItem>
            ))}
          </Select>
          <FormHelperText>{err("priority") ? "Required" : " "}</FormHelperText>
        </FormControl>

        <TextField
          label="Evidence Summary"
          value={value.evidenceSummary}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("evidenceSummary", e.target.value)}
          disabled={disabled}
          fullWidth
          multiline
          minRows={2}
        />

        {/* Officer Events */}
        {value.officerEvents.map((event, index) => (
          <Box key={index} sx={{ border: "1px solid #ccc", borderRadius: 2, padding: 2, marginBottom: 2 }}>
            <Stack spacing={2}>
              <TextField
                label={`Officer Event ${index + 1} Time`}
                type="time"
                value={event.time}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const updatedEvents = [...value.officerEvents];
                  updatedEvents[index].time = e.target.value;
                  setField("officerEvents", updatedEvents);
                }}
                disabled={disabled}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              <TextField
                label={`Officer Event ${index + 1} Location`}
                value={event.location}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const updatedEvents = [...value.officerEvents];
                  updatedEvents[index].location = e.target.value;
                  setField("officerEvents", updatedEvents);
                }}
                disabled={disabled}
                fullWidth
              />

              <TextField
                label={`Officer Event ${index + 1} Action`}
                value={event.action}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const updatedEvents = [...value.officerEvents];
                  updatedEvents[index].action = e.target.value;
                  setField("officerEvents", updatedEvents);
                }}
                disabled={disabled}
                fullWidth
              />

              <TextField
                label={`Officer Event ${index + 1} People Involved`}
                value={event.peopleInvolved}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const updatedEvents = [...value.officerEvents];
                  updatedEvents[index].peopleInvolved = e.target.value;
                  setField("officerEvents", updatedEvents);
                }}
                disabled={disabled}
                fullWidth
              />

              <TextField
                label={`Officer Event ${index + 1} Materials Used`}
                value={event.materialsUsed}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const updatedEvents = [...value.officerEvents];
                  updatedEvents[index].materialsUsed = e.target.value;
                  setField("officerEvents", updatedEvents);
                }}
                disabled={disabled}
                fullWidth
              />

              <Button
                variant="outlined"
                color="error"
                onClick={() => removeOfficerEvent(index)}
                disabled={disabled}
                fullWidth
              >
                Remove Officer Event
              </Button>
            </Stack>
          </Box>
        ))}

        <Button
          variant="contained"
          color="primary"
          onClick={addOfficerEvent}
          disabled={disabled}
          fullWidth
        >
          Add Officer Event
        </Button>

        {/* Narrative */}
        <TextField
          label="Narrative Details"
          value={value.narrative}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("narrative", e.target.value)}
          disabled={disabled}
          fullWidth
          multiline
          minRows={8}
          placeholder="Additional narrative details about the case."
        />
      </Stack>
    </Box>
  );
};
