import * as React from "react";
import { Slate, withReact } from "slate-react";
import { createEditor, Editor, Transforms, type Descendant } from "slate";
import type { CustomElement } from "../utils/slateHelpers";
import EditorComponent from "../components/Editor/EditorComponent";
import DocScaffoldLoad, { type ReportView } from "../components/DocScaffoldLoad";
import { systemPrompt } from "../utils/dummy";
import {
  Menu,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CaseDetailsForm from '../components/CaseDetailsForm';
import { useCaseDetails } from "../hooks/useCaseDetails";
import type { CaseDetails, Officer } from "../types/CaseDatails";
import { buildCaseNarrativeFromCaseDetails } from "../utils/arresting_officer_narrative";
import { convertCaseDetailToAD, createAffidavitOfArrestingOfficerTemplate } from "../utils/affidavit_of_arresting_officer";

type FastModeTemplateType =
  | "ComplainantAffidavit"
  | "ArrestingOfficerAffidavit"
  | "WitnessAffidavit"
  | "PoseurBuyerAffidavit";

  /**
 * Builds a simple Slate document (Descendant[]) for the selected fast-mode template.
 *
 * Note:
 * - Uses {{prop.path}} placeholders that are intended to map to your CaseDetails-style data.
 * - You can adjust the property paths to match your final data model.
 */
function buildFastModeTemplate(docType: FastModeTemplateType, officer: Officer, caseDetails: CaseDetails): CustomElement[] {
  switch (docType) {
    case "ComplainantAffidavit":
      return [
        {
          type: "paragraph",
          children: [
            {
              text:
                "AKO, {{complainant.fullName}}, " +
                "{{complainant.age}} taong-gulang, " +
                "na may tirahan sa {{complainant.address}}, " +
                "ay malaya at kusang-loob na nagsasalaysay at nagpapahayag sa ilalim ng panunumpa gaya ng mga sumusunod:",
            },
          ],
        },
        {
          type: "paragraph",
          children: [
            {
              text:
                "Na ako ang nagrereklamo sa kasong may bilang {{caseNumber}} na may pamagat na “{{caseTitle}}”, " +
                "na naganap noong {{incidentDate}} bandang {{incidentTime}} sa {{incidentLocation}}, " +
                "na iniuuri bilang {{incidentType}}.",
            },
          ],
        },
        {
          type: "paragraph",
          children: [
            {
              text:
                "Na ang kabuuang salaysay ng pangyayari ay ang mga sumusunod:\n\n{{incidentSummary}}\n\n{{narrative}}",
            },
          ],
        },
      ];

    case "ArrestingOfficerAffidavit":
      
      return createAffidavitOfArrestingOfficerTemplate(buildCaseNarrativeFromCaseDetails(caseDetails), convertCaseDetailToAD(caseDetails));

    case "WitnessAffidavit":
      return [
        {
          type: "paragraph",
          children: [
            {
              text:
                "AKO, {{witnesses[0].fullName}}, {{witnesses[0].age}} taong-gulang, " +
                "na naninirahan sa {{witnesses[0].address}}, " +
                "ay malaya at kusang-loob na nagsasalaysay sa ilalim ng panunumpa, gaya ng mga sumusunod:",
            },
          ],
        },
        {
          type: "paragraph",
          children: [
            {
              text:
                "Na noong {{incidentDate}} bandang {{incidentTime}}, ako ay nasa {{witnesses[0].locationDuringIncident}} " +
                "kung saan personal kong {{witnesses[0].observationNarrative}} " +
                "kaugnay ng insidenteng may pamagat na “{{caseTitle}}” na naganap sa {{incidentLocation}}.",
            },
          ],
        },
        {
          type: "paragraph",
          children: [
            {
              text:
                "Na ang aking obserbasyon ay naaapektuhan ng mga sumusunod na kondisyon:\n\n" +
                "{{witnesses[0].observationConditions}}",
            },
          ],
        },
      ];

    case "PoseurBuyerAffidavit":
      return [
        {
          type: "paragraph",
          children: [
            {
              text:
                "AKO, {{poseurBuyer.fullName}}, isang pulis na may ranggong " +
                "{{poseurBuyer.rankOrPosition}} na nakatalaga sa {{poseurBuyer.unitOrStation}}, " +
                "na kumilos bilang poseur buyer sa buy-bust operation laban kay/kina {{suspects[0].fullName}}, " +
                "ay malaya at kusang-loob na nagsasalaysay sa ilalim ng panunumpa gaya ng mga sumusunod:",
            },
          ],
        },
        {
          type: "paragraph",
          children: [
            {
              text:
                "Na bago ang operasyon ay nagkaroon ng pre-operation briefing noong {{preOperationDetails.briefingDate}} " +
                "bandang {{preOperationDetails.briefingTime}} batay sa Pre-Operation Report na may bilang " +
                "{{preOperationDetails.preOperationReportNumber}}.",
            },
          ],
        },
        {
          type: "paragraph",
          children: [
            {
              text:
                "Na sa mismong operasyon, ang kabuuang salaysay ng aking naging papel bilang poseur buyer ay ang mga sumusunod:\n\n" +
                "{{poseurBuyer.poseurBuyerNarrative}}\n\n{{preOperationDetails.saleOrDeliveryNarrative}}",
            },
          ],
        },
      ];

    default:
      return [
        {
          type: "paragraph",
          children: [{ text: "Template not found." }],
        },
      ];
  }
}

const ReportCreation: React.FC = () => {
  const [title, setTitle] = React.useState<string>("Untitled Report");
  const [view, setView] = React.useState<ReportView>("details");

  // Slate
  const [resultEditor] = React.useState(() => withReact(createEditor()));
  const [resultValue, setResultValue] = React.useState<CustomElement[]>([
    { type: "paragraph", children: [{ text: "Start typing or load a template..." }] }
  ]);

  const { caseDetails, setCaseDetails } = useCaseDetails();

  // -------------------------------------------------------------------------
  // Generate modal state
  // -------------------------------------------------------------------------

  const [modeDialogOpen, setModeDialogOpen] = React.useState<boolean>(false);

  const handleOpenGenerateDialog = React.useCallback(() => {
    setModeDialogOpen(true);
  }, []);

  const handleCloseGenerateDialog = React.useCallback(() => {
    setModeDialogOpen(false);
  }, []);

  // -------------------------------------------------------------------------
  // Template management (stubbed for now)
  // -------------------------------------------------------------------------

  const handleLoadTemplate = React.useCallback(() => {
    // store only
  }, []);

  const handleClearTemplateCache = React.useCallback(() => {
    // reset cache when chip x is clicked
  }, []);

  // -------------------------------------------------------------------------
  // AI mode: call your /api/generate endpoint
  // -------------------------------------------------------------------------

  const handleGenerateReportAIMode = React.useCallback(async () => {
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseDetails, systemPrompt }),
      }).then((res) => res.json());

      const parsed = JSON.parse(response.message.content);

      // const nodes = policeReportSummary as unknown as Descendant[];
      const nodes = parsed as Descendant[];

      Editor.withoutNormalizing(resultEditor, () => {
        Transforms.select(resultEditor, {
          anchor: Editor.start(resultEditor, []),
          focus: Editor.end(resultEditor, []),
        });
        Transforms.delete(resultEditor);
        Transforms.insertNodes(resultEditor, nodes, { at: [0] });
        Transforms.select(resultEditor, Editor.start(resultEditor, []));
      });

      if (caseDetails.caseTitle && (!title || title === "Untitled Report")) {
        setTitle(caseDetails.caseTitle);
      }

      setView("result");
      setModeDialogOpen(false);
    } catch (err) {
      alert(
        `Failed to generate report: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  }, [caseDetails, resultEditor, title]);

  // -------------------------------------------------------------------------
  // Fast mode: insert ready-made template
  // -------------------------------------------------------------------------

  const handleFastModeGenerate = React.useCallback(
    (templateType: FastModeTemplateType) => {
      const nodes = buildFastModeTemplate(templateType, caseDetails.assignedOfficer, caseDetails);

      Editor.withoutNormalizing(resultEditor, () => {
        Transforms.select(resultEditor, {
          anchor: Editor.start(resultEditor, []),
          focus: Editor.end(resultEditor, []),
        });
        Transforms.delete(resultEditor);
        Transforms.insertNodes(resultEditor, nodes, { at: [0] });
        Transforms.select(resultEditor, Editor.start(resultEditor, []));
      });

      if (caseDetails.caseTitle && (!title || title === "Untitled Report")) {
        setTitle(caseDetails.caseTitle);
      }

      setView("result");
      setModeDialogOpen(false);
    },
    [caseDetails, resultEditor, title]
  );

  // -------------------------------------------------------------------------
  // Template load error
  // -------------------------------------------------------------------------

  const handleLoadError = React.useCallback((message: string) => {
    alert(`Template import failed: ${message}`);
  }, []);

  // -------------------------------------------------------------------------
  // Menu (save/load details)
  // -------------------------------------------------------------------------

  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleSaveCaseDetails = () => {
    const fileName = `${title || "case-details"}-CaseDetails.json`;
    const json = JSON.stringify(caseDetails, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
    alert("Case details saved as JSON file.");
    handleMenuClose();
  };

  const handleLoadCaseDetails = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        setCaseDetails(json);
        alert("Case details loaded successfully.");
      } catch {
        alert("Failed to load case details. Ensure the file is a valid JSON.");
      }
    };
    reader.onerror = () => {
      alert("Could not read the file.");
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  return (
    <>
      {/* Generate mode selection dialog */}
      <Dialog
        open={modeDialogOpen}
        onClose={handleCloseGenerateDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Generate Report</DialogTitle>
        <DialogContent dividers>
          {/* AI mode section */}
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              AI Mode
            </Typography>
            <Typography variant="body2" paragraph>
              Gumamit ng AI upang awtomatikong buuin ang buong ulat mula sa mga
              detalye ng kaso.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={handleGenerateReportAIMode}
            >
              Use AI Mode
            </Button>
          </Box>

          {/* Fast mode section */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Fast Mode
            </Typography>
            <Typography variant="body2" paragraph>
              {`Pumili ng mabilis na template para agad makabuo ng affidavit na may {{prop}} placeholders na maaari mong punan o i-auto-fill.`}
            </Typography>
            <Stack spacing={1}>
              <Button
                variant="outlined"
                onClick={() =>
                  handleFastModeGenerate("ComplainantAffidavit")
                }
              >
                Affidavit of Complainant
              </Button>
              <Button
                variant="outlined"
                onClick={() =>
                  handleFastModeGenerate("ArrestingOfficerAffidavit")
                }
              >
                Affidavit of Arresting Officer
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleFastModeGenerate("WitnessAffidavit")}
              >
                Affidavit of Witness
              </Button>
              <Button
                variant="outlined"
                onClick={() =>
                  handleFastModeGenerate("PoseurBuyerAffidavit")
                }
              >
                Affidavit of Poseur Buyer
              </Button>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseGenerateDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Main layout */}
      <Slate
        editor={resultEditor}
        initialValue={resultValue}
        onChange={(value) => setResultValue(value as CustomElement[])}
      >
        <DocScaffoldLoad
          title={title}
          view={view}
          onViewChange={setView}
          onTitleChange={setTitle}
          onLoadTemplate={handleLoadTemplate}
          onClearPickedTemplate={handleClearTemplateCache}
          onLoadError={handleLoadError}
          // Important: open the mode dialog instead of generating immediately
          onGenerateReport={handleOpenGenerateDialog}
          resultContent={<EditorComponent editor={resultEditor} />}
          detailsContent={
            <CaseDetailsForm />
          }
          moreOptions={
            <>
              <input
                type="file"
                accept="application/json"
                style={{ display: "none" }}
                id="load-case-details"
                onChange={handleLoadCaseDetails}
              />

              <IconButton onClick={handleMenuOpen} aria-label="more options">
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleSaveCaseDetails}>
                  Save Case Report Detail
                </MenuItem>
                <label htmlFor="load-case-details">
                  <MenuItem component="span">Load Case Report Detail</MenuItem>
                </label>
              </Menu>
            </>
          }
        />
      </Slate>
    </>
  );
};

export default ReportCreation;
