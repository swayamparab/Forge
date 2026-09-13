"use client";

import {
    useEffect,
    useRef,
} from "react";

import {
    Terminal as XTerm,
} from "@xterm/xterm";

import "@xterm/xterm/css/xterm.css";

interface RunCommand {
    fileName: string;
    content: string;
}

interface TerminalProps {
    className?: string;
    onClose: () => void;
    runCommand?: RunCommand | null;
}

export default function Terminal({
    className = "",
    onClose,
    runCommand,
}: TerminalProps) {
    const terminalRef =
        useRef<HTMLDivElement | null>(
            null,
        );

    const socketRef =
        useRef<WebSocket | null>(
            null,
        );

    const pendingRunRef =
        useRef<RunCommand | null>(
            null,
        );

    useEffect(() => {
        if (!terminalRef.current) {
            return;
        }

        const terminal = new XTerm({
            cursorBlink: true,
            fontSize: 13,
            fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            scrollback: 5000,
            scrollSensitivity: 3,
            fastScrollSensitivity: 5,
            theme: {
                background: "#09090b",
                foreground: "#d4d4d8",
                cursor: "#fafafa",
            },
        });

        terminal.open(
            terminalRef.current,
        );

        terminal.writeln(
            "\x1b[90mConnecting to MeshIDE terminal...\x1b[0m",
        );

        const protocol =
            window.location.protocol ===
                "https:"
                ? "wss"
                : "ws";

        const host =
            window.location.hostname ===
                "localhost"
                ? "localhost:5000"
                : window.location.host;

        const socket =
            new WebSocket(
                `${protocol}://${host}/terminal`,
            );

        socketRef.current =
            socket;

        socket.onopen = () => {
            terminal.writeln(
                "\x1b[32mConnected.\x1b[0m",
            );

            if (
                pendingRunRef.current
            ) {
                socket.send(
                    JSON.stringify({
                        type: "run",
                        fileName:
                            pendingRunRef
                                .current
                                .fileName,
                        content:
                            pendingRunRef
                                .current
                                .content,
                    }),
                );

                pendingRunRef.current =
                    null;
            }
        };

        socket.onmessage = (
            event,
        ) => {
            try {
                const message =
                    JSON.parse(
                        event.data,
                    );

                if (
                    message.type ===
                    "output" &&
                    typeof message.data ===
                    "string"
                ) {
                    terminal.write(
                        message.data,
                    );

                    return;
                }

                if (
                    message.type ===
                    "exit"
                ) {
                    terminal.writeln(
                        "\r\n\x1b[90mTerminal process exited.\x1b[0m",
                    );
                }
            } catch {
            }
        };

        socket.onerror = () => {
            terminal.writeln(
                "\r\n\x1b[31mTerminal connection error.\x1b[0m",
            );
        };

        socket.onclose = (
            event,
        ) => {
            if (
                event.code !== 1000
            ) {
                terminal.writeln(
                    `\r\n\x1b[31mTerminal disconnected (${event.code}).\x1b[0m`,
                );
            } else {
                terminal.writeln(
                    "\r\n\x1b[90mDisconnected.\x1b[0m",
                );
            }
        };

        const dataDisposable =
            terminal.onData(
                (data) => {
                    if (
                        socket.readyState ===
                        WebSocket.OPEN
                    ) {
                        socket.send(
                            JSON.stringify({
                                type: "input",
                                data,
                            }),
                        );
                    }
                },
            );

        return () => {
            dataDisposable.dispose();

            socket.close();

            terminal.dispose();

            socketRef.current =
                null;
        };
    }, []);

    useEffect(() => {
        if (!runCommand) {
            return;
        }

        const socket =
            socketRef.current;

        if (
            socket &&
            socket.readyState ===
            WebSocket.OPEN
        ) {
            socket.send(
                JSON.stringify({
                    type: "run",
                    fileName:
                        runCommand.fileName,
                    content:
                        runCommand.content,
                }),
            );

            return;
        }

        pendingRunRef.current =
            runCommand;
    }, [runCommand]);

    return (
        <section
            className={`flex h-full flex-col ${className}`}
        >
            <div className="flex h-9 shrink-0 items-center justify-between border-b border-zinc-800 px-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Terminal
                </span>

                <button
                    type="button"
                    onClick={onClose}
                    className="flex h-6 w-6 items-center justify-center rounded text-zinc-600 transition hover:bg-zinc-800 hover:text-zinc-200"
                    aria-label="Close terminal"
                >
                    ×
                </button>
            </div>

            <div
                ref={terminalRef}
                className="min-h-0 flex-1 overflow-auto"
            />
        </section>
    );
}