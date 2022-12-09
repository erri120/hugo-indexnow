import execWrapper from "./execWrapper";

export async function diff(
    start: string,
    end: string
): Promise<string[] | null> {
    const output = await execWrapper("git", [
        "diff",
        "--name-only",
        start,
        end
    ]);
    if (output === null) return null;
    return output.split("\n");
}

export async function getCommit(): Promise<string | null> {
    const output = await execWrapper("git", ["rev-parse", "HEAD"]);
    if (output === null) return null;
    return output.trim();
}
