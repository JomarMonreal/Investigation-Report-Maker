import React from 'react';
import {
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';


import type {
  Witness,
  WitnessType,
} from '../types/CaseDatails'

import css from './CaseDetailsForm.module.css';

type WitnessFormProps = {
  onChange: (updated: Witness) => void;
  witness: Witness;
};

const WitnessForm: React.FC<WitnessFormProps> = ({ onChange, witness }) => {
  const handleFieldChange = <K extends keyof Witness>(
    field: K,
    value: Witness[K],
  ): void => {
    onChange({
      ...witness,
      [field]: value,
    });
  };

  return (
    <Stack className={css.sectionFields} spacing={2}>
      <TextField
        className={css.field}
        label="Full Name"
        value={witness.fullName}
        onChange={(event) => handleFieldChange('fullName', event.target.value)}
        fullWidth
        size="small"
      />
      <TextField
        className={css.field}
        label="Address"
        value={witness.address}
        onChange={(event) => handleFieldChange('address', event.target.value)}
        fullWidth
        multiline
        minRows={2}
        size="small"
      />
      <TextField
        className={css.field}
        label="Witness Type"
        select
        value={witness.witnessType}
        onChange={(event) =>
          handleFieldChange('witnessType', event.target.value as WitnessType)
        }
        fullWidth
        size="small"
      >
        <MenuItem value="CivilianEyewitness">Civilian eyewitness</MenuItem>
        <MenuItem value="ArrestingOfficer">Arresting officer</MenuItem>
        <MenuItem value="PoseurBuyer">Poseur buyer</MenuItem>
        <MenuItem value="Expert">Expert</MenuItem>
        <MenuItem value="Other">Other</MenuItem>
      </TextField>
      <TextField
        className={css.field}
        label="Relation to Complainant/Accused"
        value={witness.relationToComplainantOrAccused ?? ''}
        onChange={(event) =>
          handleFieldChange(
            'relationToComplainantOrAccused',
            event.target.value === '' ? undefined : event.target.value,
          )
        }
        fullWidth
        size="small"
      />
      <TextField
        className={css.field}
        label="Location During Incident"
        value={witness.locationDuringIncident}
        onChange={(event) =>
          handleFieldChange('locationDuringIncident', event.target.value)
        }
        fullWidth
        multiline
        minRows={2}
        size="small"
      />
      <TextField
        className={css.field}
        label="Observation Narrative"
        value={witness.observationNarrative}
        onChange={(event) =>
          handleFieldChange('observationNarrative', event.target.value)
        }
        fullWidth
        multiline
        minRows={3}
        size="small"
      />
      <TextField
        className={css.field}
        label="Observation Conditions"
        value={witness.observationConditions ?? ''}
        onChange={(event) =>
          handleFieldChange(
            'observationConditions',
            event.target.value === '' ? undefined : event.target.value,
          )
        }
        fullWidth
        multiline
        minRows={2}
        size="small"
      />
    </Stack>
  );
};

export default WitnessForm;