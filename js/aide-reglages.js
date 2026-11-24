/**
 * Assistant Leader : aide pour régler le cockpit (fonction native du cockpit type, fiches d'aide par règles fixes).
 * Chaque fiche : des « clés » (tous les mots d'une clé doivent être dans la question, accents ignorés), une réponse
 * courte en mots simples, et la page à ouvrir (bouton « Y aller »), ou un bouton qui fait le réglage tout de suite.
 */

export const AIDE_REGLAGES = [
  // Apparence et identité
  { id: "theme", titre: "Jour ou nuit", cles: ["mode jour", "mode nuit", "ecran clair", "ecran sombre", "theme", "apparence", "fond clair", "fond sombre", "fond blanc", "fond noir"], reponse: "L'écran peut être en mode nuit (fond sombre) ou en mode jour (fond clair). Touchez le bouton ci-dessous, ou le soleil en haut de l'écran.", action: { texte: "Changer jour / nuit", attr: 'data-action="theme"' } },
  { id: "logo", titre: "Logo et couleurs", cles: ["logo", "couleur", "couleurs", "charte"], reponse: "Réglages → Mon cabinet : votre logo et vos couleurs (marine et or). Ils s'affichent partout : menu, écran du code, e-mails. Pour en changer, l'agence s'en occupe.", aller: "reglages", params: {onglet: "cabinet"} },
  { id: "profil", titre: "Mon nom et ma photo", cles: ["prenom", "mon nom", "photo profil", "ma photo", "avatar", "profil"], reponse: "Réglages → Mon cabinet, carte « Mon profil » : touchez « Choisir une photo », changez votre prénom si besoin, puis « Enregistrer ». Votre photo s'affiche en bas du menu.", aller: "reglages", params: {onglet: "cabinet"} },
  { id: "signature", titre: "Signature des e-mails", cles: ["signature mail", "signature email", "signature des mails", "signature e mail", "bas des mails", "coordonnees mail"], reponse: "Réglages → Mon cabinet, carte « Signature des e-mails », bouton « Modifier » : votre nom, votre fonction, votre téléphone et votre numéro ORIAS. Elle s'ajoute toute seule au bas de chaque e-mail.", aller: "reglages", params: {onglet: "cabinet"} },
  { id: "orias", titre: "Statuts et ORIAS", cles: ["orias", "statut", "statuts", "cif", "iobsp", "carte t", "mentions legales"], reponse: "Votre numéro ORIAS se change dans Réglages → Mon cabinet, carte « Signature des e-mails », bouton « Modifier ». Il est repris dans vos e-mails et vos documents.", aller: "reglages", params: {onglet: "cabinet"} },
  { id: "baremes", titre: "Barèmes fiscaux", cles: ["bareme", "baremes", "tranches", "plafond", "loi de finances"], reponse: "Les barèmes fiscaux (impôt, PER, succession, IFI) sont mis à jour chaque année par l'agence. Vous n'avez rien à faire : les simulateurs sont toujours à jour.", aller: "reglages", params: {onglet: "cabinet"} },

  // Sécurité
  { id: "code", titre: "Changer mon code", cles: ["changer code", "nouveau code", "mon code", "mot de passe", "code acces"], reponse: "Réglages → Sécurité, bouton « Changer le code » : tapez votre code actuel puis le nouveau (6 chiffres). Vos autres appareils demanderont le nouveau code.", aller: "reglages", params: {onglet: "securite"} },
  { id: "faceid", titre: "Face ID", cles: ["face id", "faceid", "empreinte", "touch id", "sans code"], reponse: "Réglages → Sécurité, bouton « Ajouter cet appareil » : regardez l'écran, c'est fait. Ensuite vous entrez avec Face ID, sans taper le code.", aller: "reglages", params: {onglet: "securite"} },
  { id: "appareil", titre: "Ajouter un appareil", cles: ["appareil", "nouveau telephone", "autre ordinateur", "tablette", "collaborateur", "assistante"], reponse: "Sur le nouvel appareil, ouvrez l'adresse du cockpit et entrez votre code. Il apparaît dans Réglages → Sécurité, « Appareils autorisés », où un bouton « Retirer » permet aussi d'en enlever un.", aller: "reglages", params: {onglet: "securite"} },
  { id: "verrouiller", titre: "Verrouiller", cles: ["verrouiller", "deconnecter", "quitter", "fermer cockpit"], reponse: "Touchez votre nom en bas du menu (sur téléphone : « Plus », puis votre nom), puis « Verrouiller maintenant ». Le cockpit se verrouille aussi tout seul après un moment sans s'en servir.", action: { texte: "Verrouiller maintenant", attr: 'data-action="verrouiller"' } },
  { id: "oubli", titre: "Code oublié", cles: ["code oublie", "oublie code", "oublie mon code", "bloque", "debloquer"], reponse: "Sur l'écran du code, utilisez Face ID, ou le lien de déblocage reçu par e-mail. Sinon, appelez l'agence : on vous débloque dans la journée." },

  // Agenda et rendez-vous
  { id: "horaires", titre: "Horaires de rendez-vous", cles: ["horaires", "horaire", "disponibilites", "creneaux", "creneau", "heures ouverture", "jours travailles"], reponse: "Agenda, bouton « Mes disponibilités » : vos horaires, le samedi, la pause entre deux rendez-vous et la durée de chaque type de rendez-vous. Votre page de réservation en ligne suit ces réglages.", action: { texte: "Ouvrir mes disponibilités", attr: 'data-action="disponibilites"' } },
  { id: "conges", titre: "Congés et absences", cles: ["conge", "conges", "vacances", "absence", "fermeture", "bloquer journee"], reponse: "Agenda, bouton « Mes disponibilités », rubrique « Congés et absences » : choisissez les dates puis « Bloquer ». Plus personne ne peut réserver ces jours-là en ligne.", action: { texte: "Ouvrir mes disponibilités", attr: 'data-action="disponibilites"' } },
  { id: "agenda-google", titre: "Agenda Google / Outlook", cles: ["google", "outlook", "synchroniser", "synchronisation", "agenda telephone"], reponse: "Réglages → Connexions, « Agenda Google / Outlook » : vos rendez-vous vont dans les deux sens, rien à recopier.", aller: "reglages", params: {onglet: "connexions"} },
  { id: "visio", titre: "Visio", cles: ["visio", "teams", "zoom", "meet", "lien video"], reponse: "Chaque rendez-vous en visio a son lien Teams ou Google Meet, créé tout seul et envoyé au client avec la confirmation. Le jour J, touchez « Rejoindre » dans l'Agenda.", aller: "agenda" },

  // Automatismes, e-mails, notifications
  { id: "rappels", siReglage: true, titre: "Rappels automatiques", cles: ["rappel", "rappels", "sms", "relance", "relances", "automatique", "automatisme", "automatismes"], reponse: "Écran « Relances » : chaque envoi automatique (rappel avant rendez-vous, revue annuelle, anniversaire…) a un interrupteur. Touchez-le pour l'arrêter ou le remettre.", aller: "communication" },
  { id: "textes-mails", siReglage: true, titre: "Textes des e-mails", cles: ["texte mail", "texte email", "texte des mails", "modifier mail", "modifier email", "modele mail", "message automatique"], reponse: "Écran « Relances » : touchez un envoi automatique (« Lire et modifier le texte ») pour changer son objet et son texte. Votre signature s'ajoute toute seule en bas.", aller: "communication" },
  { id: "notifications", titre: "Notifications", cles: ["notification", "notifications", "cloche", "alerte telephone", "prevenir"], reponse: "Réglages → Notifications : touchez « Activer sur cet appareil », puis choisissez quand être prévenu (demande, réservation, signature…). Sur iPhone, ajoutez d'abord le cockpit à l'écran d'accueil.", aller: "reglages", params: {onglet: "notifications"} },
  { id: "deranger", titre: "Ne pas déranger", cles: ["ne pas deranger", "deranger", "silence", "heures calmes"], reponse: "Réglages → Notifications, interrupteur « Ne pas me déranger » : de 21 h à 8 h rien ne sonne, tout vous attend le matin.", aller: "reglages", params: {onglet: "notifications"} },
  { id: "ecran-accueil", titre: "Icône sur le téléphone", cles: ["ecran accueil", "icone", "installer", "application telephone", "raccourci"], reponse: "Sur l'iPhone, ouvrez le cockpit dans Safari, bouton Partager → « Sur l'écran d'accueil ». Il s'ouvre ensuite comme une application." },

  // Cabinet, connexions, données
  { id: "honoraires", siReglage: true, titre: "Honoraires et factures", cles: ["honoraire", "honoraires", "tarif", "tarifs", "facture", "factures", "facturation"], reponse: "Réglages → Mon cabinet, carte « Honoraires », bouton « Modifier » : vos tarifs. Les factures d'honoraires partent toutes seules quand vous validez un paiement.", aller: "reglages", params: {onglet: "cabinet"} },
  { id: "partenaires", siReglage: true, titre: "Relevés des partenaires", cles: ["releve", "releves", "partenaire", "partenaires", "assureur", "assureurs", "import"], reponse: "Réglages → Connexions, « Relevés des partenaires » : les fichiers des assureurs et des sociétés de gestion sont importés chaque nuit. Les encours se mettent à jour seuls.", aller: "reglages", params: {onglet: "connexions"} },
  { id: "site", siReglage: true, titre: "Mon site", cles: ["site", "formulaire", "page reservation", "reservation en ligne", "articles"], reponse: "L'écran « Mon site » montre d'où viennent vos clients. Le formulaire de contact et la page de réservation en ligne sont reliés au cockpit : les demandes arrivent toutes seules.", aller: "site" },
  { id: "connexions", siReglage: true, titre: "Connexions", cles: ["connexion", "connexions", "brancher", "relier", "connecter"], reponse: "Réglages → Connexions : agenda, e-mails et SMS, signature électronique, facturation, paiement, relevés des partenaires, site et visio. Pour en relier un nouveau, demandez-le à l'agence.", aller: "reglages", params: {onglet: "connexions"} },
  { id: "comptable", titre: "Accès comptable", cles: ["comptable", "expert comptable", "comptabilite", "acces comptable"], reponse: "Réglages → Accès comptable : votre comptable reçoit un lien personnel et un code à 6 chiffres que vous choisissez. Il ne voit que vos commissions et vos honoraires, sans rien pouvoir modifier. Vous pouvez changer le code ou couper l'accès en un clic.", aller: "reglages", params: { onglet: "comptable" } },
  { id: "support", titre: "Signaler un problème", cles: ["support", "signaler", "probleme technique", "bug", "ca ne marche pas", "demander un ajout", "nouvelle fonction", "contacter synium", "contacter l agence"], reponse: "Écran « Support », bouton « Nouvelle demande » : choisissez de quoi il s'agit, écrivez en quelques mots, expliquez, puis « Envoyer à SYNIUM ». La réponse arrive ici, avec un statut en couleur.", aller: "support" },
  { id: "visites", titre: "Visites de l'agence", cles: ["visite", "visites", "lecture seule", "agence regarde", "qui s est connecte"], reponse: "Réglages → Sécurité, « Visites de l'agence » : chaque fois que SYNIUM consulte votre cockpit (en lecture seule, sans rien modifier), vous voyez qui, quand, pourquoi et combien de temps.", aller: "reglages", params: { onglet: "securite" } },
  { id: "export", titre: "Mes données", cles: ["export", "exporter", "sauvegarde", "sauvegardes", "telecharger donnees", "mes donnees", "rgpd"], reponse: "Réglages → Sécurité, « Export complet de vos données », bouton « Télécharger ». Le cockpit est aussi sauvegardé chaque nuit, en Europe.", aller: "reglages", params: {onglet: "securite"} },
];

/** Thèmes proposés quand on demande de l'aide pour régler le cockpit sans préciser quoi. */
export const THEMES_REGLAGES = ["theme", "code", "signature", "horaires", "rappels", "notifications", "comptable", "support"];

const sans = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** La question demande-t-elle de l'aide pour régler le cockpit, sans préciser quoi ? */
export function demandeReglagesGenerale(q) {
  const s = ` ${sans(q)} `;
  return / (regler|reglage|reglages|parametr\w*|configur\w*|personnalis\w*|aide|comment ca marche|mode d emploi) /.test(s);
}

// Mots qui montrent qu'on veut régler quelque chose (pour les fiches qui ressemblent à des questions du métier).
const INTENTION = / (comment|ou (est|se|trouve|sont)|changer|regler|reglage|modifier|activer|desactiver|arreter|couper|stopper|mettre|ajouter|enlever|retirer|supprimer|configurw*|parametrw*|je veux|puis je|peut on|faut il) /;

/** Trouve la fiche d'aide qui correspond le mieux à la question (la clé la plus longue gagne). */
export function trouverAide(q) {
  const propre = sans(q);
  const mots = new Set(propre.split(" "));
  const intention = INTENTION.test(` ${propre} `);
  let meilleure = null;
  let score = 0;
  for (const f of AIDE_REGLAGES) {
    if (f.siReglage && !intention) continue;
    for (const cle of f.cles) {
      const m = sans(cle).split(" ");
      if (m.every((x) => mots.has(x)) && m.length > score) {
        meilleure = f;
        score = m.length;
      }
    }
  }
  return meilleure;
}
