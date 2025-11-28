import React from 'react';
import { Box, Stack, TextField, Typography } from '@mui/material';

import type { PhilippineAddress } from '../types/CaseDatails'; // adjust path if needed

export interface PhilippineAddressFormProps {
  label?: string;
  address: PhilippineAddress;
  onChange: (updated: PhilippineAddress) => void;
}

const PhilippineAddressForm: React.FC<PhilippineAddressFormProps> = ({
  label = 'Incident Location',
  address,
  onChange,
}) => {
  const handleFieldChange = <K extends keyof PhilippineAddress>(
    field: K,
    value: PhilippineAddress[K],
  ): void => {
    onChange({
      ...address,
      [field]: value,
    });
  };

  return (
    <Box>
      <Typography gutterBottom variant="subtitle2">
        {label}
      </Typography>

      <Stack spacing={2}>
        {/* A. Core barangay / city / province ------------------------------- */}
        <Stack direction="row" spacing={2}>
          <TextField
            label="Barangay"
            value={address.barangay}
            onChange={(event) => handleFieldChange('barangay', event.target.value)}
            fullWidth
            size="small"
            required
          />
          <TextField
            label="City / Municipality"
            value={address.cityOrMunicipality}
            onChange={(event) =>
              handleFieldChange('cityOrMunicipality', event.target.value)
            }
            fullWidth
            size="small"
            required
          />
          <TextField
            label="Province"
            value={address.province}
            onChange={(event) => handleFieldChange('province', event.target.value)}
            fullWidth
            size="small"
            required
          />
        </Stack>

        {/* B. Building / house and street ----------------------------------- */}
        <Stack direction="row" spacing={2}>
          <TextField
            label="Building / House (optional)"
            value={address.buildingOrHouse ?? ''}
            onChange={(event) =>
              handleFieldChange('buildingOrHouse', event.target.value || undefined)
            }
            fullWidth
            size="small"
          />
          <TextField
            label="Street (optional)"
            value={address.street ?? ''}
            onChange={(event) =>
              handleFieldChange('street', event.target.value || undefined)
            }
            fullWidth
            size="small"
          />
        </Stack>

        {/* C. Subdivision / village and sitio / purok ----------------------- */}
        <Stack direction="row" spacing={2}>
          <TextField
            label="Subdivision / Village (optional)"
            value={address.subdivisionOrVillage ?? ''}
            onChange={(event) =>
              handleFieldChange(
                'subdivisionOrVillage',
                event.target.value || undefined,
              )
            }
            fullWidth
            size="small"
          />
          <TextField
            label="Sitio / Purok (optional)"
            value={address.sitioOrPurok ?? ''}
            onChange={(event) =>
              handleFieldChange('sitioOrPurok', event.target.value || undefined)
            }
            fullWidth
            size="small"
          />
        </Stack>

        {/* D. Region / postal code / country -------------------------------- */}
        <Stack direction="row" spacing={2}>
          <TextField
            label="Region (optional)"
            value={address.region ?? ''}
            onChange={(event) =>
              handleFieldChange('region', event.target.value || undefined)
            }
            fullWidth
            size="small"
          />
          <TextField
            label="Postal Code (optional)"
            value={address.postalCode ?? ''}
            onChange={(event) =>
              handleFieldChange('postalCode', event.target.value || undefined)
            }
            fullWidth
            size="small"
          />
          <TextField
            label="Country"
            value={address.country}
            fullWidth
            size="small"
            disabled
          />
        </Stack>
      </Stack>
    </Box>
  );
};

export default PhilippineAddressForm;
