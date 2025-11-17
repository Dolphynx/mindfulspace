/**
 * Service IA – MindfulSpace
 * -------------------------
 * Fichier : ai.service.ts
 *
 * Rôle global :
 * - Point central de la logique métier liée aux appels à l’IA (Groq).
 * - Fournit des méthodes haut niveau utilisées par le contrôleur :
 *   - generateMantra()
 *   - generateEncouragement()
 *   - generateObjectives()
 *
 * Ce service :
 * - vérifie la présence de la clé API Groq
 * - appelle le modèle IA approprié
 * - nettoie / parse / sécurise les réponses avant de les renvoyer au reste de l’app
 */

import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import Groq from 'groq-sdk';
import { ObjectivesResponseDto } from './dto/ai-responses.dto';

/**
 * AiService
 *
 * Ce service contient toute la logique métier liée à l’IA. Il interagit directement
 * avec le client Groq pour générer des mantras, des messages d'encouragement et des objectifs
 * personnalisés en fonction des thèmes fournis par l'utilisateur.
 *
 * - Les appels à l’API Groq sont effectués via la méthode `callGroq()`.
 * - Les réponses de l'IA sont traitées et renvoyées sous forme de texte ou de JSON (pour les objectifs).
 */
@Injectable()
export class AiService {
  /** Logger NestJS pour tracer les erreurs et les réponses de l’IA. */
  private readonly logger = new Logger(AiService.name);

  /**
   * Instance du client Groq, initialisée avec la clé d'API.
   * La clé est lue depuis les variables d'environnement pour ne pas être exposée dans le code.
   *
   * Si la clé est manquante, le client Groq est initialisé avec une clé par défaut
   * (au lieu de lancer une exception immédiatement).
   * La vérification se fera au moment des appels à l'API.
   */
  private readonly client: Groq;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      // Log l'absence de clé API pour faciliter le debug
      this.logger.error('GROQ_API_KEY manquante.');
      this.client = new Groq({ apiKey: 'missing-key' }); // Utilisation d'une clé fictive pour éviter l'échec immédiat
    } else {
      this.client = new Groq({ apiKey });
    }
  }

  /**
   * Vérifie si la clé API est définie, sinon lève une exception.
   * Cette méthode est appelée avant chaque appel à l'API Groq.
   */
  private ensureApiKey() {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'missing-key') {
      throw new InternalServerErrorException('GROQ_API_KEY manquante côté serveur.');
    }
  }

  /**
   * Nettoie un texte généré par l'IA pour l'affichage :
   * - trim des espaces superflus
   * - suppression des guillemets / quotes qui entourent toute la phrase
   *   (", ', “ ”, « », `)
   *
   * Exemple :
   *   `"Je me détends progressivement."`  -> Je me détends progressivement.
   *   `« Je respire calmement »`         -> Je respire calmement
   */
  private sanitizeText(text: string): string {
    let cleaned = text.trim();

    // Paires de guillemets possibles à retirer en bordure
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

    // Nettoyage de guillemets résiduels en tout début / fin de chaîne
    cleaned = cleaned
      .replace(/^["'“”«»]+/, '')
      .replace(/["'“”«»]+$/, '')
      .trim();

    return cleaned;
  }

  /**
   * Fonction utilitaire pour effectuer un appel à l'API Groq et obtenir une réponse.
   *
   * @param userPrompt Le texte que l'utilisateur souhaite envoyer à l'IA (par exemple un thème ou une question).
   * @param maxTokens Nombre maximum de tokens (mots) que l'IA peut générer dans sa réponse.
   * @returns Le texte généré par l'IA (brut, non "sanitisé").
   */
  private async callGroq(userPrompt: string, maxTokens = 150): Promise<string> {
    this.ensureApiKey(); // Vérifie si la clé API est présente avant de faire l'appel.

    try {
      // Effectue l'appel à l'API Groq pour obtenir une réponse.
      const completion = await this.client.chat.completions.create({
        model: 'llama-3.1-8b-instant', // Modèle d'IA utilisé
        messages: [
          {
            role: 'system',
            content:
              'Tu es un coach de méditation bienveillant, calme et positif. Génère la réponse demandée sans commentaire supplémentaire.',
          },
          {
            role: 'user',
            content: userPrompt, // Message de l'utilisateur (par exemple, le thème de méditation)
          },
        ],
        max_tokens: maxTokens, // Limite des tokens dans la réponse
        temperature: 0.7, // Niveau de créativité de la réponse (0.0 à 1.0)
      });

      // Récupère le message généré
      const message = completion.choices[0]?.message?.content;

      if (!message) {
        this.logger.error('Réponse vide reçue de Groq.');
        throw new InternalServerErrorException("Réponse vide de l'IA.");
      }

      // Ancienne sécurité pour éviter les commentaires de type "C'est un mantra..."
      return message.split("C'est un mantra")[0].trim(); // Texte brut, encore non nettoyé des guillemets

    } catch (error) {
      // Log des erreurs pour faciliter le debug en production
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw new InternalServerErrorException("Erreur dans l'appel à l'IA.");
    }
  }

  /**
   * Génère un mantra court (environ 15 à 20 mots) à partir du thème fourni.
   *
   * @param theme Le thème pour lequel générer le mantra (ex : "stress", "sommeil", etc.)
   * @returns Le mantra généré par l'IA, nettoyé pour l'affichage.
   */
  async generateMantra(theme?: string): Promise<string> {
    const prompt = `
Génère un mantra court, doux et apaisant, entre 15 et 20 mots en français.
Ne mets pas de guillemets autour du mantra.
Thème : ${theme ?? 'bien-être général'}
    `.trim(); // Le prompt ajusté pour guider l'IA à générer un mantra sans commentaire.

    const raw = await this.callGroq(prompt, 50);
    return this.sanitizeText(raw); // Nettoyage des guillemets et espaces superflus
  }

  /**
   * Génère un message d'encouragement court et bienveillant.
   *
   * @param theme Le thème pour personnaliser l'encouragement (par exemple : "motivation", "confiance en soi")
   * @returns Le message d'encouragement généré par l'IA, nettoyé pour l'affichage.
   */
  async generateEncouragement(theme?: string): Promise<string> {
    const prompt = `
Écris un message d'encouragement court (maximum 15-20 mots), positif et bienveillant.
Ne mets pas de guillemets autour du message.
Le message doit être bref et adapté au thème.
Thème : ${theme ?? 'motivation générale'}
    `.trim();

    const raw = await this.callGroq(prompt, 50);
    return this.sanitizeText(raw); // Nettoyage des guillemets et espaces superflus
  }

  /**
   * Génère trois objectifs (facile / normal / ambitieux) pour un thème donné.
   * Les objectifs sont retournés sous forme de JSON, ce qui permet au frontend
   * de les manipuler facilement.
   *
   * @param theme Le thème pour lequel générer les objectifs (ex : "gestion du stress").
   * @returns Un objet contenant les trois objectifs générés.
   */
  async generateObjectives(theme: string): Promise<ObjectivesResponseDto> {
    if (!theme.trim()) {
      throw new InternalServerErrorException(
        'Le thème est requis pour générer des objectifs.',
      );
    }

    const prompt = `
Génère trois objectifs adaptés au thème "${theme}".
Les objectifs doivent être clairs, concis et adaptés à trois niveaux : facile, normal, ambitieux.
Répond STRICTEMENT en JSON valide, sans texte avant ni après, au format :
{
  "easy": "...",
  "normal": "...",
  "ambitious": "..."
}
    `.trim();

    const raw = await this.callGroq(prompt, 300);

    this.logger.log('Réponse brute Groq (objectifs) : ' + raw);

    try {
      // 1. Extraction du JSON entre le premier et le dernier "}"
      const first = raw.indexOf('{');
      const last = raw.lastIndexOf('}');
      if (first === -1 || last === -1 || first > last) {
        throw new Error('JSON non détecté dans la réponse');
      }

      const jsonCandidate = raw.slice(first, last + 1);

      // 2. Parsing sécurisé
      const parsedUnknown: unknown = JSON.parse(jsonCandidate);

      /**
       * Type guard → sécurise totalement l’accès aux champs
       */
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

      // 3. Si Groq renvoie un wrapper (ex: { "sommeil": {...} })
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

      // 4. Vérification finale du type attendu
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
}
