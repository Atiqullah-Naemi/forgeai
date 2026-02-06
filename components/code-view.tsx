"use client";

import Editor, { Monaco } from "@monaco-editor/react";
import { useMemo } from "react";

const toMonacoLanguage = (lang: string) => {
  switch (lang) {
    case "ts":
    case "tsx":
      return "typescript";
    case "js":
    case "jsx":
      return "javascript";
    case "json":
      return "json";
    case "css":
      return "css";
    case "yaml":
      return "yaml";
    case "md":
      return "markdown";
    default:
      return "plaintext";
  }
};

function configureMonaco(monaco: Monaco) {
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    jsx: monaco.languages.typescript.JsxEmit.React,
    allowNonTsExtensions: true,
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    esModuleInterop: true,
    allowJs: true,
    checkJs: false,
    strict: false,
    skipLibCheck: true,
  });
}

export function CodeView({
  code,
  lang,
  filePath,
  localValue,
  onChange,
}: {
  code: string;
  lang: string;
  filePath: string;
  localValue?: string;
  onChange: (next: string) => void;
}) {
  const value = localValue ?? code;

  const monaocLang = useMemo(() => toMonacoLanguage(lang), [lang]);

  return (
    <Editor
      height="100%"
      width="100%"
      language={monaocLang}
      value={value}
      theme="vs-dark"
      path={filePath}
      onChange={(v) => onChange(v ?? "")}
      beforeMount={configureMonaco}
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        tabSize: 2,
        insertSpaces: true,
        wordWrap: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        renderValidationDecorations: "on",
        padding: { top: 20, bottom: 20 },
        stickyScroll: { enabled: false },
      }}
    />
  );
}
