import React from 'react';
import {
  Stack,
  TextField,
} from '@mui/material';


import type {
  IsoDate,
  OfficerEvent,
  Time24h,
} from '../types/CaseDatails'

import css from './CaseDetailsForm.module.css';

type OfficerEventFormProps = {
  officerEvent: OfficerEvent;
  onChange: (updated: OfficerEvent) => void;
};

const OfficerEventForm: React.FC<OfficerEventFormProps> = ({
  officerEvent,
  onChange,
}) => {
  const handleFieldChange = <K extends keyof OfficerEvent>(
    field: K,
    value: OfficerEvent[K],
  ): void => {
    onChange({
      ...officerEvent,
      [field]: value,
    });
  };

  return (
    <Stack className={css.sectionFields} spacing={2}>
      <Stack className={css.inlineFields} direction="row" spacing={2}>
        <TextField
          className={css.field}
          label="Date (YYYY-MM-DD)"
          value={officerEvent.date}
          onChange={(event) =>
            handleFieldChange('date', event.target.value as IsoDate)
          }
          fullWidth
          size="small"
        />
        <TextField
          className={css.field}
          label="Time (HH:MM)"
          value={officerEvent.time}
          onChange={(event) =>
            handleFieldChange('time', event.target.value as Time24h)
          }
          fullWidth
          size="small"
        />
      </Stack>

      <TextField
        className={css.field}
        label="Location"
        value={officerEvent.location}
        onChange={(event) =>
          handleFieldChange('location', event.target.value)
        }
        fullWidth
        multiline
        minRows={2}
        size="small"
      />

      <TextField
        className={css.field}
        label="Action"
        value={officerEvent.action}
        onChange={(event) => handleFieldChange('action', event.target.value)}
        fullWidth
        multiline
        minRows={2}
        size="small"
      />

      <TextField
        className={css.field}
        label="People Involved"
        value={officerEvent.peopleInvolved}
        onChange={(event) =>
          handleFieldChange('peopleInvolved', event.target.value)
        }
        fullWidth
        multiline
        minRows={2}
        size="small"
      />

      <TextField
        className={css.field}
        label="Materials Used"
        value={officerEvent.materialsUsed}
        onChange={(event) =>
          handleFieldChange('materialsUsed', event.target.value)
        }
        fullWidth
        multiline
        minRows={2}
        size="small"
      />
    </Stack>
  );
};
export default OfficerEventForm;