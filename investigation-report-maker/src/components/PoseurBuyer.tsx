import React from 'react';
import {
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';


import type {
  PoseurBuyer,
} from '../types/CaseDatails'

import css from './CaseDetailsForm.module.css';
import OfficerForm from './OfficerForm';

type PoseurBuyerFormProps = {
  onChange: (updated: PoseurBuyer | undefined) => void;
  poseurBuyer?: PoseurBuyer;
};

const PoseurBuyerForm: React.FC<PoseurBuyerFormProps> = ({
  onChange,
  poseurBuyer,
}) => {
  const ensurePoseurBuyer = (): PoseurBuyer =>
    poseurBuyer ?? {
      address: '',
      fullName: '',
      isConfidential: true,
      rankOrPosition: '',
      unitOrStation: '',
    };

  if (!poseurBuyer) {
    return (
      <Button
        onClick={() => onChange(ensurePoseurBuyer())}
        size="small"
        variant="outlined"
      >
        Add Poseur Buyer
      </Button>
    );
  }

  const value = ensurePoseurBuyer();

  const handleFieldChange = <K extends keyof PoseurBuyer>(
    field: K,
    val: PoseurBuyer[K],
  ): void => {
    onChange({
      ...value,
      [field]: val,
    });
  };

  return (
    <Stack spacing={2}>
      <OfficerForm
        officer={value}
        onChange={(updatedOfficer) =>
          onChange({
            ...value,
            ...updatedOfficer,
          })
        }
      />
      <TextField
        className={css.field}
        label="Is Confidential?"
        select
        value={value.isConfidential ? 'yes' : 'no'}
        onChange={(event) =>
          handleFieldChange('isConfidential', event.target.value === 'yes')
        }
        fullWidth
        size="small"
      >
        <MenuItem value="yes">Yes</MenuItem>
        <MenuItem value="no">No</MenuItem>
      </TextField>
      <TextField
        className={css.field}
        label="Code Name"
        value={value.codeName ?? ''}
        onChange={(event) =>
          handleFieldChange(
            'codeName',
            event.target.value === '' ? undefined : event.target.value,
          )
        }
        fullWidth
        size="small"
      />
      <TextField
        className={css.field}
        label="Poseur Buyer Narrative"
        value={value.poseurBuyerNarrative ?? ''}
        onChange={(event) =>
          handleFieldChange(
            'poseurBuyerNarrative',
            event.target.value === '' ? undefined : event.target.value,
          )
        }
        fullWidth
        multiline
        minRows={3}
        size="small"
      />
      <Box>
        <Button
          color="error"
          onClick={() => onChange(undefined)}
          size="small"
          variant="text"
        >
          Remove Poseur Buyer
        </Button>
      </Box>
    </Stack>
  );
};
export default PoseurBuyerForm;