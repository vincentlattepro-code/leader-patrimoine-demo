/**
 * Espace comptable (maquette) : lien personnel + code à 6 chiffres + code de confirmation par e-mail (si activé).
 * Lecture seule, limité aux commissions et aux honoraires. Données FICTIVES.
 */
import { icone } from "./icones.js";
import { eur, esc } from "./outils.js";
import { acces, noterErreur, effacerErreurs, ESSAIS_MAX, COMPTABLE, COMMISSIONS, FACTURES, TOTAUX, fichierComptable } from "./acces-comptable.js";

const $ = (s) => document.querySelector(s);
const espace = $("#espace");
const logo = `<img class="logo" src="assets/logo-clair.svg" alt="Leader Patrimoine">`;
const mailMasque = COMPTABLE.mail.replace(/^(.)[^@]*/, "$1•••");
let minuteur;
// Montants au centime près (comptabilité).
const euros = (n) => `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

function toast(texte) {
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `<span class="coche">${icone("coche")}</span>${esc(texte)}`;
  $("#toasts").append(t);
  setTimeout(() => t.remove(), 3000);
}

function message(ico, titre, texte) {
  espace.innerHTML = `<div class="verrou"><div class="verrou-panneau verre cpt-message">${logo}<span class="carte-ico">${icone(ico)}</span><h2>${titre}</h2><p>${texte}</p></div></div>`;
}

/** Écran du code : pavé à 6 chiffres, comme celui du cockpit. */
function ecranCode({ titre, texte, verifier, avant = "" }) {
  espace.innerHTML = `<div class="verrou"><div class="verrou-panneau verre" id="panneau">${logo}
    <p style="margin-bottom:6px;color:var(--texte);font-weight:600">${titre}</p><p>${texte}</p>${avant}
    <div class="points-code" id="points">${"<i></i>".repeat(6)}</div><p class="erreur" id="erreur"></p>
    <div class="pave">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button data-c="${n}">${n}</button>`).join("")}<span></span><button data-c="0">0</button><button class="discret" data-effacer>Effacer</button></div>
    <div class="signature-synium">Une réalisation SYNIUM</div></div></div>`;
  let saisie = "";
  const dessiner = () => document.querySelectorAll("#points i").forEach((p, i) => p.classList.toggle("plein", i < saisie.length));
  const taper = (c) => {
    if (saisie.length >= 6) return;
    saisie += c;
    dessiner();
    if (saisie.length === 6) setTimeout(() => {
      const ok = verifier(saisie);
      if (!ok) {
        saisie = "";
        dessiner();
        $("#panneau").classList.remove("secouer");
        void $("#panneau").offsetWidth;
        $("#panneau").classList.add("secouer");
      }
    }, 200);
  };
  $("#panneau").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.hasAttribute("data-effacer")) {
      saisie = saisie.slice(0, -1);
      return dessiner();
    }
    taper(b.dataset.c);
  });
  document.onkeydown = (e) => {
    if (/^\d$/.test(e.key)) taper(e.key);
    if (e.key === "Backspace") (saisie = saisie.slice(0, -1)), dessiner();
  };
  return { remplir: (code) => [...code].forEach((c, i) => setTimeout(() => taper(c), 140 * i)) };
}

function demarrer() {
  const a = acces();
  if (location.hash.slice(1) !== a.jeton) return message("lien", "Ce lien n'est plus valable", "Demandez un nouveau lien à Leader Patrimoine.");
  if (a.expire) return message("horloge", "Ce lien a expiré", "Sa durée de validité est terminée. Demandez un nouveau lien à Leader Patrimoine.");
  if (!a.actif) return message("cadenas", "Accès suspendu", "Leader Patrimoine a suspendu cet accès. Contactez le cabinet si besoin.");
  if (a.erreurs >= ESSAIS_MAX) return message("cadenas", "Accès bloqué", `Trop de codes faux. Leader Patrimoine a été prévenu et peut débloquer l'accès.`);
  ecranCode({
    titre: `Espace comptable · ${COMPTABLE.cabinet}`,
    texte: "Entrez le code à 6 chiffres donné par Leader Patrimoine",
    verifier: (c) => {
      if (c === acces().code) {
        effacerErreurs();
        a.codeMail ? confirmerParMail() : tableau();
        return true;
      }
      const n = noterErreur();
      if (n >= ESSAIS_MAX) {
        demarrer();
        return true;
      }
      $("#erreur").textContent = `Code incorrect · encore ${ESSAIS_MAX - n} essai${ESSAIS_MAX - n > 1 ? "s" : ""}`;
      return false;
    },
  });
}

/** Deuxième étape : code de confirmation envoyé par e-mail (simulé : il « arrive » et se remplit tout seul). */
function confirmerParMail() {
  const recu = String(Math.floor(100000 + Math.random() * 900000));
  const ecran = ecranCode({
    titre: "Code de confirmation",
    texte: `Envoyé à ${mailMasque} · valable 10 minutes`,
    avant: `<div class="mail-arrive" id="mail" hidden><span class="carte-ico">${icone("mail")}</span><div><strong>Leader Patrimoine</strong>Votre code de connexion : <b class="num">${recu}</b></div></div>`,
    verifier: (c) => {
      if (c === recu) {
        tableau();
        return true;
      }
      $("#erreur").textContent = "Code incorrect";
      return false;
    },
  });
  setTimeout(() => {
    const m = $("#mail");
    if (!m) return;
    m.hidden = false;
    setTimeout(() => ecran.remplir(recu), 900);
  }, 1400);
}

function deconnecter(texte = "Vous êtes déconnecté.") {
  clearTimeout(minuteur);
  message("cadenas", "À bientôt", `${texte} Rouvrez votre lien pour revenir.`);
}

function telecharger() {
  const url = URL.createObjectURL(new Blob([fichierComptable()], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "Leader-Patrimoine-remuneration-2026.csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  toast("Fichier téléchargé");
}

function tableau() {
  document.onkeydown = null;
  const trim = [0, 1, 2, 3].map((i) => COMMISSIONS.reduce((s, c) => s + c.trimestres[i], 0));
  const kpi = (ico, lib, val, pied) => `<div class="carte verre kpi"><div class="kpi-libelle">${icone(ico)} ${lib}</div><div class="kpi-valeur num">${val}</div><div class="kpi-pied">${pied}</div></div>`;
  espace.innerHTML = `
    <header class="cpt-haut verre">${logo.replace('class="logo"', "")}<div class="titre"><strong>Espace comptable</strong><span>${COMPTABLE.cabinet} · lecture seule</span></div><span class="espace"></span>
      <button class="btn btn-or" id="telecharger">${icone("telecharger")}<span class="long">Télécharger pour la comptabilité</span></button>
      <button class="btn" id="sortir">${icone("cadenas")}<span class="long">Se déconnecter</span></button></header>
    <div class="grille g-4">
      ${kpi("remuneration", "Commissions 2026", eur(TOTAUX.commissions), "reçues des partenaires")}
      ${kpi("document", "Honoraires HT", eur(TOTAUX.honorairesHt), "facturés en 2026")}
      ${kpi("euro", "TVA collectée", eur(TOTAUX.tva), "sur les honoraires")}
      ${kpi("horloge", "À recevoir", eur(TOTAUX.aRecevoir), "commissions annoncées")}
    </div>
    <section class="carte verre mt">
      <div class="carte-tete"><span class="carte-ico">${icone("carte")}</span><div><h2>Commissions par partenaire</h2><div class="sous">année 2026 · par trimestre</div></div></div>
      <div class="tableau-defile"><table class="tableau"><thead><tr><th>Partenaire</th><th>T1</th><th>T2</th><th>T3</th><th>T4</th><th>Total</th></tr></thead>
        <tbody>${COMMISSIONS.map((c) => `<tr><td><span class="point" style="color:${c.couleur};margin-right:8px"></span>${esc(c.partenaire)}<small style="padding-left:15px">${esc(c.type)}</small></td>${c.trimestres.map((v) => `<td>${euros(v)}</td>`).join("")}<td><strong>${euros(c.total)}</strong></td></tr>`).join("")}</tbody>
        <tfoot><tr><td>Total</td>${trim.map((v) => `<td>${euros(v)}</td>`).join("")}<td>${euros(TOTAUX.commissions)}</td></tr></tfoot></table></div>
    </section>
    <section class="carte verre mt">
      <div class="carte-tete"><span class="carte-ico">${icone("document")}</span><div><h2>Factures d'honoraires</h2><div class="sous">numérotées par le logiciel de facturation</div></div></div>
      <div class="tableau-defile"><table class="tableau"><thead><tr><th>Facture</th><th style="text-align:left">Client</th><th>HT</th><th>TVA</th><th>TTC</th><th>Statut</th></tr></thead>
        <tbody>${FACTURES.map((f) => `<tr><td><strong>N° ${f.numero}</strong><small>${f.date.split("-").reverse().join("/")}</small></td><td style="text-align:left">${esc(f.client)}<small>${esc(f.objet)}</small></td><td>${euros(f.ht)}</td><td>${euros(f.tva)}</td><td><strong>${euros(f.ttc)}</strong></td><td><span class="pastille ${f.statut === "Payée" ? "vert" : "orange"}">${f.statut}</span></td></tr>`).join("")}</tbody></table></div>
    </section>
    <p style="text-align:center;color:var(--texte-3);font-size:12px;margin-top:18px">Accès en lecture seule, donné par Leader Patrimoine · déconnexion automatique après 15 minutes sans activité</p>`;
  $("#telecharger").onclick = telecharger;
  $("#sortir").onclick = () => deconnecter();
  // Déconnexion automatique après 15 minutes sans activité.
  const relancer = () => {
    clearTimeout(minuteur);
    if (acces().expire) return demarrer();
    minuteur = setTimeout(() => deconnecter("Déconnexion automatique après 15 minutes sans activité."), 15 * 60 * 1000);
  };
  ["pointerdown", "keydown", "scroll"].forEach((t) => addEventListener(t, relancer, { passive: true }));
  relancer();
}

// Lien changé ou accès coupé depuis le cockpit (autre onglet) : l'espace se ferme aussitôt.
addEventListener("storage", (e) => {
  if (!e.key?.startsWith("lp-comptable")) return;
  const a = acces();
  if (location.hash.slice(1) !== a.jeton || !a.actif || a.expire) demarrer();
});
addEventListener("hashchange", demarrer);
demarrer();
