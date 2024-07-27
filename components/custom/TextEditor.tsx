import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface TextEditorProps {
  placeholder: string;
  value?: string;
  onChange: (value: string) => void;
}

const TextEditor = ({ placeholder, value, onChange }: TextEditorProps) => {
  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill"), { ssr: false }),
    []
  );
  return (
    <ReactQuill
      theme="snow"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
};

export default TextEditor;
