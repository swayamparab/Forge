import type { WebContainer } from "@webcontainer/api";

export async function syncFileToWebContainer(
    container: WebContainer,
    path: string,
    content: string,
) {
    await container.fs.writeFile(
        path,
        content,
    );
}

export async function deleteFileFromWebContainer(
    container: WebContainer,
    path: string,
) {
    await container.fs.rm(path, {
        recursive: true,
    });
}