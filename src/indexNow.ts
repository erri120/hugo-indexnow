import * as core from "@actions/core";
import {CacheFile} from "./cache";

export interface SiteChanges {
    added: string[];
    removed: string[];
    changed: string[];
}

export function getSiteChanges(
    currentCache: CacheFile,
    previousCache: CacheFile,
    gitDiff: string[]
): SiteChanges {
    const currentFiles = new Set(Object.keys(currentCache.hugoOutput));
    const previousFiles = new Set(Object.keys(previousCache.hugoOutput));
    const diffFiles = new Set(gitDiff);

    const added = [...currentFiles].filter(x => !previousFiles.has(x));
    const removed = [...previousFiles].filter(x => !currentFiles.has(x));
    const changed = [...diffFiles].filter(
        x => currentFiles.has(x) && previousFiles.has(x)
    );

    return {
        added: added.map(x => currentCache.hugoOutput[x]),
        removed: removed.map(x => previousCache.hugoOutput[x]),
        changed: changed.map(x => currentCache.hugoOutput[x])
    };
}

export async function submitURLs(
    host: string,
    key: string,
    changes: SiteChanges,
    endpoints: string[],
    keyLocation?: string | undefined
): Promise<boolean> {
    let success = true;
    const urlList: string[] = [
        ...changes.added,
        ...changes.changed,
        ...changes.removed
    ];

    for (const endpoint of endpoints) {
        const payload = {
            host,
            key,
            keyLocation,
            urlList
        };

        const res = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) continue;

        core.error(`${res.statusText}\n${res.text()}`);
        success = false;
    }

    return success;
}
