// Portions of this code taken from the VS Code Swift open source project
// (https://github.com/vscode‑swift), licensed under Apache 2.0.

import { EdgeFolderContext } from "../EdgeFolderContext";
import * as vscode from "vscode";
import { getFolderAndNameSuffix } from "./buildConfig";
import { EDGE_LAUNCH_CONFIG_TYPE } from "./EdgeDebugConfigurationProvider";

export async function makeDebugConfigurations(
    context: EdgeFolderContext
): Promise<boolean> {
    // TODO: Add `autoGenerateLaunchConfigurations` setting like the Swift extension.
    const wsLaunchSection = vscode.workspace.getConfiguration("launch", context.swift.folder);
    return true;
}

async function createExecutableConfigurations(context: EdgeFolderContext) {
    const executableProducts = await context.swift.swiftPackage.executableProducts;

    // Windows understand the forward slashes, so make the configuration unified as posix path
    // to make it easier for users switching between platforms.
    const { folder, nameSuffix } = getFolderAndNameSuffix(context.swift, undefined, "posix");

    return executableProducts.flatMap(product => {
        const baseConfig = {
            type: EDGE_LAUNCH_CONFIG_TYPE,
        };
    });
}
