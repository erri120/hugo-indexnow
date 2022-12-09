import { parseOutput } from "../src/hugo";
import { getSiteChanges } from "../src/indexNow";
import { expect, test } from '@jest/globals'

test("parse output", () => {
    const output = "path,permalink\n1.md,https://example.com/1\n2.md,https://example.com/2";
    const parsed = parseOutput(output);

    expect(parsed["1.md"]).toBe("https://example.com/1");
    expect(parsed["2.md"]).toBe("https://example.com/2");
});

test("create site changes (added)", () => {
    const changes = getSiteChanges({
        commit: "",
        hugoOutput: {
            "1.md": "https://example.com/1",
            "2.md": "https://example.com/2"
        }
    }, {
        commit: "",
        hugoOutput: {
            "1.md": "https://example.com/1"
        }
    }, []);

    expect(changes.added).toStrictEqual(["https://example.com/2"])
    expect(changes.removed).toStrictEqual([]);
    expect(changes.changed).toStrictEqual([]);
});

test("create site changes (removed)", () => {
    const changes = getSiteChanges({
        commit: "",
        hugoOutput: {}
    }, {
        commit: "",
        hugoOutput: {
            "1.md": "https://example.com/1"
        }
    }, []);

    expect(changes.added).toStrictEqual([])
    expect(changes.removed).toStrictEqual(["https://example.com/1"]);
    expect(changes.changed).toStrictEqual([]);
});

test("create site changes (changed)", () => {
    const changes = getSiteChanges({
        commit: "",
        hugoOutput: {
            "1.md": "https://example.com/1"
        }
    }, {
        commit: "",
        hugoOutput: {
            "1.md": "https://example.com/1"
        }
    }, ["1.md"]);

    expect(changes.added).toStrictEqual([])
    expect(changes.removed).toStrictEqual([]);
    expect(changes.changed).toStrictEqual(["https://example.com/1"]);
});
