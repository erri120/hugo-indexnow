import * as core from "@actions/core";
import * as exec from "@actions/exec";

async function wrapper(
    commandLine: string,
    args?: string[] | undefined,
    cwd?: string | undefined
): Promise<string | null> {
    let output = "";
    let error = "";

    await exec.exec(commandLine, args, {
        cwd,
        listeners: {
            stdout(data: Buffer) {
                output += data.toString();
            },
            stderr(data: Buffer) {
                error += data.toString();
            }
        }
    });

    if (error === "") return output;
    core.error(error);
    return null;
}

export default wrapper;
