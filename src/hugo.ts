import {parse} from "csv-parse/sync";
import execWrapper from "./execWrapper";

export async function listAll(siteDirectory: string): Promise<string | null> {
    return execWrapper("hugo", ["list", "all"], siteDirectory);
}

export type HugoOutput = Record<string, string>;

export function parseOutput(output: string): HugoOutput {
    const res: {path: string; permalink: string}[] = parse(output, {
        columns: output.substring(0, output.indexOf("\n")).split(","),
        from_line: 2,
        delimiter: ",",
        encoding: "utf-8",
        bom: false
    });

    return Object.fromEntries(res.map(item => [item.path, item.permalink]));
}
