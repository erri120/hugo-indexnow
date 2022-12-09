import * as core from "@actions/core";
import {listAll, parseOutput} from "./hugo";
import {diff, getCommit} from "./git";
import {CacheFile, hasCacheFile, readCacheFile, writeCacheFile} from "./cache";
import {getSiteChanges, submitURLs} from "./indexNow";

async function run(): Promise<boolean> {
    const requiredInput = {
        required: true
    };

    try {
        const siteDirectory: string = core.getInput("siteDirectory", {
            required: false
        });

        const host: string = core.getInput("host", requiredInput);
        const key: string = core.getInput("key", requiredInput);
        const endpoints: string[] = core.getMultilineInput(
            "endpoints",
            requiredInput
        );

        const keyLocation: string = core.getInput("keyLocation", {
            required: false
        });

        const hugoList = await listAll(siteDirectory);
        if (hugoList === null) return false;

        const currentCommit = await getCommit();
        if (currentCommit === null) return false;

        const currentHugoOutput = parseOutput(hugoList);

        const currentCache: CacheFile = {
            commit: currentCommit,
            hugoOutput: currentHugoOutput
        };

        if (!(await hasCacheFile())) {
            writeCacheFile(currentCache);
            return true;
        }

        const previousCache = await readCacheFile();
        const gitDiff = await diff(currentCommit, previousCache.commit);
        if (gitDiff === null) return false;

        const changes = getSiteChanges(currentCache, previousCache, gitDiff);
        writeCacheFile(currentCache);

        return await submitURLs(
            host,
            key,
            changes,
            endpoints,
            keyLocation === "" ? undefined : keyLocation
        );
    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message);
        return false;
    }
}

async function main(): Promise<void> {
    const success = await run();
    if (success) return;
    core.setFailed("Failed");
}

main();
