import React from 'react';
import {
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';


import type {
    CivilStatus,
  Complainant,
  ComplainantRole,
  IsoDate,
  Sex,
} from '../types/CaseDatails'

import css from './CaseDetailsForm.module.css';
// ---------------------------------------------------------------------------
// Reusable person-like forms
// ---------------------------------------------------------------------------

type ComplainantFormProps = {
  complainant: Complainant;
  onChange: (updated: Complainant) => void;
};

const ComplainantForm: React.FC<ComplainantFormProps> = ({
  complainant,
  onChange,
}) => {
  const handleFieldChange = <K extends keyof Complainant>(
    field: K,
    value: Complainant[K],
  ): void => {
    onChange({
      ...complainant,
      [field]: value,
    });
  };

  return (
    <Stack className={css.sectionFields} spacing={2}>
      <TextField
        className={css.field}
        label="Full Name"
        value={complainant.fullName}
        onChange={(event) => handleFieldChange('fullName', event.target.value)}
        fullWidth
        size="small"
      />
      <TextField
        className={css.field}
        label="Age"
        type="number"
        value={complainant.age ?? ''}
        onChange={(event) =>
          handleFieldChange(
            'age',
            event.target.value === '' ? undefined : Number(event.target.value),
          )
        }
        fullWidth
        size="small"
      />
      <TextField
        className={css.field}
        label="Date of Birth (YYYY-MM-DD)"
        value={complainant.dateOfBirth ?? ''}
        onChange={(event) =>
          handleFieldChange(
            'dateOfBirth',
            event.target.value === '' ? undefined : (event.target.value as IsoDate),
          )
        }
        fullWidth
        size="small"
      />
      <TextField
        className={css.field}
        label="Sex"
        select
        value={complainant.sex ?? ''}
        onChange={(event) =>
          handleFieldChange(
            'sex',
            event.target.value === '' ? undefined : (event.target.value as Sex),
          )
        }
        fullWidth
        size="small"
      >
        <MenuItem value="">Not specified</MenuItem>
        <MenuItem value="Male">Male</MenuItem>
        <MenuItem value="Female">Female</MenuItem>
        <MenuItem value="Other">Other</MenuItem>
        <MenuItem value="PreferNotToSay">Prefer not to say</MenuItem>
      </TextField>
      <TextField
        className={css.field}
        label="Citizenship"
        value={complainant.citizenship ?? ''}
        onChange={(event) =>
          handleFieldChange(
            'citizenship',
            event.target.value === '' ? undefined : event.target.value,
          )
        }
        fullWidth
        size="small"
      />
      <TextField
        className={css.field}
        label="Civil Status"
        select
        value={complainant.civilStatus ?? ''}
        onChange={(event) =>
          handleFieldChange(
            'civilStatus',
            event.target.value === '' ? undefined : (event.target.value as CivilStatus),
          )
        }
        fullWidth
        size="small"
      >
        <MenuItem value="">Not specified</MenuItem>
        <MenuItem value="Single">Single</MenuItem>
        <MenuItem value="Married">Married</MenuItem>
        <MenuItem value="Widowed">Widowed</MenuItem>
        <MenuItem value="Separated">Separated</MenuItem>
        <MenuItem value="Other">Other</MenuItem>
      </TextField>
      <TextField
        className={css.field}
        label="Address"
        value={complainant.address}
        onChange={(event) => handleFieldChange('address', event.target.value)}
        fullWidth
        multiline
        minRows={2}
        size="small"
      />
      <TextField
        className={css.field}
        label="Contact Number"
        value={complainant.contactNumber ?? ''}
        onChange={(event) =>
          handleFieldChange(
            'contactNumber',
            event.target.value === '' ? undefined : event.target.value,
          )
        }
        fullWidth
        size="small"
      />
      <TextField
        className={css.field}
        label="Email"
        value={complainant.email ?? ''}
        onChange={(event) =>
          handleFieldChange(
            'email',
            event.target.value === '' ? undefined : event.target.value,
          )
        }
        fullWidth
        size="small"
      />
      <TextField
        className={css.field}
        label="Role"
        select
        value={complainant.role}
        onChange={(event) =>
          handleFieldChange('role', event.target.value as ComplainantRole)
        }
        fullWidth
        size="small"
      >
        <MenuItem value="PrivateComplainant">Private complainant</MenuItem>
        <MenuItem value="LawEnforcementComplainant">
          Law enforcement complainant
        </MenuItem>
      </TextField>
      <TextField
        className={css.field}
        label="Is the complainant also the victim?"
        select
        value={complainant.isVictim ? 'yes' : 'no'}
        onChange={(event) =>
          handleFieldChange('isVictim', event.target.value === 'yes')
        }
        fullWidth
        size="small"
      >
        <MenuItem value="yes">Yes</MenuItem>
        <MenuItem value="no">No</MenuItem>
      </TextField>
    </Stack>
  );
};
export default ComplainantForm;
