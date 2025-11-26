import React from 'react';
import {
  Box,
  Button,
  Stack,
} from '@mui/material';


import type {
  Officer,
} from '../types/CaseDatails'

import OfficerForm from './OfficerForm';

type OfficerOptionalFormProps = {
  officer?: Officer;
  onChange: (updated: Officer | undefined) => void;
};

const OfficerOptionalForm: React.FC<OfficerOptionalFormProps> = ({
  officer,
  onChange,
}) => {
  const ensureOfficer = (): Officer =>
    officer ?? {
      address: '',
      fullName: '',
      rankOrPosition: '',
      unitOrStation: '',
      badgeNumber: '',
    };

  if (!officer) {
    return (
      <Button
        onClick={() => onChange(ensureOfficer())}
        size="small"
        variant="outlined"
      >
        Add Officer
      </Button>
    );
  }

  return (
    <Stack spacing={2}>
      <OfficerForm officer={ensureOfficer()} onChange={onChange} />
      <Box>
        <Button
          color="error"
          onClick={() => onChange(undefined)}
          size="small"
          variant="text"
        >
          Remove Officer
        </Button>
      </Box>
    </Stack>
  );
};
export default OfficerOptionalForm;