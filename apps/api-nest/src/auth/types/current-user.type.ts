/**
 * Représente l'utilisateur authentifié extrait du JWT et injecté
 * dans `request.user` par le système d'authentification.
 *
 * @remarks
 * Ce type correspond à la structure minimale utilisée par les
 * contrôleurs et services pour appliquer les règles d’accès :
 *
 * - `id` : identifiant unique de l’utilisateur.
 * - `email` : adresse email éventuelle.
 * - `roles` : liste des rôles attribués à l’utilisateur.
 *
 * Le système d’auth s’occupe de remplir `request.user` en fonction
 * du contenu du token JWT. Le décorateur `@CurrentUser()` permet
 * ensuite de récupérer cet objet dans un contrôleur.
 *
 * @example
 * ```ts
 * // Exemple d'objet utilisateur extrait du JWT :
 * {
 *   id: "user_123",
 *   email: "demo@example.com",
 *   roles: ["user", "premium"]
 * }
 * ```
 *
 * @remarks Swagger
 * Ce type peut être utilisé dans la documentation pour préciser
 * la forme attendue du payload utilisateur lorsqu'un endpoint fait
 * appel au décorateur `@CurrentUser()`.
 */
export type CurrentUserType = {
  /**
   * Identifiant unique de l'utilisateur.
   * Correspond généralement à `sub` dans le JWT.
   */
  id: string;

  /**
   * Adresse email de l'utilisateur, si présente dans le token.
   */
  email?: string;

  /**
   * Liste des rôles attribués à l'utilisateur.
   * Utilisée notamment pour la gestion des accès premium.
   */
  roles?: string[];
};
