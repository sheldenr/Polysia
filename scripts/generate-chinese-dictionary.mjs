import { writeFile } from "node:fs/promises";

const sourceUrl =
  "https://raw.githubusercontent.com/alexamies/chinesenotes.com/4f2b9eb520d3e3c737bed9842384071828d5bc0c/data/cnotes_zh_en_dict.tsv";
const outFile = new URL("../public/chinese-dictionary.json", import.meta.url);
const hanziRegex = /\p{Script=Han}/u;

function sanitize(value) {
  if (!value || value === "\\N") {
    return "";
  }
  return value.trim();
}

function pickLonger(a, b) {
  return b.length > a.length ? b : a;
}

function isSingleHanzi(character) {
  return character.length === 1 && hanziRegex.test(character);
}

console.log(`Downloading dictionary source: ${sourceUrl}`);
const response = await fetch(sourceUrl);
if (!response.ok) {
  throw new Error(`Failed to download dictionary source: ${response.status}`);
}

const tsv = await response.text();
const entriesByChar = new Map();

for (const line of tsv.split("\n")) {
  if (!line || line.startsWith("#")) {
    continue;
  }

  const fields = line.split("\t");
  if (fields.length < 16) {
    continue;
  }

  const simplified = sanitize(fields[1]);
  const traditionalRaw = sanitize(fields[2]);
  const pinyin = sanitize(fields[3]);
  const english = sanitize(fields[4]);
  const grammar = sanitize(fields[5]);
  const notes = sanitize(fields[14]);
  const headwordId = sanitize(fields[15]) || sanitize(fields[0]);
  const traditional = traditionalRaw || simplified;

  const candidates = new Set([simplified, traditional]);
  for (const candidate of candidates) {
    if (!isSingleHanzi(candidate)) {
      continue;
    }

    const existing = entriesByChar.get(candidate);
    if (!existing) {
      entriesByChar.set(candidate, {
        s: candidate,
        t: candidate,
        p: pinyin,
        e: english || "No English definition available",
        g: grammar || "unknown",
        n: notes,
        h: headwordId,
      });
      continue;
    }

    existing.p = existing.p || pinyin;
    existing.e = pickLonger(existing.e, english);
    existing.g = existing.g === "unknown" && grammar ? grammar : existing.g;
    existing.n = pickLonger(existing.n, notes);
  }
}

const dictionary = [...entriesByChar.values()].sort((a, b) => a.s.localeCompare(b.s, "zh-Hans"));
console.log(`Writing ${dictionary.length} single-character entries to ${outFile.pathname}`);
await writeFile(outFile, `${JSON.stringify(dictionary)}\n`, "utf8");
console.log("Dictionary generation complete.");
