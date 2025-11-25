import * as React from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Autocomplete,
  createFilterOptions,
  Typography,
  Divider
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import type { PoliceCaseDetails, CasePriority } from "../types/PoliceCaseDetails";
import { usePoliceOfficerContext } from "../context/PoliceOfficerContext";
import { useNavigate } from "react-router-dom";

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
  const [touched, setTouched] = React.useState<
    Partial<Record<keyof PoliceCaseDetails, boolean>>
  >({});
  const { officers } = usePoliceOfficerContext();
  const navigate = useNavigate();

  const handleAddNewOfficer = () => {
    navigate("/police-officer-management");
  };

  const setField = React.useCallback(
    <K extends keyof PoliceCaseDetails>(key: K, next: PoliceCaseDetails[K]) => {
      onChange({ ...value, [key]: next });
    },
    [onChange, value]
  );

  const err = (k: keyof PoliceCaseDetails) =>
    touched[k] && !required(String(value[k] ?? ""));

  const addOfficerEvent = () => {
    setField("officerEvents", [
      ...value.officerEvents,
      { time: "", location: "", action: "", peopleInvolved: "", materialsUsed: "" }
    ]);
  };

  const removeOfficerEvent = (index: number) => {
    const updatedEvents = value.officerEvents.filter((_, i: number) => i !== index);
    setField("officerEvents", updatedEvents);
  };

  React.useEffect(() => {
    if (value.officerEvents.length === 0) {
      setField("officerEvents", [
        { time: "", location: "", action: "", peopleInvolved: "", materialsUsed: "" }
      ]);
    }
  }, [value.officerEvents.length, setField]);

  const incidentTypes = [
    "Assault",
    "Carnapping",
    "Cybercrime",
    "Domestic Violence",
    "Fraud",
    "Homicide",
    "Human Trafficking",
    "Illegal Drugs",
    "Kidnapping",
    "Murder",
    "Physical Injury",
    "Robbery",
    "Theft",
    "Vandalism"
  ];

  const filter = createFilterOptions<string>();

  return (
    <Box component="form" noValidate autoComplete="off">
      <Stack spacing={3}>
        {/* Case Information */}
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Case Information
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Stack spacing={2}>
            <TextField
              label="Case Title"
              value={value.caseTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setField("caseTitle", e.target.value)
              }
              onBlur={() => setTouched((t) => ({ ...t, caseTitle: true }))}
              error={!!err("caseTitle")}
              helperText={err("caseTitle") ? "Required" : " "}
              disabled={disabled}
              fullWidth
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Case Number"
                value={value.caseNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setField("caseNumber", e.target.value)
                }
                onBlur={() => setTouched((t) => ({ ...t, caseNumber: true }))}
                error={!!err("caseNumber")}
                helperText={err("caseNumber") ? "Required" : " "}
                disabled={disabled}
                fullWidth
              />

              <FormControl fullWidth disabled={disabled} error={!!err("priority")}>
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  label="Priority"
                  value={value.priority}
                  onChange={(e: SelectChangeEvent<CasePriority>) =>
                    setField("priority", e.target.value as CasePriority)
                  }
                  onBlur={() => setTouched((t) => ({ ...t, priority: true }))}
                >
                  {priorities.map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Date"
                type="date"
                value={value.date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setField("date", e.target.value)
                }
                onBlur={() => setTouched((t) => ({ ...t, date: true }))}
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setField("time", e.target.value)
                }
                onBlur={() => setTouched((t) => ({ ...t, time: true }))}
                error={!!err("time")}
                helperText={err("time") ? "Required" : " "}
                disabled={disabled}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>

            <Autocomplete
              freeSolo
              options={incidentTypes}
              filterOptions={(options, params) => {
                const filtered = filter(options, params);

                if (params.inputValue !== "" && !options.includes(params.inputValue)) {
                  filtered.push(params.inputValue);
                }

                return filtered;
              }}
              value={value.incidentType}
              onChange={(_, newValue) => {
                setField("incidentType", newValue || "");
              }}
              renderInput={(params) => (
                <TextField {...params} label="Incident Type" fullWidth />
              )}
              disabled={disabled}
            />

            <TextField
              label="Location"
              value={value.location}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setField("location", e.target.value)
              }
              onBlur={() => setTouched((t) => ({ ...t, location: true }))}
              error={!!err("location")}
              helperText={err("location") ? "Required" : " "}
              disabled={disabled}
              fullWidth
            />
          </Stack>
        </Box>

        {/* Officers */}
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Officers
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Stack spacing={2}>
            <Autocomplete
              options={[...officers.map((o) => o.name), "+ Add New Officer"]}
              value={value.assignedOfficer}
              onChange={(_, newValue) => {
                if (newValue === "+ Add New Officer") {
                  handleAddNewOfficer();
                } else {
                  setField("assignedOfficer", newValue || "");
                }
              }}
              renderInput={(params) => (
                <TextField {...params} label="Arresting Officer" fullWidth />
              )}
              disabled={disabled}
            />

            <Autocomplete
              options={[...officers.map((o) => o.name), "+ Add New Officer"]}
              value={value.administeringOfficer}
              onChange={(_, newValue) => {
                if (newValue === "+ Add New Officer") {
                  handleAddNewOfficer();
                } else {
                  setField("administeringOfficer", newValue || "");
                }
              }}
              renderInput={(params) => (
                <TextField {...params} label="Administering Officer" fullWidth />
              )}
              disabled={disabled}
            />
          </Stack>
        </Box>

        {/* Suspect Details */}
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Suspect Details
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Stack spacing={2}>
            <TextField
              label="Suspect Name"
              value={value.suspectName}
              onChange={(e) => setField("suspectName", e.target.value)}
              disabled={disabled}
              fullWidth
            />
            <TextField
              label="Suspect Occupation"
              value={value.suspectOccupation}
              onChange={(e) => setField("suspectOccupation", e.target.value)}
              disabled={disabled}
              fullWidth
            />
            <TextField
              label="Suspect Home Address"
              value={value.suspectHomeAddress}
              onChange={(e) => setField("suspectHomeAddress", e.target.value)}
              disabled={disabled}
              fullWidth
            />
            <TextField
              label="Suspect Events"
              value={value.suspectEvents}
              onChange={(e) => setField("suspectEvents", e.target.value)}
              disabled={disabled}
              fullWidth
              multiline
              minRows={3}
              placeholder="Describe events related to the suspect."
            />
          </Stack>
        </Box>

        {/* Involved Parties & Evidence */}
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Involved Parties & Evidence
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Stack spacing={2}>
            <TextField
              label="Involved Parties"
              value={value.involvedParties}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setField("involvedParties", e.target.value)
              }
              disabled={disabled}
              fullWidth
              multiline
              minRows={2}
              placeholder="List names; separate by commas or new lines."
            />

            <TextField
              label="Evidence Summary"
              value={value.evidenceSummary}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setField("evidenceSummary", e.target.value)
              }
              disabled={disabled}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </Box>

        {/* Officer Events */}
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Officer Events
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Stack spacing={2}>
            {value.officerEvents.map((event, index) => (
              <Box
                key={index}
                sx={{
                  border: "1px solid #ccc",
                  borderRadius: 2,
                  padding: 2
                }}
              >
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
          </Stack>
        </Box>

        {/* Narrative */}
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Additional Details
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <TextField
            label="Additional Details"
            value={value.narrative}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setField("narrative", e.target.value)
            }
            disabled={disabled}
            fullWidth
            multiline
            minRows={8}
            placeholder="Additional narrative details about the case."
          />
        </Box>
      </Stack>
    </Box>
  );
};
