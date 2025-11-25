import React, { useState } from "react";
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
  Paper
} from "@mui/material";
import { usePoliceOfficerContext } from "../context/PoliceOfficerContext"; // Import the context
import { Save } from "@mui/icons-material";

const PoliceOfficerManagement: React.FC = () => {
  const { officers, addOfficer, updateOfficer, deleteOfficer } = usePoliceOfficerContext(); // Use context
  const [form, setForm] = useState<{
    name: string;
    age: number;
    station: string;
    homeAddress: string;
    rank: string;
    contactNumber: string;
  }>({
    name: "",
    age: 0,
    station: "",
    homeAddress: "",
    rank: "",
    contactNumber: ""
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleInputChange = (field: keyof typeof form, value: string | number) => {
    setForm({ ...form, [field]: value });
  };

  const handleAddOrUpdateOfficer = () => {
    if (editingId !== null) {
      updateOfficer(editingId, form);
      setEditingId(null);
    } else {
      addOfficer(form);
    }
    setForm({ name: "", age: 0, station: "", homeAddress: "", rank: "", contactNumber: "" });
  };

  const handleSaveToLocalStorage = () => {
    localStorage.setItem("officers", JSON.stringify(officers));
    alert("Officers data saved to local storage.");
  };

  const handleEditOfficer = (id: number) => {
    const officer = officers.find((o) => o.id === id);
    if (officer) {
      setForm({ name: officer.name, age: officer.age, station: officer.station, homeAddress: officer.homeAddress, rank: officer.rank, contactNumber: officer.contactNumber });
      setEditingId(id);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Police Officer Management
      </Typography>

      <Stack spacing={2} mb={3}>
        <TextField
          label="Name"
          value={form.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          fullWidth
        />
        <TextField
          label="Age"
          type="number"
          value={form.age}
          onChange={(e) => handleInputChange("age", Number(e.target.value))}
          fullWidth
        />
        <TextField
          label="Station"
          value={form.station}
          onChange={(e) => handleInputChange("station", e.target.value)}
          fullWidth
        />
        <TextField
          label="Home Address"
          value={form.homeAddress}
          onChange={(e) => handleInputChange("homeAddress", e.target.value)}
          fullWidth
        />
        <TextField
          label="Rank"
          value={form.rank}
          onChange={(e) => handleInputChange("rank", e.target.value)}
          fullWidth
        />
        <TextField
          label="Contact Number"
          value={form.contactNumber}
          onChange={(e) => handleInputChange("contactNumber", e.target.value)}
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={handleAddOrUpdateOfficer}>
          {editingId !== null ? "Update Officer" : "Add Officer"}
        </Button>
        <Button variant="contained" color="secondary" onClick={handleSaveToLocalStorage} startIcon={<Save />}>
          Save Officers
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Station</TableCell>
              <TableCell>Home Address</TableCell>
              <TableCell>Rank</TableCell>
              <TableCell>Contact Number</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {officers.map((officer) => (
              <TableRow key={officer.id}>
                <TableCell>{officer.name}</TableCell>
                <TableCell>{officer.age}</TableCell>
                <TableCell>{officer.station}</TableCell>
                <TableCell>{officer.homeAddress}</TableCell>
                <TableCell>{officer.rank}</TableCell>
                <TableCell>{officer.contactNumber}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleEditOfficer(officer.id)}
                    sx={{ marginRight: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => deleteOfficer(officer.id)}
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