/**
 * Questions du rendez-vous de présentation (Leader Patrimoine). Une seule liste, utilisée par la page
 * « Questionnaire » de la maquette ET par le petit serveur local, qui écrit les réponses dans
 * `prospects/leader-patrimoine/REPONSES-RENDEZ-VOUS.md` (lisible) et `reponses-rendez-vous.json` (pour reprendre).
 *
 * Types de champs : « choix » (un seul), « coches » (plusieurs), « texte » (une ligne), « note » (plusieurs lignes).
 */
export const QUESTIONS = [
  {
    id: "utilisateurs",
    titre: "Qui utilisera le cockpit ?",
    pourquoi: "Le cockpit est prévu pour une personne. Plusieurs utilisateurs avec des droits différents = développement à prévoir.",
    champs: [
      { id: "qui", type: "choix", libelle: "Utilisateurs", options: ["Serkan seul", "Serkan + une assistante", "Plusieurs conseillers"] },
      { id: "nombre", type: "texte", libelle: "Nombre de personnes", aide: "Ex. : 2" },
      { id: "droits", type: "note", libelle: "Qui doit voir quoi ?", aide: "Ex. : l'assistante gère l'agenda mais ne voit pas la rémunération" },
    ],
  },
  {
    id: "outil",
    titre: "Quel outil utilise-t-il aujourd'hui ?",
    pourquoi: "Pour reprendre tout son historique (clients, contrats, rendez-vous) dès le premier jour.",
    champs: [
      { id: "type", type: "coches", libelle: "Aujourd'hui", options: ["Excel / tableur", "Un logiciel métier (CRM)", "Papier", "Agenda seulement"] },
      { id: "nom", type: "texte", libelle: "Nom du logiciel", aide: "Ex. : O2S, Harvest, Big Expert…" },
      { id: "export", type: "choix", libelle: "Peut-il exporter ses données ?", options: ["Oui (Excel / CSV)", "Je ne sais pas", "Non"] },
      { id: "volume", type: "texte", libelle: "Nombre de clients à reprendre", aide: "Ex. : 180 foyers" },
    ],
  },
  {
    id: "partenaires",
    titre: "Ses principaux partenaires",
    pourquoi: "Pour importer leurs relevés tout seuls (encours, commissions) au lieu de tout ressaisir.",
    champs: [
      { id: "liste", type: "note", libelle: "Assureurs, sociétés de gestion, SCPI…", aide: "Un par ligne" },
      { id: "format", type: "coches", libelle: "Comment reçoit-il les relevés ?", options: ["PDF", "Fichier Excel / CSV", "Sur leur extranet", "Je ne sais pas"] },
    ],
  },
  {
    id: "agenda",
    titre: "Agenda et visio",
    pourquoi: "Pour relier son agenda au cockpit dans les deux sens et créer les liens visio tout seuls.",
    champs: [
      { id: "agenda", type: "choix", libelle: "Agenda", options: ["Google", "Outlook / Microsoft 365", "Autre", "Aucun"] },
      { id: "visio", type: "coches", libelle: "Visio", options: ["Teams", "Google Meet", "Zoom", "Autre"] },
      { id: "habitudes", type: "note", libelle: "Ses habitudes", aide: "Ex. : rendez-vous le samedi matin, durée d'un bilan…" },
    ],
  },
  {
    id: "site",
    titre: "Site internet et e-mails",
    pourquoi: "Pour que les demandes du site arrivent dans le cockpit et que les e-mails partent de son adresse.",
    champs: [
      { id: "techno", type: "choix", libelle: "Son site est fait avec", options: ["WordPress", "Wix", "Autre", "Je ne sais pas"] },
      { id: "qui", type: "texte", libelle: "Qui s'occupe du site ?", aide: "Lui, une agence, un prestataire…" },
      { id: "domaine", type: "texte", libelle: "Nom de domaine", valeur: "leader-patrimoine.fr" },
      { id: "mail", type: "texte", libelle: "Adresse e-mail utilisée avec les clients", aide: "Ex. : contact@leader-patrimoine.fr" },
    ],
  },
  {
    id: "association",
    titre: "Association professionnelle et documents",
    pourquoi: "Pour reprendre ses modèles réglementaires et les faire signer en ligne.",
    champs: [
      { id: "association", type: "choix", libelle: "Association", options: ["CNCGP", "ANACOFI", "CNCEF", "Autre", "Aucune"] },
      { id: "documents", type: "coches", libelle: "Documents qu'il utilise", options: ["Document d'entrée en relation", "Lettre de mission", "Recueil d'informations", "Déclaration d'adéquation", "Rapport écrit"] },
      { id: "signature", type: "choix", libelle: "Signature électronique aujourd'hui", options: ["Oui", "Non", "Parfois"] },
    ],
  },
  {
    id: "statuts",
    titre: "Statuts et ORIAS",
    pourquoi: "Ils figurent sur ses e-mails, ses documents et sa signature.",
    champs: [
      { id: "statuts", type: "coches", libelle: "Statuts", options: ["CIF", "Courtier en assurance", "IOBSP", "Carte T (immobilier)"] },
      { id: "orias", type: "texte", libelle: "Numéro ORIAS", aide: "8 chiffres" },
      { id: "tel", type: "texte", libelle: "Téléphone du cabinet (pour la signature)" },
    ],
  },
  {
    id: "priorites",
    titre: "Ce qui compte le plus pour lui",
    pourquoi: "Pour construire d'abord ce qui lui fait gagner le plus de temps.",
    champs: [
      {
        id: "fonctions",
        type: "coches",
        libelle: "Ses priorités",
        options: ["Agenda et prise de rendez-vous en ligne", "Demandes du site", "Fiches clients 360°", "Encours et relevés des partenaires", "Radar d'opportunités", "Simulateurs", "Conformité et signatures", "Rémunération et factures", "Relances automatiques", "Accès comptable", "Application sur téléphone"],
      },
      { id: "remarques", type: "note", libelle: "Ce qu'il a dit (ses mots)", aide: "Ce qu'il a aimé, ce qui manque, ses craintes…" },
      { id: "suite", type: "choix", libelle: "Suite", options: ["Il veut un devis", "Il réfléchit", "À relancer", "Pas intéressé"] },
    ],
  },
];

/** Réponses → texte Markdown lisible (pour le fichier du dossier prospect). */
export function reponsesEnTexte(rep, quand) {
  const lignes = [
    "# Réponses du rendez-vous — Leader Patrimoine",
    "",
    `> Rempli dans la maquette (page « Questionnaire »), dernière modification : ${quand}.`,
    "> Fichier écrit automatiquement : ne pas modifier à la main (le refaire depuis la maquette).",
    "",
  ];
  QUESTIONS.forEach((q, n) => {
    lignes.push(`## ${n + 1}. ${q.titre}`, "");
    for (const c of q.champs) {
      const v = rep?.[q.id]?.[c.id];
      const texte = Array.isArray(v) ? v.join(", ") : String(v ?? "").trim();
      if (c.type === "note" && texte) lignes.push(`- **${c.libelle}** :`, ...texte.split(/\r?\n/).map((l) => `  > ${l}`));
      else lignes.push(`- **${c.libelle}** : ${texte || "—"}`);
    }
    lignes.push("");
  });
  return lignes.join("\n");
}
