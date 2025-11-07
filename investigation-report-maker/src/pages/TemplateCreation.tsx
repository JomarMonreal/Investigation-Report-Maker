import * as React from "react";
import DocScaffold from "../components/DocScaffold";
import EditorComponent from "../components/Editor/EditorComponent";
import type { CustomElement } from "../utils/slateHelpers";
import { Slate, withReact } from "slate-react";
import { createEditor, Editor, Transforms, type Descendant } from "slate";
import { policeReportTemplate } from "../utils/dummy";

/** Turn an arbitrary string into a safe filename slug. */
const slugify = (s: string): string =>
  s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-")
    .replace(/^\-|\-$/g, "");

/** Downloads JSON data as a file in the browser. */
const downloadJson = <T,>(data: T, filename: string): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const TemplateCreation: React.FC = () => {
  const [title, setTitle] = React.useState<string>("Untitled Report");
  const [value, setValue] = React.useState<CustomElement[]>(policeReportTemplate);
  const [editor] = React.useState(() => withReact(createEditor()));

  const handleChange = React.useCallback((newValue: CustomElement[]) => {
    setValue(newValue);
  }, []);

  const handleSaveTemplate = React.useCallback(() => {
    const base = slugify(title) || "untitled";
    downloadJson<CustomElement[]>(value, `${base}.json`);
  }, [title, value]);

  /** Apply loaded template immediately: update Slate and derive title from filename. */
  const handleLoadTemplate = React.useCallback(
    (template: CustomElement[], info: { filename: string }) => {
      // 1) Replace editor contents via Slate ops (no remount needed).
      Editor.withoutNormalizing(editor, () => {
        Transforms.select(editor, { anchor: Editor.start(editor, []), focus: Editor.end(editor, []) });
        Transforms.delete(editor);
        Transforms.insertNodes(editor, template as unknown as Descendant[], { at: [0] });
        Transforms.select(editor, Editor.start(editor, []));
      });

      // 2) Update React state mirror (optional but keeps state in sync).
      setValue(template);

      // 3) Set title from file name (strip .json).
      const base = info.filename.replace(/\.json$/i, "");
      if (base) setTitle(base);
    },
    [editor]
  );

  const handleLoadError = React.useCallback((message: string) => {
    alert(`Template import failed: ${message}`);
  }, []);

  return (
    <Slate editor={editor} initialValue={value} onChange={handleChange}>
      <DocScaffold
        title={title}
        onTitleChange={setTitle}
        onSaveTemplate={handleSaveTemplate}
        onLoadTemplate={handleLoadTemplate}   // ⟵ apply title + slate directly
        onLoadError={handleLoadError}
      >
        <EditorComponent editor={editor} />
      </DocScaffold>
    </Slate>
  );
};

export default TemplateCreation;
