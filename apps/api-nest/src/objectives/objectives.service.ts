/**
 * ObjectivesService
 * -----------------
 * Service responsable de toute la logique métier liée aux objectifs
 * pour l’utilisateur de démonstration (demo user).
 *
 * Rôles principaux :
 * - Récupérer l’utilisateur de démo configuré via une variable d’environnement
 * - Vérifier s’il possède des sessions encodées (pour savoir si on peut proposer des objectifs)
 * - Récupérer ses objectifs existants pour affichage dans le front
 * - Calculer une proposition d’objectifs (“easy / normal / challenge”) à partir de ses sessions récentes
 * - Sauvegarder un objectif en base à partir d’un niveau choisi (“easy / normal / challenge”)
 *
 * Ce service utilise Prisma pour accéder à la base de données.
 * Il lève des exceptions Nest (BadRequestException, NotFoundException)
 * pour signaler les erreurs métier ou les données manquantes.
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ObjectiveDurationUnit, ObjectiveFrequency } from '@prisma/client';
import type { ObjectiveLevel } from './objectives.types';

@Injectable()
export class ObjectivesService {
  /**
   * Injection du PrismaService :
   * ----------------------------
   * PrismaService encapsule le client Prisma pour effectuer les requêtes
   * vers la base de données (User, Session, SessionType, Objective, etc.).
   */
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère le user de démo à partir de l’email configuré.
   * ------------------------------------------------------
   * - Utilise la variable d’environnement DEMO_USER_EMAIL.
   * - Si la variable n’est pas définie, utilise une valeur par défaut :
   *   "demo@mindfulspace.app".
   * - Va chercher ce user dans la table `user` via Prisma.
   * - Si aucun user ne correspond, lève une NotFoundException avec un
   *   message explicite (utile en développement).
   *
   * Cette méthode est privée car elle ne doit être utilisée qu’en interne
   * par les méthodes du service qui travaillent sur le “demo user”.
   */
  private async getDemoUser() {
    // On lit l’email du user de démo dans les variables d’environnement,
    // avec une valeur par défaut au cas où.
    const email = process.env.DEMO_USER_EMAIL ?? 'demo@mindfulspace.app';

    // On tente de retrouver l’utilisateur dans la base via Prisma.
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Si aucun utilisateur correspondant à cet email n’est trouvé,
    // on lève une exception HTTP 404 (NotFoundException).
    if (!user) {
      throw new NotFoundException(
        `Demo user not found (email: ${email}). Did you run db:seed + db:seed:objectives-poc ?`,
      );
    }

    // Si tout est ok, on renvoie l’entité user (Prisma User).
    return user;
  }

  /**
   * Indique si le user de démo possède au moins une session encodée.
   * ----------------------------------------------------------------
   * Utilisation côté front :
   * - Le front appelle cette méthode (via un endpoint) pour savoir
   *   s’il y a des données de sessions.
   * - Si `hasSessions` est false, le front peut afficher un message
   *   du style "Impossible de proposer des objectifs car vous n'avez
   *   aucune session encodée" et désactiver le formulaire.
   *
   * Retour :
   * - Un objet { hasSessions: boolean } pour être simple à consommer
   *   côté front.
   */
  async hasSessionsForDemoUser() {
    // On récupère d’abord le user de démo (ou on lève une 404 s’il n’existe pas).
    const demoUser = await this.getDemoUser();

    // On compte le nombre de sessions associées à ce user dans la table `session`.
    const count = await this.prisma.session.count({
      where: { userId: demoUser.id },
    });

    // On renvoie un petit objet qui indique simplement s’il y a au moins 1 session.
    return { hasSessions: count > 0 };
  }

  /**
   * Retourne tous les objectifs du user de démo.
   * --------------------------------------------
   * - Charge les objectifs liés au user de démo.
   * - Inclut le type de session (`sessionType`) et l’unité (`sessionUnit`)
   *   pour pouvoir afficher correctement le label et l’unité dans le front.
   *
   * Remarque :
   * - On ne renvoie pas l’entité Prisma brute, mais un objet "formaté"
   *   adapté au front (id, sessionTypeName, unitLabel, etc.).
   */
  async getObjectivesForDemoUser() {
    // Récupération du user de démo.
    const demoUser = await this.getDemoUser();

    // On récupère tous les objectifs liés à ce user.
    const objectives = await this.prisma.objective.findMany({
      where: {
        userId: demoUser.id,
      },
      include: {
        // On inclut les infos du type de session
        sessionType: {
          // … et l’unité associée au type de session (minutes, heures, etc.)
          include: { sessionUnit: true },
        },
      },
    });

    // On transforme les entités Prisma en objets plus simples pour le front.
    return objectives.map((o) => ({
      id: o.id,
      sessionTypeId: o.sessionTypeId,
      // Si pour une raison quelconque la relation n’est pas chargée,
      // on met un fallback "Type de session".
      sessionTypeName: o.sessionType?.name ?? 'Type de session',
      // Label de l’unité (par ex. "min", "heures", etc.)
      unitLabel: o.sessionType?.sessionUnit?.value ?? '',
      value: o.value,
      frequency: o.frequency,
      durationUnit: o.durationUnit,
      durationValue: o.durationValue,
      // On ne retourne pas level ici, il n’est pas stocké en DB :
      // level (easy/normal/challenge) n’existe que dans la logique métier
      // au moment du calcul de la proposition ou du choix de l’utilisateur.
    }));
  }

  /**
   * Propose des objectifs pour un type de session donné.
   * ----------------------------------------------------
   * Principe :
   * - On prend les sessions du user de démo pour ce type de session,
   *   sur les X derniers jours (ici 14).
   * - On calcule la valeur moyenne.
   * - À partir de cette moyenne, on propose 3 niveaux :
   *   - easy     : 80% de la moyenne
   *   - normal   : 100% de la moyenne
   *   - challenge: 120% de la moyenne
   * - On arrondit :
   *   - average (moyenne) au dixième (round1)
   *   - les valeurs proposées easy/normal/challenge à l’unité (round0)
   *
   * Erreurs possibles :
   * - BadRequestException si `sessionTypeId` n’est pas fourni.
   * - NotFoundException si le SessionType n’existe pas.
   * - NotFoundException si aucune session n’est trouvée dans la période.
   */
  async proposeForSessionType(sessionTypeId: string) {
    // Validation basique : on exige un sessionTypeId non vide.
    if (!sessionTypeId) {
      throw new BadRequestException('sessionTypeId is required');
    }

    // Récupération du user de démo.
    const demoUser = await this.getDemoUser();

    // Vérification que le type de session existe bien en base.
    const sessionType = await this.prisma.sessionType.findUnique({
      where: { id: sessionTypeId },
      include: { sessionUnit: true },
    });

    if (!sessionType) {
      throw new NotFoundException('SessionType not found');
    }

    // Nombre de jours sur lesquels on calcule la moyenne.
    const daysBack = 14;

    // On calcule la date de début : aujourd’hui - 14 jours.
    const since = new Date();
    since.setDate(since.getDate() - daysBack);

    // On récupère toutes les sessions du user de démo pour ce type,
    // dont la date est >= since.
    const sessions = await this.prisma.session.findMany({
      where: {
        userId: demoUser.id,
        sessionTypeId,
        dateSession: { gte: since },
      },
    });

    // Si aucune session récente, on ne peut pas calculer de moyenne
    // => on lève une NotFoundException.
    if (sessions.length === 0) {
      throw new NotFoundException(
        `No sessions found for demo user and sessionType ${sessionType.name} in last ${daysBack} days`,
      );
    }

    // On calcule la somme des valeurs des sessions.
    const total = sessions.reduce((sum, s) => sum + s.value, 0);
    // Puis la moyenne simple (arithmétique).
    const average = total / sessions.length;

    // Petite fonction utilitaire : arrondit au dixième.
    // Exemple : 10.123 => 10.1
    const round1 = (value: number) => Math.round(value * 10) / 10;

    // Petite fonction utilitaire : arrondit à l’unité.
    // Exemple : 10.4 => 10, 10.5 => 11
    const round0 = (value: number) => Math.round(value);

    // Calcul des valeurs pour les 3 niveaux, arrondies à l’unité.
    const easy = round0(average * 0.8);
    const normal = round0(average);
    const challenge = round0(average * 1.2);

    // On fixe ici les paramètres “fréquence” et “durée” de l’objectif.
    // Ces valeurs pourraient être paramétrables plus tard si besoin.
    const frequency: ObjectiveFrequency = 'DAILY';
    const durationUnit: ObjectiveDurationUnit = 'DAY';
    const durationValue = 7; // objectif valable sur 7 jours

    // On renvoie toutes les informations nécessaires au front
    // pour afficher la proposition d’objectifs.
    return {
      sessionTypeId,
      sessionTypeName: sessionType.name,
      unitLabel: sessionType.sessionUnit?.value ?? '',
      // La moyenne arrondie au dixième pour l’affichage.
      average: round1(average),
      frequency,
      durationUnit,
      durationValue,
      objectives: {
        easy: { level: 'easy', value: easy },
        normal: { level: 'normal', value: normal },
        challenge: { level: 'challenge', value: challenge },
      },
    };
  }

  /**
   * Enregistre un objectif à partir d’un niveau (easy / normal / challenge).
   * -----------------------------------------------------------------------
   * Workflow :
   * 1. On appelle `proposeForSessionType` pour recalculer la proposition
   *    à jour (en fonction des données les plus récentes).
   * 2. En fonction du `level` choisi (easy, normal, challenge),
   *    on sélectionne la bonne valeur.
   * 3. On crée un enregistrement dans la table `objective`.
   *
   * Remarques :
   * - On recalcule toujours d’abord la proposition au moment de la sauvegarde
   *   pour rester cohérent avec les éventuelles nouvelles sessions.
   * - On renvoie un message simple plus l’objectif créé (entité Prisma).
   */
  async saveObjectiveFromLevel(
    sessionTypeId: string,
    level: ObjectiveLevel,
  ) {
    // On commence par récupérer la proposition actuelle pour ce type de session.
    const proposal = await this.proposeForSessionType(sessionTypeId);

    // On récupère également le user de démo (pour lier l’objectif à ce user).
    const demoUser = await this.getDemoUser();

    // On choisit la bonne entrée (easy / normal / challenge)
    // en fonction du level demandé.
    const chosen =
      level === 'easy'
        ? proposal.objectives.easy
        : level === 'challenge'
          ? proposal.objectives.challenge
          : proposal.objectives.normal;

    // Vérification de l’existence du SessionType pour pouvoir
    // récupérer l’unité à stocker dans l’objectif.
    const sessionType = await this.prisma.sessionType.findUnique({
      where: { id: sessionTypeId },
      include: { sessionUnit: true },
    });

    if (!sessionType) {
      throw new NotFoundException('SessionType not found');
    }

    // Création de l’objectif dans la DB :
    // - userId       : le user de démo
    // - sessionTypeId: type de session concerné
    // - sessionUnitId: unité (ex. minutes) récupérée à partir du SessionType
    // - value        : valeur de l’objectif (ex. 10 minutes)
    // - frequency    : DAILY (d’après la proposition)
    // - durationUnit : DAY (d’après la proposition)
    // - durationValue: 7 (objectif sur 7 jours)
    const objective = await this.prisma.objective.create({
      data: {
        userId: demoUser.id,
        sessionTypeId,
        sessionUnitId: sessionType.sessionUnit?.id ?? null,
        value: chosen.value,
        frequency: proposal.frequency,
        durationUnit: proposal.durationUnit,
        durationValue: proposal.durationValue,
      },
    });

    // On renvoie un petit objet de confirmation, avec le niveau choisi
    // et l’objectif créé (entité Prisma).
    return {
      message: 'Objective created',
      level,
      objective,
    };
  }
}