import React from 'react';
import {
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { useCaseDetails } from '../hooks/useCaseDetails';

import type {
  ArrestDetails,
  CaseDetails,
  CasePriority,
  Complainant,
  EvidenceItem,
  IsoDate,
  Officer,
  OfficerEvent,
  PoseurBuyer,
  PreOperationDetails,
  Suspect,
  Time24h,
  Witness,
} from '../types/CaseDatails'

import css from './CaseDetailsForm.module.css';

import SectionHeader from './SectionHeader';
import ComplainantForm from './ComplaintForm';
import OfficerForm from './OfficerForm';
import OfficerOptionalForm from './OfficerOptionalFormProps';
import SuspectForm from './SuspectFrom';
import WitnessForm from './WitnessForm';
import PoseurBuyerForm from './PoseurBuyer';
import PreOperationDetailsForm from './PreOpertationDetailForm';
import ArrestDetailsForm from './ArrestDetailsForm';
import EvidenceItemForm from './EvidenceItemForm';
import OfficerEventForm from './OfficerEventForm';
import PhilippineAddressForm from './PhilippineAddressForm';

const CaseDetailsForm: React.FC = () => {
  const { caseDetails, setCaseDetails } = useCaseDetails();

  // ---------------------------------------------------------------------------
  // Root-level field handlers
  // ---------------------------------------------------------------------------

  const handleCaseFieldChange = <K extends keyof CaseDetails>(
    field: K,
    value: CaseDetails[K],
  ): void => {
    setCaseDetails({
      ...caseDetails,
      [field]: value,
    });
  };

  const handlePriorityChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    handleCaseFieldChange('priority', event.target.value as CasePriority);
  };

  // ---------------------------------------------------------------------------
  // Nested object handlers
  // ---------------------------------------------------------------------------

  const handleArrestDetailsChange = (updated: ArrestDetails | undefined): void => {
    handleCaseFieldChange('arrestDetails', updated);
  };

  const handleAssignedOfficerChange = (updated: Officer): void => {
    console.log(updated);
    handleCaseFieldChange('assignedOfficer', updated);
  };

  const handleComplainantChange = (updated: Complainant): void => {
    handleCaseFieldChange('complainant', updated);
  };

  const handlePoseurBuyerChange = (updated: PoseurBuyer | undefined): void => {
    handleCaseFieldChange('poseurBuyer', updated);
  };

  const handlePreOperationDetailsChange = (
    updated: PreOperationDetails | undefined,
  ): void => {
    handleCaseFieldChange('preOperationDetails', updated);
  };

  const handleAdministeringOfficerChange = (
    updated: Officer | undefined,
  ): void => {
    handleCaseFieldChange('administeringOfficer', updated);
  };

  // ---------------------------------------------------------------------------
  // Array handlers
  // ---------------------------------------------------------------------------

  const handleArrestingOfficerChange = (index: number, updated: Officer): void => {
    const next = caseDetails.arrestingOfficers.map((officer, idx) =>
      idx === index ? updated : officer,
    );

    handleCaseFieldChange('arrestingOfficers', next);
  };

  const handleArrestingOfficerAdd = (): void => {
    const next: Officer[] = [
      ...caseDetails.arrestingOfficers,
      {
        address: '',
        fullName: '',
        rankOrPosition: '',
        unitOrStation: '',
        badgeNumber: '',
      },
    ];
    handleCaseFieldChange('arrestingOfficers', next);
  };

  const handleArrestingOfficerRemove = (index: number): void => {
    const next = caseDetails.arrestingOfficers.filter((_, idx) => idx !== index);
    handleCaseFieldChange('arrestingOfficers', next);
  };

  const handleEvidenceChange = (index: number, updated: EvidenceItem): void => {
    const next = caseDetails.evidence.map((item, idx) =>
      idx === index ? updated : item,
    );
    handleCaseFieldChange('evidence', next);
  };

  const handleEvidenceAdd = (): void => {
    const next: EvidenceItem[] = [
      ...caseDetails.evidence,
      {
        chainOfCustody: [],
        description: '',
        firstCustodianName: '',
        label: '',
        recoveryLocation: '',
        seizureDate: '' as IsoDate,
        seizureTime: '' as Time24h,
      },
    ];
    handleCaseFieldChange('evidence', next);
  };

  const handleEvidenceRemove = (index: number): void => {
    const next = caseDetails.evidence.filter((_, idx) => idx !== index);
    handleCaseFieldChange('evidence', next);
  };

  const handleOfficerEventChange = (index: number, updated: OfficerEvent): void => {
    const next = caseDetails.officerEvents.map((event, idx) =>
      idx === index ? updated : event,
    );
    handleCaseFieldChange('officerEvents', next);
  };

  const handleOfficerEventAdd = (): void => {
    const next: OfficerEvent[] = [
      ...caseDetails.officerEvents,
      {
        action: '',
        date: '' as IsoDate,
        location: '',
        materialsUsed: '',
        peopleInvolved: '',
        time: '' as Time24h,
      },
    ];
    handleCaseFieldChange('officerEvents', next);
  };

  const handleOfficerEventRemove = (index: number): void => {
    const next = caseDetails.officerEvents.filter((_, idx) => idx !== index);
    handleCaseFieldChange('officerEvents', next);
  };

  const handleSuspectChange = (index: number, updated: Suspect): void => {
    const next = caseDetails.suspects.map((suspect, idx) =>
      idx === index ? updated : suspect,
    );
    handleCaseFieldChange('suspects', next);
  };

  const handleSuspectAdd = (): void => {
    const next: Suspect[] = [
      ...caseDetails.suspects,
      {
        fullName: '',
      },
    ];
    handleCaseFieldChange('suspects', next);
  };

  const handleSuspectRemove = (index: number): void => {
    const next = caseDetails.suspects.filter((_, idx) => idx !== index);
    handleCaseFieldChange('suspects', next);
  };

  const handleWitnessChange = (index: number, updated: Witness): void => {
    const next = caseDetails.witnesses.map((witness, idx) =>
      idx === index ? updated : witness,
    );
    handleCaseFieldChange('witnesses', next);
  };

  const handleWitnessAdd = (): void => {
    const next: Witness[] = [
      ...caseDetails.witnesses,
      {
        address: '',
        fullName: '',
        locationDuringIncident: '',
        observationNarrative: '',
        witnessType: 'CivilianEyewitness',
      },
    ];
    handleCaseFieldChange('witnesses', next);
  };

  const handleWitnessRemove = (index: number): void => {
    const next = caseDetails.witnesses.filter((_, idx) => idx !== index);
    handleCaseFieldChange('witnesses', next);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Box className={css.root} component="form" noValidate autoComplete="off">
      <Stack className={css.stackRoot} spacing={4}>
        {/* Case Information --------------------------------------------------- */}
        <Box className={css.section}>
          <SectionHeader title="Case Information" />

          <Stack className={css.sectionFields} spacing={2}>
            <TextField
              className={css.field}
              label="Case Number"
              value={caseDetails.caseNumber}
              onChange={(event) =>
                handleCaseFieldChange('caseNumber', event.target.value)
              }
              fullWidth
              size="small"
            />

            <TextField
              className={css.field}
              label="Case Title"
              value={caseDetails.caseTitle}
              onChange={(event) =>
                handleCaseFieldChange('caseTitle', event.target.value)
              }
              fullWidth
              size="small"
            />

            <Stack className={css.inlineFields} direction="row" spacing={2}>
              <TextField
                className={css.field}
                label="Incident Date (YYYY-MM-DD)"
                value={caseDetails.incidentDate}
                onChange={(event) =>
                  handleCaseFieldChange('incidentDate', event.target.value as IsoDate)
                }
                fullWidth
                size="small"
              />
              <TextField
                className={css.field}
                label="Incident Time (HH:MM)"
                value={caseDetails.incidentTime}
                onChange={(event) =>
                  handleCaseFieldChange('incidentTime', event.target.value as Time24h)
                }
                fullWidth
                size="small"
              />
            </Stack>

            <TextField
              className={css.field}
              label="Incident Type"
              value={caseDetails.incidentType}
              onChange={(event) =>
                handleCaseFieldChange('incidentType', event.target.value)
              }
              fullWidth
              size="small"
            />
            
            <TextField
              className={css.field}
              label="Investigating Unit"
              value={caseDetails.investigatingUnit}
              onChange={(event) =>
                handleCaseFieldChange('investigatingUnit', event.target.value)
              }
              fullWidth
              size="small"
            />

            <TextField
              className={css.field}
              label="Priority"
              select
              fullWidth
              size="small"
              value={caseDetails.priority}
              onChange={handlePriorityChange}
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Critical">Critical</MenuItem>
            </TextField>

            <PhilippineAddressForm
              address={caseDetails.incidentLocation}
              onChange={(updated) => handleCaseFieldChange('incidentLocation', updated)}
            />  
          </Stack>
        </Box>

         {/* Officers and assignments ------------------------------------------ */}
        <Box className={css.section}>
          <SectionHeader title="Assigned Officer" />
          <OfficerForm
            officer={caseDetails.assignedOfficer}
            onChange={handleAssignedOfficerChange}
          />
        </Box>

        <Box className={css.section}>
          <SectionHeader
            action={
              <Button
                onClick={handleArrestingOfficerAdd}
                size="small"
                variant="outlined"
              >
                Add Arresting Officer
              </Button>
            }
            title="Arresting Officers"
          />
          <Stack spacing={2}>
            {caseDetails.arrestingOfficers.map((officer, index) => (
              <Box key={index} className={css.arrayItem}>
                <Box className={css.arrayItemHeader}>
                  <Typography variant="subtitle2">
                    Arresting Officer {index + 1}
                  </Typography>
                  <Button
                    color="error"
                    onClick={() => handleArrestingOfficerRemove(index)}
                    size="small"
                    variant="text"
                  >
                    Remove
                  </Button>
                </Box>
                <OfficerForm
                  officer={officer}
                  onChange={(updated) =>
                    handleArrestingOfficerChange(index, updated)
                  }
                />
              </Box>
            ))}
          </Stack>
        </Box>

        <Box className={css.section}>
          <SectionHeader title="Administering Officer (if any)" />
          <OfficerOptionalForm
            officer={caseDetails.administeringOfficer}
            onChange={handleAdministeringOfficerChange}
          />
        </Box>

        {/* Parties ------------------------------------------------------------ */}
        <Box className={css.section}>
          <SectionHeader title="Complainant" />
          <ComplainantForm
            complainant={caseDetails.complainant}
            onChange={handleComplainantChange}
          />
        </Box>
        <Box className={css.section}>
          <SectionHeader
            action={
              <Button onClick={handleSuspectAdd} size="small" variant="outlined">
                Add Suspect
              </Button>
            }
            title="Suspects"
          />
          <Stack spacing={2}>
            {caseDetails.suspects.map((suspect, index) => (
              <Box key={index} className={css.arrayItem}>
                <Box className={css.arrayItemHeader}>
                  <Typography variant="subtitle2">
                    Suspect {index + 1}
                  </Typography>
                  <Button
                    color="error"
                    onClick={() => handleSuspectRemove(index)}
                    size="small"
                    variant="text"
                  >
                    Remove
                  </Button>
                </Box>
                <SuspectForm
                  suspect={suspect}
                  onChange={(updated) => handleSuspectChange(index, updated)}
                />
              </Box>
            ))}
          </Stack>
        </Box>

        <Box className={css.section}>
          <SectionHeader
            action={
              <Button onClick={handleWitnessAdd} size="small" variant="outlined">
                Add Witness
              </Button>
            }
            title="Witnesses"
          />
          <Stack spacing={2}>
            {caseDetails.witnesses.map((witness, index) => (
              <Box key={index} className={css.arrayItem}>
                <Box className={css.arrayItemHeader}>
                  <Typography variant="subtitle2">
                    Witness {index + 1}
                  </Typography>
                  <Button
                    color="error"
                    onClick={() => handleWitnessRemove(index)}
                    size="small"
                    variant="text"
                  >
                    Remove
                  </Button>
                </Box>
                <WitnessForm
                  onChange={(updated) => handleWitnessChange(index, updated)}
                  witness={witness}
                />
              </Box>
            ))}
          </Stack>
        </Box>

        <Box className={css.section}>
          <SectionHeader title="Poseur Buyer (if any)" />
          <PoseurBuyerForm
            poseurBuyer={caseDetails.poseurBuyer}
            onChange={handlePoseurBuyerChange}
          />
        </Box>

        {/* Evidence ----------------------------------------------------------- */}
        <Box className={css.section}>
          <SectionHeader
            action={
              <Button onClick={handleEvidenceAdd} size="small" variant="outlined">
                Add Evidence Item
              </Button>
            }
            title="Evidence and Chain of Custody"
          />
          <Stack spacing={2}>
            {caseDetails.evidence.map((item, index) => (
              <Box key={index} className={css.arrayItem}>
                <Box className={css.arrayItemHeader}>
                  <Typography variant="subtitle2">
                    Evidence Item {index + 1}
                  </Typography>
                  <Button
                    color="error"
                    onClick={() => handleEvidenceRemove(index)}
                    size="small"
                    variant="text"
                  >
                    Remove
                  </Button>
                </Box>
                <EvidenceItemForm
                  evidenceItem={item}
                  onChange={(updated) => handleEvidenceChange(index, updated)}
                />
              </Box>
            ))}
          </Stack>

          <TextField
            className={css.field}
            label="Evidence Summary"
            value={caseDetails.evidenceSummary}
            onChange={(event) =>
              handleCaseFieldChange('evidenceSummary', event.target.value)
            }
            fullWidth
            multiline
            minRows={3}
            size="small"
          />
        </Box>

        {/* Narratives -------------------------------------------------------- */}
        <Box className={css.section}>
          <SectionHeader title="Narratives" />
          <Stack spacing={2}>
            <TextField
              className={css.field}
              label="Incident Summary"
              value={caseDetails.incidentSummary}
              onChange={(event) =>
                handleCaseFieldChange('incidentSummary', event.target.value)
              }
              fullWidth
              multiline
              minRows={3}
              size="small"
            />
            <TextField
              className={css.field}
              label="Full Narrative"
              value={caseDetails.narrative}
              onChange={(event) =>
                handleCaseFieldChange('narrative', event.target.value)
              }
              fullWidth
              multiline
              minRows={6}
              size="small"
            />
          </Stack>
        </Box>

        {/* Timeline / officer events ---------------------------------------- */}
        <Box className={css.section}>
          <SectionHeader
            action={
              <Button
                onClick={handleOfficerEventAdd}
                size="small"
                variant="outlined"
              >
                Add Officer Event
              </Button>
            }
            title="Officer Events / Timeline"
          />
          <Stack spacing={2}>
            {caseDetails.officerEvents.map((event, index) => (
              <Box key={index} className={css.arrayItem}>
                <Box className={css.arrayItemHeader}>
                  <Typography variant="subtitle2">
                    Event {index + 1}
                  </Typography>
                  <Button
                    color="error"
                    onClick={() => handleOfficerEventRemove(index)}
                    size="small"
                    variant="text"
                  >
                    Remove
                  </Button>
                </Box>
                <OfficerEventForm
                  officerEvent={event}
                  onChange={(updated) => handleOfficerEventChange(index, updated)}
                />
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Operation details -------------------------------------------------- */}
        <Box className={css.section}>
          <SectionHeader title="Pre-Operation / Buy-Bust Details" />
          <PreOperationDetailsForm
            preOperationDetails={caseDetails.preOperationDetails}
            onChange={handlePreOperationDetailsChange}
          />
        </Box>

        {/* Arrest and post-arrest details ------------------------------------ */}
        <Box className={css.section}>
          <SectionHeader title="Arrest and Post-Arrest Details" />
          <ArrestDetailsForm
            arrestDetails={caseDetails.arrestDetails}
            onChange={handleArrestDetailsChange}
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default CaseDetailsForm;