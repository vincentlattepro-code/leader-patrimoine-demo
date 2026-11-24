/** Moteur du cockpit de démonstration : navigation, verrouillage, feuilles, assistant, télécommande. */
import { CLIENTS, DEMANDES, RDV, SIGNATURES, AUTOMATISMES, CABINET_CHIFFRES, modeRdv } from "./donnees.js";
import { VUES, feuillePreparation, feuilleCompteRendu, feuilleReservation, feuilleOpp, calculerSim } from "./vues.js";
import { icone } from "./icones.js";
import { esc, eur, meur, keur, nomComplet, pastilleNature, clientDe, encoursClient, opportunites, syntheseConformite, montantCourt } from "./outils.js";
import { JOURS } from "./donnees.js";
import { acces, lienComptable, changerCode, changerActif, changerCodeMail, nouveauLien, codeTropSimple, COMPTABLE, changerDuree, finLisible } from "./acces-comptable.js";
import { formulaireClient, sirenValide, chercherSiren, SIREN_DEMO, suggestionsAdresse, ficheNouvelle } from "./nouveau-client.js";
import { DEMANDES_SUPPORT, formulaireSupport, detailDemande, AGENCE } from "./support.js";
import { avatarProfil, changerPhoto, preparerPhoto, signature as maSignature, changerSignature, TARIFS } from "./profil.js";
import { AIDE_REGLAGES, THEMES_REGLAGES, trouverAide, demandeReglagesGenerale } from "./aide-reglages.js";

const params = new URLSearchParams(location.search);
const CANAL = "leader-patrimoine-demo";
const canal = "BroadcastChannel" in window ? new BroadcastChannel(CANAL) : null;
const MOI = params.get("ecran") ?? "seul";
// Identifiant de la page de présentation ouverte : les deux écrans d'une même page se suivent entre eux, mais
// jamais une page restée ouverte dans un autre onglet (sinon on pourrait ouvrir la maquette ailleurs que sur le code).
const SALLE = (() => {
  try {
    if (window.parent !== window) return (window.parent.__salleDemo ??= Math.random().toString(36).slice(2));
  } catch {}
  return Math.random().toString(36).slice(2);
})();
const telephone = () => window.matchMedia("(max-width: 1023px)").matches;
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

const st = {
  vue: params.get("vue") ?? "accueil",
  params: {},
  theme: params.get("theme") ?? lire("lp-theme", "nuit"),
  prenom: params.get("prenom") ?? lire("lp-prenom", "Serkan"),
  sync: params.get("sync") === "1",
  demandes: DEMANDES.map((d) => ({ ...d })),
  rdv: RDV.map((r) => ({ ...r })),
  signatures: SIGNATURES.map((s) => ({ ...s })),
  automatismes: AUTOMATISMES.map((a) => ({ ...a })),
  support: DEMANDES_SUPPORT.map((d) => ({ ...d })),
  supportNature: "probleme",
  appareils: [
    { nom: "PC du cabinet", detail: "Lyon · utilisé aujourd'hui", ico: "ordinateur" },
    { nom: "iPhone de Serkan", detail: "Face ID · utilisé aujourd'hui", ico: "mobile" },
  ],
  notifReglages: { appareil: false, nuit: true, cloche: true, demande: true, resa: true, signature: true, commission: false },
  encours: CABINET_CHIFFRES.encours,
  releves: false,
  notifs: [
    { t: "Lettre de mission ouverte", d: "Sophie NGUYEN · il y a 2 h", ico: "signature" },
    { t: "Rendez-vous réservé en ligne", d: "Amandine ROUX · lundi 10:00", ico: "agenda" },
    { t: "Relevés des partenaires importés", d: "48 contrats mis à jour · 04:12", ico: "telecharger" },
  ],
  taches: [
    { titre: "Appeler Thomas LEROY (demande PER)", detail: "Demande prioritaire reçue il y a 12 min", fait: false },
    { titre: "Valider l'étude prévoyance RAHMANI", detail: "Pré-remplie · rendez-vous mercredi", fait: false },
    { titre: "Signer la déclaration d'adéquation NGUYEN", detail: "Avant le rendez-vous de 17:30", fait: false },
    { titre: "Relire la lettre patrimoniale de décembre", detail: "Envoi programmé le 3 décembre", fait: true },
    { titre: "Vérifier le virement Horizon Capital", detail: "Commission attendue · 4 200 €", fait: false },
  ],
};
document.documentElement.dataset.theme = st.theme;

/* ================================================================ Coque (menu, haut, barre du bas) ================================================================ */

const $ = (s, r = document) => r.querySelector(s);
const app = $("#app");

function badge(vue) {
  if (vue === "demandes") return st.demandes.filter((d) => d.statut === "Nouvelle").length;
  if (vue === "conformite") return st.signatures.filter((s) => !s.etat.startsWith("Signé")).length;
  return 0;
}

function coque() {
  const groupes = {};
  for (const [id, v] of Object.entries(VUES)) (groupes[v.groupe] ??= []).push([id, v]);
  const ongletsBas = ["accueil", "agenda", "clients", "demandes"];
  app.innerHTML = `
  <div class="appli">
    <aside class="cote verre">
      <a class="cote-logo" href="#" data-aller="accueil"><img src="assets/${st.theme === "jour" ? "logo" : "logo-clair"}.svg" alt="Leader Patrimoine" id="logo-cote"></a>
      <nav class="nav">${Object.entries(groupes)
        .map(([g, l]) => `<div class="nav-groupe">${g}</div>${l.map(([id, v]) => `<button class="nav-entree" data-aller="${id}" data-nav="${id}"><span class="nav-ico">${icone(v.ico)}</span>${v.titre}<span class="nav-badge-zone" data-badge="${id}"></span></button>`).join("")}`)
        .join("")}</nav>
      <div class="cote-bas">
        <button class="carte-assistant" data-action="assistant"><span class="orbe"></span><div><strong>Assistant Leader</strong><span>Posez une question</span></div></button>
        <div class="profil" role="button" tabindex="0" data-action="profil" style="cursor:pointer" title="Mon profil">${avatarProfil()}<div class="profil-texte"><strong id="profil-nom">${esc(st.prenom === "Serkan" ? "Serkan Bulut" : st.prenom || "Administrateur")}</strong><span class="profil-role">Administrateur</span><span>Leader Patrimoine</span></div></div>
      </div>
    </aside>
    <div class="principal">
      <header class="haut verre">
        <button class="btn btn-icone haut-retour" id="retour" data-action="retour" aria-label="Retour" title="Retour" hidden>${icone("retour")}</button>
        <button class="haut-mono" data-aller="accueil" aria-label="Accueil"><img src="assets/${st.theme === "jour" ? "mono" : "mono-clair"}.svg" alt=""></button>
        <div class="haut-titre"><h1 id="titre"></h1><p id="sous-titre"></p></div>
        <div class="recherche"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.3-4.3"/></svg><input id="recherche" placeholder="Rechercher un client…" autocomplete="off"><div class="resultats verre" id="resultats" hidden></div></div>
        <button class="btn btn-icone masquer-tel" data-action="theme" title="Jour / nuit">${icone(st.theme === "jour" ? "lune" : "soleil")}</button>
        <div class="cloche" style="position:relative"><button class="btn btn-icone" data-action="notifs" aria-label="Notifications">${icone("cloche")}</button><span class="cloche-point" id="cloche-point"></span><div class="notifs verre" id="notifs" hidden></div></div>
        <button class="btn btn-or masquer-tel" data-action="nouveau">${icone("plus")} Nouveau</button>
        <button class="btn btn-icone" data-action="assistant" style="display:none" id="assistant-tel" aria-label="Assistant"><span class="orbe" style="width:22px;height:22px"></span></button>
        <button class="haut-profil" data-action="profil" aria-label="Mon profil" title="Mon profil">${avatarProfil()}</button>
      </header>
      <main class="contenu" id="contenu"></main>
    </div>
  </div>
  <nav class="barre-onglets verre">
    ${ongletsBas.map((id) => `<button class="onglet-bas" data-aller="${id}" data-nav="${id}">${icone(VUES[id].ico)}<span>${VUES[id].titre}</span><span class="nav-badge-zone" data-badge="${id}"></span></button>`).join("")}
    <button class="onglet-bas" data-action="menu-plus" data-nav="plus">${icone("menu")}<span>Plus</span></button>
  </nav>`;
  if (telephone()) $("#assistant-tel").style.display = "";
}

function majBadges() {
  document.querySelectorAll("[data-badge]").forEach((el) => {
    const n = badge(el.dataset.badge);
    el.innerHTML = n ? `<span class="nav-badge ${el.dataset.badge === "conformite" ? "" : ""}">${n}</span>` : "";
  });
}

/* ================================================================ Navigation ================================================================ */

/**
 * Retour en arrière, comme dans un vrai logiciel : flèche « Retour » en haut, et bouton précédent du navigateur
 * (ou geste retour du téléphone). Chaque écran garde la même pile ; un retour fait sur un écran est suivi par l'autre.
 */
const pile = [];
function aller(vue, p = {}, depuis = "local") {
  if (!VUES[vue]) return;
  const meme = vue === st.vue && JSON.stringify(p) === JSON.stringify(st.params);
  if ((depuis === "local" || depuis === "distant") && !meme) {
    pile.push({ vue: st.vue, params: st.params });
    if (pile.length > 40) pile.shift();
    if (depuis === "local") history.pushState({ lp: pile.length }, "");
  }
  st.vue = vue;
  st.params = p;
  rendre();
  $("#contenu").scrollTop = 0;
  if (depuis === "local" && st.sync) envoyer({ t: "nav", vue, params: p, de: MOI, salle: SALLE });
}

function retour(depuis = "local") {
  const prec = pile.pop();
  fermerFeuille();
  if (prec) aller(prec.vue, prec.params, "retour");
  else if (st.vue !== "accueil") aller("accueil", {}, "retour");
  if (depuis === "local" && st.sync) envoyer({ t: "retour", de: MOI, salle: SALLE });
}
// Bouton précédent du navigateur / geste retour du téléphone.
addEventListener("popstate", () => retour("local"));

function rendre() {
  const v = VUES[st.vue];
  $("#titre").textContent = st.params.id ? "Fiche client" : v.titre;
  $("#sous-titre").textContent = v.sous;
  $("#contenu").innerHTML = v.html(st, st.params);
  document.querySelectorAll("[data-nav]").forEach((b) => b.classList.toggle("actif", b.dataset.nav === st.vue || (b.dataset.nav === "plus" && !["accueil", "agenda", "clients", "demandes"].includes(st.vue))));
  majBadges();
  document.querySelectorAll(".cloche").forEach((c) => (c.hidden = !st.notifReglages.cloche));
  const r = $("#retour");
  if (r) r.hidden = st.vue === "accueil" && !st.params.id;
  if (st.vue === "simulateurs") monterSim();
  if (st.vue === "accueil") compter();
}

/* Simulateurs : calcul en direct au glissement des curseurs */
function monterSim() {
  const zone = $("#sim-entrees");
  const sim = st.params.sim ?? "per";
  const fmt = { eur, parts: (v) => `${String(v).replace(".", ",")} part${v > 1 ? "s" : ""}`, n: (v) => String(v), pct: (v) => `${String(v).replace(".", ",")} %`, ans: (v) => `${v} ans` };
  const calc = () => {
    const v = {};
    zone.querySelectorAll("input[type=range]").forEach((i) => {
      v[i.id] = Number(i.value);
      const s = zone.querySelector(`[data-sortie="${i.id}"]`);
      s.textContent = (fmt[i.dataset.format] ?? fmt.eur)(Number(i.value));
      const pourc = ((i.value - i.min) / (i.max - i.min)) * 100;
      i.style.background = `linear-gradient(90deg, #e6b86a ${pourc}%, var(--verre-3) ${pourc}%)`;
    });
    $("#sim-resultat").innerHTML = calculerSim(sim, v);
  };
  zone.addEventListener("input", calc);
  calc();
}

/* Compteur animé des grands chiffres */
function compter() {
  document.querySelectorAll("[data-compteur]").forEach((el) => {
    const fin = Number(el.dataset.compteur);
    const t0 = performance.now();
    const pas = (t) => {
      const k = Math.min(1, (t - t0) / 1400);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = meur(fin * (0.82 + 0.18 * e));
      if (k < 1) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  });
}

/* ================================================================ Feuilles, messages, bannières ================================================================ */

function feuille(html, large = false) {
  fermerFeuille();
  const v = document.createElement("div");
  v.className = "voile";
  v.id = "voile";
  v.innerHTML = `<div class="feuille verre ${large ? "large" : ""}"><div class="poignee"></div>${html}</div>`;
  v.addEventListener("click", (e) => e.target === v && (fermerFeuille(), miroir("fermer-voile")));
  document.body.append(v);
}
function fermerFeuille() {
  $("#voile")?.remove();
}

function toast(texte) {
  const z = $("#toasts");
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `<span class="coche">${icone("coche")}</span>${esc(texte)}`;
  z.append(t);
  setTimeout(() => (t.style.transition = "opacity .4s", (t.style.opacity = "0")), 2800);
  setTimeout(() => t.remove(), 3300);
}

function banniere(titre, texte, action) {
  document.querySelectorAll(".banniere").forEach((b) => b.remove());
  const b = document.createElement("div");
  b.className = "banniere";
  b.innerHTML = `<img src="assets/mono-clair.svg" alt=""><div><strong>${esc(titre)}</strong><p>${esc(texte)}</p></div><time>maintenant</time>`;
  b.addEventListener("click", () => {
    b.remove();
    action?.();
  });
  document.body.append(b);
  st.notifs.unshift({ t: titre, d: texte, ico: "cloche" });
  const p = $("#cloche-point");
  p.hidden = false;
  p.classList.remove("pulse");
  void p.offsetWidth;
  p.classList.add("pulse");
  setTimeout(() => {
    b.classList.add("partir");
    setTimeout(() => b.remove(), 400);
  }, 6000);
}

/* ================================================================ Clics ================================================================ */

document.addEventListener("click", (e) => {
  const cible = e.target.closest("[data-aller],[data-action],[data-aller-anim]");
  if (!cible) {
    const ouverts = ($("#resultats") && !$("#resultats").hidden) || ($("#notifs") && !$("#notifs").hidden);
    if (!e.target.closest(".recherche")) $("#resultats") && ($("#resultats").hidden = true);
    if (!e.target.closest(".cloche")) $("#notifs") && ($("#notifs").hidden = true);
    if (ouverts && !e.target.closest(".recherche, .cloche")) miroir("fermer-panneaux");
    return;
  }
  if (cible.dataset.allerAnim) {
    e.preventDefault();
    envoyer({ t: "ouvrir-animation", id: cible.dataset.allerAnim });
    if (window.parent === window) window.open(`animations.html#${cible.dataset.allerAnim}`, "_blank");
    return;
  }
  if (cible.dataset.aller) {
    e.preventDefault();
    const p = cible.dataset.params ? JSON.parse(cible.dataset.params) : {};
    if (cible.hasAttribute("data-fermer") || cible.closest(".voile")) fermerFeuille();
    $("#resultats") && ($("#resultats").hidden = true);
    aller(cible.dataset.aller, p);
    return;
  }
  // Un bouton de l'assistant qui ouvre une fenêtre ou verrouille : l'assistant s'efface pour laisser la place.
  if (cible.closest("#assistant") && ["disponibilites", "verrouiller", "profil"].includes(cible.dataset.action)) $("#assistant")?.remove();
  if (st.sync && !LOCALES.has(cible.dataset.action)) envoyer({ t: "action", a: cible.dataset.action, ref: reperer(cible), salle: SALLE });
  action(cible.dataset.action, cible);
});

/* ================================================================ Miroir entre l'ordinateur et le téléphone ================================================================
 * Dans la présentation, tout ce qui est fait sur un écran se fait au même instant sur l'autre : fenêtres, cases,
 * interrupteurs, assistant, saisies, simulateurs, code de déverrouillage. */
// Actions qui ne se refont pas sur l'autre écran (déjà synchronisées autrement, ou propres à cet écran).
const LOCALES = new Set(["theme", "retour", "comptable-ouvrir", "comptable-code-ok"]);
// Actions qui changent un réglage gardé dans le navigateur (commun aux deux écrans) : l'autre écran se redessine seulement.
const PARTAGEES = new Set(["comptable-mail", "comptable-lien", "comptable-couper"]);
let enMiroir = false;

/** Repère un élément cliquable par son action, ses données et sa position, pour retrouver le même de l'autre côté. */
function reperer(el) {
  const ds = { ...el.dataset };
  const memes = [...document.querySelectorAll(`[data-action="${CSS.escape(el.dataset.action)}"]`)].filter((x) => JSON.stringify({ ...x.dataset }) === JSON.stringify(ds));
  return { ds, i: Math.max(0, memes.indexOf(el)) };
}
function retrouver(a, ref) {
  const memes = [...document.querySelectorAll(`[data-action="${CSS.escape(a)}"]`)].filter((x) => JSON.stringify({ ...x.dataset }) === JSON.stringify(ref.ds));
  return memes[ref.i] ?? memes[0] ?? { dataset: ref.ds, querySelector: () => null };
}
function rejouer(m) {
  if (PARTAGEES.has(m.a)) {
    const textes = { "comptable-mail": () => (acces().codeMail ? "Code par e-mail activé" : "Code par e-mail désactivé"), "comptable-lien": () => "Nouveau lien créé : l'ancien ne marche plus", "comptable-couper": () => (acces().actif ? "Accès du comptable rouvert" : "Accès du comptable coupé") };
    toast(textes[m.a]());
    return rendre();
  }
  if (m.a === "comptable-code-fait") return fermerFeuille(), toast("Nouveau code enregistré"), rendre();
  if (m.a === "duree-faite") {
    const a = acces();
    toast(a.fin === null ? "Lien valable sans limite" : `Lien valable jusqu'au ${finLisible(a.fin)}`);
    return rendre();
  }
  if (m.a === "redessiner") return redessinerTout();
  if (m.a === "fermer-voile") return fermerFeuille(), $("#lancement-visio")?.remove();
  if (m.a === "fermer-assistant") return $("#assistant")?.remove();
  if (m.a === "fermer-panneaux") return $("#resultats") && ($("#resultats").hidden = true), $("#notifs") && ($("#notifs").hidden = true);
  if (m.a === "fermer-tout") return fermerFeuille(), $("#assistant")?.remove();
  if (["disponibilites", "verrouiller", "profil"].includes(m.a)) $("#assistant")?.remove();
  action(m.a, retrouver(m.a, m.ref ?? { ds: {}, i: 0 }));
}
const miroir = (a) => st.sync && envoyer({ t: "action", a, salle: SALLE });

// Saisies (recherche, simulateurs, champ de l'assistant, code…) : la même valeur s'écrit sur l'autre écran.
document.addEventListener(
  "input",
  (e) => {
    if (enMiroir || !st.sync || !e.target.id || e.target.type === "file") return;
    envoyer({ t: "saisie", id: e.target.id, v: e.target.value, salle: SALLE });
  },
  true,
);
function saisieDistante(m) {
  const el = document.getElementById(m.id);
  if (!el) return;
  enMiroir = true;
  el.value = m.v;
  el.dispatchEvent(new Event("input", { bubbles: true }));
  enMiroir = false;
}

// Réglages → Accès comptable : durée de validité du lien (elle compte à partir de maintenant).
document.addEventListener("change", (e) => {
  if (e.target.id !== "duree-comptable") return;
  changerDuree(e.target.value);
  miroir("duree-faite");
  const a = acces();
  toast(a.fin === null ? "Lien valable sans limite" : `Lien valable jusqu'au ${finLisible(a.fin)}`);
  rendre();
});

/**
 * « Rejoindre » : ouvre la réunion dans Teams ou Google Meet en un clic. Dans le vrai cockpit, le bouton ouvre le lien
 * de la réunion créé avec le rendez-vous (l'application Teams se lance, Meet s'ouvre dans le navigateur). Dans la
 * maquette, aucune vraie réunion n'existe : on montre le lancement à l'écran.
 */
function lancerVisio(r) {
  if (!r) return;
  const m = modeRdv(r);
  fermerFeuille();
  $("#lancement-visio")?.remove();
  const v = document.createElement("div");
  v.id = "lancement-visio";
  v.className = "voile lancement-visio";
  v.innerHTML = `<div class="lancement-panneau verre">
    <span class="lancement-ico m-${m.cle}">${icone("visio")}</span>
    <strong id="lancement-titre">Ouverture de ${m.appli}…</strong>
    <span>${esc(r.type)} · ${esc(r.client)} · ${r.debut}</span>
    <div class="lancement-barre"><i></i></div>
    <small>${esc(r.client.split(" ")[0])} a reçu le même lien avec sa confirmation.</small>
  </div>`;
  v.addEventListener("click", (e) => e.target === v && (v.remove(), miroir("fermer-voile")));
  document.body.append(v);
  setTimeout(() => {
    const t = $("#lancement-titre");
    if (!t) return;
    t.textContent = `Vous êtes dans la réunion ${m.court}`;
    v.classList.add("connecte");
  }, 1900);
  setTimeout(() => v.remove(), 3600);
}

function trouverRdv(nom) {
  return st.rdv.find((r) => r.client === nom);
}

function action(a, el) {
  switch (a) {
    case "fermer":
      return fermerFeuille();
    case "toast":
      return toast(el.dataset.texte);
    case "theme":
      return changerTheme(st.theme === "jour" ? "nuit" : "jour", true);
    case "cocher": {
      const t = st.taches[Number(el.dataset.i)];
      t.fait = !t.fait;
      if (t.fait) toast("Bravo, c'est fait");
      return rendre();
    }
    case "cocher-cr": {
      const c = el.querySelector(".case");
      c.classList.toggle("cochee");
      c.innerHTML = c.classList.contains("cochee") ? icone("coche") : "";
      return;
    }
    case "rdv":
      return feuille(feuillePreparation(trouverRdv(el.dataset.rdv)), true);
    case "retour":
      // Si cet écran a créé l'étape, on passe par l'historique du navigateur (même effet que son bouton précédent).
      return history.state?.lp ? history.back() : retour("local");
    case "rejoindre":
      return lancerVisio(trouverRdv(el.dataset.rdv));
    case "compte-rendu":
      return feuille(feuilleCompteRendu(trouverRdv(el.dataset.rdv)), true);
    case "envoyer-cr":
      fermerFeuille();
      return toast("Compte rendu envoyé, documents partis à la signature");
    case "reservation":
      return feuille(feuilleReservation(0));
    case "resa":
      return feuille(feuilleReservation(Number(el.dataset.etape)));
    case "resa-fin":
      fermerFeuille();
      ajouterReservation();
      return;
    case "nouveau-rdv":
      return feuille(formulaireRdv(el.dataset.nom ?? ""), true);

    /* ---------------- Nouveau client : particulier ou professionnel */
    case "nouveau-client":
      return feuille(formulaireClient(icone), true);
    case "nc-type": {
      const pro = el.dataset.t === "pro";
      document.querySelectorAll('[data-action="nc-type"]').forEach((b) => b.classList.toggle("actif", b === el || b.dataset.t === el.dataset.t));
      $("#nc-particulier").hidden = pro;
      $("#nc-pro").hidden = !pro;
      return;
    }
    case "nc-siren": {
      const s = ($("#nc-siren").value ?? "").replace(/\D/g, "");
      const info = $("#nc-siren-info");
      info.classList.remove("erreur");
      if (!sirenValide(s)) return (info.classList.add("erreur"), (info.textContent = "Ce numéro SIREN n'est pas valide : il faut 9 chiffres (il est écrit sur le Kbis ou les factures)."));
      const e = chercherSiren(s);
      if (!e) return (info.classList.add("erreur"), (info.textContent = `Aucune entreprise trouvée pour ce numéro. Pour la démonstration, essayez ${SIREN_DEMO}.`));
      const fixe = (id, v) => ($(`#${id}`).value = v);
      fixe("nc-raison", e.raison);
      fixe("nc-forme", e.forme);
      fixe("nc-naf", e.naf);
      fixe("nc-tva", e.tva);
      fixe("nc-dirigeant", e.dirigeant);
      fixe("nc-creation", e.creation);
      fixe("ncp-adresse", e.adresse);
      fixe("ncp-cp", e.cp);
      fixe("ncp-ville", e.ville);
      $("#nc-societe").hidden = false;
      // Champs remplis par la recherche : marqués « pré-rempli » (le contact reste à écrire).
      ["nc-raison", "nc-forme", "nc-naf", "nc-tva", "nc-dirigeant", "nc-creation", "ncp-adresse", "ncp-cp", "ncp-ville"].forEach((id) => $(`#${id}`).classList.add("pre-rempli"));
      info.textContent = `✓ Trouvée : ${e.raison} · ${e.effectif}. Il ne reste que le contact à écrire.`;
      return setTimeout(() => $("#ncp-prenom")?.focus(), 50);
    }
    case "adresse-choisir": {
      const p = el.dataset.pref;
      $(`#${p}-adresse`).value = el.dataset.adresse;
      $(`#${p}-cp`).value = el.dataset.cp;
      $(`#${p}-ville`).value = el.dataset.ville;
      $(`#${p}-propositions`).hidden = true;
      return;
    }
    case "nc-creer": {
      const pro = !$("#nc-pro").hidden;
      const v = (id) => ($(`#${id}`)?.value ?? "").trim();
      const err = $("#nc-erreur");
      const d = pro
        ? { pro: true, raison: v("nc-raison"), forme: v("nc-forme"), siren: v("nc-siren").replace(/\D/g, ""), tva: v("nc-tva"), naf: v("nc-naf"), dirigeant: v("nc-dirigeant"), prenom: v("ncp-prenom"), nom: v("ncp-nom"), fonction: v("ncp-fonction"), mail: v("ncp-mail"), tel: v("ncp-tel"), adresse: v("ncp-adresse"), cp: v("ncp-cp"), ville: v("ncp-ville") }
        : { pro: false, situation: v("nc-situation"), prenom: v("nc-prenom"), nom: v("nc-nom"), mail: v("nc-mail"), tel: v("nc-tel"), adresse: v("nc-adresse"), cp: v("nc-cp"), ville: v("nc-ville") };
      d.statut = v("nc-statut");
      if (pro && !d.raison) return (err.textContent = "Recherchez d'abord la société avec son SIREN.");
      if (!d.prenom || !d.nom) return (err.textContent = pro ? "Écrivez le prénom et le nom du contact." : "Écrivez le prénom et le nom.");
      if (!d.mail && !d.tel) return (err.textContent = "Ajoutez au moins un e-mail ou un téléphone.");
      const id = `n${CLIENTS.length}`;
      CLIENTS.push(ficheNouvelle(id, d));
      fermerFeuille();
      toast(`Fiche créée${pro ? ` · ${d.raison}` : ""} · questionnaire de découverte envoyé`);
      return aller("clients", { id }, "scenario");
    }
    case "rdv-creer":
      return creerRdv();
    case "proposer-rdv":
      return feuille(`<div class="feuille-tete"><span class="carte-ico">${icone("agenda")}</span><h2>Proposer des créneaux${el.dataset.nom ? ` · ${esc(el.dataset.nom)}` : ""}</h2><button class="btn btn-icone" data-action="fermer">${icone("fermer")}</button></div>
        <p style="color:var(--texte-2);margin-top:0">Le cockpit a choisi 3 créneaux libres dans votre agenda. Le client clique sur celui qui lui convient : le rendez-vous se pose tout seul, avec rappels et lien visio.</p>
        <div class="liste">${["Lundi 23 novembre · 11:30 · Google Meet", "Mardi 24 novembre · 14:00 · au cabinet", "Jeudi 26 novembre · 09:30 · Teams"].map((c) => `<div class="ligne"><span class="case cochee">${icone("coche")}</span><div class="ligne-texte"><strong>${c}</strong></div></div>`).join("")}</div>
        <div class="pied-feuille"><button class="btn" data-action="fermer">Annuler</button><button class="btn btn-or" data-action="envoyer-creneaux">${icone("envoyer")} Envoyer par e-mail et SMS</button></div>`);
    case "envoyer-creneaux":
      fermerFeuille();
      return toast("Créneaux envoyés · vous serez prévenu dès la réservation");
    case "releves":
      return importerReleves();
    case "voir-opp":
      return feuille(feuilleOpp(el.dataset.opp, "liste"), true);
    case "campagne-opp":
      return feuille(feuilleOpp(el.dataset.opp, "campagne"), true);
    case "envoyer-campagne":
      fermerFeuille();
      return toast(`${el.dataset.n} e-mails personnalisés programmés · relance auto à J+5`);
    /* ---------------- Accès comptable */
    case "comptable-copier": {
      const l = lienComptable();
      navigator.clipboard?.writeText(l).catch(() => {});
      return toast("Lien copié");
    }
    case "comptable-envoyer":
      return toast(`Lien envoyé à ${COMPTABLE.nom}`);
    case "comptable-ouvrir":
      return window.open(lienComptable(), "_blank");
    case "comptable-mail": {
      changerCodeMail(!acces().codeMail);
      toast(acces().codeMail ? "Code par e-mail activé" : "Code par e-mail désactivé");
      return rendre();
    }
    case "comptable-lien":
      nouveauLien();
      toast("Nouveau lien créé : l'ancien ne marche plus");
      return rendre();
    case "comptable-couper":
      changerActif(!acces().actif);
      toast(acces().actif ? "Accès du comptable rouvert" : "Accès du comptable coupé");
      return rendre();
    case "comptable-code":
      feuille(`<h2 style="margin:4px 0 6px">Nouveau code du comptable</h2>
        <p style="margin:0 0 14px;color:var(--texte-2)">6 chiffres. Donnez-le à ${COMPTABLE.nom} de vive voix ou par téléphone, jamais dans le même e-mail que le lien.</p>
        <input id="code-comptable" class="champ-code num" inputmode="numeric" autocomplete="off" maxlength="6" placeholder="● ● ● ● ● ●">
        <p id="code-erreur" style="margin:8px 0 0;color:var(--rouge);min-height:18px;font-size:12.5px"></p>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px"><button class="btn" data-action="fermer">Annuler</button><button class="btn btn-or" data-action="comptable-code-ok">Enregistrer</button></div>`);
      return setTimeout(() => $("#code-comptable")?.focus(), 50);
    case "comptable-code-ok": {
      const c = ($("#code-comptable")?.value ?? "").replace(/D/g, "");
      const err = $("#code-erreur");
      if (c.length !== 6) return (err.textContent = "Le code doit avoir 6 chiffres.");
      if (codeTropSimple(c)) return (err.textContent = "Trop simple : évitez 123456 ou 111111.");
      changerCode(c);
      miroir("comptable-code-fait");
      fermerFeuille();
      toast("Nouveau code enregistré");
      return rendre();
    }
    case "basculer": {
      const au = st.automatismes[Number(el.dataset.i)];
      au.actif = !au.actif;
      toast(au.actif ? `« ${au.titre} » activé` : `« ${au.titre} » mis en pause`);
      return rendre();
    }
    case "notifs": {
      const n = $("#notifs");
      n.hidden = !n.hidden;
      $("#cloche-point").hidden = true;
      n.innerHTML = st.notifs.map((x) => `<div class="ligne"><span class="carte-ico">${icone(x.ico)}</span><div class="ligne-texte"><strong>${esc(x.t)}</strong><span>${esc(x.d)}</span></div></div>`).join("");
      return;
    }
    case "nouveau":
      return feuille(`<div class="feuille-tete"><span class="carte-ico">${icone("plus")}</span><h2>Nouveau</h2><button class="btn btn-icone" data-action="fermer">${icone("fermer")}</button></div>
        <div class="grille g-2" style="gap:10px">${[
          ["clients", "Client ou prospect", "clients"],
          ["agenda", "Rendez-vous", "agenda"],
          ["simulateurs", "Simulation", "simulateurs"],
          ["conformite", "Document à signer", "signature"],
          ["communication", "Campagne e-mail", "campagnes"],
          ["demandes", "Note d'appel", "telephone"],
        ]
          .map(([v, t, i]) => `<button class="opp" ${v === "agenda" ? `data-action="nouveau-rdv"` : v === "clients" ? `data-action="nouveau-client"` : `data-aller="${v}" data-fermer`}><span class="carte-ico">${icone(i)}</span><h3 style="align-self:center">${t}</h3></button>`)
          .join("")}</div>`);
    case "menu-plus": {
      const autres = Object.entries(VUES).filter(([id]) => !["accueil", "agenda", "clients", "demandes"].includes(id));
      return feuille(`<div class="feuille-tete"><h2>Menu</h2><button class="btn btn-icone" data-action="fermer">${icone("fermer")}</button></div>
        <button class="profil" data-action="profil" style="width:100%;margin-bottom:10px;text-align:left">${avatarProfil()}<div class="profil-texte"><strong>${esc(st.prenom === "Serkan" ? "Serkan Bulut" : st.prenom || "Administrateur")}</strong><span>Mon profil · Verrouiller</span></div></button>
        <button class="carte-assistant" data-action="assistant" style="margin-bottom:12px"><span class="orbe"></span><div><strong>Assistant Leader</strong><span>Posez une question</span></div></button>
        <div class="grille g-2" style="gap:8px;grid-template-columns:1fr 1fr">${autres.map(([id, v]) => `<button class="opp" data-aller="${id}" data-fermer style="padding:12px;align-items:center"><span class="carte-ico">${icone(v.ico)}</span><h3 style="font-size:13px">${v.titre}</h3></button>`).join("")}</div>
        <div class="pied-feuille"><button class="btn" data-action="theme">${icone(st.theme === "jour" ? "lune" : "soleil")} ${st.theme === "jour" ? "Mode nuit" : "Mode jour"}</button></div>`);
    }
    case "assistant":
      fermerFeuille();
      return ouvrirAssistant();

    /* ---------------- Support : nouvelle demande, détail */
    case "support-nouvelle":
      st.supportNature = "probleme";
      return feuille(formulaireSupport(icone, st.supportNature), true);
    case "support-nature":
      st.supportNature = el.dataset.v;
      document.querySelectorAll(".support-nature").forEach((b) => b.classList.toggle("actif", b.dataset.v === el.dataset.v));
      return;
    case "support-envoyer": {
      const titre = ($("#support-titre")?.value ?? "").trim();
      const texte = ($("#support-texte")?.value ?? "").trim();
      const err = $("#support-erreur");
      if (!titre) return (err.textContent = "Écrivez en quelques mots de quoi il s'agit.");
      if (!texte) return (err.textContent = "Expliquez-nous en quelques lignes.");
      st.support.unshift({ id: `n${st.support.length + 1}`, nature: st.supportNature, titre, texte, creeLe: new Date().toISOString(), statut: null });
      fermerFeuille();
      toast(`Demande envoyée. ${AGENCE} vous répond ici.`);
      return st.vue === "support" ? rendre() : aller("support", {}, "scenario");
    }
    case "support-ouvrir": {
      const d = st.support.find((x) => x.id === el.dataset.id);
      return d && feuille(detailDemande(d, icone), true);
    }

    /* ---------------- Mon profil */
    case "profil":
      return feuille(`<div class="feuille-tete"><h2>Mon profil</h2><button class="btn btn-icone" data-action="fermer">${icone("fermer")}</button></div>
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">${avatarProfil("grand")}<div><strong style="font-size:17px">${esc(st.prenom === "Serkan" ? "Serkan Bulut" : st.prenom || "Administrateur")}</strong><div style="color:var(--texte-2);font-size:12.5px;font-weight:600">Administrateur</div><div style="color:var(--texte-3);font-size:12.5px">Leader Patrimoine</div></div></div>
        <div class="liste">
          <button class="ligne" data-aller="reglages" data-params='{"onglet":"cabinet"}' data-fermer><span class="carte-ico">${icone("clients")}</span><div class="ligne-texte"><strong>Changer ma photo et mon prénom</strong><span>Réglages → Mon cabinet</span></div></button>
          <button class="ligne" data-aller="reglages" data-params='{"onglet":"securite"}' data-fermer><span class="carte-ico">${icone("cadenas")}</span><div class="ligne-texte"><strong>Mon code et Face ID</strong><span>Réglages → Sécurité</span></div></button>
          <button class="ligne" data-action="verrouiller"><span class="carte-ico">${icone("cadenas")}</span><div class="ligne-texte"><strong>Verrouiller maintenant</strong><span>Il faudra le code ou Face ID pour revenir</span></div></button>
        </div>`);
    case "verrouiller":
      fermerFeuille();
      $("#assistant")?.remove();
      return $("#verrou") || verrou();
    case "photo-retirer":
      changerPhoto("");
      toast("Photo retirée");
      return redessinerTout();
    case "profil-ok": {
      const v = ($("#prenom-profil")?.value ?? "").trim();
      if (!v) return toast("Indiquez un prénom");
      st.prenom = v;
      ecrire("lp-prenom", v);
      toast("Profil enregistré");
      return redessinerTout();
    }

    /* ---------------- Signature des e-mails et honoraires */
    case "signature-modifier": {
      const s = maSignature();
      const champ = (id, lib, val) => `<label class="champ-reglage">${lib}<input id="${id}" value="${esc(val)}" autocomplete="off"></label>`;
      return feuille(`<div class="feuille-tete"><span class="carte-ico">${icone("mail")}</span><h2>Signature des e-mails</h2><button class="btn btn-icone" data-action="fermer">${icone("fermer")}</button></div>
        <div class="grille g-2" style="gap:10px">${champ("sig-nom", "Nom", s.nom)}${champ("sig-fonction", "Fonction", s.fonction)}${champ("sig-tel", "Téléphone", s.tel)}${champ("sig-orias", "N° ORIAS", s.orias)}</div>
        <div class="pied-feuille"><button class="btn" data-action="fermer">Annuler</button><button class="btn btn-or" data-action="signature-ok">Enregistrer</button></div>`);
    }
    case "signature-ok":
      changerSignature({ nom: $("#sig-nom").value.trim(), fonction: $("#sig-fonction").value.trim(), tel: $("#sig-tel").value.trim(), orias: $("#sig-orias").value.trim() });
      fermerFeuille();
      toast("Signature enregistrée : elle part avec chaque e-mail");
      return rendre();
    case "honoraires-modifier":
      return feuille(`<div class="feuille-tete"><span class="carte-ico">${icone("euro")}</span><h2>Mes honoraires</h2><button class="btn btn-icone" data-action="fermer">${icone("fermer")}</button></div>
        <div class="liste">${TARIFS.map(([t, v], i) => `<div class="ligne"><div class="ligne-texte"><strong>${t}</strong></div><input class="champ-court" id="tarif-${i}" value="${esc(v)}" autocomplete="off"></div>`).join("")}</div>
        <p style="margin:10px 0 0;font-size:12px;color:var(--texte-3)">Un nouveau tarif ne change pas les factures déjà faites.</p>
        <div class="pied-feuille"><button class="btn" data-action="fermer">Annuler</button><button class="btn btn-or" data-action="honoraires-ok">Enregistrer</button></div>`);
    case "honoraires-ok":
      TARIFS.forEach((t, i) => (t[1] = $(`#tarif-${i}`)?.value.trim() || t[1]));
      fermerFeuille();
      toast("Honoraires enregistrés");
      return rendre();

    /* ---------------- Sécurité */
    case "changer-code":
      return feuille(`<div class="feuille-tete"><span class="carte-ico">${icone("cadenas")}</span><h2>Changer mon code</h2><button class="btn btn-icone" data-action="fermer">${icone("fermer")}</button></div>
        <label class="champ-reglage">Code actuel<input id="code-actuel" class="champ-code num" inputmode="numeric" maxlength="6" autocomplete="off" placeholder="● ● ● ● ● ●"></label>
        <label class="champ-reglage" style="margin-top:10px">Nouveau code<input id="code-nouveau" class="champ-code num" inputmode="numeric" maxlength="6" autocomplete="off" placeholder="● ● ● ● ● ●"></label>
        <p id="code-perso-erreur" style="margin:8px 0 0;color:var(--rouge);min-height:18px;font-size:12.5px"></p>
        <div class="pied-feuille"><button class="btn" data-action="fermer">Annuler</button><button class="btn btn-or" data-action="changer-code-ok">Enregistrer</button></div>`);
    case "changer-code-ok": {
      const a = ($("#code-actuel")?.value ?? "").replace(/\D/g, "");
      const n = ($("#code-nouveau")?.value ?? "").replace(/\D/g, "");
      const err = $("#code-perso-erreur");
      if (a.length !== 6) return (err.textContent = "Tapez votre code actuel (6 chiffres).");
      if (n.length !== 6) return (err.textContent = "Le nouveau code doit avoir 6 chiffres.");
      if (codeTropSimple(n)) return (err.textContent = "Trop simple : évitez 123456 ou 111111.");
      fermerFeuille();
      return toast("Nouveau code enregistré · vos autres appareils le demanderont");
    }
    case "ajouter-appareil": {
      feuille(`<div style="text-align:center;padding:10px 0"><div class="faceid scan" style="margin:0 auto 14px">${icone("faceid")}</div><h2 style="margin:0 0 6px">Face ID</h2><p style="color:var(--texte-2);margin:0">Regardez votre écran…</p></div>`);
      return setTimeout(() => {
        fermerFeuille();
        if (!st.appareils.some((x) => x.nom === "Cet appareil")) st.appareils.push({ nom: "Cet appareil", detail: "Face ID activé · à l'instant", ico: telephone() ? "mobile" : "ordinateur" });
        toast("Cet appareil est ajouté : entrée avec Face ID");
        rendre();
      }, 1500);
    }
    case "retirer-appareil": {
      const x = st.appareils.splice(Number(el.dataset.i), 1)[0];
      toast(`« ${x?.nom ?? "Appareil"} » retiré : il devra entrer le code`);
      return rendre();
    }

    /* ---------------- Notifications */
    case "notif-activer":
      st.notifReglages.appareil = true;
      toast("Notifications activées sur cet appareil");
      return rendre();
    case "notif-basculer": {
      const k = el.dataset.cle;
      st.notifReglages[k] = !st.notifReglages[k];
      toast(st.notifReglages[k] ? "Activé" : "Désactivé");
      return rendre();
    }

    /* ---------------- Agenda : mes disponibilités, congés */
    case "disponibilites": {
      const ligneDispo = (lib, contenu) => `<div class="ligne"><div class="ligne-texte"><strong>${lib}</strong></div>${contenu}</div>`;
      const choix = (id, opts, val) => `<select class="choix-duree" id="${id}">${opts.map((o) => `<option ${o === val ? "selected" : ""}>${o}</option>`).join("")}</select>`;
      return feuille(`<div class="feuille-tete"><span class="carte-ico">${icone("horloge")}</span><h2>Mes disponibilités</h2><button class="btn btn-icone" data-action="fermer">${icone("fermer")}</button></div>
        <h3 style="font-size:14px;margin:0 0 6px">Mes horaires</h3>
        <div class="liste">
          ${ligneDispo("Lundi au vendredi", `<span style="display:flex;gap:6px;align-items:center"><input type="time" class="champ-court" id="dispo-debut" value="09:00"> – <input type="time" class="champ-court" id="dispo-fin" value="19:00"></span>`)}
          ${ligneDispo("Samedi", choix("dispo-samedi", ["Fermé", "Matin", "Sur demande"], "Sur demande"))}
          ${ligneDispo("Pause entre deux rendez-vous", choix("dispo-pause", ["Aucune", "15 min", "30 min"], "15 min"))}
        </div>
        <h3 style="font-size:14px;margin:16px 0 6px">Durée des rendez-vous</h3>
        <div class="liste">
          ${ligneDispo("Découverte", choix("duree-decouverte", ["45 min", "1 h", "1 h 30"], "1 h"))}
          ${ligneDispo("Bilan patrimonial", choix("duree-bilan", ["1 h", "1 h 30", "2 h"], "1 h 30"))}
          ${ligneDispo("Revue annuelle", choix("duree-revue", ["45 min", "1 h", "1 h 30"], "1 h"))}
        </div>
        <h3 style="font-size:14px;margin:16px 0 6px">Congés et absences</h3>
        <div class="ligne" style="flex-wrap:wrap;gap:8px"><span style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">Du <input type="date" class="champ-court" id="conge-debut" value="2026-12-24"> au <input type="date" class="champ-court" id="conge-fin" value="2027-01-03"></span><button class="btn btn-petit" data-action="conges-bloquer">Bloquer</button></div>
        <div class="pied-feuille"><button class="btn" data-action="fermer">Annuler</button><button class="btn btn-or" data-action="dispo-ok">Enregistrer</button></div>`, true);
    }
    case "conges-bloquer": {
      const d = (id) => new Date($(id).value).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
      return toast(`Du ${d("#conge-debut")} au ${d("#conge-fin")} : plus personne ne peut réserver`);
    }
    case "dispo-ok":
      fermerFeuille();
      return toast("Disponibilités enregistrées · la page de réservation est à jour");

    /* ---------------- Relances : texte des e-mails automatiques */
    case "auto-texte": {
      const a = st.automatismes[Number(el.dataset.i)];
      return feuille(`<div class="feuille-tete"><span class="carte-ico">${icone("mail")}</span><h2>${esc(a.titre)}</h2><button class="btn btn-icone" data-action="fermer">${icone("fermer")}</button></div>
        <p style="margin:0 0 10px;color:var(--texte-2);font-size:13px">Quand : ${esc(a.regle)}</p>
        <label class="champ-reglage">Objet<input id="auto-objet" value="${esc(a.objet ?? objetAuto(a))}" autocomplete="off"></label>
        <label class="champ-reglage" style="margin-top:10px">Texte<textarea id="auto-corps" rows="7">${esc(a.corps ?? corpsAuto(a))}</textarea></label>
        <p style="margin:8px 0 0;font-size:12px;color:var(--texte-3)">{prénom} est remplacé par le prénom de chaque client. Votre signature s'ajoute toute seule en bas.</p>
        <div class="pied-feuille"><button class="btn" data-action="fermer">Annuler</button><button class="btn btn-or" data-action="auto-texte-ok" data-i="${el.dataset.i}">Enregistrer</button></div>`, true);
    }
    case "auto-texte-ok": {
      const a = st.automatismes[Number(el.dataset.i)];
      a.objet = $("#auto-objet").value;
      a.corps = $("#auto-corps").value;
      fermerFeuille();
      return toast(`Texte de « ${a.titre} » enregistré`);
    }
  }
}

/** Textes proposés par défaut pour les e-mails automatiques (modifiables par le gérant). */
function objetAuto(a) {
  return { "Revue annuelle": "Faisons le point sur votre patrimoine", "Avant 70 ans": "Vos versements avant 70 ans", "Campagne PER de fin d'année": "Réduire vos impôts 2026 avant le 31 décembre", "Anniversaire du client": "Joyeux anniversaire {prénom} !" }[a.titre] ?? a.titre;
}
function corpsAuto(a) {
  return `Bonjour {prénom},\n\n${a.titre === "Revue annuelle" ? "Cela fait un an que nous avons fait le point ensemble. Votre situation a peut-être changé : je vous propose un rendez-vous de revue, au cabinet ou en visio." : a.action + "."}\n\nVous pouvez choisir un créneau directement ici : Prendre rendez-vous en ligne.\n\nBien à vous,`;
}

/** Redessine tout le cockpit (après un changement de photo, de prénom…), en restant sur le même écran. */
function redessinerTout() {
  const v = st.vue;
  const p = st.params;
  coque();
  st.vue = v;
  st.params = p;
  rendre();
}

// Photo de profil choisie : réduite, enregistrée, puis affichée partout (et sur l'autre écran).
document.addEventListener("change", async (e) => {
  if (e.target.id !== "photo-profil" || !e.target.files?.[0]) return;
  try {
    changerPhoto(await preparerPhoto(e.target.files[0]));
    toast("Photo de profil enregistrée");
    redessinerTout();
    miroir("redessiner");
  } catch {
    toast("Cette image n'a pas pu être lue");
  }
});

/* ================================================================ Aide à la saisie de l'adresse ================================================================ */

document.addEventListener("input", (e) => {
  const pref = e.target.dataset?.adresse;
  if (!pref) return;
  e.target.classList.remove("pre-rempli");
  const z = $(`#${pref}-propositions`);
  const l = suggestionsAdresse(e.target.value);
  z.hidden = !l.length;
  z.innerHTML = l.map((a) => `<button class="proposition" data-action="adresse-choisir" data-pref="${pref}" data-adresse="${esc(a.adresse)}" data-cp="${a.cp}" data-ville="${esc(a.ville)}">${icone("maison")}<span><strong>${esc(a.adresse)}</strong>${a.cp} ${esc(a.ville)}</span></button>`).join("");
});

/* ================================================================ Recherche ================================================================ */

document.addEventListener("input", (e) => {
  if (e.target.id !== "recherche") return;
  const q = e.target.value.trim().toLowerCase();
  const z = $("#resultats");
  if (!q) return (z.hidden = true);
  const r = CLIENTS.filter((c) => nomComplet(c).toLowerCase().includes(q) || (c.pro?.raison ?? "").toLowerCase().includes(q) || c.ville.toLowerCase().includes(q) || c.contrats.some((k) => k.nom.toLowerCase().includes(q))).slice(0, 7);
  z.hidden = false;
  z.innerHTML = r.length ? r.map((c) => `<button class="resultat" data-aller="clients" data-params='${JSON.stringify({ id: c.id })}'><span class="avatar">${esc(c.initiales)}</span><div class="ligne-texte"><strong>${pastilleNature(c)}${esc(nomComplet(c))}</strong><span>${esc(c.pro ? c.pro.raison + " · " : "")}${esc(c.ville)} · ${montantCourt(encoursClient(c))}</span></div></button>`).join("") : `<div style="padding:10px;color:var(--texte-3)">Aucun résultat</div>`;
});
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    $("#recherche")?.focus();
  }
  if (e.key === "Escape") {
    fermerFeuille();
    $("#assistant")?.remove();
    miroir("fermer-tout");
  }
});

/* ================================================================ Thème ================================================================ */

function changerTheme(t, diffuser = false) {
  st.theme = t;
  ecrire("lp-theme", t);
  document.documentElement.dataset.theme = t;
  const vue = st.vue;
  const p = st.params;
  coque();
  st.vue = vue;
  st.params = p;
  rendre();
  if (diffuser) envoyer({ t: "theme", v: t, de: MOI });
}

/* ================================================================ Scénarios de démonstration ================================================================ */

function nouvelleDemande() {
  st.demandes.unshift({ id: `d${Date.now()}`, quand: "à l'instant", nom: "Céline ARNOUX", age: 52, ville: "Évian", objet: "Préparer ma retraite", message: "Je pars à la retraite dans 5 ans et je veux savoir comment compléter mes revenus. J'ai un PEA et une assurance-vie.", montant: "100 000 – 500 000 €", tmi: 41, source: "Google · article « PER ou assurance-vie »", score: 90, chaud: true, statut: "Nouvelle", nouveau: true });
  banniere("Nouvelle demande prioritaire", "Céline ARNOUX · Préparer ma retraite · intérêt 90/100", () => aller("demandes"));
  if (st.vue === "demandes" || st.vue === "accueil") rendre();
  else majBadges();
}

/* ---------------- Nouveau rendez-vous posé par le gérant */
const TYPES_RDV = [
  ["Découverte", 60, "decouverte"],
  ["Bilan patrimonial", 90, "bilan"],
  ["Revue annuelle", 60, "revue"],
  ["Signature", 30, "signature"],
  ["Restitution d'étude", 60, "bilan"],
  ["Point partenaire", 60, "partenaire"],
];
const LIEUX_RDV = ["Au cabinet", "Chez le client", "Teams", "Google Meet", "Téléphone"];
const enMinutes = (h) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));
const enHeure = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

function formulaireRdv(nom) {
  const champ = (lib, html) => `<label class="champ-reglage">${lib}${html}</label>`;
  const choix = (id, opts, val) => `<select id="${id}" class="champ-select">${opts.map(([v, t]) => `<option value="${esc(v)}" ${v === val ? "selected" : ""}>${esc(t)}</option>`).join("")}</select>`;
  return `<div class="feuille-tete"><span class="carte-ico">${icone("agenda")}</span><h2>Nouveau rendez-vous</h2><button class="btn btn-icone" data-action="fermer">${icone("fermer")}</button></div>
    <div class="grille g-2" style="gap:12px">
      ${champ("Client", `<input id="rdv-client" list="rdv-clients" value="${esc(nom)}" placeholder="Nom du client ou du prospect" autocomplete="off"><datalist id="rdv-clients">${CLIENTS.map((c) => `<option value="${esc(nomComplet(c))}">`).join("")}</datalist>`)}
      ${champ("Type", choix("rdv-type", TYPES_RDV.map(([t, d]) => [t, `${t} · ${d < 60 ? d + " min" : d / 60 + " h"}`.replace("1.5 h", "1 h 30")]), "Revue annuelle"))}
      ${champ("Jour", choix("rdv-jour", JOURS.map((j, i) => [String(i), j.long]), "1"))}
      ${champ("Heure", `<input type="time" id="rdv-heure" value="09:00" min="08:00" max="19:00" step="900">`)}
      ${champ("Où", choix("rdv-lieu", LIEUX_RDV.map((l) => [l, l === "Teams" || l === "Google Meet" ? `Visio ${l}` : l]), "Au cabinet"))}
      ${champ("Note pour vous (facultatif)", `<input id="rdv-note" placeholder="Ex. : apporter l'avis d'imposition" autocomplete="off">`)}
    </div>
    <p id="rdv-erreur" style="margin:10px 0 0;color:var(--rouge);min-height:18px;font-size:12.5px"></p>
    <p style="margin:0;font-size:12px;color:var(--texte-3)">Le client reçoit la confirmation, puis les rappels (e-mail J-2, SMS la veille). En visio, le lien Teams ou Meet part avec.</p>
    <div class="pied-feuille"><button class="btn" data-action="proposer-rdv">${icone("lien")} Laisser le client choisir</button><button class="btn btn-or" data-action="rdv-creer">${icone("coche")} Créer le rendez-vous</button></div>`;
}

function creerRdv() {
  const client = $("#rdv-client").value.trim();
  const [type, duree, couleur] = TYPES_RDV.find(([t]) => t === $("#rdv-type").value) ?? TYPES_RDV[0];
  const jour = Number($("#rdv-jour").value);
  const debut = $("#rdv-heure").value;
  const lieu = $("#rdv-lieu").value;
  const err = $("#rdv-erreur");
  if (!client) return (err.textContent = "Indiquez le nom du client.");
  if (!/^\d\d:\d\d$/.test(debut) || enMinutes(debut) < 8 * 60 || enMinutes(debut) + duree > 20 * 60) return (err.textContent = "Choisissez une heure entre 8:00 et 19:00.");
  const fin = enHeure(enMinutes(debut) + duree);
  const conflit = st.rdv.find((r) => r.jour === jour && enMinutes(r.debut) < enMinutes(fin) && enMinutes(debut) < enMinutes(r.fin));
  if (conflit) return (err.textContent = `Vous avez déjà ${conflit.client} de ${conflit.debut} à ${conflit.fin} : choisissez une autre heure.`);
  const c = CLIENTS.find((x) => nomComplet(x) === client);
  st.rdv.push({ jour, debut, fin, client, type, lieu, couleur, nouveau: true, ...(c ? { id: c.id } : {}) });
  fermerFeuille();
  const m = modeRdv({ lieu });
  toast(`Rendez-vous créé · ${JOURS[jour].long} à ${debut}${m.visio ? ` · lien ${m.court} envoyé` : ""} · confirmation partie au client`);
  aller("agenda", { jour }, "scenario");
}

function ajouterReservation() {
  if (!st.rdv.some((r) => r.client === "Thomas LEROY")) st.rdv.push({ jour: 1, debut: "11:30", fin: "12:15", client: "Thomas LEROY", type: "Réduire mes impôts", lieu: "Google Meet", couleur: "decouverte", nouveau: true });
  const d = st.demandes.find((x) => x.nom === "Thomas LEROY");
  if (d) d.statut = "Rendez-vous fixé";
  banniere("Rendez-vous réservé en ligne", "Thomas LEROY · lundi 23 novembre à 11:30 · Google Meet", () => aller("agenda", { jour: 1 }));
  aller("agenda", telephone() ? { jour: 1 } : {}, "scenario");
}

function signature() {
  st.signatures.forEach((s) => s.client === "Sophie NGUYEN" && (s.etat = "Signé ✓"));
  banniere("Documents signés", "Sophie NGUYEN a signé sa lettre de mission et la déclaration d'adéquation", () => aller("conformite"));
  if (st.vue === "conformite" || st.vue === "accueil") rendre();
  else majBadges();
}

function importerReleves() {
  const z = $("#import-progression");
  const partenaires = ["Orion Vie", "Atlantique Prévoyance", "Valmont Gestion", "Pierre & Rendement", "Horizon Capital", "Lumen Bourse"];
  if (z) {
    z.innerHTML = "";
    partenaires.forEach((p, i) =>
      setTimeout(() => {
        z.insertAdjacentHTML("beforeend", `<div class="ligne" style="animation:apparaitre .4s both"><span class="case cochee">${icone("coche")}</span><div class="ligne-texte"><strong>${p}</strong><span>${[18, 14, 4, 6, 2, 4][i]} contrats mis à jour</span></div></div>`);
      }, 350 * (i + 1)),
    );
  }
  setTimeout(() => {
    st.encours = 48934000;
    st.releves = true;
    banniere("Encours mis à jour", "48 contrats · +322 000 € depuis hier · aucune anomalie", () => aller("portefeuille"));
    if (st.vue === "portefeuille" || st.vue === "accueil") setTimeout(rendre, z ? 900 : 0);
  }, z ? 2400 : 300);
}

function scenarioOpportunite() {
  banniere("Radar : nouvelle opportunité", "4 clients peuvent encore réduire leur impôt 2026 avec un PER", () => aller("radar"));
}

/* ================================================================ Assistant Leader (réponses par règles, sur les données du cockpit) ================================================================ */

const SUGGESTIONS = ["Mes rendez-vous du jour", "Qui proposer pour un PER ?", "Dossiers à mettre à jour", "Régler mon cockpit", "Encours total"];

function ouvrirAssistant(question) {
  let p = $("#assistant");
  if (!p) {
    p = document.createElement("section");
    p.id = "assistant";
    p.className = "assistant verre";
    p.innerHTML = `<div class="poignee" style="margin-top:8px"></div><header class="assistant-tete"><span class="orbe"></span><strong>Assistant Leader</strong><button class="btn btn-icone" id="assistant-fermer" aria-label="Fermer">${icone("fermer")}</button></header>
      <div class="assistant-fil" id="fil"><div class="bulle lui">Bonjour${st.prenom ? ` ${esc(st.prenom)}` : ""} ! Je connais vos clients, votre agenda et vos dossiers, et je vous aide à régler votre cockpit. Que voulez-vous savoir ?</div></div>
      <div class="suggestions">${SUGGESTIONS.map((s) => `<button data-q="${esc(s)}">${esc(s)}</button>`).join("")}</div>
      <form class="assistant-saisie" id="assistant-form"><button type="button" class="btn btn-icone" data-action="toast" data-texte="Dictée vocale activée">${icone("micro")}</button><input id="assistant-champ" placeholder="Posez votre question…" autocomplete="off"><button class="btn btn-icone btn-or" aria-label="Envoyer">${icone("envoyer")}</button></form>`;
    document.body.append(p);
    $("#assistant-fermer").onclick = () => (p.remove(), miroir("fermer-assistant"));
    // Suggestions et choix proposés dans les réponses : un clic pose la question.
    p.addEventListener("click", (e) => {
      const b = e.target.closest("[data-q]");
      if (b) poser(b.dataset.q);
    });
    $("#assistant-form").onsubmit = (e) => {
      e.preventDefault();
      const v = $("#assistant-champ").value.trim();
      if (v) poser(v);
      $("#assistant-champ").value = "";
    };
  }
  if (question) setTimeout(() => taperPuisPoser(question), 500);
}

function taperPuisPoser(q) {
  const champ = $("#assistant-champ");
  let i = 0;
  const t = setInterval(() => {
    champ.value = q.slice(0, ++i);
    if (i >= q.length) {
      clearInterval(t);
      setTimeout(() => {
        champ.value = "";
        poser(q, "auto");
      }, 300);
    }
  }, 38);
}

function poser(q, depuis = "local") {
  if (depuis === "local" && st.sync) envoyer({ t: "poser", q, salle: SALLE });
  if (!$("#assistant")) ouvrirAssistant();
  if (depuis === "distant") $("#assistant-champ").value = "";
  const fil = $("#fil");
  fil.insertAdjacentHTML("beforeend", `<div class="bulle moi">${esc(q)}</div><div class="bulle lui" id="ecrit"><span class="ecrit"><i></i><i></i><i></i></span></div>`);
  fil.scrollTop = fil.scrollHeight;
  setTimeout(() => {
    $("#ecrit").outerHTML = `<div class="bulle lui">${repondre(q)}</div>`;
    fil.scrollTop = fil.scrollHeight;
  }, 900);
}

const sans = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const ligneClient = (c, droite) => `<button class="ligne" data-aller="clients" data-params='${JSON.stringify({ id: c.id })}'><span class="avatar" style="width:28px;height:28px;font-size:10px">${esc(c.initiales)}</span><div class="ligne-texte"><strong>${pastilleNature(c)}${esc(nomComplet(c))}</strong></div><div class="ligne-droite"><span>${droite}</span></div></button>`;

/** Réponse d'aide pour régler le cockpit, avec le bouton qui y emmène (ou qui fait le réglage). */
function repondreAide(f) {
  const bouton = f.action
    ? `<button class="ligne" ${f.action.attr}><div class="ligne-texte"><strong>${esc(f.action.texte)}</strong></div></button>`
    : f.aller
      ? `<button class="ligne" data-aller="${f.aller}"${f.params ? ` data-params='${JSON.stringify(f.params)}'` : ""}><div class="ligne-texte"><strong>Y aller</strong><span>${esc(VUES[f.aller].titre)}</span></div></button>`
      : "";
  return `${esc(f.reponse)}${bouton ? `<div class="liste">${bouton}</div>` : ""}`;
}

function repondre(q) {
  const s = sans(q);
  // Un sujet touché dans la liste (son titre exact) ou une question avec ses mots.
  const aide = AIDE_REGLAGES.find((f) => sans(f.titre) === s.trim()) ?? trouverAide(q);
  if (aide) return repondreAide(aide);
  if (demandeReglagesGenerale(q)) {
    const choix = THEMES_REGLAGES.map((id) => AIDE_REGLAGES.find((f) => f.id === id));
    return `Bien sûr ! Que voulez-vous régler ? Touchez un sujet, ou posez votre question avec vos mots (par exemple « comment changer mon code »).<div class="suggestions" style="padding:8px 0 0">${choix.map((f) => `<button data-q="${esc(f.titre)}">${esc(f.titre)}</button>`).join("")}</div>`;
  }
  const opps = opportunites();
  const client = CLIENTS.find((c) => s.includes(sans(c.nom)));
  if (client) return `${esc(nomComplet(client))} : patrimoine net ${montantCourt(require_bilan(client))}, encours ${montantCourt(encoursClient(client))}, TMI ${client.tmi} %.${client.prochain ? ` Prochain rendez-vous le ${client.prochain.date.slice(8)}/${client.prochain.date.slice(5, 7)} à ${client.prochain.heure}.` : ""}<div class="liste">${ligneClient(client, "Ouvrir la fiche")}</div>`;
  if (/rendez|rdv|agenda|aujourd|journee/.test(s)) {
    const l = st.rdv.filter((r) => r.jour === 0).sort((a, b) => a.debut.localeCompare(b.debut));
    return `Vous avez ${l.length} rendez-vous aujourd'hui. Les dossiers de préparation sont prêts et les rappels sont partis.<div class="liste">${l.map((r) => `<button class="ligne" data-action="rdv" data-rdv="${esc(r.client)}"><strong style="width:44px">${r.debut}</strong><div class="ligne-texte"><strong>${esc(r.client)}</strong><span>${esc(r.type)}</span></div></button>`).join("")}</div>`;
  }
  if (/per|retraite|impot|defisc/.test(s)) {
    const o = opps.find((x) => x.id === "per");
    return `${o.clients.length} clients imposés à 30 % ou plus n'ont pas de PER. Ensemble, ils pourraient économiser environ ${keur(o.totalGain)} d'impôt avant le 31 décembre :<div class="liste">${o.clients.slice(0, 5).map((c) => ligneClient(c, `${eur(o.gain(c))}`)).join("")}</div>`;
  }
  if (/70|ans|age|990/.test(s)) {
    const o = opps.find((x) => x.id === "avant70");
    return `${o.clients.length} clients ont entre 63 et 69 ans avec une assurance-vie : c'est le moment de verser avant 70 ans.<div class="liste">${o.clients.map((c) => ligneClient(c, `${c.age} ans`)).join("")}</div>`;
  }
  if (/conform|dossier|kyc|mettre a jour|signature|manquant/.test(s)) {
    const k = syntheseConformite();
    return `${k.complets} dossiers sur ${k.total} sont complets. À régulariser : ${k.kyc.length} connaissances client, ${k.identite.length} pièces d'identité, ${k.adequation.length} déclarations d'adéquation. Les demandes sont déjà parties aux clients.<div class="liste"><button class="ligne" data-aller="conformite"><div class="ligne-texte"><strong>Ouvrir la conformité</strong></div></button></div>`;
  }
  if (/encours|collecte|chiffre|remuneration|combien/.test(s)) return `Encours conseillés : ${meur(st.encours)} (+6,4 % depuis janvier). Collecte nette 2026 : 4,12 M€ sur un objectif de 5 M€. Rémunération du cabinet : 588 k€.`;
  if (/demande|prospect|site/.test(s)) {
    const n = st.demandes.filter((d) => d.statut === "Nouvelle");
    return `${n.length} nouvelles demandes, dont ${n.filter((d) => d.chaud).length} prioritaires. La plus chaude : ${esc(n[0]?.nom ?? "—")} (${esc(n[0]?.objet ?? "")}).<div class="liste"><button class="ligne" data-aller="demandes"><div class="ligne-texte"><strong>Voir les demandes</strong></div></button></div>`;
  }
  if (/simul|succession|ifi|donation/.test(s)) return `Je vous ouvre les simulateurs : impôt et PER, succession, IFI, démembrement et projection.<div class="liste"><button class="ligne" data-aller="simulateurs"><div class="ligne-texte"><strong>Ouvrir les simulateurs</strong></div></button></div>`;
  return `Je peux vous répondre sur vos rendez-vous, vos clients (tapez un nom), le PER, les 70 ans, la conformité, les demandes ou vos encours, et vous aider à régler le cockpit (code, signature, horaires, rappels, notifications…).`;
}
function require_bilan(c) {
  const actifs = c.actifs ?? c.contrats.map((k) => ({ valeur: k.valeur }));
  return actifs.reduce((s, a) => s + a.valeur, 0) - (c.passifs ?? []).reduce((s, p) => s + p.crd, 0);
}

/* ================================================================ Verrouillage (code + Face ID) ================================================================ */

function verrou() {
  const v = document.createElement("div");
  v.className = "verrou";
  v.id = "verrou";
  v.innerHTML = `<div class="verrou-panneau verre">
    <img class="logo" src="assets/${st.theme === "jour" ? "logo" : "logo-clair"}.svg" alt="Leader Patrimoine">
    <div class="faceid" id="faceid">${icone("faceid")}</div>
    <p>Entrez votre code ou utilisez Face ID</p>
    <div class="points-code" id="points">${"<i></i>".repeat(6)}</div>
    <div class="pave">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button data-chiffre="${n}">${n}</button>`).join("")}<button class="discret" data-face>Face ID</button><button data-chiffre="0">0</button><button class="discret" data-effacer>Effacer</button></div>
    <div class="signature-synium">Une réalisation SYNIUM</div>
  </div>`;
  document.body.append(v);
  let n = 0;
  v.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.hasAttribute("data-face")) {
      if (st.sync) envoyer({ t: "deverrouiller", salle: SALLE });
      return deverrouiller(true);
    }
    n = b.hasAttribute("data-effacer") ? Math.max(0, n - 1) : n + 1;
    if (st.sync) envoyer({ t: "code-points", n, salle: SALLE });
    points(n);
  });
  v.points = (k) => ((n = k), points(k));
  function points(k) {
    v.querySelectorAll("#points i").forEach((p, i) => p.classList.toggle("plein", i < k));
    if (k >= 6) setTimeout(() => deverrouiller(false), 250);
  }
}

function deverrouiller(face) {
  const v = $("#verrou");
  if (!v) return;
  const fin = () => {
    v.classList.add("partir");
    setTimeout(() => v.remove(), 800);
  };
  if (face) {
    $("#faceid").classList.add("scan");
    setTimeout(fin, 1100);
  } else {
    v.querySelectorAll("#points i").forEach((p) => p.classList.add("plein"));
    setTimeout(fin, 300);
  }
}

/* ================================================================ Télécommande et synchronisation des écrans ================================================================ */

function envoyer(m) {
  canal?.postMessage({ ...m, de: m.de ?? MOI });
}

function recevoir(m) {
  if (!m || m.de === MOI) return;
  switch (m.t) {
    case "nav":
      if (st.sync && m.salle === SALLE) {
        fermerFeuille();
        aller(m.vue, m.params, "distant");
      }
      break;
    case "action":
      if (st.sync && m.salle === SALLE) rejouer(m);
      break;
    case "saisie":
      if (st.sync && m.salle === SALLE) saisieDistante(m);
      break;
    case "poser":
      if (st.sync && m.salle === SALLE) poser(m.q, "distant");
      break;
    case "code-points":
      if (st.sync && m.salle === SALLE) $("#verrou")?.points?.(m.n);
      break;
    case "retour":
      if (st.sync && m.salle === SALLE) retour("distant");
      break;
    case "aller":
      fermerFeuille();
      $("#assistant")?.remove();
      $("#lancement-visio")?.remove();
      aller(m.vue, m.params ?? {}, "distant");
      break;
    case "theme":
      if (m.v !== st.theme) changerTheme(m.v);
      break;
    case "sync":
      st.sync = !!m.on;
      break;
    case "prenom":
      st.prenom = m.v;
      ecrire("lp-prenom", m.v);
      $("#profil-nom") && ($("#profil-nom").textContent = m.v === "Serkan" ? "Serkan Bulut" : m.v || "Administrateur");
      rendre();
      break;
    case "deverrouiller":
      deverrouiller(telephone());
      break;
    case "verrouiller":
      if (!$("#verrou")) verrou();
      break;
    case "demande":
      nouvelleDemande();
      break;
    case "reservation":
      fermerFeuille();
      ajouterReservation();
      break;
    case "signature":
      signature();
      break;
    case "releves":
      importerReleves();
      break;
    case "opportunite":
      scenarioOpportunite();
      break;
    case "assistant":
      fermerFeuille();
      ouvrirAssistant(m.question ?? "Qui proposer pour un PER ?");
      break;
    case "page-resa":
      aller("agenda", {}, "distant");
      feuille(feuilleReservation(0));
      break;
    case "reinitialiser":
      location.reload();
      break;
  }
}
canal && (canal.onmessage = (e) => recevoir(e.data));
window.addEventListener("message", (e) => e.data?.canal === CANAL && recevoir(e.data));

/* Raccourcis clavier de la démo (touches 1 à 8), aussi quand l'écran du cockpit a le focus. */
const TOUCHES = ["deverrouiller", "demande", "reservation", "page-resa", "signature", "releves", "opportunite", "assistant"];
document.addEventListener("keydown", (e) => {
  if (e.target.closest?.("input,textarea") || e.ctrlKey || e.metaKey || e.altKey) return;
  const n = Number(e.key);
  if (n >= 1 && n <= TOUCHES.length) {
    const m = { t: TOUCHES[n - 1], de: `clavier-${MOI}` };
    recevoir(m);
    canal?.postMessage(m);
  }
  if (e.key.toLowerCase() === "t" && window.parent !== window) window.parent.document.getElementById("ouvrir-tc")?.click();
  if (e.key === "Escape") fermerTelecommande();
});
// Dans la présentation, un clic sur l'écran de l'ordinateur ou de l'iPhone referme la télécommande.
function fermerTelecommande() {
  try {
    if (window.parent !== window) window.parent.fermerTelecommande?.();
  } catch {}
}
document.addEventListener("pointerdown", fermerTelecommande, true);

/* ================================================================ Démarrage ================================================================ */

// Dans le cadre « iPhone » de la présentation : barre d'état et indicateur d'accueil, pour un rendu réaliste.
if (MOI === "tel") {
  document.documentElement.classList.add("cadre-tel");
  document.body.insertAdjacentHTML("beforeend", `<div class="barre-statut"><span>10:42</span><span class="statut-ico"><svg viewBox="0 0 18 12" width="18" height="12"><rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor"/><rect x="5" y="5" width="3" height="7" rx="1" fill="currentColor"/><rect x="10" y="2.5" width="3" height="9.5" rx="1" fill="currentColor"/><rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor"/></svg><b>5G</b><svg viewBox="0 0 27 13" width="27" height="13"><rect x="0.5" y="0.5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".5"/><rect x="2" y="2" width="17" height="9" rx="2" fill="currentColor"/><rect x="24.5" y="4" width="2" height="5" rx="1" fill="currentColor" opacity=".5"/></svg></span></div><div class="indicateur-accueil"></div>`);
}

// À chaque ouverture : page du code (verrouillage) avec l'accueil derrière, quel que soit l'écran affiché à la
// fermeture. Si le navigateur ressort la page de sa mémoire (retour arrière, onglet restauré), on la recharge.
window.addEventListener("pageshow", (e) => e.persisted && location.reload());
coque();
aller(st.vue, {}, "init");
if (params.get("verrou") !== "0") verrou();
let largeurTel = telephone();
window.addEventListener("resize", () => {
  if (telephone() !== largeurTel) {
    largeurTel = telephone();
    const v = st.vue;
    const p = st.params;
    coque();
    st.vue = v;
    st.params = p;
    rendre();
  }
});
