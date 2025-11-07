// Element.tsx
import * as React from "react";
import type { RenderElementProps } from "slate-react";
import type { Element as SlateElement } from "slate";

type Align = "left" | "center" | "right" | "justify";

interface BaseBlock extends SlateElement { align?: Align }

const blockAlign = (el: BaseBlock): React.CSSProperties =>
  el.align ? { textAlign: el.align } : {};

export const Element: React.FC<RenderElementProps> = ({ attributes, children, element }) => {
  const el = element as BaseBlock;

  switch (el.type) {
    case "bulleted-list":
      // Align the list container minimally; main effect happens on li
      return (
        <ul {...attributes} style={blockAlign(el)}>
          {children}
        </ul>
      );
    case "numbered-list":
      return (
        <ol {...attributes} style={blockAlign(el)}>
          {children}
        </ol>
      );
    case "list-item":
      // Align the item text (and optionally the marker — see B)
      return (
        <li {...attributes} style={blockAlign(el)}>
          {children}
        </li>
      );
    case "paragraph":
    default:
      return (
        <p {...attributes} style={blockAlign(el)}>
          {children}
        </p>
      );
  }
};
