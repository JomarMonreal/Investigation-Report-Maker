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
    contactNumber: "",
    involvedParties: "",
    assignedOfficer: "",
    badgeNumber: "",
    priority: "Low",
    evidenceSummary: "",
    narrative: "",
    arrestingOfficerAge: 0,
    arrestingOfficerStation: "",
    arrestingOfficerHomeAddress: "",
    currentDate: "",
    administeringOfficer: "",
    suspectName: "",
    suspectOccupation: "",
    suspectHomeAddress: "",
    suspectEvents: "",
    officerEvents: []
  });

  // NEW: cache the last loaded template (do not auto-apply)
  const [templateCache, setTemplateCache] = React.useState<CustomElement[] | null>(null);

  const handleLoadTemplate = React.useCallback(
    (template: CustomElement[]) => {
      setTemplateCache(template); // store only
    },
    []
  );

  const handleClearTemplateCache = React.useCallback(() => {
    setTemplateCache(null);
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

  return (
    <Slate
      editor={resultEditor}
      initialValue={resultValue}
      onChange={(value) => setResultValue(value as CustomElement[])} // Fixed type mismatch
    >
      <DocScaffoldLoad
        title={title}
        view={view}
        onViewChange={setView}
        onTitleChange={setTitle}
        onLoadTemplate={handleLoadTemplate}
        onClearPickedTemplate={handleClearTemplateCache} // ⟵ reset cache when chip x is clicked
        onLoadError={handleLoadError}
        onGenerateReport={handleGenerateReport}
        resultContent={<EditorComponent editor={resultEditor} />}
        detailsContent={<PoliceCaseDetailsForm value={details} onChange={setDetails} />}
      />
    </Slate>
  );
};

export default ReportCreation;
