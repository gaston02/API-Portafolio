import axios from "axios";
import { MYMEMORY_API } from "../config.js";
import { normalizeText } from "../utils/normalizeText.util.js";

const MYMEMORY_API_URL = MYMEMORY_API;

export async function translateText(text, targetLanguage) {
  try {
    const normalizedText = normalizeText(text);
    const response = await axios.get(MYMEMORY_API_URL, {
      params: {
        q: normalizedText,
        langpair: `es|${targetLanguage}`,
      },
    });

    if (response.data.responseStatus !== 200) {
      throw new Error(`API error: ${response.data.responseDetails}`);
    }

    const translations = response.data.matches;

    // Filtrar traducciones basadas en el source y el target
    const preferredTranslations = translations.filter(
      (translation) =>
        translation.source === "es-ES" && translation.target === targetLanguage
    );

    if (preferredTranslations.length > 0) {
      return preferredTranslations[0].translation;
    } else {
      throw new Error(
        "No translations found for the preferred source and target"
      );
    }
  } catch (error) {
    throw new Error(`Error translating text: ${error.message}`);
  }
}
