import { writeFile } from "node:fs/promises";

const sourceUrl =
  "https://raw.githubusercontent.com/alexamies/chinesenotes.com/4f2b9eb520d3e3c737bed9842384071828d5bc0c/data/cnotes_zh_en_dict.tsv";
const outFile = new URL("../public/chinese-dictionary-custom.json", import.meta.url);
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

  // Extract HSK level from notes if present
  // Pattern examples: (HSK '欢迎' 1), (HSK '世界'), (HSK '藏' 1)
  const hskMatch = notes.match(/\(HSK\s+'[^']+'\s*(\d+)?\)/i);
  const hskLevel = hskMatch ? (hskMatch[1] ? parseInt(hskMatch[1], 10) : 1) : null;

  if (hskLevel || hanziRegex.test(simplified)) {
    const entry = {
      s: simplified,
      t: traditional,
      p: pinyin,
      e: english || "No English definition available",
      g: grammar || "unknown",
      n: notes,
      h: hskLevel ? `hsk-L${hskLevel}-${headwordId}` : headwordId,
    };

    // If it's a multi-character word, just add it.
    // If it's a single character, we might want to merge definitions as before.
    if (simplified.length > 1) {
       entriesByChar.set(simplified, entry);
    } else {
      const existing = entriesByChar.get(simplified);
      if (!existing) {
        entriesByChar.set(simplified, entry);
      } else {
        existing.p = existing.p || pinyin;
        existing.e = pickLonger(existing.e, english);
        existing.g = existing.g === "unknown" && grammar ? grammar : existing.g;
        existing.n = pickLonger(existing.n, notes);
        // Keep the HSK headword ID if available
        if (hskLevel && !existing.h.startsWith("hsk-")) {
          existing.h = entry.h;
        }
      }
    }
  }
}

const dictionary = [...entriesByChar.values()].sort((a, b) => a.s.localeCompare(b.s, "zh-Hans"));
console.log(`Writing ${dictionary.length} entries to ${outFile.pathname}`);
await writeFile(outFile, `${JSON.stringify(dictionary)}\n`, "utf8");
console.log("Dictionary generation complete.");
