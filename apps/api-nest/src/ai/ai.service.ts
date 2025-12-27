/**
 * Service IA – MindfulSpace
 * -------------------------
 * - Point central de la logique métier liée aux appels à l’IA (Groq).
 * - Fournit des méthodes :
 *   - generateMantra()
 *   - generateEncouragement()
 *   - generateObjectives()
 *
 * Version auto multi-langues :
 * - Aucune liste de locales en dur (fr/en…) dans le code métier.
 * - La locale est utilisée telle quelle pour guider la langue de génération.
 * - Ajouter une langue ne nécessite pas de modifier ce fichier.
 */

import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import Groq from 'groq-sdk';
import { ObjectivesResponseDto } from './dto/ai-responses.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: Groq;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      this.logger.error('GROQ_API_KEY manquante.');
      this.client = new Groq({ apiKey: 'missing-key' });
    } else {
      this.client = new Groq({ apiKey });
    }
  }

  private ensureApiKey() {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'missing-key') {
      throw new InternalServerErrorException('GROQ_API_KEY manquante côté serveur.');
    }
  }

  /** Nettoyage des guillemets, espaces, etc. */
  private sanitizeText(text: string): string {
    let cleaned = text.trim();

    const quotePairs: Array<[string, string]> = [
      ['"', '"'],
      ["'", "'"],
      ['“', '”'],
      ['«', '»'],
      ['`', '`'],
    ];

    let changed = true;
    while (changed && cleaned.length > 1) {
      changed = false;
      for (const [left, right] of quotePairs) {
        if (cleaned.startsWith(left) && cleaned.endsWith(right)) {
          cleaned = cleaned.slice(left.length, cleaned.length - right.length).trim();
          changed = true;
        }
      }
    }

    cleaned = cleaned
      .replace(/^["'“”«»]+/, '')
      .replace(/["'“”«»]+$/, '')
      .trim();

    return cleaned;
  }

  /**
   * Normalisation de la locale en un code simple (fr, en, nl, es, …).
   * - "fr-BE" -> "fr"
   * - "en-US" -> "en"
   * - undefined -> "fr" (fallback IA)
   */
  private normalizeLocale(locale?: string): string {
    return locale?.split('-')[0].toLowerCase() ?? 'fr';
  }

  /**
   * Appel bas niveau à Groq.
   *
   * On garde un message système générique, la langue est gérée
   * dans le userPrompt via la locale.
   */
  private async callGroq(
    userPrompt: string,
    maxTokens = 150,
    systemPrompt?: string,
    temperature = 0.7,
    skipMantraSplit = false,
  ): Promise<string> {
    this.ensureApiKey();

    try {
      const completion = await this.client.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: systemPrompt ||
              'You are a kind, calm and positive meditation coach. ' +
              'Always follow the user instructions carefully and answer only with the requested content.',
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        max_tokens: maxTokens,
        temperature,
      });

      const message = completion.choices[0]?.message?.content;

      if (!message) {
        this.logger.error('Réponse vide reçue de Groq.');
        throw new InternalServerErrorException("Réponse vide de l'IA.");
      }

      // Only split for mantra generation (legacy behavior)
      if (skipMantraSplit) {
        return message.trim();
      }
      return message.split("C'est un mantra")[0].trim();
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw new InternalServerErrorException("Erreur dans l'appel à l'IA.");
    }
  }

  /**
   * Génère un mantra court.
   *
   * La langue de sortie est guidée par la locale (ex: fr, en, nl, es…),
   * mais aucune liste de locales n’est codée en dur ici.
   */
  async generateMantra(theme?: string, locale?: string): Promise<string> {
    const lang = this.normalizeLocale(locale);

    const prompt = `
You are a meditation coach.

Write a short, gentle and soothing mantra in the language corresponding to this locale code: "${lang}".
If the locale code is unknown to you, fall back to French.

Constraints:
- About 15–20 words.
- Do NOT put quotes around the mantra.
- No explanation, no extra commentary, only the mantra text.

Theme: ${theme ?? 'general wellbeing'}
    `.trim();

    const raw = await this.callGroq(prompt, 80);
    return this.sanitizeText(raw);
  }

  /**
   * Génère un message d'encouragement court.
   */
  async generateEncouragement(theme?: string, locale?: string): Promise<string> {
    const lang = this.normalizeLocale(locale);

    const prompt = `
You are a meditation and wellbeing coach.

Write a short encouragement message in the language corresponding to this locale code: "${lang}".
If the locale code is unknown to you, fall back to French.

Constraints:
- Maximum 15–20 words.
- Positive, kind and non-guilt-inducing.
- Do NOT put quotes around the message.
- No explanation, no extra commentary, only the message text.

Theme: ${theme ?? 'general motivation'}
    `.trim();

    const raw = await this.callGroq(prompt, 80);
    return this.sanitizeText(raw);
  }

  /**
   * Génère trois objectifs (facile / normal / ambitieux) pour un thème donné.
   */
  async generateObjectives(
    theme: string,
    locale?: string,
  ): Promise<ObjectivesResponseDto> {
    const lang = this.normalizeLocale(locale);

    if (!theme.trim()) {
      throw new InternalServerErrorException(
        'Le thème est requis pour générer des objectifs.',
      );
    }

    const prompt = `
You are a wellbeing and coaching assistant.

Generate three goals adapted to the theme "${theme}" in the language corresponding to this locale code: "${lang}".
If the locale code is unknown to you, fall back to French.

Constraints:
- The goals must be clear and concise.
- They must correspond to three levels: easy, normal, ambitious.
- Answer STRICTLY in valid JSON, with NO text before or after, exactly in this format:
{
  "easy": "...",
  "normal": "...",
  "ambitious": "..."
}
    `.trim();

    const raw = await this.callGroq(prompt, 300);

    this.logger.log('Réponse brute Groq (objectifs) : ' + raw);

    try {
      const first = raw.indexOf('{');
      const last = raw.lastIndexOf('}');
      if (first === -1 || last === -1 || first > last) {
        throw new Error('JSON non détecté dans la réponse');
      }

      const jsonCandidate = raw.slice(first, last + 1);
      const parsedUnknown: unknown = JSON.parse(jsonCandidate);

      const isObjectives = (v: unknown): v is ObjectivesResponseDto =>
        typeof v === 'object' &&
        v !== null &&
        'easy' in v &&
        'normal' in v &&
        'ambitious' in v &&
        typeof (v as Record<string, unknown>).easy === 'string' &&
        typeof (v as Record<string, unknown>).normal === 'string' &&
        typeof (v as Record<string, unknown>).ambitious === 'string';

      let extracted: unknown = parsedUnknown;

      if (
        typeof parsedUnknown === 'object' &&
        parsedUnknown !== null &&
        !isObjectives(parsedUnknown)
      ) {
        const obj = parsedUnknown as Record<string, unknown>;
        const keys = Object.keys(obj);

        if (keys.length === 1 && typeof obj[keys[0]] === 'object') {
          extracted = obj[keys[0]];
        }
      }

      if (!isObjectives(extracted)) {
        this.logger.error(
          'Réponse reçue mais non conforme aux objectifs attendus : ' +
          JSON.stringify(extracted),
        );
        throw new Error('Format JSON invalide pour les objectifs');
      }

      return extracted;
    } catch (err) {
      this.logger.error('Erreur de parsing JSON : ' + raw);
      this.logger.error(err);
      throw new InternalServerErrorException("Erreur dans la réponse de l'IA.");
    }
  }

  /**
   * Translates a short taxonomy label (category or tag name) from one language to another.
   *
   * @param text - The category or tag name to translate
   * @param sourceLocale - Source language code (e.g., "fr", "en")
   * @param targetLocale - Target language code (e.g., "en", "fr")
   * @returns Translated label (short, 1-3 words)
   */
  async translateText(
    text: string,
    sourceLocale: string,
    targetLocale: string,
  ): Promise<string> {
    const sourceLang = this.normalizeLocale(sourceLocale);
    const targetLang = this.normalizeLocale(targetLocale);

    if (!text.trim()) {
      throw new InternalServerErrorException('Text is required for translation.');
    }

    if (sourceLang === targetLang) {
      // No translation needed - same language
      return text;
    }

    const systemPrompt = `You are a professional translator specializing in wellness and mindfulness content. Output ONLY the translated text with no preamble, no explanation, and no meta-commentary.`;

    const prompt = `Translate this wellness resource category/tag name from ${sourceLang} to ${targetLang}.

IMPORTANT:
- This is a category or tag name for a mindfulness/wellness application.
- Translate the NAME/LABEL only, do not define or explain the word.
- Keep it short and concise (1-3 words maximum).
- If it's already a proper noun or brand name, keep it unchanged.
- Output ONLY the translated name, nothing else.

Text to translate: ${text}`;

    // Use temperature 0.3 for more consistent/literal translations
    // Skip mantra split (5th parameter = true) - translations need full response
    const raw = await this.callGroq(prompt, 100, systemPrompt, 0.3, true);

    // Remove common preamble patterns that Groq might add
    let cleaned = this.sanitizeText(raw);

    // Remove lines that start with "Here is the translation" or similar meta-commentary
    const preamblePatterns = [
      /^Here is the translation[^\n]*\n+/i,
      /^Translation[^\n]*:\n+/i,
      /^The translated text[^\n]*:\n+/i,
      /^Translated to \w+[^\n]*:\n+/i,
      /^From \w+ to \w+[^\n]*:\n+/i,
    ];

    for (const pattern of preamblePatterns) {
      cleaned = cleaned.replace(pattern, '');
    }

    return cleaned.trim();
  }

  /**
   * Translates resource content (title, summary, or full content) from one language to another.
   * This method is designed for longer, richer content that requires full context preservation.
   *
   * @param text - The resource content to translate
   * @param sourceLocale - Source language code (e.g., "fr", "en")
   * @param targetLocale - Target language code (e.g., "en", "fr")
   * @param contentType - Type of content (title, summary, or content) for better translation hints
   * @returns Translated content preserving formatting and meaning
   */
  async translateResourceContent(
    text: string,
    sourceLocale: string,
    targetLocale: string,
    contentType: 'title' | 'summary' | 'content' = 'content',
  ): Promise<string> {
    const sourceLang = this.normalizeLocale(sourceLocale);
    const targetLang = this.normalizeLocale(targetLocale);

    if (!text.trim()) {
      throw new InternalServerErrorException('Text is required for translation.');
    }

    if (sourceLang === targetLang) {
      // No translation needed - same language
      return text;
    }

    const systemPrompt = `You are a professional translator. Your ONLY task is to translate the provided text accurately from one language to another. Never write new content, never add explanations, never generate additional text. Output ONLY the direct translation.`;

    let contentTypeInstructions = '';
    if (contentType === 'title') {
      contentTypeInstructions = `
7. This is a title - keep it short and impactful while translating accurately.`;
    } else if (contentType === 'summary') {
      contentTypeInstructions = `
7. This is a summary - translate it completely without expanding or reducing it.`;
    } else {
      contentTypeInstructions = `
7. This is article content - translate every paragraph, sentence, and word completely.
8. Preserve formatting: paragraphs, line breaks, lists, and structure.`;
    }

    const prompt = `You are translating a ${contentType} from ${sourceLang} to ${targetLang}.

INSTRUCTIONS:
1. Translate EVERY WORD of the text below from ${sourceLang} to ${targetLang}.
2. DO NOT write new content - only translate what is provided.
3. DO NOT add explanations, definitions, introductions, or conclusions.
4. DO NOT summarize or paraphrase - translate word-for-word.
5. Preserve ALL content exactly as written - do not omit anything.${contentTypeInstructions}
6. Output ONLY the direct translation, nothing else.

Text to translate from ${sourceLang} to ${targetLang}:
"""
${text}
"""`;

    // Use high token limit for resource content (can be long articles)
    // Use temperature 0.1 for deterministic, literal translations (avoid hallucinations)
    // Skip mantra split to get full response
    const raw = await this.callGroq(prompt, 8000, systemPrompt, 0.1, true);

    // Remove common preamble patterns
    let cleaned = this.sanitizeText(raw);

    const preamblePatterns = [
      /^Here is the translation[^\n]*\n+/i,
      /^Translation[^\n]*:\n+/i,
      /^The translated text[^\n]*:\n+/i,
      /^Translated to \w+[^\n]*:\n+/i,
      /^From \w+ to \w+[^\n]*:\n+/i,
      /^Translated[^\n]*:\n+/i,
    ];

    for (const pattern of preamblePatterns) {
      cleaned = cleaned.replace(pattern, '');
    }

    return cleaned.trim();
  }
}
