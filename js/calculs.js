/**
 * Calculs patrimoniaux de la maquette (règles fiscales françaises, barèmes en réglage dans le vrai cockpit,
 * mis à jour chaque année à la loi de finances). Simplifications assumées : décote, contributions exceptionnelles et
 * situations particulières non traitées — le résultat est une estimation à valider par le conseiller.
 */

/** Barème de l'impôt sur le revenu 2026 (revenus 2025), par part. */
export const BAREME_IR = [
  [11600, 0],
  [29579, 0.11],
  [84577, 0.3],
  [181917, 0.41],
  [Infinity, 0.45],
];
const PLAFOND_DEMI_PART = 1807;
export const PLAFOND_PER_MAX = 37680;

function impotParPart(q) {
  let impot = 0;
  let bas = 0;
  for (const [haut, taux] of BAREME_IR) {
    if (q > bas) impot += (Math.min(q, haut) - bas) * taux;
    bas = haut;
  }
  return impot;
}

export function tmi(revenu, parts) {
  const q = revenu / parts;
  let bas = 0;
  for (const [haut, taux] of BAREME_IR) {
    if (q <= haut) return taux;
    bas = haut;
  }
  return 0.45;
}

/** Impôt brut avec plafonnement du quotient familial (parts de base : 1 ou 2). */
export function impot(revenu, parts, partsBase) {
  const avec = impotParPart(revenu / parts) * parts;
  const sans = impotParPart(revenu / partsBase) * partsBase;
  const avantageMax = ((parts - partsBase) / 0.5) * PLAFOND_DEMI_PART;
  return Math.max(0, Math.round(Math.max(avec, sans - avantageMax)));
}

export function simulerPer({ revenu, parts, couple, versement }) {
  const partsBase = couple ? 2 : 1;
  const plafond = Math.min(PLAFOND_PER_MAX * (couple ? 2 : 1), Math.max(4710, revenu * 0.1));
  const deductible = Math.min(versement, plafond);
  const avant = impot(revenu, parts, partsBase);
  const apres = impot(revenu - deductible, parts, partsBase);
  // Taux marginal réel (tient compte du plafonnement du quotient familial).
  const marginal = (avant - impot(revenu - 1000, parts, partsBase)) / 1000;
  const taux = [0, 0.11, 0.3, 0.41, 0.45].reduce((m, t) => (Math.abs(t - marginal) < Math.abs(m - marginal) ? t : m), 0);
  return { avant, apres, economie: avant - apres, plafond: Math.round(plafond), tmi: taux, effort: versement - (avant - apres) };
}

/** Droits de succession en ligne directe, après abattement de 100 000 € par enfant. */
const BAREME_DIRECT = [
  [8072, 0.05],
  [12109, 0.1],
  [15932, 0.15],
  [552324, 0.2],
  [902838, 0.3],
  [1805677, 0.4],
  [Infinity, 0.45],
];
export function droitsLigneDirecte(partTaxable) {
  let d = 0;
  let bas = 0;
  for (const [haut, taux] of BAREME_DIRECT) {
    if (partTaxable > bas) d += (Math.min(partTaxable, haut) - bas) * taux;
    bas = haut;
  }
  return Math.round(d);
}

/** Assurance-vie, primes versées avant 70 ans (art. 990 I) : 152 500 € d'abattement par bénéficiaire. */
export function prelevement990I(capitalParBeneficiaire) {
  const taxable = Math.max(0, capitalParBeneficiaire - 152500);
  return Math.round(Math.min(taxable, 700000) * 0.2 + Math.max(0, taxable - 700000) * 0.3125);
}

/**
 * Succession : compare « tout dans la succession » et « avec assurance-vie + donations ».
 * Hypothèse simple : conjoint survivant exonéré (on calcule la transmission aux enfants au second décès).
 */
export function simulerSuccession({ patrimoine, enfants, assuranceVie, donations }) {
  const n = Math.max(1, enfants);
  const sansOptim = n * droitsLigneDirecte(Math.max(0, patrimoine / n - 100000));
  const hors = Math.min(patrimoine, assuranceVie + donations);
  const resteSuccession = patrimoine - hors;
  // Donations faites plus de 15 ans avant la succession : l'abattement de 100 000 € par enfant se renouvelle.
  const droitsDon = n * droitsLigneDirecte(Math.max(0, donations / n - 100000));
  const droitsAv = n * prelevement990I(assuranceVie / n);
  const droitsSucc = n * droitsLigneDirecte(Math.max(0, resteSuccession / n - 100000));
  const avecOptim = droitsDon + droitsAv + droitsSucc;
  return { sansOptim, avecOptim, gain: Math.max(0, sansOptim - avecOptim), droitsAv, droitsDon, droitsSucc };
}

/** IFI : abattement de 30 % sur la résidence principale, seuil de 1,3 M€, décote entre 1,3 et 1,4 M€. */
const BAREME_IFI = [
  [800000, 0],
  [1300000, 0.005],
  [2570000, 0.007],
  [5000000, 0.01],
  [10000000, 0.0125],
  [Infinity, 0.015],
];
export function simulerIfi({ residence, autres, dettes }) {
  const net = Math.max(0, residence * 0.7 + autres - dettes);
  if (net < 1300000) return { net, impot: 0, assujetti: false, marge: 1300000 - net };
  let d = 0;
  let bas = 0;
  for (const [haut, taux] of BAREME_IFI) {
    if (net > bas) d += (Math.min(net, haut) - bas) * taux;
    bas = haut;
  }
  if (net < 1400000) d -= 17500 - 0.0125 * net;
  return { net, impot: Math.max(0, Math.round(d)), assujetti: true, marge: 0 };
}

/** Démembrement : valeur de l'usufruit selon l'âge de l'usufruitier (article 669 du CGI). */
export function usufruit(age) {
  const bornes = [21, 31, 41, 51, 61, 71, 81, 91];
  const i = bornes.findIndex((b) => age < b);
  return i === -1 ? 0.1 : 0.9 - i * 0.1;
}

/** Projection d'épargne : capital + versements mensuels, rendement annuel net. */
export function projeter({ capital, mensuel, taux, annees }) {
  const points = [];
  let v = capital;
  let verse = capital;
  const tm = Math.pow(1 + taux / 100, 1 / 12) - 1;
  for (let a = 0; a <= annees; a++) {
    points.push({ annee: a, valeur: Math.round(v), verse: Math.round(verse) });
    for (let m = 0; m < 12; m++) {
      v = v * (1 + tm) + mensuel;
      verse += mensuel;
    }
  }
  return points;
}
