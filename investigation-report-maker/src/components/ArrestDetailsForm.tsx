import React from 'react';
import {
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';


import type {
  ArrestDetails,
  ArrestType,
  IsoDate,
  SearchType,
  Time24h,
} from '../types/CaseDatails'

import css from './CaseDetailsForm.module.css';
import OfficerForm from './OfficerForm';

type ArrestDetailsFormProps = {
  arrestDetails?: ArrestDetails;
  onChange: (updated: ArrestDetails | undefined) => void;
};

const ArrestDetailsForm: React.FC<ArrestDetailsFormProps> = ({
  arrestDetails,
  onChange,
}) => {
  const ensureDetails = (): ArrestDetails =>
    arrestDetails ?? {
      arrestDate: '' as IsoDate,
      arrestLocation: '',
      arrestTime: '' as Time24h,
      arrestType: "Not yet arrested",
      arrestExecutionNarrative: '',
      arrestingOfficer: {
        address: '',
        fullName: '',
        rankOrPosition: '',
        unitOrStation: '',
        badgeNumber: '',
      },
      rightsInformed: false,
      searchType: 'None',
    };

  const value = ensureDetails();

  const handleFieldChange = <K extends keyof ArrestDetails>(
    field: K,
    val: ArrestDetails[K],
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
        label="Arrest Type"
        select
        value={value.arrestType}
        onChange={(event) =>
          handleFieldChange('arrestType', event.target.value as ArrestType)
        }
        fullWidth
        size="small"
      >
        <MenuItem value="Not yet arrested">Not yet arrested</MenuItem>
        <MenuItem value="Warrant">By warrant</MenuItem>
        <MenuItem value="InFlagranteDelicto">In flagrante delicto</MenuItem>
        <MenuItem value="HotPursuit">Hot pursuit</MenuItem>
        <MenuItem value="VoluntarySurrender">Voluntary surrender</MenuItem>
      </TextField>

      {
        value.arrestType !== 'Warrant' ? null : <>
          <TextField
            className={css.field}
            label="Warrant Details"
            value={value.warrantDetails ?? ''}
            onChange={(event) =>
              handleFieldChange(
                'warrantDetails',
                event.target.value === '' ? undefined : event.target.value,
              )
            }
            fullWidth
            multiline
            minRows={2}
            size="small"
          />

          <Stack className={css.inlineFields} direction="row" spacing={2}>
            <TextField
              className={css.field}
              label="Arrest Date (YYYY-MM-DD)"
              value={value.arrestDate}
              onChange={(event) =>
                handleFieldChange('arrestDate', event.target.value as IsoDate)
              }
              fullWidth
              size="small"
            />
            <TextField
              className={css.field}
              label="Arrest Time (HH:MM)"
              value={value.arrestTime}
              onChange={(event) =>
                handleFieldChange('arrestTime', event.target.value as Time24h)
              }
              fullWidth
              size="small"
            />
          </Stack>

          <TextField
            className={css.field}
            label="Arrest Location"
            value={value.arrestLocation}
            onChange={(event) =>
              handleFieldChange('arrestLocation', event.target.value)
            }
            fullWidth
            multiline
            minRows={2}
            size="small"
          />

          <Typography variant="subtitle2">Arresting Officer</Typography>
          <OfficerForm
            officer={value.arrestingOfficer}
            onChange={(updatedOfficer) =>
              handleFieldChange('arrestingOfficer', updatedOfficer)
            }
          />

          <TextField
            className={css.field}
            label="Arrest Execution Narrative"
            value={value.arrestExecutionNarrative}
            onChange={(event) =>
              handleFieldChange('arrestExecutionNarrative', event.target.value)
            }
            fullWidth
            multiline
            minRows={3}
            size="small"
          />

          <TextField
            className={css.field}
            label="Were the suspect's rights informed?"
            select
            value={value.rightsInformed ? 'yes' : 'no'}
            onChange={(event) =>
              handleFieldChange('rightsInformed', event.target.value === 'yes')
            }
            fullWidth
            size="small"
          >
            <MenuItem value="yes">Yes</MenuItem>
            <MenuItem value="no">No</MenuItem>
          </TextField>

          <TextField
            className={css.field}
            label="Rights Explanation Details"
            value={value.rightsExplanationDetails ?? ''}
            onChange={(event) =>
              handleFieldChange(
                'rightsExplanationDetails',
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
            label="Search Type"
            select
            value={value.searchType}
            onChange={(event) =>
              handleFieldChange('searchType', event.target.value as SearchType)
            }
            fullWidth
            size="small"
          >
            <MenuItem value="None">None</MenuItem>
            <MenuItem value="BodySearch">Body search</MenuItem>
            <MenuItem value="VehicleSearch">Vehicle search</MenuItem>
            <MenuItem value="PremisesSearch">Premises search</MenuItem>
          </TextField>

          <TextField
            className={css.field}
            label="Search Basis"
            value={value.searchBasis ?? ''}
            onChange={(event) =>
              handleFieldChange(
                'searchBasis',
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
            label="Search Narrative"
            value={value.searchNarrative ?? ''}
            onChange={(event) =>
              handleFieldChange(
                'searchNarrative',
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
            label="Transport and Booking Details"
            value={value.transportAndBookingDetails ?? ''}
            onChange={(event) =>
              handleFieldChange(
                'transportAndBookingDetails',
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
            label="Medical Examination Details"
            value={value.medicalExaminationDetails ?? ''}
            onChange={(event) =>
              handleFieldChange(
                'medicalExaminationDetails',
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
            label="Spontaneous Statements"
            value={value.spontaneousStatements ?? ''}
            onChange={(event) =>
              handleFieldChange(
                'spontaneousStatements',
                event.target.value === '' ? undefined : event.target.value,
              )
            }
            fullWidth
            multiline
            minRows={2}
            size="small"
          />
        </>
      }

    </Stack>
  );
};
export default ArrestDetailsForm;