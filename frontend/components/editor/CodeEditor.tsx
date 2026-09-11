"use client";

import Editor from "@monaco-editor/react";

interface CodeEditorProps {
    value: string;
    language: string;
    onChange?: (value: string | undefined) => void;
}

export default function CodeEditor({
    value,
    language,
    onChange,
}: CodeEditorProps) {
    return (
        <Editor
            height="100%"
            theme="vs-dark"
            language={language}
            value={value}
            onChange={onChange}
            options={{
                minimap: {
                    enabled: true,
                },
                fontSize: 14,
                lineNumbers: "on",
                wordWrap: "off",
                automaticLayout: true,
                tabSize: 4,
                padding: {
                    top: 12,
                },
            }}
        />
    );
}