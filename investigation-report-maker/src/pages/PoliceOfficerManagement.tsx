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
  Paper,
  Autocomplete,
} from "@mui/material";
import { usePoliceOfficer } from "../hooks/usePoliceOfficer";
import type { Officer, Sex, CivilStatus } from "../types/CaseDatails";

const ranks: string[] = [
  // A. Current commissioned officers
  "Police General (PGEN)",
  "Police Lieutenant General (PLTGEN)",
  "Police Major General (PMGEN)",
  "Police Brigadier General (PBGEN)",
  "Police Colonel (PCOL)",
  "Police Lieutenant Colonel (PLTCOL)",
  "Police Major (PMAJ)",
  "Police Captain (PCPT)",
  "Police Lieutenant (PLT)",

  // B. Current non-commissioned officers
  "Police Executive Master Sergeant (PEMS)",
  "Police Chief Master Sergeant (PCMS)",
  "Police Senior Master Sergeant (PSMS)",
  "Police Master Sergeant (PMSg)",
  "Police Staff Sergeant (PSSg)",
  "Police Corporal (PCpl)",
  "Patrolman (Pat)",
  "Patrolwoman (Pat)",

  // C. Legacy non-commissioned officers (pre-RA 11279)
  "Senior Police Officer IV (SPO4)",
  "Senior Police Officer III (SPO3)",
  "Senior Police Officer II (SPO2)",
  "Senior Police Officer I (SPO1)",
  "Police Officer III (PO3)",
  "Police Officer II (PO2)",
  "Police Officer I (PO1)",
];

const sexes: Sex[] = ["Male", "Female", "Other", "Prefer Not To Say"];

const civilStatuses: CivilStatus[] = [
  "Single",
  "Married",
  "Widowed",
  "Separated",
  "Other",
];

const emptyCompleteAddress: NonNullable<Officer["completeAddress"]> = {
  buildingOrHouse: "",
  street: "",
  subdivisionOrVillage: "",
  sitioOrPurok: "",
  barangay: "",
  cityOrMunicipality: "",
  province: "",
  region: "",
  postalCode: "",
  country: "Philippines",
};

const PoliceOfficerManagement: React.FC = () => {
  const { officers, addOfficer, updateOfficer, deleteOfficer } = usePoliceOfficer();

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
    completeAddress: emptyCompleteAddress,
  });

  const [editingBadgeNumber, setEditingBadgeNumber] = useState<string | null>(null);

  const handleInputChange = <K extends keyof Officer>(field: K, value: Officer[K]) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCompleteAddressChange = <
    K extends keyof NonNullable<Officer["completeAddress"]>
  >(
    field: K,
    value: NonNullable<Officer["completeAddress"]>[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      completeAddress: {
        ...emptyCompleteAddress,
        ...prev.completeAddress,
        [field]: value,
      },
    }));
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
      completeAddress: emptyCompleteAddress,
    });
  };

  const handleEditOfficer = (badgeNumber: string) => {
    const officer = officers.find((o) => o.badgeNumber === badgeNumber);
    if (officer) {
      setForm({
        ...officer,
        completeAddress: officer.completeAddress ?? emptyCompleteAddress,
      });
      setEditingBadgeNumber(badgeNumber);
    }
  };

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
          onChange={(_, newValue) =>
            handleInputChange("rankOrPosition", (newValue ?? "") as Officer["rankOrPosition"])
          }
          renderInput={(params) => (
            <TextField {...params} label="Rank or Position" fullWidth />
          )}
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
          value={form.dateOfBirth ?? ""}
          onChange={(e) =>
            handleInputChange("dateOfBirth", (e.target.value || undefined) as Officer["dateOfBirth"])
          }
          fullWidth
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Age"
          type="number"
          value={form.age ?? ""}
          onChange={(e) =>
            handleInputChange(
              "age",
              (e.target.value === "" ? undefined : Number(e.target.value)) as Officer["age"]
            )
          }
          fullWidth
          inputProps={{ min: 0 }}
        />

        <Autocomplete<Sex, false, false, false>
          options={sexes}
          value={form.sex ?? null}
          onChange={(_, newValue) =>
            handleInputChange("sex", (newValue ?? undefined) as Officer["sex"])
          }
          renderInput={(params) => <TextField {...params} label="Sex" fullWidth />}
        />

        <TextField
          label="Citizenship"
          value={form.citizenship ?? ""}
          onChange={(e) =>
            handleInputChange("citizenship", (e.target.value || undefined) as Officer["citizenship"])
          }
          fullWidth
        />

        <Autocomplete<CivilStatus, false, false, false>
          options={civilStatuses}
          value={form.civilStatus ?? null}
          onChange={(_, newValue) =>
            handleInputChange("civilStatus", (newValue ?? undefined) as Officer["civilStatus"])
          }
          renderInput={(params) => <TextField {...params} label="Civil Status" fullWidth />}
        />

        <Typography variant="h6" sx={{ mt: 2 }}>
          Complete Address (Philippines)
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Building / House"
            value={form.completeAddress?.buildingOrHouse ?? ""}
            onChange={(e) =>
              handleCompleteAddressChange("buildingOrHouse", e.target.value)
            }
            fullWidth
          />
          <TextField
            label="Street"
            value={form.completeAddress?.street ?? ""}
            onChange={(e) => handleCompleteAddressChange("street", e.target.value)}
            fullWidth
          />
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Subdivision / Village"
            value={form.completeAddress?.subdivisionOrVillage ?? ""}
            onChange={(e) =>
              handleCompleteAddressChange("subdivisionOrVillage", e.target.value)
            }
            fullWidth
          />
          <TextField
            label="Sitio / Purok"
            value={form.completeAddress?.sitioOrPurok ?? ""}
            onChange={(e) =>
              handleCompleteAddressChange("sitioOrPurok", e.target.value)
            }
            fullWidth
          />
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Barangay"
            value={form.completeAddress?.barangay ?? ""}
            onChange={(e) =>
              handleCompleteAddressChange("barangay", e.target.value)
            }
            fullWidth
          />
          <TextField
            label="City / Municipality"
            value={form.completeAddress?.cityOrMunicipality ?? ""}
            onChange={(e) =>
              handleCompleteAddressChange("cityOrMunicipality", e.target.value)
            }
            fullWidth
          />
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Province"
            value={form.completeAddress?.province ?? ""}
            onChange={(e) =>
              handleCompleteAddressChange("province", e.target.value)
            }
            fullWidth
          />
          <TextField
            label="Region"
            value={form.completeAddress?.region ?? ""}
            onChange={(e) =>
              handleCompleteAddressChange("region", e.target.value)
            }
            fullWidth
          />
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Postal Code"
            value={form.completeAddress?.postalCode ?? ""}
            onChange={(e) =>
              handleCompleteAddressChange("postalCode", e.target.value)
            }
            fullWidth
          />
          <TextField
            label="Country"
            value={form.completeAddress?.country ?? "Philippines"}
            disabled
            fullWidth
          />
        </Stack>

        <TextField
          label="Email"
          type="email"
          value={form.email ?? ""}
          onChange={(e) =>
            handleInputChange("email", (e.target.value || undefined) as Officer["email"])
          }
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
              <TableCell>Age</TableCell>
              <TableCell>Sex</TableCell>
              <TableCell>Citizenship</TableCell>
              <TableCell>Civil Status</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Contact Number</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {officers.map((officer) => {
              const addr = officer.completeAddress;
              const formattedCompleteAddress = addr
                ? [
                    addr.buildingOrHouse,
                    addr.street,
                    addr.subdivisionOrVillage,
                    addr.sitioOrPurok,
                    addr.barangay && `Brgy. ${addr.barangay}`,
                    addr.cityOrMunicipality,
                    addr.province,
                    addr.postalCode,
                    addr.country,
                  ]
                    .filter(Boolean)
                    .join(", ")
                : officer.address;

              return (
                <TableRow key={officer.badgeNumber}>
                  <TableCell>{officer.fullName}</TableCell>
                  <TableCell>{officer.rankOrPosition}</TableCell>
                  <TableCell>{officer.unitOrStation}</TableCell>
                  <TableCell>{officer.badgeNumber}</TableCell>
                  <TableCell>{officer.dateOfBirth || "N/A"}</TableCell>
                  <TableCell>{officer.age ?? "N/A"}</TableCell>
                  <TableCell>{officer.sex || "N/A"}</TableCell>
                  <TableCell>{officer.citizenship || "N/A"}</TableCell>
                  <TableCell>{officer.civilStatus || "N/A"}</TableCell>
                  <TableCell>{formattedCompleteAddress}</TableCell>
                  <TableCell>{officer.email || "N/A"}</TableCell>
                  <TableCell>{officer.contactNumber}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleEditOfficer(officer.badgeNumber)}
                      sx={{ width: "100%" }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => deleteOfficer(officer.badgeNumber)}
                      sx={{ width: "100%", mt: 0.5 }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PoliceOfficerManagement;
