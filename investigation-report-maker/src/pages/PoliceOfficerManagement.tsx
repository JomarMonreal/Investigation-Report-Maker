import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Autocomplete,
} from "@mui/material";
import { usePoliceOfficer } from "../hooks/usePoliceOfficer";
import type { Officer, Sex } from "../types/CaseDatails";

const ranks = [
  // Commissioned Officers
  "Police General (PGEN)",
  "Police Lieutenant General (PLTGEN)",
  "Police Major General (PMGEN)",
  "Police Brigadier General (PBGEN)",
  "Police Colonel (PCOL)",
  "Police Lieutenant Colonel (PLTCOL)",
  "Police Major (PMAJ)",
  "Police Captain (PCPT)",
  "Police Lieutenant (PLT)",
  // Non-Commissioned Officers
  "Police Executive Master Sergeant (PEMS)",
  "Police Chief Master Sergeant (PCMS)",
  "Police Senior Master Sergeant (PSMS)",
  "Police Master Sergeant (PMSg)",
  "Police Staff Sergeant (PSSg)",
  "Police Corporal (PCpl)",
  "Patrolman / Patrolwoman (Pat)",
];

const sexes: Sex[] = ["Male", "Female", "Other", "Prefer Not To Say"];

const PoliceOfficerManagement: React.FC = () => {
  const { officers, addOfficer, updateOfficer, deleteOfficer } = usePoliceOfficer(); // Use context
  const [form, setForm] = useState<Officer>({
    fullName: "",
    rankOrPosition: "",
    unitOrStation: "",
    contactNumber: "",
    badgeNumber: "",
    age: undefined,
    dateOfBirth: undefined,
    sex: undefined,
    citizenship: undefined,
    civilStatus: undefined,
    address: "",
    email: undefined,
  });
  const [editingBadgeNumber, setEditingBadgeNumber] = useState<string | null>(null);

  const handleInputChange = (field: keyof Officer, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleAddOrUpdateOfficer = () => {
    if (editingBadgeNumber !== null) {
      updateOfficer(editingBadgeNumber, form);
      setEditingBadgeNumber(null);
    } else {
      addOfficer(form);
    }
    setForm({
      fullName: "",
      rankOrPosition: "",
      unitOrStation: "",
      contactNumber: "",
      badgeNumber: "",
      age: undefined,
      dateOfBirth: undefined,
      sex: undefined,
      citizenship: undefined,
      civilStatus: undefined,
      address: "",
      email: undefined,
    });
  };

  const handleSaveToLocalStorage = () => {
    localStorage.setItem("officers", JSON.stringify(officers));
  };

  const handleEditOfficer = (badgeNumber: string) => {
    const officer = officers.find((o) => o.badgeNumber === badgeNumber);
    if (officer) {
      setForm(officer);
      setEditingBadgeNumber(badgeNumber);
    }
  };

  // save every time officers change
  useEffect(() => {
    handleSaveToLocalStorage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [officers]); 

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Police Officer Management
      </Typography>

      <Stack spacing={2} mb={3}>
        <TextField
          label="Full Name"
          value={form.fullName}
          onChange={(e) => handleInputChange("fullName", e.target.value)}
          fullWidth
        />
        <Autocomplete
          options={ranks}
          value={form.rankOrPosition}
          onChange={(_, newValue) => handleInputChange("rankOrPosition", newValue || "")}
          renderInput={(params) => <TextField {...params} label="Rank or Position" fullWidth />}
        />
        <TextField
          label="Unit or Station"
          value={form.unitOrStation}
          onChange={(e) => handleInputChange("unitOrStation", e.target.value)}
          fullWidth
        />
        
        <TextField
          label="Badge Number"
          value={form.badgeNumber}
          onChange={(e) => handleInputChange("badgeNumber", e.target.value)}
          fullWidth
        />
        <TextField
          label="Date of Birth"
          type="date"
          value={form.dateOfBirth || ""}
          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <Autocomplete
          options={sexes}
          value={form.sex || ""}
          onChange={(_, newValue) => handleInputChange("sex", newValue || "")}
          renderInput={(params) => <TextField {...params} label="Sex" fullWidth />}
        />
        <TextField
          label="Address"
          value={form.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          fullWidth
        />
        <TextField
          label="Email"
          type="email"
          value={form.email || ""}
          onChange={(e) => handleInputChange("email", e.target.value)}
          fullWidth
        />
        <TextField
          label="Contact Number"
          value={form.contactNumber}
          onChange={(e) => handleInputChange("contactNumber", e.target.value)}
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={handleAddOrUpdateOfficer}>
          {editingBadgeNumber !== null ? "Update Officer" : "Add Officer"}
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Full Name</TableCell>
              <TableCell>Rank or Position</TableCell>
              <TableCell>Unit or Station</TableCell>
              <TableCell>Badge Number</TableCell>
              <TableCell>Date of Birth</TableCell>
              <TableCell>Sex</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Contact Number</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {officers.map((officer) => (
              <TableRow key={officer.badgeNumber}>
                <TableCell>{officer.fullName}</TableCell>
                <TableCell>{officer.rankOrPosition}</TableCell>
                <TableCell>{officer.unitOrStation}</TableCell>
                <TableCell>{officer.badgeNumber}</TableCell>
                <TableCell>{officer.dateOfBirth || "N/A"}</TableCell>
                <TableCell>{officer.sex || "N/A"}</TableCell>
                <TableCell>{officer.address}</TableCell>
                <TableCell>{officer.email || "N/A"}</TableCell>
                <TableCell>{officer.contactNumber}</TableCell>
                <TableCell align="center">
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleEditOfficer(officer.badgeNumber)}
                    sx={{ width: '100%'}}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => deleteOfficer(officer.badgeNumber)}
                    sx={{ width: '100%'}}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PoliceOfficerManagement;