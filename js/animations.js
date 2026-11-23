/** Automatismes en images : chaque scène raconte, étape par étape, ce que le cockpit fait à la place du cabinet. */
import { icone } from "./icones.js";
import { signatureMail } from "./signature.js";

const d = (s) => `style="animation-delay:${s}s"`;
const R = (s) => `class="retarde" ${d(s)}`;
const mono = `<img src="assets/mono-clair.svg" alt="">`;

/* ---------------------------------------------------------------- Petits décors réutilisables */

const tel = (contenu, sombre = false) => `<div class="mini-tel"><span class="ilot"></span><div class="mini-ecran ${sombre ? "sombre" : ""}">${contenu}</div></div>`;
const pc = (contenu) => `<div class="mini-pc"><div class="ecran-pc">${contenu}</div></div>`;
const entete = (t) => `<div class="entete">${mono}<strong>${t}</strong></div>`;
const email = ({ de = "Leader Patrimoine", a, objet, corps, bouton, pieces = [] }) => `<div class="email">
  <div class="tete-mail"><span>De : <b>${de}</b></span>${a ? `<span>À : ${a}</span>` : ""}<span>Objet : <b>${objet}</b></span></div>
  <div class="corps">${corps}${pieces.map((p, i) => `<div class="piece retarde" ${d(0.5 + i * 0.25)}>${icone("document")}${p}</div>`).join("")}${bouton ? `<span class="bouton-mail">${bouton}</span>` : ""}${signatureMail()}</div></div>`;
const notif = (titre, texte) => `<div class="notif-tel">${mono}<div><strong>${titre}</strong><p>${texte}</p></div></div>`;
const coches = (items, depart = 0.4, pas = 0.55) => items.map((t, i) => `<div class="ligne-check coche retarde" ${d(depart + i * pas)}><span class="case-a">${icone("coche")}</span>${t}</div>`).join("");
const agendaMini = (nouveau) => `<div class="agenda-mini">
  ${[
    ["ven. 20", ["v:Découverte", "b:Revue", "g:Signature"]],
    ["lun. 23", ["vide", nouveau ? "n" : "vide", "b:Bilan"]],
    ["mar. 24", ["b:DELORME", "vide", "b:Revue"]],
    ["mer. 25", ["v:FAVRE", "vide", "b:RAHMANI"]],
    ["jeu. 26", ["b:Revue", "g:Cession", "vide"]],
  ]
    .map(([j, blocs]) => `<div class="col"><div class="jour">${j}</div>${blocs.map((b) => (b === "vide" ? `<div class="vide"></div>` : b === "n" ? `<div class="bloc nouveau"><b>${nouveau}</b><br>11:30 · visio</div>` : `<div class="bloc ${b[0]}">${b.slice(2)}</div>`)).join("")}</div>`)
    .join("")}
</div>`;

/* ---------------------------------------------------------------- Les scènes */

export const SCENES = [
  {
    id: "rdv",
    titre: "Un rendez-vous, de la réservation au compte rendu",
    court: "Rendez-vous de A à Z",
    ico: "agenda",
    gain: "≈ 1 h 10 gagnée par rendez-vous",
    etapes: [
      {
        acteur: "client",
        nom: "Réservation",
        ico: "lien",
        texte: "Votre client clique sur « Prendre rendez-vous » depuis votre site ou un de vos e-mails.",
        sous: "Il choisit l'objet du rendez-vous, sans vous appeler, même un dimanche soir.",
        visuel: () => tel(`${entete("Prendre rendez-vous")}<div class="option">${icone("cible")} Bilan patrimonial · 1 h 30</div><div class="option choisie" ${d(1.1)}>${icone("euro")} Réduire mes impôts · 45 min</div><div class="option">${icone("sablier")} Préparer ma retraite · 1 h</div><div class="option">${icone("famille")} Transmettre · 1 h</div><span class="doigt" style="left:110px;top:150px"></span>`),
      },
      {
        acteur: "client",
        nom: "Créneau libre",
        ico: "horloge",
        texte: "Seuls vos créneaux réellement libres lui sont proposés.",
        sous: "Votre agenda habituel est lu automatiquement : jamais deux rendez-vous en même temps.",
        visuel: () => tel(`${entete("Choisissez un créneau")}<p style="margin:0 0 8px;font-weight:600">Lundi 23 novembre</p><div class="creneaux"><div class="libre">09:00</div><div class="choisie">11:30</div><div class="libre">14:00</div><div class="libre">16:00</div></div><p style="margin:14px 0 8px;font-weight:600">Mardi 24 novembre</p><div class="creneaux"><div class="libre">14:00</div><div class="libre">17:30</div></div><span class="doigt" style="left:150px;top:118px"></span>`),
      },
      {
        acteur: "cockpit",
        nom: "Agenda",
        ico: "agenda",
        texte: "Le rendez-vous se pose tout seul dans votre agenda.",
        sous: "Sur votre ordinateur, votre téléphone et votre agenda habituel, en même temps.",
        visuel: () => `<div>${pc(agendaMini("Thomas LEROY"))}<div class="synchro"><span class="pastille vert retarde" ${d(1.4)}>${icone("rafraichir")} Agenda Google / Outlook à jour</span><span class="pastille or retarde" ${d(1.7)}>${icone("cloche")} Vous êtes prévenu</span></div></div>`,
      },
      {
        acteur: "cockpit",
        nom: "Confirmation",
        ico: "mail",
        texte: "Le client reçoit aussitôt sa confirmation, à vos couleurs.",
        sous: "Avec le lien visio, l'adresse du cabinet et un court questionnaire pour préparer l'échange.",
        visuel: () => email({ a: "Thomas LEROY", objet: "Votre rendez-vous du lundi 23 novembre à 11:30", corps: `<p style="margin:0 0 8px">Bonjour Thomas,</p><p style="margin:0">Votre rendez-vous est confirmé. Pour gagner du temps, répondez à 5 questions sur votre situation : votre conseiller aura tout en main.</p>`, pieces: ["Lien visio du rendez-vous", "Questionnaire de découverte (3 min)", "Document d'entrée en relation"], bouton: "Ajouter à mon agenda" }),
      },
      {
        acteur: "cockpit",
        nom: "Rappels",
        ico: "telephone",
        texte: "Avant le rendez-vous, le client reçoit ses rappels tout seul.",
        sous: "Un e-mail deux jours avant avec les papiers à apporter, puis un SMS la veille. Plus de rendez-vous oubliés.",
        visuel: () => tel(`<div class="ecran-verrou"><div style="font-size:14px">Dimanche 22 novembre</div><div class="h">18:00</div></div>${notif("Leader Patrimoine", "Rappel : rendez-vous demain à 11:30 en visio. Le lien visio est dans votre e-mail")}`, true),
      },
      {
        acteur: "vous",
        nom: "Préparation",
        ico: "clients",
        texte: "Le matin même, votre dossier de préparation vous attend.",
        sous: "Synthèse du client, réponses au questionnaire, points à aborder proposés par le cockpit.",
        visuel: () => `<div class="fiche-mini verre"><h3>Préparation · Thomas LEROY</h3><p style="margin:0 0 8px;color:var(--texte-2);font-size:13px">46 ans · cadre · TMI 41 % · 22 000 € d'impôt par an</p>${coches(["Questionnaire de découverte reçu", "Simulation PER prête : −6 150 € d'impôt", "Profil investisseur à faire signer", "Documents déposés : avis d'impôt, relevés"])}</div>`,
      },
      {
        acteur: "vous",
        nom: "Compte rendu",
        ico: "signature",
        texte: "Après le rendez-vous : vous cochez, le compte rendu se rédige.",
        sous: "Deux minutes au lieu de vingt. Il part au client et se range dans sa fiche.",
        visuel: () => `<div class="fiche-mini verre"><h3>Compte rendu</h3>${coches(["Situation et objectifs validés", "Ouverture d'un PER : 12 000 €", "Lettre de mission à signer"], 0.3, 0.45)}<div class="texte-redige" style="margin-top:12px">${"Bonjour Thomas, merci pour notre échange. Comme convenu, nous ouvrons votre plan d'épargne retraite avec un premier versement de 12 000 €. Vous recevez les documents à signer dans quelques minutes."
          .split(" ")
          .map((m, i) => `<span ${d(1.8 + i * 0.07)}>${m} </span>`)
          .join("")}</div></div>`,
      },
      {
        acteur: "cockpit",
        nom: "Suite",
        ico: "eclair",
        texte: "Et la suite est déjà programmée.",
        sous: "Documents envoyés à la signature, relance si besoin, prochaine revue planifiée dans 12 mois.",
        visuel: () => `<div class="fiche-mini verre"><h3>Ce que le cockpit a programmé</h3>${coches(["Lettre de mission + adéquation envoyées à la signature", "Relance automatique dans 3 jours si non signé", "Facture d'honoraires émise après paiement", "Revue annuelle : invitation en novembre 2027"])}</div>`,
      },
    ],
  },
  {
    id: "demande",
    titre: "Une demande du site devient un rendez-vous",
    court: "Demande du site",
    ico: "demandes",
    gain: "Réponse en moins d'une minute, 24 h / 24",
    etapes: [
      { acteur: "client", nom: "Formulaire", ico: "globe", texte: "Un visiteur remplit le formulaire de votre site.", sous: "Objectif, montant, situation : les bonnes questions, posées simplement.", visuel: () => tel(`${entete("Parlons de votre projet")}<div class="option">Objectif : <b style="margin-left:auto">Réduire mes impôts</b></div><div class="option">Montant : <b style="margin-left:auto">50 – 100 k€</b></div><div class="option">Impôt payé : <b style="margin-left:auto">≈ 22 000 €</b></div><div class="option choisie" ${d(1.2)} style="justify-content:center">Envoyer ma demande</div><span class="doigt" style="left:95px;top:232px"></span>`) },
      { acteur: "cockpit", nom: "Qualification", ico: "cible", texte: "Il estime l'impôt du prospect et note son intérêt.", sous: "Vous savez tout de suite qui rappeler en premier.", visuel: () => `<div class="jauge-profil fiche-mini verre"><h3>Thomas LEROY · 46 ans · Annecy</h3><p style="color:var(--texte-2);margin:0">Tranche d'imposition estimée : <b>41 %</b></p><div class="compteur-grand texte-or" data-compte="92" style="margin-top:18px">0</div><div class="compteur-sous">intérêt sur 100 · <span class="pastille rouge">Prioritaire</span></div></div>` },
      { acteur: "cockpit", nom: "Accusé", ico: "mail", texte: "Le prospect reçoit une réponse immédiate, avec votre lien de rendez-vous.", sous: "Pendant que vos concurrents le rappellent trois jours plus tard.", visuel: () => email({ a: "Thomas LEROY", objet: "Bien reçu, Thomas", corps: `<p style="margin:0">Merci pour votre message. Réduire votre impôt de façon durable, c'est possible : choisissez le moment qui vous convient pour en parler 30 minutes.</p>`, bouton: "Choisir mon créneau" }) },
      { acteur: "vous", nom: "Alerte", ico: "cloche", texte: "Vous êtes prévenu sur votre téléphone.", sous: "Demande prioritaire : une notification, tout de suite.", visuel: () => tel(`<div class="ecran-verrou"><div style="font-size:14px">Vendredi 20 novembre</div><div class="h">10:42</div></div>${notif("Nouvelle demande prioritaire", "Thomas LEROY · Réduire mes impôts · intérêt 92/100")}`, true) },
      { acteur: "client", nom: "Rendez-vous", ico: "agenda", texte: "Le prospect réserve : le rendez-vous est dans votre agenda.", sous: "Sans un seul appel ni un seul e-mail de votre part.", visuel: () => pc(agendaMini("Thomas LEROY")) },
      { acteur: "cockpit", nom: "Relance", ico: "rafraichir", texte: "Pas de réservation ? Relance douce à J+2, puis à J+5.", sous: "Et une tâche « appeler » si rien ne bouge. Aucun prospect n'est oublié.", visuel: () => `<div class="fiche-mini verre"><h3>Suivi automatique du prospect</h3>${coches(["J+0 · accusé de réception et lien de rendez-vous", "J+2 · relance douce par e-mail", "J+5 · seconde relance avec un article utile", "J+7 · tâche « appeler » dans votre liste"])}</div>` },
    ],
  },
  {
    id: "conformite",
    titre: "L'entrée en relation, sans papier et sans oubli",
    court: "Conformité sans papier",
    ico: "conformite",
    gain: "≈ 2 h de saisie évitées par nouveau client",
    etapes: [
      { acteur: "cockpit", nom: "Entrée en relation", ico: "document", texte: "Le document d'entrée en relation part avec la confirmation du premier rendez-vous.", sous: "Statuts, rémunération, réclamations : tout ce que la réglementation impose, au bon moment.", visuel: () => email({ a: "Thomas LEROY", objet: "Document d'entrée en relation", corps: `<p style="margin:0">Comme la réglementation le prévoit, voici la présentation de notre cabinet, de nos statuts et de notre mode de rémunération.</p>`, pieces: ["Document d'entrée en relation (PDF)", "Politique de traitement des réclamations"] }) },
      { acteur: "client", nom: "Questionnaire", ico: "clients", texte: "Le client remplit en ligne sa situation et son profil investisseur.", sous: "Connaissances, expérience, horizon, préférences de durabilité : la fiche se remplit toute seule.", visuel: () => tel(`${entete("Mon profil investisseur")}<p style="margin:0 0 8px;font-weight:600">Face à une baisse de 15 % de votre épargne, vous…</p><div class="option">Vendez tout</div><div class="option">Attendez sans bouger</div><div class="option choisie" ${d(1.1)}>Profitez-en pour investir</div><p style="margin:10px 0 6px;font-weight:600">Placements durables souhaités ?</p><div class="option">Oui, au moins 30 %</div><span class="doigt" style="left:100px;top:178px"></span>`) },
      { acteur: "cockpit", nom: "Profil", ico: "cible", texte: "Le profil de risque est calculé et justifié.", sous: "Score sur 7, cohérence des réponses vérifiée, date de mise à jour suivie.", visuel: () => `<div class="jauge-profil fiche-mini verre"><h3>Profil investisseur · Thomas LEROY</h3><div class="echelle">${[1, 2, 3, 4, 5, 6, 7].map((n) => `<div class="${n === 5 ? "cible" : ""}">${n}</div>`).join("")}</div><p class="retarde" ${d(1.9)} style="margin:0;text-align:center"><b>Dynamique</b> · horizon 8 ans et plus · 30 % durable</p></div>` },
      { acteur: "cockpit", nom: "Lettre de mission", ico: "document", texte: "La lettre de mission et la déclaration d'adéquation sont pré-remplies.", sous: "À partir de la fiche et de votre recommandation. Vous relisez, c'est tout.", visuel: () => `<div class="duo"><div class="doc retarde" ${d(0.2)}><b style="font-size:11px;color:#9a6a2c">LEADER PATRIMOINE</b><h4>Lettre de mission</h4>${'<div class="l"></div>'.repeat(9)}</div><div class="doc retarde" ${d(0.6)}><b style="font-size:11px;color:#9a6a2c">LEADER PATRIMOINE</b><h4>Déclaration d'adéquation</h4>${'<div class="l"></div>'.repeat(9)}</div></div>` },
      { acteur: "client", nom: "Signature", ico: "signature", texte: "Le client signe en ligne, depuis son téléphone.", sous: "Signature électronique à valeur légale, horodatée.", visuel: () => `<div class="doc"><b style="font-size:11px;color:#9a6a2c">LEADER PATRIMOINE</b><h4>Lettre de mission 2027</h4>${'<div class="l"></div>'.repeat(6)}<svg class="trait" viewBox="0 0 180 70"><path d="M5 50 C 20 10, 35 10, 40 40 S 60 70, 70 30 S 95 5, 100 45 S 130 60, 140 30 S 165 25, 175 40"/></svg><span class="tampon">SIGNÉ ✓</span></div>` },
      { acteur: "cockpit", nom: "Archivage", ico: "conformite", texte: "Tout est rangé, daté, prêt pour un contrôle.", sous: "Et le cockpit vous prévient quand une pièce expire ou qu'un profil a plus de 24 mois.", visuel: () => `<div class="jauge-profil fiche-mini verre" style="text-align:center"><h3>Dossier réglementaire</h3><div class="compteur-grand texte-or" data-compte="100" data-suffixe=" %">0</div><div class="compteur-sous">complet · prêt pour un contrôle</div>${coches(["Entrée en relation", "Profil + durabilité", "Lettre de mission", "Adéquation signée"], 1.2, 0.3)}</div>` },
    ],
  },
  {
    id: "revue",
    titre: "La revue annuelle se lance toute seule",
    court: "Revue annuelle",
    ico: "rafraichir",
    gain: "Tous vos clients revus chaque année, sans y penser",
    etapes: [
      { acteur: "cockpit", nom: "12 mois", ico: "sablier", texte: "Douze mois après la dernière revue, le cockpit s'en souvient pour vous.", sous: "Il repère aussi les profils de plus de 24 mois et les pièces d'identité expirées.", visuel: () => `<div class="jauge-profil fiche-mini verre" style="text-align:center"><h3>Revues à lancer ce mois-ci</h3><div class="compteur-grand texte-or" data-compte="14">0</div><div class="compteur-sous">clients · invitations prêtes</div></div>` },
      { acteur: "cockpit", nom: "Invitation", ico: "mail", texte: "Chaque client reçoit son invitation personnalisée.", sous: "Avec la valeur de ses contrats et votre lien de rendez-vous.", visuel: () => email({ a: "Philippe & Claire DELORME", objet: "Faisons le point sur votre patrimoine", corps: `<p style="margin:0">Bonjour Philippe et Claire, une année s'est écoulée : vos placements ont progressé de <b>+5,8 %</b>. Je vous propose notre point annuel.</p>`, bouton: "Choisir un créneau" }) },
      { acteur: "client", nom: "Mise à jour", ico: "clients", texte: "Le client met à jour sa situation en ligne avant de venir.", sous: "Revenus, famille, projets : sa fiche et son profil sont à jour avant le rendez-vous.", visuel: () => tel(`${entete("Ma situation a-t-elle changé ?")}<div class="option">Revenus : <b style="margin-left:auto">identiques</b></div><div class="option choisie" ${d(1)}>Famille : un petit-enfant</div><div class="option">Projet : <b style="margin-left:auto">aider Inès</b></div><div class="option" style="justify-content:center;background:#0f112d;color:#fff">Valider</div>`) },
      { acteur: "cockpit", nom: "Rapport", ico: "pdf", texte: "Le relevé de situation est généré à vos couleurs.", sous: "Évolution des contrats, frais, performance : un document pro en un clic.", visuel: () => `<div class="duo"><div class="doc"><b style="font-size:11px;color:#9a6a2c">LEADER PATRIMOINE</b><h4>Revue annuelle 2026</h4><svg viewBox="0 0 250 90" style="width:100%;margin:6px 0 10px"><path d="M0 80 L40 70 L80 72 L120 52 L160 48 L200 30 L250 18" fill="none" stroke="#c7905e" stroke-width="3" stroke-dasharray="400" stroke-dashoffset="400" style="animation:signer 1.6s forwards .6s"/></svg>${'<div class="l"></div>'.repeat(5)}</div></div>` },
      { acteur: "vous", nom: "Rendez-vous", ico: "agenda", texte: "Vous n'avez plus qu'à conseiller.", sous: "La relation est entretenue, les opportunités remontent d'elles-mêmes.", visuel: () => pc(agendaMini("DELORME")) },
    ],
  },
  {
    id: "radar",
    titre: "Le radar trouve les opportunités, la campagne fait le reste",
    court: "Radar + campagne PER",
    ico: "radar",
    gain: "11 rendez-vous générés en une campagne",
    etapes: [
      { acteur: "cockpit", nom: "Analyse", ico: "radar", texte: "Chaque nuit, le cockpit passe toutes vos fiches au crible.", sous: "Selon des règles patrimoniales que vous choisissez : PER, 70 ans, contrats de 8 ans, épargne qui dort…", visuel: () => `<div class="grille-avatars"><span class="faisceau"></span>${"PD AM SN JB KR HV EM NF CG JR IP FL VM SC NB GD AR TM ML OC DB PY BF YT".split(" ").map((x, i) => `<i class="${[0, 2, 4, 9, 13, 18, 21].includes(i) ? "trouve" : ""}" ${d(0.4 + (i % 8) * 0.3)}>${x}</i>`).join("")}</div>` },
      { acteur: "cockpit", nom: "Calcul", ico: "euro", texte: "Pour chaque client repéré, il calcule SON économie d'impôt.", sous: "Avec ses vrais revenus et sa vraie tranche d'imposition.", visuel: () => `<div class="cartes-eventail">${[["SN", "6 068 €", "Sophie N."], ["KR", "6 150 €", "Karim R."], ["EM", "3 900 €", "Élodie M."]].map(([a, m, n], i) => `<div class="carte-sim verre retarde" ${d(0.3 + i * 0.35)}><div class="avatar-a">${a}</div><strong class="texte-or">${m}</strong><span>d'impôt en moins · ${n}</span></div>`).join("")}</div>` },
      { acteur: "vous", nom: "Validation", ico: "coche", texte: "Vous relisez le message et vous validez. Un seul clic.", sous: "Chaque client reçoit un e-mail personnalisé, avec ses chiffres.", visuel: () => email({ a: "Sophie NGUYEN", objet: "6 068 € d'impôt en moins avant le 31 décembre", corps: `<p style="margin:0">Bonjour Sophie, en versant 14 800 € sur un plan d'épargne retraite avant la fin de l'année, vous pourriez réduire votre impôt d'environ <b>6 068 €</b>.</p>`, bouton: "En parler 30 minutes" }) },
      { acteur: "cockpit", nom: "Envoi", ico: "envoyer", texte: "Les e-mails partent, les ouvertures se suivent en direct.", sous: "Relance automatique à ceux qui n'ont pas ouvert.", visuel: () => `<div style="text-align:center"><div class="compteur-grand texte-or" data-compte="94">0</div><div class="compteur-sous">e-mails personnalisés envoyés</div><div class="synchro" style="margin-top:20px"><span class="pastille vert retarde" ${d(1.4)}>62 ouverts</span><span class="pastille bleu retarde" ${d(1.8)}>31 clics</span></div></div>` },
      { acteur: "client", nom: "Rendez-vous", ico: "agenda", texte: "Les clients intéressés réservent d'eux-mêmes.", sous: "Votre agenda se remplit de rendez-vous à forte valeur.", visuel: () => `<div style="text-align:center"><div class="compteur-grand texte-or" data-compte="11">0</div><div class="compteur-sous">rendez-vous réservés · ${"≈"} 180 000 € de versements</div></div>` },
    ],
  },
  {
    id: "releves",
    titre: "Encours, commissions et factures : à jour chaque matin",
    court: "Relevés et facturation",
    ico: "portefeuille",
    gain: "Plus aucune ressaisie des relevés",
    etapes: [
      { acteur: "cockpit", nom: "Import", ico: "telecharger", texte: "Chaque nuit, les relevés de vos partenaires sont lus automatiquement.", sous: "Assureurs, sociétés de gestion, SCPI : valeurs, mouvements, versements programmés.", visuel: () => `<div class="flux-partenaires"><div class="colonne-part">${["Orion Vie", "Atlantique Prévoyance", "Valmont Gestion", "Pierre & Rendement"].map((p, i) => `<div class="retarde" ${d(0.2 + i * 0.25)}>${p}</div>`).join("")}</div><span class="fleche-flux"></span><div class="coeur verre"><img src="assets/mono-clair.svg" alt=""></div></div>` },
      { acteur: "cockpit", nom: "Encours", ico: "portefeuille", texte: "Vos encours et ceux de chaque client sont à jour.", sous: "Avec les alertes utiles : fonds en forte baisse, contrat hors profil.", visuel: () => `<div style="text-align:center"><div class="compteur-grand texte-or" data-compte="48934" data-format="meur">0</div><div class="compteur-sous">encours conseillés · +322 000 € depuis hier</div></div>` },
      { acteur: "cockpit", nom: "Commissions", ico: "remuneration", texte: "Le cockpit vérifie que chaque partenaire vous a bien payé.", sous: "Un oubli ? Vous le voyez tout de suite.", visuel: () => `<div class="fiche-mini verre"><h3>Commissions de novembre</h3>${coches(["Orion Vie · 13 400 € · conforme", "Atlantique Prévoyance · 9 800 € · conforme", "Pierre & Rendement · 6 300 € · conforme", "Horizon Capital · 4 200 € · en attente"])}</div>` },
      { acteur: "cockpit", nom: "Facture", ico: "document", texte: "Honoraires encaissés : la facture est émise et envoyée seule.", sous: "Numérotée par votre logiciel de facturation, conforme, rangée dans la fiche.", visuel: () => email({ a: "Philippe DELORME", objet: "Votre facture n° 2026-0142", corps: `<p style="margin:0">Merci pour votre règlement de 900 € (abonnement de conseil, 4ᵉ trimestre). Votre facture est jointe.</p>`, pieces: ["Facture 2026-0142.pdf"] }) },
    ],
  },
];

/* ================================================================ Lecteur ================================================================ */

const DUREE = 6500;
const params = new URLSearchParams(location.search);
let iScene = Math.max(0, SCENES.findIndex((s) => s.id === location.hash.slice(1)));
let iEtape = 0;
let lecture = true;
let minuteur = null;
let debut = 0;
let reste = DUREE;

const $ = (s) => document.querySelector(s);

function monter() {
  $("#scenes").innerHTML = SCENES.map((s, i) => `<button class="scene-puce" data-scene="${i}"><span class="rond">${icone(s.ico)}</span>${s.court}</button>`).join("");
  $("#scenes").addEventListener("click", (e) => {
    const b = e.target.closest("[data-scene]");
    if (b) choisirScene(Number(b.dataset.scene));
  });
  $("#precedent").onclick = () => aller(iEtape - 1);
  $("#suivant").onclick = () => aller(iEtape + 1);
  $("#lecture").onclick = basculer;
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") aller(iEtape + 1);
    if (e.key === "ArrowLeft") aller(iEtape - 1);
    if (e.key === " ") (e.preventDefault(), basculer());
  });
  choisirScene(iScene);
}

function choisirScene(i) {
  iScene = (i + SCENES.length) % SCENES.length;
  const s = SCENES[iScene];
  history.replaceState(null, "", `${location.pathname}${location.search}#${s.id}`);
  document.querySelectorAll(".scene-puce").forEach((b, n) => b.classList.toggle("actif", n === iScene));
  const nav = $("#scenes");
  const puce = document.querySelector(".scene-puce.actif");
  if (puce) nav.scrollTo({ left: puce.offsetLeft - nav.clientWidth / 2 + puce.offsetWidth / 2, behavior: "smooth" });
  $("#titre-scene").textContent = s.titre;
  $("#gain").textContent = s.gain;
  $("#frise").innerHTML = `<span class="frise-progres" id="progres"></span>${s.etapes.map((e) => `<div class="noeud"><span class="rond">${icone(e.ico)}</span><span class="etiq">${e.nom}</span></div>`).join("")}`;
  iEtape = -1;
  aller(0);
}

function aller(n) {
  const s = SCENES[iScene];
  if (n >= s.etapes.length) return choisirScene(iScene + 1);
  if (n < 0) n = 0;
  iEtape = n;
  const e = s.etapes[n];
  const ACT = { client: ["Le client", "clients"], cockpit: ["Le cockpit", "eclair"], vous: ["Vous", "etoile"] };
  $("#legende").innerHTML = `<span class="acteur ${e.acteur}">${icone(ACT[e.acteur][1])}${ACT[e.acteur][0]}</span><p>${e.texte}</p><small>${e.sous}</small>`;
  const plateau = $("#plateau");
  plateau.querySelectorAll(".visuel").forEach((v) => {
    v.classList.add("sort");
    setTimeout(() => v.remove(), 350);
  });
  const v = document.createElement("div");
  v.className = "visuel";
  v.innerHTML = e.visuel();
  plateau.append(v);
  compteurs(v);
  document.querySelectorAll(".noeud").forEach((nd, k) => {
    nd.classList.toggle("fait", k < n);
    nd.classList.toggle("actuel", k === n);
  });
  const noeuds = document.querySelectorAll(".noeud");
  const frise = $("#frise").getBoundingClientRect();
  const cible = noeuds[n].getBoundingClientRect();
  $("#progres").style.width = `${Math.max(0, cible.left + cible.width / 2 - frise.left - 18)}px`;
  reste = DUREE;
  programmer();
}

function programmer() {
  clearTimeout(minuteur);
  const barre = $("#barre-etape i");
  barre.style.transition = "none";
  barre.style.width = `${((DUREE - reste) / DUREE) * 100}%`;
  if (!lecture) return;
  void barre.offsetWidth;
  barre.style.transition = `width ${reste}ms linear`;
  barre.style.width = "100%";
  debut = performance.now();
  minuteur = setTimeout(() => aller(iEtape + 1), reste);
}

function basculer() {
  lecture = !lecture;
  if (!lecture) reste = Math.max(0, reste - (performance.now() - debut));
  $("#lecture").innerHTML = icone(lecture ? "pause" : "play");
  programmer();
}

function compteurs(zone) {
  zone.querySelectorAll("[data-compte]").forEach((el) => {
    const fin = Number(el.dataset.compte);
    const t0 = performance.now() + 300;
    const f = (t) => {
      const k = Math.max(0, Math.min(1, (t - t0) / 1500));
      const v = fin * (1 - Math.pow(1 - k, 3));
      el.textContent = el.dataset.format === "meur" ? `${(v / 1000).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M€` : `${Math.round(v).toLocaleString("fr-FR")}${el.dataset.suffixe ?? ""}`;
      if (k < 1) requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  });
}

if (params.get("seul") === "1") document.documentElement.classList.add("integre");
monter();
