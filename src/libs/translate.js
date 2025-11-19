import axios from "axios";
import { MYMEMORY_API } from "../config.js";
import { normalizeText } from "../utils/normalizeText.util.js";

const MYMEMORY_API_URL = MYMEMORY_API;

export async function translateText(text, targetLanguage = "en") {
  const normalizedText = normalizeText(text);

  try {
    const response = await axios.get(MYMEMORY_API_URL, {
      params: {
        q: normalizedText,
        langpair: `es|${targetLanguage}`,
      },
    });

    if (response.data.responseStatus !== 200) {
      // Si hay error de API, usa el texto original
      return normalizedText;
    }

    const translations = response.data.matches || [];

    // 1) Si la API ya te da una traducción directa, úsala
    if (response.data.responseData?.translatedText) {
      return response.data.responseData.translatedText;
    }

    // 2) Intentar encontrar un match con target parecido al idioma objetivo
    let bestMatch =
      translations.find((t) =>
        t.target?.toLowerCase().startsWith(targetLanguage.toLowerCase())
      ) || translations[0]; // 3) Si no, el primero

    if (bestMatch?.translation) {
      return bestMatch.translation;
    }

    // 4) Si no hay nada usable, vuelve el texto original
    return normalizedText;
  } catch (error) {
    // No revientes el flujo del template por culpa de la API externa
    return normalizedText;
  }
}
