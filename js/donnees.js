/**
 * Données FICTIVES de la maquette Leader Patrimoine.
 * Aucun nom, chiffre ou partenaire ne correspond à une personne ou à une société réelle.
 * Dans le vrai cockpit, ces informations viennent de la base de données du cabinet (fiches, contrats, rendez-vous…).
 */

export const CABINET = {
  nom: "Leader Patrimoine",
  devise: "La valeur de l'humain, la force du patrimoine",
  statuts: "CIF · Courtier en assurance · Intermédiaire en opérations de banque · Carte T",
};

/** Partenaires fictifs (assureurs, sociétés de gestion, SCPI). */
export const PARTENAIRES = [
  { id: "orion", nom: "Orion Vie", type: "Assureur", couleur: "#e8b964" },
  { id: "atlantique", nom: "Atlantique Prévoyance", type: "Assureur", couleur: "#7cb8e8" },
  { id: "valmont", nom: "Valmont Gestion", type: "Société de gestion", couleur: "#a78bfa" },
  { id: "pierre", nom: "Pierre & Rendement", type: "SCPI", couleur: "#f0a37a" },
  { id: "horizon", nom: "Horizon Capital", type: "Private equity", couleur: "#6ee7b7" },
  { id: "lumen", nom: "Lumen Bourse", type: "Compte-titres / PEA", couleur: "#f472b6" },
];

export const PROFILS = ["", "Sécuritaire", "Prudent", "Prudent +", "Équilibré", "Dynamique", "Offensif", "Très offensif"];

/* ================================================================ Clients « vitrines » (fiches complètes) ================================================================ */

const vitrines = [
  {
    id: "delorme",
    nom: "DELORME",
    prenom: "Philippe & Claire",
    type: "Foyer",
    initiales: "PD",
    age: 58,
    ageConjoint: 55,
    profession: "Chirurgien orthopédiste (libéral) · Pharmacienne",
    ville: "Lyon 6e",
    segment: "Premium",
    depuis: "2014",
    tmi: 45,
    revenus: 412000,
    regime: "Communauté réduite aux acquêts",
    enfants: [
      { prenom: "Louis", age: 24, note: "Étudiant en médecine" },
      { prenom: "Inès", age: 21, note: "Donation 2014 → abattement reconstitué en 2029" },
      { prenom: "Hugo", age: 17, note: "Majeur en avril 2027" },
    ],
    profil: { risque: 4, horizon: "8 ans et plus", experience: "Confirmée", esg: "Oui · 30 % minimum en placements durables", date: "2026-03-12" },
    objectifs: ["Préparer la retraite (2031)", "Réduire l'impôt sur le revenu", "Transmettre aux 3 enfants", "Protéger le conjoint"],
    actifs: [
      { cat: "Immobilier", libelle: "Résidence principale · Lyon 6e", valeur: 1180000 },
      { cat: "Immobilier", libelle: "Appartement locatif · Annecy", valeur: 420000 },
      { cat: "Immobilier", libelle: "SCPI Pierre & Rendement", valeur: 186000 },
      { cat: "Financier", libelle: "Assurances-vie", valeur: 871400 },
      { cat: "Financier", libelle: "PER individuel", valeur: 214800 },
      { cat: "Financier", libelle: "PEA + compte-titres", valeur: 302500 },
      { cat: "Liquidités", libelle: "Comptes courants et livrets", valeur: 142000 },
      { cat: "Professionnel", libelle: "Parts SELARL (clinique)", valeur: 650000 },
    ],
    passifs: [
      { libelle: "Prêt immobilier Annecy", crd: 168000, fin: "2033", taux: "1,35 %" },
      { libelle: "Prêt SELARL (rachat de parts)", crd: 96000, fin: "2029", taux: "2,10 %" },
    ],
    contrats: [
      { type: "Assurance-vie", nom: "Orion Vie Patrimoine", partenaire: "orion", ouverture: "2014-06-02", valeur: 512300, verse: 380000, uc: 62, perf: 5.8, programme: 1000 },
      { type: "Assurance-vie", nom: "Atlantique Sélection (Claire)", partenaire: "atlantique", ouverture: "2017-09-15", valeur: 359100, verse: 300000, uc: 45, perf: 4.1, programme: 0 },
      { type: "PER individuel", nom: "Atlantique Retraite+", partenaire: "atlantique", ouverture: "2020-01-10", valeur: 214800, verse: 176000, uc: 80, perf: 7.2, programme: 2000 },
      { type: "SCPI", nom: "Pierre & Rendement Europe", partenaire: "pierre", ouverture: "2019-04-01", valeur: 186000, verse: 180000, uc: 100, perf: 4.6, programme: 0 },
      { type: "PEA", nom: "Lumen PEA", partenaire: "lumen", ouverture: "2012-03-20", valeur: 182500, verse: 150000, uc: 100, perf: 9.4, programme: 0 },
      { type: "Compte-titres", nom: "Lumen CTO", partenaire: "lumen", ouverture: "2016-11-04", valeur: 120000, verse: 110000, uc: 100, perf: 6.3, programme: 0 },
    ],
    conformite: { der: "2014-05-20", kyc: "2026-03-12", profil: "2026-03-12", lettre: "2026-03-12", adequation: "2026-03-14", identite: "2031-09-01", domicile: "2026-02-10", avis: "2026-09-02", vigilance: "Standard", ppe: false, origine: "Revenus professionnels, épargne" },
    historique: [
      { date: "2026-11-18", type: "email", texte: "Envoi de la note « Optimisation fin d'année : versement PER » (ouverte 3 fois)." },
      { date: "2026-10-07", type: "rdv", texte: "Revue annuelle au cabinet. Arbitrage de 40 000 € du fonds euros vers 2 fonds durables." },
      { date: "2026-10-09", type: "signature", texte: "Bulletin d'arbitrage signé électroniquement (Orion Vie Patrimoine)." },
      { date: "2026-06-15", type: "appel", texte: "Question sur la vente de l'appartement d'Annecy : simulation de plus-value envoyée." },
      { date: "2026-03-14", type: "signature", texte: "Lettre de mission 2026 et déclaration d'adéquation signées." },
      { date: "2026-03-12", type: "rdv", texte: "Mise à jour du profil investisseur et des préférences de durabilité." },
    ],
    prochain: { date: "2026-11-24", heure: "10:00", objet: "Point fin d'année : versement PER + donation Inès" },
    remuneration: { honoraires: 3600, encours: 6120, entree: 1800 },
  },
  {
    id: "marchetti",
    nom: "MARCHETTI",
    prenom: "Antoine",
    type: "Chef d'entreprise",
    initiales: "AM",
    age: 61,
    profession: "Dirigeant · Marchetti Industrie (52 salariés)",
    ville: "Valence",
    segment: "Premium",
    depuis: "2021",
    tmi: 45,
    revenus: 286000,
    regime: "Séparation de biens",
    enfants: [
      { prenom: "Julie", age: 34, note: "Reprise envisagée de l'entreprise" },
      { prenom: "Marc", age: 30, note: "" },
    ],
    profil: { risque: 5, horizon: "8 ans et plus", experience: "Experte", esg: "Indifférent", date: "2025-02-20" },
    objectifs: ["Céder l'entreprise en 2027", "Réinvestir le prix de cession (150-0 B ter)", "Transmettre (pacte Dutreil)"],
    actifs: [
      { cat: "Professionnel", libelle: "Marchetti Industrie (100 % des titres)", valeur: 6200000 },
      { cat: "Immobilier", libelle: "Résidence principale · Valence", valeur: 890000 },
      { cat: "Immobilier", libelle: "SCI des locaux de l'entreprise", valeur: 1350000 },
      { cat: "Financier", libelle: "Assurance-vie Luxembourg", valeur: 1240000 },
      { cat: "Financier", libelle: "Contrat de capitalisation", valeur: 480000 },
      { cat: "Liquidités", libelle: "Trésorerie personnelle", valeur: 310000 },
    ],
    passifs: [{ libelle: "Prêt SCI", crd: 420000, fin: "2032", taux: "1,90 %" }],
    contrats: [
      { type: "Assurance-vie", nom: "Orion Vie International", partenaire: "orion", ouverture: "2021-05-11", valeur: 1240000, verse: 1100000, uc: 70, perf: 6.1, programme: 0 },
      { type: "Capitalisation", nom: "Valmont Capitalisation", partenaire: "valmont", ouverture: "2022-02-01", valeur: 480000, verse: 450000, uc: 55, perf: 3.9, programme: 0 },
      { type: "Private equity", nom: "Horizon Croissance III", partenaire: "horizon", ouverture: "2023-07-01", valeur: 265000, verse: 250000, uc: 100, perf: 2.4, programme: 0 },
    ],
    conformite: { der: "2021-04-02", kyc: "2024-11-05", profil: "2025-02-20", lettre: "2025-02-20", adequation: "2025-02-22", identite: "2027-01-15", domicile: "2025-01-10", avis: "2025-09-01", vigilance: "Renforcée", ppe: false, origine: "Dividendes, cession prévue de l'entreprise" },
    historique: [
      { date: "2026-11-12", type: "rdv", texte: "Rendez-vous avec l'avocat fiscaliste : schéma d'apport-cession validé." },
      { date: "2026-09-30", type: "email", texte: "Envoi de la sélection de fonds éligibles au réinvestissement 150-0 B ter." },
      { date: "2026-05-04", type: "appel", texte: "Lettre d'intention reçue d'un repreneur (valorisation 6,2 M€)." },
    ],
    prochain: { date: "2026-11-26", heure: "14:30", objet: "Comité cession : notaire + expert-comptable" },
    remuneration: { honoraires: 15000, encours: 11850, entree: 0 },
  },
  {
    id: "nguyen",
    nom: "NGUYEN",
    prenom: "Sophie",
    type: "Personne seule",
    initiales: "SN",
    age: 42,
    profession: "Directrice financière (cadre salariée)",
    ville: "Annecy",
    segment: "Patrimonial",
    depuis: "2023",
    tmi: 41,
    revenus: 148000,
    regime: "Pacsée · séparation",
    enfants: [{ prenom: "Léna", age: 9, note: "" }],
    profil: { risque: 5, horizon: "8 ans et plus", experience: "Confirmée", esg: "Oui · fonds article 9 souhaités", date: "2026-01-18" },
    objectifs: ["Réduire l'impôt (TMI 41 %)", "Acheter un investissement locatif", "Épargne pour les études de Léna"],
    actifs: [
      { cat: "Immobilier", libelle: "Résidence principale · Annecy", valeur: 640000 },
      { cat: "Financier", libelle: "Assurance-vie", valeur: 96000 },
      { cat: "Financier", libelle: "Épargne salariale (PEE)", valeur: 58000 },
      { cat: "Liquidités", libelle: "Livrets et compte courant", valeur: 87000 },
    ],
    passifs: [{ libelle: "Prêt résidence principale", crd: 312000, fin: "2044", taux: "3,05 %" }],
    contrats: [{ type: "Assurance-vie", nom: "Orion Vie Patrimoine", partenaire: "orion", ouverture: "2023-04-03", valeur: 96000, verse: 88000, uc: 75, perf: 8.4, programme: 300 }],
    conformite: { der: "2023-03-01", kyc: "2026-01-18", profil: "2026-01-18", lettre: "2026-01-18", adequation: "", identite: "2029-06-30", domicile: "2026-01-10", avis: "2026-08-28", vigilance: "Standard", ppe: false, origine: "Salaires" },
    historique: [
      { date: "2026-11-19", type: "email", texte: "Simulation PER envoyée : 14 800 € versés = 6 068 € d'impôt en moins." },
      { date: "2026-11-05", type: "rdv", texte: "Visio : objectifs 2027, projet locatif à Chambéry." },
    ],
    prochain: { date: "2026-11-20", heure: "17:30", objet: "Signature ouverture PER (visio)" },
    remuneration: { honoraires: 1200, encours: 620, entree: 0 },
  },
  {
    id: "bertin",
    nom: "BERTIN",
    prenom: "Jacques & Monique",
    type: "Foyer retraité",
    initiales: "JB",
    age: 69,
    ageConjoint: 67,
    profession: "Retraités (ancien notaire · professeure)",
    ville: "Aix-les-Bains",
    segment: "Premium",
    depuis: "2011",
    tmi: 30,
    revenus: 96000,
    regime: "Communauté universelle avec attribution intégrale",
    enfants: [
      { prenom: "Caroline", age: 41, note: "3 petits-enfants" },
      { prenom: "Thomas", age: 38, note: "" },
    ],
    profil: { risque: 3, horizon: "5 à 8 ans", experience: "Confirmée", esg: "Non renseigné", date: "2023-09-10" },
    objectifs: ["Transmettre en franchise de droits", "Revenus complémentaires", "Aider les petits-enfants"],
    actifs: [
      { cat: "Immobilier", libelle: "Maison · Aix-les-Bains", valeur: 960000 },
      { cat: "Immobilier", libelle: "Studio locatif · Chambéry", valeur: 165000 },
      { cat: "Financier", libelle: "Assurances-vie", valeur: 1020000 },
      { cat: "Financier", libelle: "Compte-titres", valeur: 210000 },
      { cat: "Liquidités", libelle: "Livrets et comptes", valeur: 188000 },
    ],
    passifs: [],
    contrats: [
      { type: "Assurance-vie", nom: "Orion Vie Patrimoine", partenaire: "orion", ouverture: "2011-02-14", valeur: 640000, verse: 470000, uc: 35, perf: 3.6, programme: 0 },
      { type: "Assurance-vie", nom: "Atlantique Sélection", partenaire: "atlantique", ouverture: "2015-06-08", valeur: 380000, verse: 330000, uc: 25, perf: 2.9, programme: 0 },
      { type: "Compte-titres", nom: "Lumen CTO", partenaire: "lumen", ouverture: "2013-01-21", valeur: 210000, verse: 160000, uc: 100, perf: 5.1, programme: 0 },
    ],
    conformite: { der: "2011-01-10", kyc: "2023-09-10", profil: "2023-09-10", lettre: "2023-09-10", adequation: "2023-09-12", identite: "2026-10-02", domicile: "2023-09-01", avis: "2025-09-01", vigilance: "Standard", ppe: false, origine: "Épargne, retraite" },
    historique: [
      { date: "2026-10-21", type: "appel", texte: "Souhaite aider Caroline pour l'achat de sa résidence principale." },
      { date: "2025-12-02", type: "rdv", texte: "Revue annuelle. Rachat partiel de 9 200 € en franchise d'impôt." },
    ],
    prochain: null,
    remuneration: { honoraires: 2400, encours: 7140, entree: 0 },
  },
  {
    id: "rahmani",
    nom: "RAHMANI",
    prenom: "Karim & Lucie",
    type: "Foyer",
    initiales: "KR",
    age: 39,
    ageConjoint: 37,
    profession: "Pharmacien titulaire · Kinésithérapeute",
    ville: "Grenoble",
    segment: "Patrimonial",
    depuis: "2025",
    tmi: 41,
    revenus: 168000,
    regime: "Communauté réduite aux acquêts",
    enfants: [
      { prenom: "Adam", age: 6, note: "" },
      { prenom: "Nora", age: 3, note: "" },
    ],
    profil: { risque: 5, horizon: "8 ans et plus", experience: "Intermédiaire", esg: "Oui · 20 % minimum", date: "2025-06-02" },
    objectifs: ["Protéger la famille (prévoyance)", "Se constituer un patrimoine", "Réduire l'IR"],
    actifs: [
      { cat: "Professionnel", libelle: "Fonds de pharmacie (SELAS)", valeur: 1400000 },
      { cat: "Immobilier", libelle: "Résidence principale · Meylan", valeur: 720000 },
      { cat: "Financier", libelle: "Assurance-vie", valeur: 64000 },
      { cat: "Liquidités", libelle: "Comptes et livrets", valeur: 121000 },
    ],
    passifs: [
      { libelle: "Prêt d'acquisition de la pharmacie", crd: 980000, fin: "2037", taux: "3,40 %" },
      { libelle: "Prêt résidence principale", crd: 455000, fin: "2048", taux: "3,20 %" },
    ],
    contrats: [{ type: "Assurance-vie", nom: "Atlantique Sélection", partenaire: "atlantique", ouverture: "2025-06-20", valeur: 64000, verse: 60000, uc: 70, perf: 6.6, programme: 800 }],
    conformite: { der: "2025-05-15", kyc: "2025-06-02", profil: "2025-06-02", lettre: "2025-06-02", adequation: "2025-06-03", identite: "2026-08-14", domicile: "2025-05-20", avis: "2025-09-01", vigilance: "Standard", ppe: false, origine: "Revenus professionnels" },
    historique: [{ date: "2026-09-12", type: "rdv", texte: "Audit prévoyance : garanties décès insuffisantes au regard des emprunts." }],
    prochain: { date: "2026-11-25", heure: "18:00", objet: "Présentation de l'étude prévoyance + PER" },
    remuneration: { honoraires: 1500, encours: 420, entree: 600 },
  },
  {
    id: "vasseur",
    nom: "VASSEUR",
    prenom: "Hélène",
    type: "Personne seule",
    initiales: "HV",
    age: 74,
    profession: "Veuve · ancienne commerçante",
    ville: "Chambéry",
    segment: "Patrimonial",
    depuis: "2018",
    tmi: 30,
    revenus: 58000,
    regime: "Veuve",
    enfants: [
      { prenom: "Pierre", age: 49, note: "" },
      { prenom: "Anne", age: 46, note: "" },
    ],
    profil: { risque: 2, horizon: "3 à 5 ans", experience: "Faible", esg: "Non", date: "2024-04-11" },
    objectifs: ["Revenus réguliers", "Simplicité", "Transmission aux deux enfants"],
    actifs: [
      { cat: "Immobilier", libelle: "Appartement · Chambéry", valeur: 390000 },
      { cat: "Immobilier", libelle: "Usufruit · local commercial", valeur: 120000 },
      { cat: "Financier", libelle: "Assurance-vie", valeur: 312000 },
      { cat: "Liquidités", libelle: "Livrets", valeur: 96000 },
    ],
    passifs: [],
    contrats: [{ type: "Assurance-vie", nom: "Orion Vie Sérénité", partenaire: "orion", ouverture: "2018-03-05", valeur: 312000, verse: 290000, uc: 15, perf: 2.6, programme: 0 }],
    conformite: { der: "2018-02-20", kyc: "2024-04-11", profil: "2024-04-11", lettre: "2024-04-11", adequation: "2024-04-12", identite: "2025-12-01", domicile: "2024-04-01", avis: "2025-09-01", vigilance: "Standard", ppe: false, origine: "Vente du fonds de commerce (2017)" },
    historique: [{ date: "2026-07-03", type: "appel", texte: "Demande de rachat programmé : 800 € par mois mis en place." }],
    prochain: null,
    remuneration: { honoraires: 0, encours: 1870, entree: 0 },
  },
];

/* ================================================================ Autres clients (générés, fiches courtes) ================================================================ */

const PRENOMS = ["Élodie", "Nicolas", "Camille", "Julien", "Isabelle", "Frédéric", "Aurélie", "Mathieu", "Laure", "Olivier", "Céline", "Romain", "Valérie", "Sébastien", "Nathalie", "Guillaume", "Sandrine", "Pierre-Yves", "Agnès", "Benoît", "Muriel", "Thierry", "Emma", "Yann", "Delphine", "François", "Hélène", "Arnaud", "Chloé", "Bruno"];
const NOMS = ["MOREAU", "FAURE", "GIRAUD", "LAMBERT", "ROUSSEL", "PERRIN", "CHEVALIER", "BLANC", "GUERIN", "BOYER", "GARNIER", "MERCIER", "FONTAINE", "ROLLAND", "DUVAL", "LEMOINE", "BARBIER", "MEUNIER", "BRUN", "COLIN", "ARNAUD", "MARTY", "CARON", "PICARD", "AUBERT", "RENAUD", "JOLY", "GAUTIER", "LECLERC", "BRETON"];
const VILLES = ["Lyon 3e", "Annecy", "Grenoble", "Chambéry", "Villeurbanne", "Écully", "Aix-les-Bains", "Valence", "Bourgoin-Jallieu", "Caluire", "Évian", "Thonon-les-Bains"];
const METIERS = ["Médecin généraliste", "Cadre dirigeant", "Avocat associé", "Expert-comptable", "Ingénieur", "Dentiste", "Commerçant", "Architecte", "Retraité", "Pilote de ligne", "Artisan (BTP)", "Cadre bancaire", "Kinésithérapeute", "Gérant de PME"];

function hasard(n) {
  let s = n * 9301 + 49297;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}

const generes = PRENOMS.map((prenom, i) => {
  const r = hasard(i + 3);
  const age = Math.round(32 + r() * 44);
  const tmi = [11, 30, 30, 41, 41, 45][Math.floor(r() * 6)];
  const encours = Math.round((60 + r() * 900) * 1000);
  const anneeOuv = 2009 + Math.floor(r() * 15);
  const aPer = r() > 0.55;
  const contrats = [
    { type: "Assurance-vie", nom: r() > 0.5 ? "Orion Vie Patrimoine" : "Atlantique Sélection", partenaire: r() > 0.5 ? "orion" : "atlantique", ouverture: `${anneeOuv}-0${1 + Math.floor(r() * 8)}-1${Math.floor(r() * 9)}`, valeur: Math.round(encours * 0.7), verse: Math.round(encours * 0.6), uc: Math.round(20 + r() * 60), perf: Math.round((2 + r() * 6) * 10) / 10, programme: r() > 0.5 ? 300 : 0 },
  ];
  if (aPer) contrats.push({ type: "PER individuel", nom: "Atlantique Retraite+", partenaire: "atlantique", ouverture: `${2020 + Math.floor(r() * 5)}-01-15`, valeur: Math.round(encours * 0.3), verse: Math.round(encours * 0.27), uc: 75, perf: 6.1, programme: 250 });
  else contrats.push({ type: "SCPI", nom: "Pierre & Rendement Europe", partenaire: "pierre", ouverture: "2021-06-01", valeur: Math.round(encours * 0.3), verse: Math.round(encours * 0.3), uc: 100, perf: 4.5, programme: 0 });
  const kycMois = i === 11 ? 26 + i % 5 : Math.floor(r() * 18);
  const kyc = new Date(2026, 10 - kycMois, 10).toISOString().slice(0, 10);
  return {
    id: `c${i}`,
    nom: NOMS[i],
    prenom,
    type: r() > 0.5 ? "Foyer" : "Personne seule",
    initiales: (prenom[0] + NOMS[i][0]).toUpperCase(),
    age,
    profession: age > 66 ? "Retraité(e)" : METIERS[i % METIERS.length],
    ville: VILLES[i % VILLES.length],
    segment: encours > 600000 ? "Premium" : encours > 250000 ? "Patrimonial" : "Essentiel",
    depuis: String(anneeOuv),
    tmi,
    revenus: tmi * 2600 + Math.round(r() * 20000),
    profil: { risque: 2 + Math.floor(r() * 5), horizon: "5 à 8 ans", experience: "Intermédiaire", esg: i === 14 ? "Non renseigné" : "Oui", date: kyc },
    liquidites: Math.round(r() * 160000),
    contrats,
    conformite: { kyc, identite: i === 22 ? "2026-09-01" : "2030-01-01", adequation: kyc, vigilance: [7, 20].includes(i) ? "Renforcée" : "Standard", ppe: false },
    prochain: null,
    remuneration: { honoraires: Math.round(r() * 2) * 600, encours: Math.round(encours * 0.0065), entree: 0 },
    courte: true,
  };
});

export const CLIENTS = [...vitrines, ...generes];

/**
 * Clients professionnels (FICTIFS) : société, holding ou SCI suivie par le cabinet ; la personne citée est son
 * représentant. Tous les autres clients sont des particuliers.
 */
const PROS = {
  marchetti: (c) => ({ raison: "MARCHETTI INDUSTRIE", forme: "SAS", siren: "999 654 327", activite: "Holding · cession en préparation" }),
  c4: (c) => ({ raison: `SCI ${c.nom} FAMILLE`, forme: "SCI", siren: "999 210 004", activite: "Société civile immobilière" }),
  c9: (c) => ({ raison: `${c.nom} CONSEIL`, forme: "SAS", siren: "999 210 012", activite: "Trésorerie d'entreprise" }),
  c17: (c) => ({ raison: `HOLDING ${c.nom}`, forme: "SARL", siren: "999 210 020", activite: "Holding patrimoniale" }),
  c25: (c) => ({ raison: `SELARL ${c.nom}`, forme: "SELARL", siren: "999 210 038", activite: "Société d'exercice libéral" }),
};
for (const c of CLIENTS) {
  if (!PROS[c.id]) continue;
  c.pro = PROS[c.id](c);
  c.type = `Professionnel · ${c.pro.raison}`;
}

/** Totaux fictifs du cabinet (l'ensemble du portefeuille, pas seulement la liste affichée). */
export const CABINET_CHIFFRES = {
  encours: 48612000,
  encoursEvolution: 6.4,
  foyers: 186,
  collecteNette: 4120000,
  collecteObjectif: 5000000,
  remuneration: 588400,
  remunerationObjectif: 650000,
  encoursMois: [41.2, 41.9, 42.3, 43.0, 43.4, 44.1, 44.6, 45.2, 46.0, 46.8, 47.9, 48.6],
  repartition: [
    { libelle: "Fonds euros", valeur: 31, couleur: "#e8c07a" },
    { libelle: "Unités de compte", valeur: 29, couleur: "#c7905e" },
    { libelle: "PER", valeur: 14, couleur: "#7cb8e8" },
    { libelle: "SCPI", valeur: 11, couleur: "#f0a37a" },
    { libelle: "PEA / titres", valeur: 9, couleur: "#a78bfa" },
    { libelle: "Private equity", valeur: 6, couleur: "#6ee7b7" },
  ],
  remunerationMois: [38, 41, 52, 44, 47, 49, 46, 39, 51, 55, 63, 63.4],
  sources: [
    { libelle: "Recommandation client", valeur: 41 },
    { libelle: "Site internet (Google)", valeur: 27 },
    { libelle: "Expert-comptable partenaire", valeur: 14 },
    { libelle: "LinkedIn", valeur: 11 },
    { libelle: "Notaire partenaire", valeur: 7 },
  ],
};

/* ================================================================ Demandes reçues du site ================================================================ */

export const DEMANDES = [
  { id: "d1", quand: "il y a 12 min", nom: "Thomas LEROY", age: 46, ville: "Annecy", objet: "Réduire mes impôts", message: "Bonjour, je suis cadre et je paie environ 22 000 € d'impôts par an. J'aimerais savoir si un PER est intéressant pour moi.", montant: "50 000 – 100 000 €", tmi: 41, source: "Google · article « PER ou assurance-vie »", score: 92, chaud: true, statut: "Nouvelle" },
  { id: "d2", quand: "il y a 2 h", nom: "Martine et Gérard FAVRE", age: 66, ville: "Lyon 4e", objet: "Préparer ma succession", message: "Nous avons 3 enfants et une maison familiale, nous voulons éviter des droits de succession trop importants.", montant: "500 000 € et plus", tmi: 30, source: "Recommandation · Notaire partenaire", score: 88, chaud: true, statut: "Nouvelle" },
  { id: "d3", quand: "hier, 21:14", nom: "Julia MARTIN", age: 31, ville: "Grenoble", objet: "Investir dans l'immobilier", message: "Je souhaite investir dans un premier bien locatif ou en SCPI, je ne sais pas quoi choisir.", montant: "20 000 – 50 000 €", tmi: 30, source: "Instagram", score: 64, chaud: false, statut: "Nouvelle" },
  { id: "d4", quand: "hier, 11:02", nom: "Laurent DUBOIS", pro: { raison: "DUBOIS AUTOMATISMES" }, age: 57, ville: "Chambéry", objet: "Vendre mon entreprise", message: "Projet de cession de ma société d'ici 2 ans, je cherche un accompagnement patrimonial.", montant: "1 M€ et plus", tmi: 45, source: "LinkedIn", score: 95, chaud: true, statut: "Rendez-vous fixé" },
  { id: "d5", quand: "18 nov.", nom: "Amandine ROUX", age: 38, ville: "Lyon 7e", objet: "Bilan patrimonial", message: "Je voudrais faire un point complet sur ma situation après un héritage.", montant: "100 000 – 500 000 €", tmi: 30, source: "Site internet · formulaire bilan", score: 81, chaud: true, statut: "En cours" },
];

/* ================================================================ Agenda ================================================================ */

export const RDV = [
  { jour: 0, debut: "09:00", fin: "10:00", client: "Laurent DUBOIS", type: "Découverte", lieu: "Au cabinet", couleur: "decouverte" },
  { jour: 0, debut: "11:30", fin: "12:30", client: "Camille GIRAUD", type: "Revue annuelle", lieu: "Teams", couleur: "revue", id: "c2" },
  { jour: 0, debut: "14:00", fin: "15:00", client: "Nicolas FAURE", type: "Signature", lieu: "Au cabinet", couleur: "signature", id: "c1" },
  { jour: 0, debut: "17:30", fin: "18:00", client: "Sophie NGUYEN", type: "Signature PER", lieu: "Google Meet", couleur: "signature", id: "nguyen" },
  { jour: 1, debut: "10:00", fin: "11:30", client: "Amandine ROUX", type: "Bilan patrimonial", lieu: "Au cabinet", couleur: "bilan" },
  { jour: 1, debut: "15:00", fin: "16:00", client: "Cabinet comptable Arvel", type: "Partenaire", lieu: "Téléphone", couleur: "partenaire" },
  { jour: 2, debut: "10:00", fin: "11:00", client: "Philippe & Claire DELORME", type: "Point fin d'année", lieu: "Au cabinet", couleur: "revue", id: "delorme" },
  { jour: 2, debut: "16:30", fin: "17:30", client: "Élodie MOREAU", type: "Revue annuelle", lieu: "Au cabinet", couleur: "revue", id: "c0" },
  { jour: 3, debut: "09:30", fin: "11:00", client: "Martine et Gérard FAVRE", type: "Découverte", lieu: "Chez le client", couleur: "decouverte" },
  { jour: 3, debut: "18:00", fin: "19:00", client: "Karim & Lucie RAHMANI", type: "Restitution d'étude", lieu: "Teams", couleur: "bilan", id: "rahmani" },
  { jour: 4, debut: "11:00", fin: "12:00", client: "Julien ROUSSEL", type: "Revue annuelle", lieu: "Google Meet", couleur: "revue", id: "c3" },
  { jour: 4, debut: "14:30", fin: "16:00", client: "Antoine MARCHETTI", type: "Comité cession", lieu: "Étude notariale", couleur: "partenaire", id: "marchetti" },
];

/**
 * Où se passe un rendez-vous : sur le terrain (cabinet, chez le client, étude notariale…), en visio Teams ou Google Meet,
 * ou par téléphone. Une visio a toujours son lien, créé tout seul et envoyé au client avec la confirmation.
 */
export function modeRdv(r) {
  if (r.lieu === "Teams") return { cle: "teams", visio: true, libelle: "Visio Teams", court: "Teams", ico: "visio", couleur: "violet", appli: "Microsoft Teams" };
  if (r.lieu === "Google Meet") return { cle: "meet", visio: true, libelle: "Visio Google Meet", court: "Meet", ico: "visio", couleur: "vert", appli: "Google Meet" };
  if (r.lieu === "Téléphone") return { cle: "tel", visio: false, libelle: "Téléphone", court: "Tél.", ico: "telephone", couleur: "bleu" };
  return { cle: "terrain", visio: false, libelle: r.lieu, court: r.lieu === "Au cabinet" ? "Cabinet" : "Terrain", ico: "maison", couleur: "or" };
}

/** Jours affichés dans l'agenda : jours ouvrés à partir d'aujourd'hui (vendredi 20 novembre 2026). */
export const JOURS = [
  { court: "ven.", num: 20, long: "Vendredi 20 novembre", date: "2026-11-20" },
  { court: "lun.", num: 23, long: "Lundi 23 novembre", date: "2026-11-23" },
  { court: "mar.", num: 24, long: "Mardi 24 novembre", date: "2026-11-24" },
  { court: "mer.", num: 25, long: "Mercredi 25 novembre", date: "2026-11-25" },
  { court: "jeu.", num: 26, long: "Jeudi 26 novembre", date: "2026-11-26" },
];

/* ================================================================ Relances et campagnes automatiques ================================================================ */

export const AUTOMATISMES = [
  { titre: "Revue annuelle", regle: "12 mois après le dernier rendez-vous de revue", action: "E-mail avec lien de prise de rendez-vous, puis rappel à J+10", actif: true, mois: 14 },
  { titre: "Mise à jour de la connaissance client", regle: "Profil investisseur de plus de 24 mois ou pièce d'identité expirée", action: "Questionnaire en ligne à remplir par le client, signé électroniquement", actif: true, mois: 9 },
  { titre: "Anniversaire des 8 ans d'un contrat", regle: "Contrat d'assurance-vie qui atteint 8 ans", action: "Note « fiscalité allégée des rachats » + proposition de rendez-vous", actif: true, mois: 3 },
  { titre: "Avant 70 ans", regle: "Client à 6 mois de ses 70 ans, avec assurance-vie", action: "Alerte au cabinet + e-mail « versements avant 70 ans »", actif: true, mois: 2 },
  { titre: "Campagne PER de fin d'année", regle: "Clients avec TMI ≥ 30 %, du 1er novembre au 20 décembre", action: "Simulation personnalisée de l'économie d'impôt envoyée à chacun", actif: true, mois: 38 },
  { titre: "Anniversaire du client", regle: "Le jour de son anniversaire", action: "Carte de vœux personnalisée aux couleurs du cabinet", actif: true, mois: 16 },
  { titre: "Rapport annuel des frais (MIF 2)", regle: "Chaque année en février", action: "Relevé des coûts et frais envoyé à chaque client", actif: true, mois: 186 },
  { titre: "Prospect sans réponse", regle: "Demande sans rendez-vous après 5 jours", action: "Relance douce par e-mail, puis tâche « appeler »", actif: true, mois: 7 },
  { titre: "Majorité d'un enfant", regle: "Enfant d'un client qui atteint 18 ans", action: "Idée de rendez-vous : ouverture d'un contrat, donation", actif: false, mois: 0 },
];

export const CAMPAGNES = [
  { titre: "Lettre patrimoniale de novembre", date: "2026-11-05", envoyes: 172, ouverts: 71, clics: 23, rdv: 6 },
  { titre: "Fin d'année : réduire son impôt avec le PER", date: "2026-11-12", envoyes: 94, ouverts: 62, clics: 31, rdv: 11 },
  { titre: "Loi de finances 2026 : ce qui change pour vous", date: "2026-03-02", envoyes: 168, ouverts: 58, clics: 19, rdv: 4 },
];

/* ================================================================ Articles du site ================================================================ */

export const ARTICLES = [
  { titre: "PER ou assurance-vie : lequel choisir en 2026 ?", date: "2026-11-14", statut: "Publié", vues: 1840, demandes: 9 },
  { titre: "Donation aux petits-enfants : les 5 règles à connaître", date: "2026-11-28", statut: "Programmé", vues: 0, demandes: 0 },
  { titre: "Céder son entreprise : l'apport-cession expliqué simplement", date: "2026-10-30", statut: "Publié", vues: 960, demandes: 4 },
  { titre: "SCPI : comment toucher des loyers sans gérer de locataires", date: "2026-10-16", statut: "Publié", vues: 1320, demandes: 6 },
  { titre: "IFI 2027 : êtes-vous concerné ?", date: "2026-12-12", statut: "Programmé", vues: 0, demandes: 0 },
];

/* ================================================================ Documents à signer ================================================================ */

export const SIGNATURES = [
  { doc: "Lettre de mission 2027", client: "Sophie NGUYEN", envoye: "il y a 2 h", etat: "Ouvert, pas encore signé" },
  { doc: "Déclaration d'adéquation · PER", client: "Sophie NGUYEN", envoye: "il y a 2 h", etat: "En attente" },
  { doc: "Bulletin d'arbitrage", client: "Nicolas MOREAU", envoye: "hier", etat: "Signé ✓" },
  { doc: "Document d'entrée en relation", client: "Amandine ROUX", envoye: "18 nov.", etat: "Signé ✓" },
  { doc: "Questionnaire profil investisseur", client: "Hélène VASSEUR", envoye: "14 nov.", etat: "Relancé 2 fois" },
];
