import ollama from 'ollama'
import * as React from "react";
import { Slate, withReact } from "slate-react";
import { createEditor, Editor, Transforms, type Descendant } from "slate";
import type { CustomElement } from "../utils/slateHelpers";
import EditorComponent from "../components/Editor/EditorComponent";
import DocScaffoldLoad, { type ReportView } from "../components/DocScaffoldLoad";
import { PoliceCaseDetailsForm } from "../components/PoliceCaseDetailsForm";
import type { PoliceCaseDetails } from "../types/PoliceCaseDetails";
import { policeReportSummary, systemPrompt } from "../utils/dummy";
import { Menu, MenuItem, IconButton } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const ReportCreation: React.FC = () => {
  const [title, setTitle] = React.useState<string>("Untitled Report");
  const [view, setView] = React.useState<ReportView>("details");

  // Slate
  const [resultEditor] = React.useState(() => withReact(createEditor()));
  const [resultValue, setResultValue] = React.useState<CustomElement[]>([
    { type: "paragraph", children: [{ text: "Start typing or load a template..." }] }
  ]);

  // Details form
  const [details, setDetails] = React.useState<PoliceCaseDetails>({
    caseNumber: "",
    caseTitle: "",
    date: "",
    time: "",
    incidentType: "",
    location: "",
    reportingPerson: "",
    involvedParties: "",
    assignedOfficer: "",
    badgeNumber: "",
    priority: "Low",
    evidenceSummary: "",
    narrative: "",
    arrestingOfficerAge: 0,
    arrestingOfficerStation: "",
    arrestingOfficerHomeAddress: "",
    arrestingOfficerContactNumber: "",
    currentDate: "",
    administeringOfficer: "",
    suspectName: "",
    suspectOccupation: "",
    suspectHomeAddress: "",
    suspectEvents: "",
    officerEvents: []
  });

  const handleLoadTemplate = React.useCallback(
    () => {
      // store only
    },
    []
  );

  const handleClearTemplateCache = React.useCallback(() => {
    // reset cache when chip x is clicked
  }, []);

  const handleGenerateReport = React.useCallback(async () => {
    try {
      // For now we ignore templateCache; you can merge or apply it here if desired.
      
      // const response = await ollama.chat({
      //   model: 'gemma3:27b',
      //   format: 'json',
      //   messages: [
      //     {role: 'system', content: systemPrompt},
      //     {role: 'user', content: JSON.stringify(details)}
      //   ]
      // })
      // const response = await fetch("/api/generate", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ details, systemPrompt })
      // }).then(res => res.json());


      // const test = JSON.parse(response.message.content).elements
      // const nodes = test as unknown as Descendant[];
      const nodes = policeReportSummary as unknown as Descendant[];

      Editor.withoutNormalizing(resultEditor, () => {
        Transforms.select(resultEditor, { anchor: Editor.start(resultEditor, []), focus: Editor.end(resultEditor, []) });
        Transforms.delete(resultEditor);
        Transforms.insertNodes(resultEditor, nodes, { at: [0] });
        Transforms.select(resultEditor, Editor.start(resultEditor, []));
      });

      if (details.caseTitle && (!title || title === "Untitled Report")) {
        setTitle(details.caseTitle);
      }

      setView("result");
    } catch (err) {
      alert(`Failed to generate report: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }, [details, resultEditor, title]);

  const handleLoadError = React.useCallback((message: string) => {
    alert(`Template import failed: ${message}`);
  }, []);

  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleSaveCaseDetails = () => {
    const fileName = `${title || "case-details"}.json`;
    const json = JSON.stringify(details, null, 2);
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
        setDetails(json);
        alert("Case details loaded successfully.");
      } catch {
        alert("Failed to load case details. Ensure the file is a valid JSON.");
      }
    };
    reader.onerror = () => {
      alert("Could not read the file.");
    };
    reader.readAsText(file);
    event.target.value = ""; // Reset the input value to allow reloading the same file
  };

  return (
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
        onGenerateReport={handleGenerateReport}
        resultContent={<EditorComponent editor={resultEditor} />}
        detailsContent={<PoliceCaseDetailsForm value={details} onChange={setDetails} />}
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
              <MenuItem onClick={handleSaveCaseDetails}>Save Case Report Detail</MenuItem>
              <label htmlFor="load-case-details">
                <MenuItem component="span">Load Case Report Detail</MenuItem>
              </label>
            </Menu>
          </>
        }
      />
    </Slate>
  );
};

export default ReportCreation;
