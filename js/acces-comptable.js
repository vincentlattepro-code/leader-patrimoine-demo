/**
 * Accès comptable (maquette) : réglages partagés entre l'onglet Réglages → Accès comptable du cockpit et l'espace
 * du comptable (comptable.html). Données FICTIVES. Dans la maquette, tout est gardé dans le navigateur ; dans le vrai
 * cockpit : jeton du lien et code (haché) en base, contrôle côté serveur, accès en lecture seule limité à la rémunération.
 */
import { PARTENAIRES } from "./donnees.js";

export const COMPTABLE = { cabinet: "Cabinet Martin & Associés", nom: "Claire MARTIN", fonction: "Expert-comptable", mail: "c.martin@exemple.fr" };
export const CODE_DEFAUT = "204812";
export const ESSAIS_MAX = 5;
/** Durées de validité du lien proposées à Serkan (en jours ; 0 = sans limite). */
export const DUREES = [["1", "1 jour"], ["7", "7 jours"], ["30", "30 jours"], ["90", "3 mois"], ["365", "1 an"], ["0", "Sans limite"]];
export const DUREE_DEFAUT = "90";
const JOUR = 24 * 3600 * 1000;

const lire = (k, d) => {
  try {
    return localStorage.getItem(k) ?? d;
  } catch {
    return d;
  }
};
const ecrire = (k, v) => {
  try {
    localStorage.setItem(k, v);
  } catch {}
};
const nouveauJeton = () => Array.from(crypto.getRandomValues(new Uint8Array(18)), (o) => o.toString(36).padStart(2, "0")).join("").slice(0, 28);

export function acces() {
  let jeton = lire("lp-comptable-jeton", "");
  if (!jeton) {
    jeton = nouveauJeton();
    ecrire("lp-comptable-jeton", jeton);
    ecrire("lp-comptable-depuis", String(Date.now()));
  }
  const duree = lire("lp-comptable-duree", DUREE_DEFAUT);
  const depuis = Number(lire("lp-comptable-depuis", String(Date.now())));
  const fin = duree === "0" ? null : depuis + Number(duree) * JOUR;
  return {
    duree,
    fin,
    expire: fin !== null && Date.now() > fin,
    jeton,
    code: lire("lp-comptable-code", CODE_DEFAUT),
    actif: lire("lp-comptable-actif", "1") === "1",
    codeMail: lire("lp-comptable-mail", "1") === "1",
    erreurs: Number(lire("lp-comptable-erreurs", "0")),
  };
}

export const changerCode = (c) => (ecrire("lp-comptable-code", c), ecrire("lp-comptable-erreurs", "0"));
export const changerActif = (v) => (ecrire("lp-comptable-actif", v ? "1" : "0"), v && ecrire("lp-comptable-erreurs", "0"));
export const changerCodeMail = (v) => ecrire("lp-comptable-mail", v ? "1" : "0");
export const nouveauLien = () => (ecrire("lp-comptable-jeton", nouveauJeton()), ecrire("lp-comptable-depuis", String(Date.now())), ecrire("lp-comptable-erreurs", "0"));
/** Nouvelle durée : elle compte à partir de maintenant. */
export const changerDuree = (d) => (ecrire("lp-comptable-duree", d), ecrire("lp-comptable-depuis", String(Date.now())));
export const finLisible = (fin) => (fin === null ? "sans limite" : new Date(fin).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }));
export const noterErreur = () => {
  const n = acces().erreurs + 1;
  ecrire("lp-comptable-erreurs", String(n));
  return n;
};
export const effacerErreurs = () => ecrire("lp-comptable-erreurs", "0");

export function lienComptable(jeton = acces().jeton) {
  const base = location.origin + location.pathname.replace(/[^/]*$/, "");
  return `${base}comptable.html#${jeton}`;
}

/** Un code trop simple est refusé (suite, chiffre répété). */
export function codeTropSimple(c) {
  return /^(\d)\1{5}$/.test(c) || "0123456789".includes(c) || "9876543210".includes(c);
}

export const CONNEXIONS = [
  { quand: "Lundi 16 novembre · 09:12", detail: "Ordinateur · Lyon · export téléchargé" },
  { quand: "Lundi 2 novembre · 14:40", detail: "Ordinateur · Lyon" },
  { quand: "Vendredi 9 octobre · 10:05", detail: "Ordinateur · Lyon · export téléchargé" },
];

/* ---------------------------------------------------------------- Données comptables 2026 (fictives) */

const COMMISSIONS_ANNEE = [162000, 118000, 64000, 76000, 21000, 18400];
const PART_TRIMESTRE = [0.22, 0.24, 0.25, 0.29];

export const COMMISSIONS = PARTENAIRES.map((p, i) => {
  const t = PART_TRIMESTRE.map((r) => Math.round(COMMISSIONS_ANNEE[i] * r));
  t[3] = COMMISSIONS_ANNEE[i] - t[0] - t[1] - t[2];
  return { partenaire: p.nom, type: p.type, couleur: p.couleur, trimestres: t, total: COMMISSIONS_ANNEE[i] };
});

export const FACTURES = [
  ["2026-0142", "2026-11-18", "Philippe & Claire DELORME", "Abonnement conseil · T4", 750, "Payée"],
  ["2026-0141", "2026-11-12", "Antoine MARCHETTI", "Mission cession · acompte 2", 4166.67, "Payée"],
  ["2026-0140", "2026-11-05", "Sophie NGUYEN", "Bilan patrimonial", 1000, "Payée"],
  ["2026-0139", "2026-10-29", "Karim & Lucie RAHMANI", "Étude prévoyance", 1250, "En attente"],
  ["2026-0138", "2026-10-21", "Hélène VASSEUR", "Audit successoral", 2500, "Payée"],
  ["2026-0137", "2026-10-14", "Julien BERTIN", "Bilan patrimonial", 1000, "Payée"],
  ["2026-0136", "2026-10-02", "Philippe & Claire DELORME", "Abonnement conseil · T3", 750, "Payée"],
  ["2026-0135", "2026-09-24", "Antoine MARCHETTI", "Mission cession · acompte 1", 4166.67, "Payée"],
].map(([numero, date, client, objet, ht, statut]) => {
  const tva = Math.round(ht * 20) / 100;
  return { numero, date, client, objet, ht, tva, ttc: Math.round((ht + tva) * 100) / 100, statut };
});

export const TOTAUX = {
  commissions: COMMISSIONS_ANNEE.reduce((s, v) => s + v, 0),
  honorairesHt: 128400,
  tva: 25680,
  aRecevoir: 48200,
};

/** Fichier pour la comptabilité (CSV lisible par Excel : séparateur « ; », virgule décimale). */
export function fichierComptable() {
  const n = (v) => v.toFixed(2).replace(".", ",");
  const lignes = ["Commissions 2026 par partenaire;;;;;;", "Partenaire;Type;T1;T2;T3;T4;Total"];
  for (const c of COMMISSIONS) lignes.push([c.partenaire, c.type, ...c.trimestres.map(n), n(c.total)].join(";"));
  lignes.push("", "Factures d'honoraires;;;;;;;", "Numéro;Date;Client;Objet;HT;TVA;TTC;Statut");
  for (const f of FACTURES) lignes.push([f.numero, f.date.split("-").reverse().join("/"), f.client, f.objet, n(f.ht), n(f.tva), n(f.ttc), f.statut].join(";"));
  return "﻿" + lignes.join("\r\n");
}
