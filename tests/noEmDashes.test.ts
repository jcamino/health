import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// House rule: no em dashes anywhere in the site or the code behind it. Rewrite the
// sentence instead of swapping in another dash. Numeric ranges keep their en dash,
// and citation titles use the hyphen form PubMed indexes them under.
const EM_DASH = new RegExp(
  `${String.fromCodePoint(0x2014)}|&(mdash|#8212|#x2014);`,
  "i",
);
const TEXT_FILE = /\.(astro|css|html|md|mdx|svelte|svg|ts|txt)$/;
const ROOTS = ["src", "public", "tests", "README.md"];

function textFiles(path: string): string[] {
  if (statSync(path).isDirectory()) {
    return readdirSync(path).flatMap((name) => textFiles(join(path, name)));
  }
  return TEXT_FILE.test(path) ? [path] : [];
}

describe("em dashes", () => {
  it("appear nowhere in the site or its code", () => {
    const hits = ROOTS.flatMap(textFiles).flatMap((file) =>
      readFileSync(file, "utf8")
        .split("\n")
        .flatMap((line, i) => (EM_DASH.test(line) ? [`${file}:${i + 1}`] : [])),
    );
    expect(hits).toEqual([]);
  });
});
