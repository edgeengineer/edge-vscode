import { execFile, expandFilePathTilde, getErrorDescription } from "../utilities/utilities";
import * as fs from "fs/promises";

export class EdgeCLI {
    constructor(
        public readonly path: string,
    ) {}

    static async create(): Promise<EdgeCLI> {
        const path = await EdgeCLI.getEdgePath();
        return new EdgeCLI(path);
    }

    private static async getEdgePath(): Promise<string> {
        // This follows a similar pattern to `SwiftToolchain.getSwiftFolderPath()`
        // in the Swift extension.
        try {
            let edgeCli: string;
            // TODO: Allow overriding the path via a setting.
            switch (process.platform) {
                case "darwin": {
                    const { stdout } = await execFile("which", ["edge"]);
                    edgeCli = stdout.trimEnd();
                    break;
                }
                default: {
                    // similar to SwiftToolchain.getSwiftFolderPath(), use `type` to find `edge`
                    const { stdout } = await execFile("/bin/sh", [
                        "-c",
                        "LC_MESSAGES=C type edge",
                    ]);
                    const edgeMatch = /^edge is (.*)$/.exec(stdout.trimEnd());
                    if (edgeMatch) {
                        edgeCli = edgeMatch[1];
                    } else {
                        throw Error("Failed to find edge executable");
                    }
                    break;
                }
            }
            
            // It might be a symbolic link, so resolve it.
            const realEdge = await fs.realpath(edgeCli);
            return expandFilePathTilde(realEdge);
        } catch (error) {
            throw new Error(`Failed to find edge executable`);
        }
    }
}
