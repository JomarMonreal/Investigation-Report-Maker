import React from 'react';
import {
  Autocomplete,
  Stack,
  TextField,
} from '@mui/material';

import type { Officer } from '../types/CaseDatails';
import css from './CaseDetailsForm.module.css';
import { usePoliceOfficer } from '../hooks/usePoliceOfficer';
import { useNavigate } from 'react-router-dom';

type OfficerFormProps = {
  officer: Officer;
  onChange: (updated: Officer) => void;
};

const OfficerForm: React.FC<OfficerFormProps> = ({ officer, onChange }) => {
    const navigate = useNavigate();
  const { officers } = usePoliceOfficer();
  const handleAddNewOfficer = () => {
    navigate('/police-officer-management');
  };


  return (
    <Stack className={css.sectionFields} spacing={2}>
      <Autocomplete
        options={[...officers.map((o) => o.fullName), '+ Add New Officer']}
        value={officer.fullName}
        onChange={(_, newValue) => {
          if (newValue === '+ Add New Officer') {
            handleAddNewOfficer();
          } else {
            onChange({ ...officer, fullName: newValue || '' });
          }
        }}
        renderInput={(params) => (
          <TextField {...params} label="Officer in-charge" fullWidth />
        )}
      />
    </Stack>
  );
};

export default OfficerForm;