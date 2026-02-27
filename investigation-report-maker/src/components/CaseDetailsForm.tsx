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

  const handleCaseFieldChange = React.useCallback(
    <K extends keyof CaseDetails>(field: K, value: CaseDetails[K]): void => {
      setCaseDetails((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [setCaseDetails]
  );

  const handlePriorityChange = React.useCallback((
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    handleCaseFieldChange('priority', event.target.value as CasePriority);
  }, [handleCaseFieldChange]);

  // ---------------------------------------------------------------------------
  // Nested object handlers
  // ---------------------------------------------------------------------------

  const handleArrestDetailsChange = React.useCallback((updated: ArrestDetails | undefined): void => {
    handleCaseFieldChange('arrestDetails', updated);
  }, [handleCaseFieldChange]);

  const handleAssignedOfficerChange = React.useCallback((updated: Officer): void => {
    handleCaseFieldChange('assignedOfficer', updated);
  }, [handleCaseFieldChange]);

  const handleComplainantChange = React.useCallback((updated: Complainant): void => {
    handleCaseFieldChange('complainant', updated);
  }, [handleCaseFieldChange]);

  const handlePoseurBuyerChange = React.useCallback((updated: PoseurBuyer | undefined): void => {
    handleCaseFieldChange('poseurBuyer', updated);
  }, [handleCaseFieldChange]);

  const handlePreOperationDetailsChange = React.useCallback((
    updated: PreOperationDetails | undefined,
  ): void => {
    handleCaseFieldChange('preOperationDetails', updated);
  }, [handleCaseFieldChange]);

  const handleAdministeringOfficerChange = React.useCallback((
    updated: Officer | undefined,
  ): void => {
    handleCaseFieldChange('administeringOfficer', updated);
  }, [handleCaseFieldChange]);

  // ---------------------------------------------------------------------------
  // Array handlers
  // ---------------------------------------------------------------------------

  const handleArrestingOfficerChange = React.useCallback((index: number, updated: Officer): void => {
    setCaseDetails((prev) => ({
      ...prev,
      arrestingOfficers: prev.arrestingOfficers.map((officer, idx) =>
        idx === index ? updated : officer,
      ),
    }));
  }, [setCaseDetails]);

  const handleArrestingOfficerAdd = React.useCallback((): void => {
    setCaseDetails((prev) => ({
      ...prev,
      arrestingOfficers: [
        ...prev.arrestingOfficers,
        {
          address: '',
          fullName: '',
          rankOrPosition: '',
          unitOrStation: '',
          badgeNumber: '',
        },
      ],
    }));
  }, [setCaseDetails]);

  const handleArrestingOfficerRemove = React.useCallback((index: number): void => {
    setCaseDetails((prev) => ({
      ...prev,
      arrestingOfficers: prev.arrestingOfficers.filter((_, idx) => idx !== index),
    }));
  }, [setCaseDetails]);

  const handleEvidenceChange = React.useCallback((index: number, updated: EvidenceItem): void => {
    setCaseDetails((prev) => ({
      ...prev,
      evidence: prev.evidence.map((item, idx) =>
        idx === index ? updated : item,
      ),
    }));
  }, [setCaseDetails]);

  const handleEvidenceAdd = React.useCallback((): void => {
    setCaseDetails((prev) => ({
      ...prev,
      evidence: [
        ...prev.evidence,
        {
          chainOfCustody: [],
          description: '',
          firstCustodianName: '',
          label: '',
          recoveryLocation: '',
          seizureDate: '' as IsoDate,
          seizureTime: '' as Time24h,
        },
      ],
    }));
  }, [setCaseDetails]);

  const handleEvidenceRemove = React.useCallback((index: number): void => {
    setCaseDetails((prev) => ({
      ...prev,
      evidence: prev.evidence.filter((_, idx) => idx !== index),
    }));
  }, [setCaseDetails]);

  const handleOfficerEventChange = React.useCallback((index: number, updated: OfficerEvent): void => {
    setCaseDetails((prev) => ({
      ...prev,
      officerEvents: prev.officerEvents.map((event, idx) =>
        idx === index ? updated : event,
      ),
    }));
  }, [setCaseDetails]);

  const handleOfficerEventAdd = React.useCallback((): void => {
    setCaseDetails((prev) => ({
      ...prev,
      officerEvents: [
        ...prev.officerEvents,
        {
          action: '',
          date: '' as IsoDate,
          location: '',
          materialsUsed: '',
          peopleInvolved: '',
          time: '' as Time24h,
        },
      ],
    }));
  }, [setCaseDetails]);

  const handleOfficerEventRemove = React.useCallback((index: number): void => {
    setCaseDetails((prev) => ({
      ...prev,
      officerEvents: prev.officerEvents.filter((_, idx) => idx !== index),
    }));
  }, [setCaseDetails]);

  const handleSuspectChange = React.useCallback((index: number, updated: Suspect): void => {
    setCaseDetails((prev) => ({
      ...prev,
      suspects: prev.suspects.map((suspect, idx) =>
        idx === index ? updated : suspect,
      ),
    }));
  }, [setCaseDetails]);

  const handleSuspectAdd = React.useCallback((): void => {
    setCaseDetails((prev) => ({
      ...prev,
      suspects: [
        ...prev.suspects,
        {
          fullName: '',
        },
      ],
    }));
  }, [setCaseDetails]);

  const handleSuspectRemove = React.useCallback((index: number): void => {
    setCaseDetails((prev) => ({
      ...prev,
      suspects: prev.suspects.filter((_, idx) => idx !== index),
    }));
  }, [setCaseDetails]);

  const handleWitnessChange = React.useCallback((index: number, updated: Witness): void => {
    setCaseDetails((prev) => ({
      ...prev,
      witnesses: prev.witnesses.map((witness, idx) =>
        idx === index ? updated : witness,
      ),
    }));
  }, [setCaseDetails]);

  const handleWitnessAdd = React.useCallback((): void => {
    setCaseDetails((prev) => ({
      ...prev,
      witnesses: [
        ...prev.witnesses,
        {
          address: '',
          fullName: '',
          locationDuringIncident: '',
          observationNarrative: '',
          witnessType: 'CivilianEyewitness',
        },
      ],
    }));
  }, [setCaseDetails]);

  const handleWitnessRemove = React.useCallback((index: number): void => {
    setCaseDetails((prev) => ({
      ...prev,
      witnesses: prev.witnesses.filter((_, idx) => idx !== index),
    }));
  }, [setCaseDetails]);

  const handleIncidentLocationChange = React.useCallback((updated: CaseDetails["incidentLocation"]): void => {
    handleCaseFieldChange('incidentLocation', updated);
  }, [handleCaseFieldChange]);

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
              onChange={handleIncidentLocationChange}
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
