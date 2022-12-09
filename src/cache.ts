import {stat, writeFile, readFile} from "fs/promises";
import {HugoOutput} from "./hugo";

const cacheFilePath = ".github/indexnow.cache";

export async function hasCacheFile(): Promise<boolean> {
    try {
        const res = await stat(cacheFilePath);
        return res.isFile();
    } catch {
        return false;
    }
}

export interface CacheFile {
    commit: string;
    hugoOutput: HugoOutput;
}

export async function writeCacheFile(cacheFile: CacheFile): Promise<void> {
    const data = new Uint8Array(
        Buffer.from(
            `${cacheFile.commit}\n${JSON.stringify(cacheFile.hugoOutput)}`
        )
    );

    await writeFile(cacheFilePath, data);
}

export async function readCacheFile(): Promise<CacheFile> {
    const data = await readFile(cacheFilePath, {
        encoding: "utf-8"
    });

    const newLineIndex = data.indexOf("\n");
    const commit = data.substring(0, newLineIndex);
    const jsonContents = data.substring(newLineIndex + 1);
    const hugoOutput = JSON.parse(jsonContents);

    return {
        commit,
        hugoOutput
    };
}
