// src/components/Editor/Leaf.tsx
import React from 'react';

export const Leaf = ({ attributes, children, leaf }: any) => {
  let style: React.CSSProperties = {};

  if (leaf.bold) {
    style.fontWeight = 'bold';
  }
  if (leaf.italic) {
    style.fontStyle = 'italic';
  }
  if (leaf.underline) {
    style.textDecoration = 'underline';
  }
  if (leaf.fontSize) {
    console.log(leaf.fontSize)
    style.fontSize = leaf.fontSize; // Apply custom font size
  }

  return (
    <span {...attributes} style={style}>
      {children}
    </span>
  );
};
