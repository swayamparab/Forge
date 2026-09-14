import { WebContainer } from "@webcontainer/api";

let webContainerPromise: Promise<WebContainer> | null = null;

export function getWebContainer() {
    if (!webContainerPromise) {
        webContainerPromise = WebContainer.boot();
    }

    return webContainerPromise;
}