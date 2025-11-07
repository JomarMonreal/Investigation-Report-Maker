import * as React from "react";
import {
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  TextField,
  InputAdornment,
} from "@mui/material";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import { Editor, Element as SlateElement, Transforms, Text, Range } from "slate";
import { ReactEditor, useSlate } from "slate-react";
import { toggleFontSize, toggleMark } from "../../utils/slateHelpers";

/** Text alignment values supported by our schema. */
type Align = "left" | "center" | "right" | "justify";

/** List block types supported by our schema. */
type ListType = "bulleted-list" | "numbered-list";

/** Inline marks we expose in the UI. */
type Mark = "bold" | "italic" | "underline";

/** Slate element shape for blocks that accept `align`. */
interface AlignableElement extends SlateElement { align?: Align; }
interface ListElement extends SlateElement { type: ListType; children: SlateElement[]; }

/** MARK HELPERS — font size */
const normalizeFontSize = (val: unknown): number | undefined => {
  if (typeof val === "number" && Number.isFinite(val)) return val;
  if (typeof val === "string") {
    const n = Number(val.replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : undefined;
  }
  return 16;
};

/** Reads the selection’s fontSize mark. If mixed, returns undefined. */
const getCurrentFontSize = (editor: Editor): number | undefined => {
  if (!editor.selection) return 16;

  // Collapsed selection: rely on Editor.marks()
  if (Range.isCollapsed(editor.selection)) {
    const m = Editor.marks(editor) as Record<string, unknown> | null;
    return normalizeFontSize(m?.fontSize);
  }

  // Expanded selection: scan text nodes and collapse to a single value if uniform
  const sizes = new Set<number>();
  for (const [n] of Editor.nodes(editor, { at: editor.selection, match: Text.isText })) {
    const size = normalizeFontSize((n as any).fontSize);
    if (size !== undefined) sizes.add(size);
    else sizes.add(NaN); // represent "no size mark" explicitly
    if (sizes.size > 1) break;
  }

  // If everything matches, return it; otherwise undefined
  if (sizes.size === 1) {
    const only = sizes.values().next().value as number;
    return Number.isNaN(only) ? undefined : only;
  }
  return undefined;
};

/** Sets an exact font size mark (in px). */
const setFontSize = (editor: Editor, px: number): void => {
  if (!editor.selection) return;
  // Remove mark if px is invalid
  if (!Number.isFinite(px) || px <= 0) {
    Editor.removeMark(editor, "fontSize");
    return;
  }
  Editor.addMark(editor, "fontSize", px);
};

/** MARK HELPERS — bold/italic/underline */
const isMarkActive = (editor: Editor, mark: Mark): boolean =>
  Boolean(Editor.marks(editor)?.[mark]);

/** ALIGN HELPERS */
const setAlignment = (editor: Editor, align: Align): void => {
  if (!editor.selection) return;

  const inListItem = Editor.above(editor, {
    at: editor.selection,
    mode: "lowest",
    match: (n) => SlateElement.isElement(n) && (n as SlateElement).type === "list-item",
  });

  if (inListItem) {
    Transforms.setNodes(
      editor,
      { align },
      { match: (n) => SlateElement.isElement(n) && (n as SlateElement).type === "list-item", split: true }
    );
  } else {
    Transforms.setNodes(
      editor,
      { align },
      { match: (n) => SlateElement.isElement(n) && (n as SlateElement).type === "paragraph", split: true }
    );
  }
};

const getCurrentAlign = (editor: Editor): Align => {
  if (!editor.selection) return "left";
  const withAlign =
    Editor.above(editor, {
      at: editor.selection,
      mode: "lowest",
      match: (n) => SlateElement.isElement(n) && "align" in (n as any),
    }) ??
    Editor.above(editor, {
      at: editor.selection,
      mode: "lowest",
      match: (n) => Editor.isBlock(editor, n),
    });

  const node = withAlign?.[0] as AlignableElement | undefined;
  return (node?.align as Align) ?? "left";
};

/** LIST HELPERS (your improved versions) */
const isListActive = (editor: Editor, type: ListType): boolean => {
  const [match] = Editor.nodes(editor, {
    match: (n) => SlateElement.isElement(n) && (n as SlateElement).type === type,
  });
  return Boolean(match);
};

const isListContainerActive = (editor: Editor, type: ListType): boolean =>
  !!Editor.above(editor, {
    at: editor.selection ?? undefined,
    match: (n) => SlateElement.isElement(n) && (n as SlateElement).type === type,
  });

const unwrapAnyList = (editor: Editor): void => {
  Transforms.unwrapNodes(editor, {
    match: (n) => SlateElement.isElement(n) && ((n as SlateElement).type === "bulleted-list" || (n as SlateElement).type === "numbered-list"),
    split: true,
  });
};

const WRAP_PARAGRAPH_IN_LI = false;

const ensureLiShape = (editor: Editor): void => {
  if (!WRAP_PARAGRAPH_IN_LI) return;
  const entries = Array.from(Editor.nodes(editor, { match: (n) => SlateElement.isElement(n) && (n as SlateElement).type === "list-item" }));
  for (const [, path] of entries) {
    const [first] = Editor.node(editor, path);
    if (
      SlateElement.isElement(first) &&
      first.children.some((c) => SlateElement.isElement(c as any) && (c as SlateElement).type !== "paragraph")
    ) {
      Transforms.wrapNodes(
        editor,
        { type: "paragraph", children: [] } as SlateElement,
        { at: path, match: (n) => Editor.isInline(editor, n) || Editor.isVoid(editor, n) }
      );
    }
  }
};

const toggleList = (editor: Editor, type: ListType): void => {
  if (!editor.selection) return;

  Editor.withoutNormalizing(editor, () => {
    const wasContainerActive = isListContainerActive(editor, type);

    unwrapAnyList(editor);

    if (wasContainerActive) {
      Transforms.setNodes(
        editor,
        { type: "paragraph" },
        { match: (n) => SlateElement.isElement(n) && (n as SlateElement).type === "list-item" }
      );
      return;
    }

    const at = Editor.unhangRange(editor, editor.selection);
    Transforms.setNodes(
      editor,
      { type: "list-item" },
      {
        at,
        match: (n) =>
          SlateElement.isElement(n) &&
          (n as SlateElement).type !== "bulleted-list" &&
          (n as SlateElement).type !== "numbered-list" &&
          (n as SlateElement).type !== "list-item",
      }
    );

    const list: ListElement = { type, children: [] };
    Transforms.wrapNodes(editor, list, { at, match: (n) => SlateElement.isElement(n) && (n as SlateElement).type === "list-item" });

    ensureLiShape(editor);
  });

  ReactEditor.focus(editor);
};

export const EditorToolbar: React.FC = React.memo(() => {
  const editor = useSlate();

  // Marks state
  const marks = React.useMemo<ReadonlyArray<Mark>>(() => {
    const active: Mark[] = [];
    if (isMarkActive(editor, "bold")) active.push("bold");
    if (isMarkActive(editor, "italic")) active.push("italic");
    if (isMarkActive(editor, "underline")) active.push("underline");
    return active;
  }, [editor]);

  const handleMarkChange = React.useCallback(
    (_e: React.MouseEvent<HTMLElement>, next: ReadonlyArray<Mark>) => {
      (["bold", "italic", "underline"] as const).forEach((m) => {
        const was = marks.includes(m);
        const now = next.includes(m);
        if (was !== now) toggleMark(editor, m);
      });
    },
    [editor, marks]
  );

  // Lists state
  const listState = React.useMemo<ReadonlyArray<ListType>>(() => {
    const active: ListType[] = [];
    if (isListActive(editor, "bulleted-list")) active.push("bulleted-list");
    if (isListActive(editor, "numbered-list")) active.push("numbered-list");
    return active;
  }, [editor]);

  const handleListChange = React.useCallback(
    (_e: React.MouseEvent<HTMLElement>, next: ReadonlyArray<ListType>): void => {
      const target = next.find((n) => !listState.includes(n)) ?? listState.find((l) => !next.includes(l));
      if (!target) return;
      toggleList(editor, target);
    },
    [editor, listState]
  );

  // Alignment state
  const align = getCurrentAlign(editor);
  const handleAlignChange = React.useCallback(
    (_e: React.MouseEvent<HTMLElement>, next: Align | null): void => {
      if (next) setAlignment(editor, next);
    },
    [editor]
  );

  // Font size state (derived each render so it stays in sync)
  const fontSize = getCurrentFontSize(editor);

  const handleFontSizeInput = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value === "" ? NaN : e.target.valueAsNumber;
      if (Number.isNaN(next)) {
        // Empty or invalid: remove size mark
        Editor.removeMark(editor, "fontSize");
      } else {
        setFontSize(editor, Math.max(1, Math.min(512, Math.round(next))));
      }
    },
    [editor]
  );

  const stepFontSize = React.useCallback(
    (delta: number) => {
      // Use your existing delta helper, but fall back to setting a base if undefined
      if (fontSize === undefined) {
        setFontSize(editor, delta > 0 ? 16 + delta : Math.max(1, 16 + delta));
      } else {
        toggleFontSize(editor, delta);
      }
    },
    [editor, fontSize]
  );

  return (
    <Stack alignItems="center" direction="row" spacing={1}>
      <ToggleButtonGroup aria-label="Text styles" onChange={handleMarkChange} size="small" value={marks}>
        <ToggleButton value="bold" aria-label="Bold"><FormatBoldIcon fontSize="small" /></ToggleButton>
        <ToggleButton value="italic" aria-label="Italic"><FormatItalicIcon fontSize="small" /></ToggleButton>
        <ToggleButton value="underline" aria-label="Underline"><FormatUnderlinedIcon fontSize="small" /></ToggleButton>
      </ToggleButtonGroup>

      <Divider flexItem orientation="vertical" />

      <ToggleButtonGroup aria-label="Lists" onChange={handleListChange} size="small" value={listState}>
        <ToggleButton value="bulleted-list" aria-label="Bulleted list"><FormatListBulletedIcon fontSize="small" /></ToggleButton>
        <ToggleButton value="numbered-list" aria-label="Numbered list"><FormatListNumberedIcon fontSize="small" /></ToggleButton>
      </ToggleButtonGroup>

      <Divider flexItem orientation="vertical" />

      <ToggleButtonGroup aria-label="Alignment" exclusive onChange={handleAlignChange} size="small" value={align}>
        <ToggleButton value="left" aria-label="Align left"><FormatAlignLeftIcon fontSize="small" /></ToggleButton>
        <ToggleButton value="center" aria-label="Align center"><FormatAlignCenterIcon fontSize="small" /></ToggleButton>
        <ToggleButton value="right" aria-label="Align right"><FormatAlignRightIcon fontSize="small" /></ToggleButton>
        <ToggleButton value="justify" aria-label="Justify"><FormatAlignJustifyIcon fontSize="small" /></ToggleButton>
      </ToggleButtonGroup>

      <Divider flexItem orientation="vertical" />

      {/* Font size controls */}
      <Tooltip title="Set exact font size (px)">
        <TextField
          aria-label="Font size"
          type="number"
          size="small"
          value={fontSize ?? ""}
          placeholder={fontSize === undefined ? "—" : undefined}
          onChange={handleFontSizeInput}
          inputProps={{ min: 1, max: 512, step: 1, style: { width: 64, textAlign: "center" } }}
          InputProps={{ endAdornment: <InputAdornment position="end">px</InputAdornment> }}
        />
      </Tooltip>

      <Tooltip title="Decrease font size (Ctrl+Shift+,)">
        <ToggleButton value="decrease" onClick={() => stepFontSize(-1)} aria-label="Decrease font size">–</ToggleButton>
      </Tooltip>
      <Tooltip title="Increase font size (Ctrl+Shift+.)">
        <ToggleButton value="increase" onClick={() => stepFontSize(1)} aria-label="Increase font size">+</ToggleButton>
      </Tooltip>
    </Stack>
  );
});
