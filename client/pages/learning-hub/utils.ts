const HSK_VOCAB_SUFFIX_REGEX = /\(HSK level \d+ vocabulary\)\s*$/i;
const HSK_VOCAB_LABEL_REGEX = /^HSK level \d+ vocabulary$/i;
const HANZI_REGEX = /[\u3400-\u9fff]/;
const BRACKETED_ANNOTATION_REGEX = /^\(.*\)$/;

export function parseExampleFromNotes(notes: string): { sentence: string; pinyin: string; translation: string } {
  const cleanedNotes = (notes || "").replace(HSK_VOCAB_SUFFIX_REGEX, "").trim();
  if (!cleanedNotes) return { sentence: "", pinyin: "", translation: "" };

  const parts = cleanedNotes.split("|").map((p) => p.trim()).filter(Boolean);
  const contentParts = parts.filter(p => !BRACKETED_ANNOTATION_REGEX.test(p));
  
  const sentencePart = contentParts.find((p) => HANZI_REGEX.test(p)) ?? contentParts[0] ?? "";
  const translationPart = contentParts.find((p) => p !== sentencePart) ?? "";
  
  const sentence = (HSK_VOCAB_LABEL_REGEX.test(sentencePart) || BRACKETED_ANNOTATION_REGEX.test(sentencePart)) ? "" : sentencePart;
  const translation = translationPart.replace(HSK_VOCAB_SUFFIX_REGEX, "").trim();
  
  // Extract pinyin if it exists in the original parts but wasn't selected as sentence/translation
  const pinyinPart = parts.find(p => p !== sentencePart && p !== translationPart && !HANZI_REGEX.test(p)) || "";

  return { sentence, pinyin: pinyinPart, translation };
}

export function getSrsDayStart(date: Date) {
  const d = new Date(date);
  d.setHours(4, 0, 0, 0); // SRS day starts at 4 AM
  if (date.getHours() < 4) {
    d.setDate(d.getDate() - 1);
  }
  return d;
}
