import React from 'react';
import {
  Stack,
  TextField,
  Typography,
  Button,
} from '@mui/material';

import type { PoliceStation, PhilippineAddress } from '../types/CaseDatails';
import css from './CaseDetailsForm.module.css';
import { usePoliceOfficer } from '../hooks/usePoliceOfficer';

/**
 * Form for editing police station details, including nested
 * Philippine mailing address information.
 */
const PoliceStationForm: React.FC = () => {
  const { policeStation, setPoliceStation } = usePoliceOfficer();
  const onChange = setPoliceStation;
  const address: PhilippineAddress = policeStation.address;

  /**
   * Update a top-level field of the `PoliceStation` object.
   */
  const handleStationFieldChange = <K extends keyof PoliceStation>(
    field: K,
    value: PoliceStation[K],
  ): void => {
    onChange({
      ...policeStation,
      [field]: value,
    });
  };

  /**
   * Update a nested field within the `PhilippineAddress` object.
   */
  const handleAddressFieldChange = <K extends keyof PhilippineAddress>(
    field: K,
    value: PhilippineAddress[K],
  ): void => {
    onChange({
      ...policeStation,
      address: {
        ...address,
        [field]: value,
      },
    });
  };

  /**
   * Persist the current police station to localStorage.
   */
  const handleSave = (): void => {
    try {
      // Existing value is available if needed:
      // const existing = localStorage.getItem('policeStation');
      localStorage.setItem('policeStation', JSON.stringify(policeStation));
      alert('Police station details saved successfully.');
    } catch (error) {
      // You can replace this with a snackbar or UI error handling.
      console.error('Failed to save police station to localStorage', error);
    }
  };

  return (
    <Stack className={css.sectionFields} spacing={2}>
      <Typography variant="h4" gutterBottom>
        Police Station Details
      </Typography>

      {/* Station identity */}
      <TextField
        label="Police Station Name"
        fullWidth
        required
        value={policeStation.name}
        onChange={(event) =>
          handleStationFieldChange('name', event.target.value)
        }
      />

      {/* Contact information */}
      <TextField
        label="Contact Number"
        fullWidth
        value={policeStation.contactNumber ?? ''}
        onChange={(event) =>
          handleStationFieldChange('contactNumber', event.target.value)
        }
      />

      <TextField
        label="Email Address"
        type="email"
        fullWidth
        value={policeStation.email ?? ''}
        onChange={(event) =>
          handleStationFieldChange('email', event.target.value)
        }
      />

      <Typography variant="h6" gutterBottom>
        Address
      </Typography>

      {/* Address: building and street */}
      <TextField
        label="Building or House"
        fullWidth
        value={address.buildingOrHouse ?? ''}
        onChange={(event) =>
          handleAddressFieldChange('buildingOrHouse', event.target.value)
        }
      />

      <TextField
        label="Street"
        fullWidth
        value={address.street ?? ''}
        onChange={(event) =>
          handleAddressFieldChange('street', event.target.value)
        }
      />

      {/* Address: subdivision / village and sitio / purok */}
      <TextField
        label="Subdivision or Village"
        fullWidth
        value={address.subdivisionOrVillage ?? ''}
        onChange={(event) =>
          handleAddressFieldChange('subdivisionOrVillage', event.target.value)
        }
      />

      <TextField
        label="Sitio or Purok"
        fullWidth
        value={address.sitioOrPurok ?? ''}
        onChange={(event) =>
          handleAddressFieldChange('sitioOrPurok', event.target.value)
        }
      />

      {/* Address: barangay, city / municipality, province */}
      <TextField
        label="Barangay"
        fullWidth
        required
        value={address.barangay}
        onChange={(event) =>
          handleAddressFieldChange('barangay', event.target.value)
        }
      />

      <TextField
        label="City or Municipality"
        fullWidth
        required
        value={address.cityOrMunicipality}
        onChange={(event) =>
          handleAddressFieldChange('cityOrMunicipality', event.target.value)
        }
      />

      <TextField
        label="Province"
        fullWidth
        required
        value={address.province}
        onChange={(event) =>
          handleAddressFieldChange('province', event.target.value)
        }
      />

      {/* Address: region and postal code */}
      <TextField
        label="Region"
        fullWidth
        value={address.region ?? ''}
        onChange={(event) =>
          handleAddressFieldChange('region', event.target.value)
        }
      />

      <TextField
        label="Postal Code"
        fullWidth
        value={address.postalCode ?? ''}
        onChange={(event) =>
          handleAddressFieldChange('postalCode', event.target.value)
        }
      />

      {/* Address: country (fixed to 'Philippines') */}
      <TextField
        label="Country"
        fullWidth
        disabled
        value={address.country}
      />

      {/* Save button */}
      <Button
        variant="contained"
        sx={{ mt: 2, alignSelf: 'flex-end' }}
        onClick={handleSave}
      >
        Save
      </Button>
    </Stack>
  );
};

export default PoliceStationForm;
