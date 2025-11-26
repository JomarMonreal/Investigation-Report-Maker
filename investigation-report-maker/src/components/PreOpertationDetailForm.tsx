import React from 'react';
import {
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';


import type {
  IsoDate,
  PreOperationDetails,
  Time24h,
} from '../types/CaseDatails'

import css from './CaseDetailsForm.module.css';
// ---------------------------------------------------------------------------
// Pre-operation and arrest details
// ---------------------------------------------------------------------------

type PreOperationDetailsFormProps = {
  onChange: (updated: PreOperationDetails | undefined) => void;
  preOperationDetails?: PreOperationDetails;
};

const PreOperationDetailsForm: React.FC<PreOperationDetailsFormProps> = ({
  onChange,
  preOperationDetails,
}) => {
  const ensureDetails = (): PreOperationDetails =>
    preOperationDetails ?? {
      isBuyBustOperation: false,
    };

  const value = ensureDetails();

  const handleFieldChange = <K extends keyof PreOperationDetails>(
    field: K,
    val: PreOperationDetails[K],
  ): void => {
    onChange({
      ...value,
      [field]: val,
    });
  };

  return (
    <Stack className={css.sectionFields} spacing={2}>
      <TextField
        className={css.field}
        label="Is this a buy-bust / entrapment operation?"
        select
        value={value.isBuyBustOperation ? 'yes' : 'no'}
        onChange={(event) =>
          handleFieldChange('isBuyBustOperation', event.target.value === 'yes')
        }
        fullWidth
        size="small"
      >
        <MenuItem value="yes">Yes</MenuItem>
        <MenuItem value="no">No</MenuItem>
      </TextField>

      <TextField
        className={css.field}
        label="Pre-operation Report Number"
        value={value.preOperationReportNumber ?? ''}
        onChange={(event) =>
          handleFieldChange(
            'preOperationReportNumber',
            event.target.value === '' ? undefined : event.target.value,
          )
        }
        fullWidth
        size="small"
      />

      <Stack className={css.inlineFields} direction="row" spacing={2}>
        <TextField
          className={css.field}
          label="Briefing Date (YYYY-MM-DD)"
          value={value.briefingDate ?? ''}
          onChange={(event) =>
            handleFieldChange(
              'briefingDate',
              event.target.value === '' ? undefined : (event.target.value as IsoDate),
            )
          }
          fullWidth
          size="small"
        />
        <TextField
          className={css.field}
          label="Briefing Time (HH:MM)"
          value={value.briefingTime ?? ''}
          onChange={(event) =>
            handleFieldChange(
              'briefingTime',
              event.target.value === '' ? undefined : (event.target.value as Time24h),
            )
          }
          fullWidth
          size="small"
        />
      </Stack>

      <TextField
        className={css.field}
        label="Pre-operation Plan Summary"
        value={value.preOperationPlanSummary ?? ''}
        onChange={(event) =>
          handleFieldChange(
            'preOperationPlanSummary',
            event.target.value === '' ? undefined : event.target.value,
          )
        }
        fullWidth
        multiline
        minRows={3}
        size="small"
      />

      <TextField
        className={css.field}
        label="Informant Used?"
        select
        value={value.informantUsed === true ? 'yes' : value.informantUsed === false ? 'no' : ''}
        onChange={(event) => {
          const selected = event.target.value;
          handleFieldChange(
            'informantUsed',
            selected === '' ? undefined : selected === 'yes',
          );
        }}
        fullWidth
        size="small"
      >
        <MenuItem value="">Not specified</MenuItem>
        <MenuItem value="yes">Yes</MenuItem>
        <MenuItem value="no">No</MenuItem>
      </TextField>

      <TextField
        className={css.field}
        label="Marked Money Total Amount"
        type="number"
        value={value.markedMoneyTotalAmount ?? ''}
        onChange={(event) =>
          handleFieldChange(
            'markedMoneyTotalAmount',
            event.target.value === ''
              ? undefined
              : Number(event.target.value),
          )
        }
        fullWidth
        size="small"
      />

      <TextField
        className={css.field}
        label="Marked Money Details (denominations, serial numbers)"
        value={value.markedMoneyDetails ?? ''}
        onChange={(event) =>
          handleFieldChange(
            'markedMoneyDetails',
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
        label="Marked Money Markings"
        value={value.markedMoneyMarkings ?? ''}
        onChange={(event) =>
          handleFieldChange(
            'markedMoneyMarkings',
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
        label="Intended Transaction Location"
        value={value.intendedTransactionLocation ?? ''}
        onChange={(event) =>
          handleFieldChange(
            'intendedTransactionLocation',
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
        label="Negotiation Summary"
        value={value.negotiationSummary ?? ''}
        onChange={(event) =>
          handleFieldChange(
            'negotiationSummary',
            event.target.value === '' ? undefined : event.target.value,
          )
        }
        fullWidth
        multiline
        minRows={3}
        size="small"
      />

      <TextField
        className={css.field}
        label="Sale or Delivery Narrative"
        value={value.saleOrDeliveryNarrative ?? ''}
        onChange={(event) =>
          handleFieldChange(
            'saleOrDeliveryNarrative',
            event.target.value === '' ? undefined : event.target.value,
          )
        }
        fullWidth
        multiline
        minRows={3}
        size="small"
      />

      <TextField
        className={css.field}
        label="Completion Signal Description"
        value={value.completionSignalDescription ?? ''}
        onChange={(event) =>
          handleFieldChange(
            'completionSignalDescription',
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
export default PreOperationDetailsForm;