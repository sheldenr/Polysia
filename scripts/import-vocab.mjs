import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const vocabFilePath = join(process.cwd(), "public/vocab.txt");
const outFilePath = join(process.cwd(), "public/chinese-dictionary-custom.json");

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

function extractHanzi(html) {
  const match = html.match(/<div class="hanzi">([^<]+)<\/div>/) || html.match(/<div class=""hanzi"">([^<]+)<\/div>/);
  return match ? match[1].trim() : "";
}

function extractSentence(html) {
  const match = html.match(/<div class="sentence-front">([\s\S]+?)<\/div>/) || html.match(/<div class=""sentence-front"">([\s\S]+?)<\/div>/);
  if (!match) return "";
  return stripHtml(match[1]);
}

function extractPinyin(html) {
  const match = html.match(/<div class="pinyin">([^<]+)<\/div>/) || html.match(/<div class=""pinyin"">([^<]+)<\/div>/);
  return match ? match[1].trim() : "";
}

function extractDefinition(html) {
  const match = html.match(/<div class="definition">([^<]+)<\/div>/) || html.match(/<div class=""definition"">([^<]+)<\/div>/);
  return match ? match[1].trim() : "";
}

function extractTranslation(html) {
  const match = html.match(/<div class="translation">([^<]+)<\/div>/) || html.match(/<div class=""translation"">([^<]+)<\/div>/);
  return match ? match[1].trim() : "";
}

// Simple CSV/TSV parser that handles quoted multi-line fields
function parseTsv(content) {
  const rows = [];
  let currentRow = [];
  let currentField = "";
  let inQuotes = false;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i+1];
    
    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === '\t') {
        currentRow.push(currentField);
        currentField = "";
      } else if (char === '\n') {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = "";
      } else if (char === '\r') {
        // ignore
      } else {
        currentField += char;
      }
    }
  }
  
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }
  
  return rows;
}

async function run() {
  console.log("Reading vocab.txt...");
  const content = await readFile(vocabFilePath, "utf-8");
  
  console.log("Parsing TSV...");
  const rows = parseTsv(content);
  console.log(`Parsed ${rows.length} rows.`);
  
  const entries = [];
  let idCounter = 0;

  for (let i = 0; i < rows.length; i++) {
    const fields = rows[i];
    if (fields.length < 3) continue;
    if (fields[0].trim().startsWith("#")) continue;

    const frontHtml = fields[0];
    const backHtml = fields[1];
    const hskTag = fields[2];

    const simplified = extractHanzi(frontHtml);
    if (!simplified) {
        if (i < 5) console.log(`Row ${i} missing hanzi. FrontHTML: ${frontHtml.slice(0, 50)}...`);
        continue;
    }

    const sentence = extractSentence(frontHtml);
    const pinyin = extractPinyin(backHtml);
    const english = extractDefinition(backHtml);
    const translation = extractTranslation(backHtml);
    
    const hskMatch = hskTag.match(/HSK (\d+)/i);
    const level = hskMatch ? hskMatch[1] : "1";
    
    idCounter++;
    const headwordId = `hsk-L${level}-${idCounter.toString().padStart(5, '0')}`;

    entries.push({
      s: simplified,
      t: simplified,
      p: pinyin,
      e: english,
      g: "",
      n: `${sentence} | ${translation} (HSK level ${level} vocabulary)`,
      h: headwordId
    });
  }

  console.log(`Writing ${entries.length} entries to ${outFilePath}...`);
  await writeFile(outFilePath, JSON.stringify(entries));
  console.log("Done!");
}

run().catch(console.error);
