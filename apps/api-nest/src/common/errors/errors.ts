/**
 * Catalogue de messages d'erreur homogènes.
 *
 * @remarks
 * Les messages sont courts, stables, et adaptés à un usage côté frontend (tests, affichage).
 */
export const ERRORS = {
  DAY_FORMAT: (field: string) => `${field} doit être au format YYYY-MM-DD`,
  DAY_INVALID: (field: string) => `${field} est une date invalide`,
  RANGE_REQUIRED: "from et to doivent être fournis ensemble",
  RANGE_ORDER: "from doit être antérieur ou égal à to",
  REQUIRED: (field: string) => `${field} est requis`,
  POSITIVE_INT: (field: string) => `${field} doit être un entier positif`,
};
