import React from 'react';
import {
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';


import type {
  IdentificationMethod,
  Sex,
  Suspect,
} from '../types/CaseDatails'

import css from './CaseDetailsForm.module.css';

type SuspectFormProps = {
  suspect: Suspect;
  onChange: (updated: Suspect) => void;
};

const SuspectForm: React.FC<SuspectFormProps> = ({ suspect, onChange }) => {
  const handleFieldChange = <K extends keyof Suspect>(
    field: K,
    value: Suspect[K],
  ): void => {
    onChange({
      ...suspect,
      [field]: value,
    });
  };

  const aliasesText = (suspect.aliases ?? []).join(', ');

  return (
    <Stack className={css.sectionFields} spacing={2}>
      <TextField
        className={css.field}
        label="Full Name"
        value={suspect.fullName}
        onChange={(event) => handleFieldChange('fullName', event.target.value)}
        fullWidth
        size="small"
      />
      <TextField
        className={css.field}
        label="Aliases (comma-separated)"
        value={aliasesText}
        onChange={(event) =>
          handleFieldChange(
            'aliases',
            event.target.value === ''
              ? undefined
              : event.target.value
                  .split(',')
                  .map((value) => value.trim())
                  .filter((value) => value.length > 0),
          )
        }
        fullWidth
        size="small"
      />
      <TextField
        className={css.field}
        label="Sex"
        select
        value={suspect.sex ?? ''}
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
        label="Occupation"
        value={suspect.occupation ?? ''}
        onChange={(event) =>
          handleFieldChange(
            'occupation',
            event.target.value === '' ? undefined : event.target.value,
          )
        }
        fullWidth
        size="small"
      />
      <TextField
        className={css.field}
        label="Address"
        value={suspect.address ?? ''}
        onChange={(event) =>
          handleFieldChange(
            'address',
            event.target.value === '' ? undefined : event.target.value,
          )
        }
        fullWidth
        multiline
        minRows={2}
        size="small"
      />
      <TextField
        className={css.field}
        label="Identification Method"
        select
        value={suspect.identificationMethod ?? ''}
        onChange={(event) =>
          handleFieldChange(
            'identificationMethod',
            event.target.value === '' ? undefined : (event.target.value as IdentificationMethod),
          )
        }
        fullWidth
        size="small"
      >
        <MenuItem value="">Not specified</MenuItem>
        <MenuItem value="CaughtInTheAct">Caught in the act</MenuItem>
        <MenuItem value="IdentifiedByComplainant">Identified by complainant</MenuItem>
        <MenuItem value="IdentifiedByWitness">Identified by witness</MenuItem>
        <MenuItem value="IdentifiedByInformant">Identified by informant</MenuItem>
        <MenuItem value="PhotoLineup">Photo lineup</MenuItem>
        <MenuItem value="InPersonLineup">In-person lineup</MenuItem>
        <MenuItem value="Other">Other</MenuItem>
      </TextField>
      <TextField
        className={css.field}
        label="Identification Details"
        value={suspect.identificationDetails ?? ''}
        onChange={(event) =>
          handleFieldChange(
            'identificationDetails',
            event.target.value === '' ? undefined : event.target.value,
          )
        }
        fullWidth
        multiline
        minRows={2}
        size="small"
      />
      <TextField
        className={css.field}
        label="Relationship to Complainant/Witnesses"
        value={suspect.relationshipToComplainantOrWitnesses ?? ''}
        onChange={(event) =>
          handleFieldChange(
            'relationshipToComplainantOrWitnesses',
            event.target.value === '' ? undefined : event.target.value,
          )
        }
        fullWidth
        size="small"
      />
      <TextField
        className={css.field}
        label="Suspect Events Narrative"
        value={suspect.suspectEventsNarrative ?? ''}
        onChange={(event) =>
          handleFieldChange(
            'suspectEventsNarrative',
            event.target.value === '' ? undefined : event.target.value,
          )
        }
        fullWidth
        multiline
        minRows={3}
        size="small"
      />
    </Stack>
  );
};
export default SuspectForm;