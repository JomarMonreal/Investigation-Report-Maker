import React from 'react';
import {
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';


import type {
  EvidenceItem,
  InventoryType,
  IsoDate,
  Time24h,
} from '../types/CaseDatails'

import css from './CaseDetailsForm.module.css';

// ---------------------------------------------------------------------------
// Evidence items and officer events
// ---------------------------------------------------------------------------

type EvidenceItemFormProps = {
  evidenceItem: EvidenceItem;
  onChange: (updated: EvidenceItem) => void;
};

const EvidenceItemForm: React.FC<EvidenceItemFormProps> = ({
  evidenceItem,
  onChange,
}) => {
  const handleFieldChange = <K extends keyof EvidenceItem>(
    field: K,
    value: EvidenceItem[K],
  ): void => {
    onChange({
      ...evidenceItem,
      [field]: value,
    });
  };

  return (
    <Stack className={css.sectionFields} spacing={2}>
      <TextField
        className={css.field}
        label="Label"
        value={evidenceItem.label}
        onChange={(event) => handleFieldChange('label', event.target.value)}
        fullWidth
        size="small"
      />

      <TextField
        className={css.field}
        label="Description / Markings"
        value={evidenceItem.description}
        onChange={(event) =>
          handleFieldChange('description', event.target.value)
        }
        fullWidth
        multiline
        minRows={2}
        size="small"
      />

      <TextField
        className={css.field}
        label="Quantity / Weight"
        value={evidenceItem.quantityOrWeight ?? ''}
        onChange={(event) =>
          handleFieldChange(
            'quantityOrWeight',
            event.target.value === '' ? undefined : event.target.value,
          )
        }
        fullWidth
        size="small"
      />

      <TextField
        className={css.field}
        label="Recovery Location"
        value={evidenceItem.recoveryLocation}
        onChange={(event) =>
          handleFieldChange('recoveryLocation', event.target.value)
        }
        fullWidth
        multiline
        minRows={2}
        size="small"
      />

      <Stack className={css.inlineFields} direction="row" spacing={2}>
        <TextField
          className={css.field}
          label="Seizure Date (YYYY-MM-DD)"
          value={evidenceItem.seizureDate}
          onChange={(event) =>
            handleFieldChange('seizureDate', event.target.value as IsoDate)
          }
          fullWidth
          size="small"
        />
        <TextField
          className={css.field}
          label="Seizure Time (HH:MM)"
          value={evidenceItem.seizureTime}
          onChange={(event) =>
            handleFieldChange('seizureTime', event.target.value as Time24h)
          }
          fullWidth
          size="small"
        />
      </Stack>

      <TextField
        className={css.field}
        label="First Custodian Name"
        value={evidenceItem.firstCustodianName}
        onChange={(event) =>
          handleFieldChange('firstCustodianName', event.target.value)
        }
        fullWidth
        size="small"
      />

      <TextField
        className={css.field}
        label="Inventory / Photography"
        select
        value={evidenceItem.inventoryType ?? ''}
        onChange={(event) =>
          handleFieldChange(
            'inventoryType',
            event.target.value === '' ? undefined : (event.target.value as InventoryType),
          )
        }
        fullWidth
        size="small"
      >
        <MenuItem value="">Not specified</MenuItem>
        <MenuItem value="None">None</MenuItem>
        <MenuItem value="InventoryOnly">Inventory only</MenuItem>
        <MenuItem value="PhotographyOnly">Photography only</MenuItem>
        <MenuItem value="InventoryAndPhotography">
          Inventory and photography
        </MenuItem>
      </TextField>

      <TextField
        className={css.field}
        label="Persons Present During Inventory / Photography"
        value={evidenceItem.personsPresentDuringInventory ?? ''}
        onChange={(event) =>
          handleFieldChange(
            'personsPresentDuringInventory',
            event.target.value === '' ? undefined : event.target.value,
          )
        }
        fullWidth
        multiline
        minRows={2}
        size="small"
      />

      {/* Chain of custody entries can be a separate sub-form if you want to expand. */}
    </Stack>
  );
};
export default EvidenceItemForm;