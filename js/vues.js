/** Écrans du cockpit Leader Patrimoine. Chaque écran renvoie son HTML ; `monter` branche ses interactions. */
import { CLIENTS, CABINET_CHIFFRES as K, DEMANDES, PARTENAIRES, PROFILS, AUTOMATISMES, CAMPAGNES, ARTICLES, JOURS, modeRdv } from "./donnees.js";
import { icone } from "./icones.js";
import { signatureMail } from "./signature.js";
import { avatarProfil, photoProfil, signature, TARIFS } from "./profil.js";
import { acces, lienComptable, COMPTABLE, CONNEXIONS, DUREES, finLisible } from "./acces-comptable.js";
import * as S from "./calculs.js";
import { eur, meur, keur, pct, esc, dateFr, moisDepuis, anneesDepuis, nomComplet, clientParId, pastilleNature, clientDe, encoursClient, bilan, COULEURS_CAT, opportunites, etatConformite, syntheseConformite, tousContrats, etincelle, courbe, anneau, montantCourt, HEURE_DEMO } from "./outils.js";

const MOIS = ["déc.", "janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov."];
const lien = (vue, params = {}) => `data-aller="${vue}" data-params='${esc(JSON.stringify(params))}'`;
const COULEUR_OPP = { or: ["rgba(230,184,106,.18)", "var(--or-texte)"], bleu: ["var(--bleu-doux)", "var(--bleu)"], violet: ["var(--violet-doux)", "var(--violet)"], vert: ["var(--vert-doux)", "var(--vert)"], orange: ["var(--orange-doux)", "var(--orange)"], rouge: ["var(--rouge-doux)", "var(--rouge)"] };
const ICONE_HISTO = { rdv: "agenda", email: "mail", signature: "signature", appel: "telephone" };

function tete(titre, sous = "", droite = "", ico = "") {
  return `<div class="carte-tete">${ico ? `<span class="carte-ico">${icone(ico)}</span>` : ""}<div><h2>${titre}</h2>${sous ? `<div class="sous">${sous}</div>` : ""}</div>${droite ? `<div class="droite">${droite}</div>` : ""}</div>`;
}
const avatar = (c, cl = "") => `<span class="avatar ${cl}">${esc(c.initiales ?? "?")}</span>`;
const pastilleRdv = { decouverte: "violet", revue: "bleu", signature: "vert", bilan: "or", partenaire: "" };

/* ================================================================ ACCUEIL ================================================================ */

function accueil(st) {
  const auj = st.rdv.filter((r) => r.jour === 0).sort((a, b) => a.debut.localeCompare(b.debut));
  const nouvelles = st.demandes.filter((d) => d.statut === "Nouvelle").length;
  const opps = opportunites().filter((o) => o.clients.length).slice(0, 3);
  const conf = syntheseConformite();
  const score = Math.round((conf.complets / conf.total) * 100);
  const taches = st.taches;
  const bonjour = st.prenom ? `Bonjour <em>${esc(st.prenom)}</em>` : "Bonjour";
  return `
  <div class="vue anim-entree">
    <section class="carte verre bienvenue">
      <div>
        <h2>${bonjour}</h2>
        <p>Vendredi 20 novembre · votre cockpit a déjà préparé vos rendez-vous et vos relances du jour.</p>
      </div>
      <div class="bienvenue-resume">
        <button class="puce-resume" ${lien("agenda")}><b>${auj.length}</b> rendez-vous</button>
        <button class="puce-resume" ${lien("demandes")}><b>${nouvelles}</b> nouvelles demandes</button>
        <button class="puce-resume" ${lien("conformite")}><b>${st.signatures.filter((s) => !s.etat.startsWith("Signé")).length}</b> signatures en attente</button>
      </div>
    </section>

    <div class="grille g-4 mt anim-entree">
      <div class="carte verre kpi">${etincelle(K.encoursMois)}
        <div class="kpi-libelle">${icone("portefeuille")} Encours conseillés</div>
        <div class="kpi-valeur num" data-compteur="${st.encours}" data-format="meur">${meur(st.encours)}</div>
        <div class="kpi-pied"><span class="hausse">+${pct(K.encoursEvolution)}</span> depuis janvier</div>
      </div>
      <div class="carte verre kpi">
        <div class="kpi-libelle">${icone("tendance")} Collecte nette 2026</div>
        <div class="kpi-valeur num">${meur(K.collecteNette, 2)}</div>
        <div class="kpi-pied">Objectif ${meur(K.collecteObjectif, 0)} · ${Math.round((K.collecteNette / K.collecteObjectif) * 100)} %</div>
        <div class="jauge"><i style="width:${(K.collecteNette / K.collecteObjectif) * 100}%"></i></div>
      </div>
      <div class="carte verre kpi">${etincelle(K.remunerationMois)}
        <div class="kpi-libelle">${icone("remuneration")} Rémunération du cabinet</div>
        <div class="kpi-valeur num">${keur(K.remuneration)}</div>
        <div class="kpi-pied"><span class="hausse">+11,8 %</span> vs 2025</div>
      </div>
      <div class="carte verre kpi">
        <div class="kpi-libelle">${icone("clients")} Foyers clients</div>
        <div class="kpi-valeur num">${K.foyers}</div>
        <div class="kpi-pied"><span class="hausse">+14</span> cette année · 38 prospects actifs</div>
      </div>
    </div>

    <div class="grille g-2-1 mt anim-entree">
      <section class="carte verre">
        ${tete("Aujourd'hui", "Dossiers de préparation prêts · rappels envoyés automatiquement", `<button class="btn btn-petit" ${lien("agenda")}>Agenda ${icone("fleche")}</button>`, "agenda")}
        <div class="liste">
          ${auj.map((r) => ligneRdv(r)).join("")}
        </div>
      </section>
      <section class="carte verre">
        ${tete("À faire", `${taches.filter((t) => !t.fait).length} actions · créées par le cockpit`, "", "coche")}
        <div class="liste">
          ${taches
            .map(
              (t, i) => `<div class="ligne cliquable" data-action="cocher" data-i="${i}"><span class="case ${t.fait ? "cochee" : ""}">${t.fait ? icone("coche") : ""}</span><div class="ligne-texte ${t.fait ? "barre-texte-raye" : ""}"><strong>${esc(t.titre)}</strong><span>${esc(t.detail)}</span></div></div>`,
            )
            .join("")}
        </div>
      </section>
    </div>


    <div class="grille g-3 mt anim-entree">
      <section class="carte verre">
        ${tete("Radar d'opportunités", "détectées cette nuit dans vos fiches", `<button class="btn btn-petit" ${lien("radar")}>Tout voir</button>`, "radar")}
        <div class="liste">
          ${opps
            .map(
              (o) => `<button class="ligne" ${lien("radar")}><span class="opp-ico" style="background:${COULEUR_OPP[o.couleur][0]};color:${COULEUR_OPP[o.couleur][1]}">${icone(o.ico)}</span><div class="ligne-texte"><strong>${esc(o.titre)}</strong><span>${o.clients.length} clients · ${montantCourt(o.total)} ${esc(o.unite)}</span></div></button>`,
            )
            .join("")}
        </div>
      </section>
      <section class="carte verre">
        ${tete("Conformité", "MIF 2 · DDA · LCB-FT", `<button class="btn btn-petit" ${lien("conformite")}>Ouvrir</button>`, "conformite")}
        <div style="display:flex;align-items:center;gap:16px">
          ${jaugeRonde(score)}
          <div class="liste" style="flex:1">
            <div class="ligne"><div class="ligne-texte"><strong>${conf.kyc.length} connaissances client à renouveler</strong><span>questionnaire envoyé automatiquement</span></div></div>
            <div class="ligne"><div class="ligne-texte"><strong>${conf.identite.length} pièces d'identité expirées</strong><span>demande de pièce envoyée</span></div></div>
            <div class="ligne"><div class="ligne-texte"><strong>${conf.adequation.length} déclarations à produire</strong><span>pré-remplies, prêtes à signer</span></div></div>
          </div>
        </div>
      </section>
      <section class="carte verre">
        ${tete("Ce mois-ci, votre cockpit a…", "travaillé pour vous", "", "eclair")}
        <div class="liste">
          ${[
            ["142", "e-mails de relance et de suivi envoyés"],
            ["38", "rappels de rendez-vous (e-mail + SMS)"],
            ["21", "dossiers de préparation de rendez-vous"],
            ["17", "documents signés électroniquement"],
            ["24", "factures d'honoraires émises"],
          ]
            .map(([n, t]) => `<div class="ligne"><strong class="texte-or num" style="width:44px;font-size:18px">${n}</strong><div class="ligne-texte"><span style="color:var(--texte-2);white-space:normal">${t}</span></div></div>`)
            .join("")}
        </div>
        <div class="resultat-sim" style="padding:12px;margin-top:8px"><span style="font-size:12px;color:var(--texte-2)">Temps gagné estimé</span><div class="grand-chiffre texte-or" style="font-size:28px">≈ 31 heures</div></div>
      </section>
    </div>
  </div>`;
}

function jaugeRonde(score) {
  const C = 2 * Math.PI * 42;
  return `<svg viewBox="0 0 100 100" style="width:110px;height:110px;flex:none">
    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--verre-3)" stroke-width="9"/>
    <circle cx="50" cy="50" r="42" fill="none" stroke="url(#degOr)" stroke-width="9" stroke-linecap="round" stroke-dasharray="${(score / 100) * C} ${C}" transform="rotate(-90 50 50)" style="animation:anneau 1.6s var(--doux) both"/>
    <text x="50" y="50" text-anchor="middle" font-size="22" font-weight="700" fill="var(--texte)">${score} %</text>
    <text x="50" y="66" text-anchor="middle" font-size="9" fill="var(--texte-3)">dossiers complets</text>
  </svg>`;
}

/** Pastille « où » d'un rendez-vous : terrain, Teams, Google Meet ou téléphone. */
export function pastilleLieu(r) {
  const m = modeRdv(r);
  return `<span class="pastille ${m.couleur}">${icone(m.ico)} ${esc(m.court)}</span>`;
}

function ligneRdv(r) {
  const passe = r.jour === 0 && r.fin < `${String(HEURE_DEMO.h).padStart(2, "0")}:${HEURE_DEMO.m}`;
  const m = modeRdv(r);
  const droite = passe
    ? `<span class="pastille vert">Compte rendu envoyé</span>`
    : m.visio
      ? `<button class="btn btn-petit btn-or bouton-rejoindre" data-action="rejoindre" data-rdv="${esc(r.client)}" title="Rejoindre sur ${m.appli}">${icone("visio")} Rejoindre</button>`
      : pastilleLieu(r);
  return `<div class="ligne ligne-rdv" role="button" tabindex="0" data-action="rdv" data-rdv="${esc(r.client)}" style="cursor:pointer;${passe ? "opacity:.55" : ""}">
    <div class="heure num">${r.debut}<span>${r.fin}</span></div>
    <span class="barre-couleur c-${r.couleur}" style="border-left:4px solid"></span>
    <div class="ligne-texte"><strong>${pastilleNature(clientDe(r))}${esc(r.client)}</strong><span>${esc(r.type)} · ${esc(m.libelle)}</span></div>
    <div class="ligne-droite">${droite}</div>
  </div>`;
}

/* ================================================================ AGENDA ================================================================ */

function agenda(st, p) {
  const jourMobile = p.jour ?? 0;
  const debutJ = 8;
  const pos = (h) => {
    const [hh, mm] = h.split(":").map(Number);
    return (hh - debutJ + mm / 60) * 54;
  };
  const colonnes = JOURS.map(
    (j, i) => `<div class="agenda-col ${i === 0 ? "aujourdhui" : ""}" style="height:${12 * 54}px">
      ${i === 0 ? `<div class="maintenant" style="top:${pos(`${HEURE_DEMO.h}:${HEURE_DEMO.m}`)}px"></div>` : ""}
      ${st.rdv
        .filter((r) => r.jour === i)
        .map((r) => `<div class="creneau c-${r.couleur} ${r.nouveau ? "nouveau" : ""}" data-action="rdv" data-rdv="${esc(r.client)}" style="top:${pos(r.debut) + 2}px;height:${pos(r.fin) - pos(r.debut) - 4}px"><strong>${esc(r.client)}</strong><span>${r.debut} · ${esc(modeRdv(r).court)}</span>${modeRdv(r).visio ? `<i class="creneau-visio" title="${modeRdv(r).libelle}">${icone("visio")}</i>` : ""}</div>`)
        .join("")}
    </div>`,
  );
  const duJour = st.rdv.filter((r) => r.jour === jourMobile).sort((a, b) => a.debut.localeCompare(b.debut));
  return `
  <div class="vue">
    <div class="barre-outils">
      
      <span class="pastille vert masquer-tel">${icone("rafraichir")} Synchronisé avec votre agenda Google / Outlook</span>
      <span class="espace"></span>
      <button class="btn" data-action="disponibilites">${icone("horloge")} Mes disponibilités</button>
      <button class="btn" data-action="reservation">${icone("lien")} Page de prise de rendez-vous</button>
      <button class="btn btn-or" data-action="nouveau-rdv">${icone("plus")} Rendez-vous</button>
    </div>
    <div class="grille g-2-1">
      <section class="carte verre agenda-pc" style="padding:14px 14px 18px">
        <div class="agenda" style="grid-template-columns:52px repeat(${JOURS.length}, minmax(0,1fr))">
          <div></div>
          ${JOURS.map((j, i) => `<div class="agenda-jour ${i === 0 ? "aujourdhui" : ""}">${j.court}<b>${j.num}</b></div>`).join("")}
          <div class="agenda-heures">${Array.from({ length: 12 }, (_, i) => `<div>${debutJ + i}:00</div>`).join("")}</div>
          ${colonnes.join("")}
        </div>
      </section>
      <div class="agenda-mobile-zone" style="display:contents">
        <div class="jours-mobile">${JOURS.map((j, i) => `<button class="jour-puce ${i === jourMobile ? "actif" : ""}" ${lien("agenda", { jour: i })}>${j.court}<b>${j.num}</b>${st.rdv.some((r) => r.jour === i) ? "<i></i>" : ""}</button>`).join("")}</div>
      </div>
      <div>
        <section class="carte verre" style="margin-bottom:14px">
          ${tete(JOURS[jourMobile].long, `${duJour.length} rendez-vous`, "", "agenda")}
          <div class="liste">${duJour.map((r) => ligneRdv(r)).join("") || `<p style="color:var(--texte-3)">Aucun rendez-vous.</p>`}</div>
        </section>
        <section class="carte verre">
          ${tete("Votre agenda travaille seul", "", "", "eclair")}
          <div class="liste">
            ${[
              ["lien", "Prise de rendez-vous en ligne", "Vos clients choisissent un créneau libre depuis votre site ou un e-mail."],
              ["mail", "Confirmation + rappels", "E-mail à la réservation, rappel J-2 avec les pièces à apporter, SMS la veille."],
              ["visio", "Visio Teams ou Google Meet", "Le lien est créé tout seul et part avec la confirmation. Le jour J : « Rejoindre », un clic."],
              ["document", "Dossier de préparation", "La veille : synthèse du client, points à aborder, documents manquants."],
              ["signature", "Compte rendu en 2 minutes", "Après le rendez-vous : modèle pré-rempli, envoyé au client et rangé dans sa fiche."],
            ]
              .map(([i, t, d]) => `<div class="ligne"><span class="carte-ico">${icone(i)}</span><div class="ligne-texte"><strong>${t}</strong><span style="white-space:normal">${d}</span></div></div>`)
              .join("")}
          </div>
          <button class="btn mt" style="width:100%" data-aller-anim="rdv">${icone("film")} Voir l'animation</button>
        </section>
      </div>
    </div>
  </div>`;
}

export function feuillePreparation(r) {
  const c = r.id ? clientParId(r.id) : null;
  const conf = c ? etatConformite(c) : null;
  const opps = c ? opportunites().filter((o) => o.clients.includes(c)) : [];
  return `
  <div class="feuille-tete"><span class="carte-ico">${icone("document")}</span><h2>Préparation · ${esc(r.client)}${pastilleNature(clientDe(r))}</h2><button class="btn btn-icone" data-action="fermer">${icone("fermer")}</button></div>
  <div class="grille g-2" style="gap:10px">
    <div class="carte verre" style="padding:14px"><div class="sous" style="color:var(--texte-3);font-size:12px">Rendez-vous</div><strong>${esc(r.type)}</strong><div style="color:var(--texte-2);font-size:13px">${JOURS[r.jour].long} · ${r.debut} – ${r.fin}</div><div style="margin-top:6px">${pastilleLieu(r)}</div></div>
    <div class="carte verre" style="padding:14px"><div class="sous" style="color:var(--texte-3);font-size:12px">Automatique</div><strong>Rappels envoyés</strong><div style="color:var(--texte-2);font-size:13px">E-mail J-2 ✓ · SMS la veille ✓${modeRdv(r).visio ? ` · lien ${modeRdv(r).court} ✓` : ""}</div></div>
  </div>
  ${
    c
      ? `<h3 style="font-size:14px;margin:18px 0 8px">Synthèse du client</h3>
  <div class="grille g-3" style="gap:10px">
    <div class="carte verre" style="padding:12px"><span style="font-size:11.5px;color:var(--texte-3)">Patrimoine net</span><br><strong>${montantCourt(bilan(c).net)}</strong></div>
    <div class="carte verre" style="padding:12px"><span style="font-size:11.5px;color:var(--texte-3)">Encours au cabinet</span><br><strong>${montantCourt(encoursClient(c))}</strong></div>
    <div class="carte verre" style="padding:12px"><span style="font-size:11.5px;color:var(--texte-3)">Profil</span><br><strong>${PROFILS[c.profil.risque]} · TMI ${c.tmi} %</strong></div>
  </div>
  <h3 style="font-size:14px;margin:18px 0 8px">Points à aborder (proposés par le cockpit)</h3>
  <div class="liste">
    ${opps.map((o) => `<div class="ligne"><span class="opp-ico" style="width:30px;height:30px;background:${COULEUR_OPP[o.couleur][0]};color:${COULEUR_OPP[o.couleur][1]}">${icone(o.ico)}</span><div class="ligne-texte"><strong>${esc(o.titre)}</strong><span style="white-space:normal">${esc(o.texte)}</span></div></div>`).join("")}
    ${conf.manquants.map((m) => `<div class="ligne"><span class="opp-ico" style="width:30px;height:30px;background:var(--orange-doux);color:var(--orange)">${icone("conformite")}</span><div class="ligne-texte"><strong>À mettre à jour : ${esc(m.libelle)}</strong><span>Faire signer pendant le rendez-vous</span></div></div>`).join("")}
    ${(c.objectifs ?? []).slice(0, 2).map((o) => `<div class="ligne"><span class="opp-ico" style="width:30px;height:30px;background:var(--verre-2)">${icone("cible")}</span><div class="ligne-texte"><strong>Objectif : ${esc(o)}</strong><span>Faire le point</span></div></div>`).join("")}
  </div>`
      : `<h3 style="font-size:14px;margin:18px 0 8px">Nouveau contact</h3><p style="color:var(--texte-2)">Questionnaire de découverte envoyé avec la confirmation : situation familiale, revenus, patrimoine et objectifs seront pré-remplis dans la fiche avant le rendez-vous.</p>`
  }
  <div class="pied-feuille">
    ${modeRdv(r).visio ? `<button class="btn btn-or" data-action="rejoindre" data-rdv="${esc(r.client)}">${icone("visio")} Rejoindre sur ${modeRdv(r).appli}</button>` : ""}
    ${c ? `<button class="btn" ${lien("clients", { id: c.id })} data-fermer>${icone("clients")} Ouvrir la fiche</button>` : ""}
    <button class="btn btn-or" data-action="compte-rendu" data-rdv="${esc(r.client)}">${icone("signature")} Compte rendu</button>
  </div>`;
}

export function feuilleCompteRendu(r) {
  return `
  <div class="feuille-tete"><span class="carte-ico">${icone("signature")}</span><h2>Compte rendu · ${esc(r.client)}</h2><button class="btn btn-icone" data-action="fermer">${icone("fermer")}</button></div>
  <p style="color:var(--texte-2);margin-top:0">Cochez ce qui a été vu : le texte se rédige tout seul.</p>
  <div class="liste">
    ${["Situation familiale et professionnelle mise à jour", "Profil investisseur confirmé", "Versement PER de 10 000 € décidé", "Arbitrage vers des fonds durables", "Donation à préparer avec le notaire"]
      .map((t, i) => `<div class="ligne cliquable" data-action="cocher-cr"><span class="case ${i < 3 ? "cochee" : ""}">${i < 3 ? icone("coche") : ""}</span><div class="ligne-texte"><strong>${t}</strong></div></div>`)
      .join("")}
  </div>
  <div class="champ mt"><label>Texte envoyé au client</label><textarea>Bonjour, merci pour notre échange de ce jour. Comme convenu : votre situation a été mise à jour, votre profil investisseur est confirmé et nous mettons en place un versement de 10 000 € sur votre PER. Vous recevrez les documents à signer dans quelques minutes. Bien à vous.</textarea></div>
  <div class="liste">
    <div class="ligne"><span class="carte-ico">${icone("eclair")}</span><div class="ligne-texte"><strong>Ce que le cockpit fera en envoyant</strong><span style="white-space:normal">Compte rendu rangé dans la fiche · documents à signer envoyés · tâche « vérifier la signature » dans 3 jours · prochaine revue planifiée dans 12 mois.</span></div></div>
  </div>
  <div class="pied-feuille"><button class="btn" data-action="fermer">Plus tard</button><button class="btn btn-or" data-action="envoyer-cr">${icone("envoyer")} Envoyer et classer</button></div>`;
}

export function feuilleReservation(etape = 0) {
  const creneaux = ["lun. 23 · 11:30", "lun. 23 · 16:00", "mar. 24 · 14:00", "mer. 25 · 15:00", "jeu. 26 · 09:30", "jeu. 26 · 17:00"];
  const corps = [
    `<p style="color:var(--texte-2);margin:0 0 12px">Quel est l'objet de votre rendez-vous ?</p>
     <div class="liste">${[
       ["Bilan patrimonial", "1 h 30 · au cabinet ou en visio", "cible"],
       ["Réduire mes impôts", "45 min · visio", "euro"],
       ["Préparer ma retraite", "1 h · au cabinet ou en visio", "sablier"],
       ["Transmettre mon patrimoine", "1 h · au cabinet", "famille"],
     ]
       .map(([t, d, i]) => `<button class="ligne" data-action="resa" data-etape="1"><span class="carte-ico">${icone(i)}</span><div class="ligne-texte"><strong>${t}</strong><span>${d}</span></div>${icone("fleche")}</button>`)
       .join("")}</div>`,
    `<p style="color:var(--texte-2);margin:0 0 12px">Choisissez un créneau (seuls les créneaux libres de l'agenda sont proposés) :</p>
     <div class="grille g-3" style="gap:8px">${creneaux.map((c) => `<button class="btn" data-action="resa" data-etape="2">${c}</button>`).join("")}</div>`,
    `<div class="champ"><label>Prénom et nom</label><input type="text" value="Thomas LEROY"></div>
     <div class="champ"><label>E-mail</label><input type="text" value="thomas.leroy@exemple.fr"></div>
     <div class="champ"><label>Téléphone (pour le rappel par SMS)</label><input type="text" value="06 12 34 56 78"></div>
     <label style="display:flex;gap:8px;font-size:12px;color:var(--texte-2)"><input type="checkbox" checked> J'accepte d'être recontacté par Leader Patrimoine (politique de confidentialité).</label>
     <div class="pied-feuille"><button class="btn btn-or" data-action="resa" data-etape="3">Confirmer le rendez-vous</button></div>`,
    `<div style="text-align:center;padding:20px 0">
       <div style="width:72px;height:72px;border-radius:50%;margin:0 auto 14px;display:grid;place-items:center;background:var(--vert);color:#06210f;animation:surgir .6s var(--ressort) both">${icone("coche")}</div>
       <h3 style="margin:0 0 6px">Rendez-vous confirmé</h3>
       <p style="color:var(--texte-2);margin:0">Lundi 23 novembre à 11:30 · Visio Google Meet<br>Un e-mail de confirmation vient de partir, avec le lien visio et le questionnaire de découverte.</p>
     </div>
     <div class="pied-feuille"><button class="btn btn-or" data-action="resa-fin">Voir dans l'agenda du cabinet</button></div>`,
  ];
  return `
  <div class="feuille-tete"><img src="assets/mono-clair.svg" alt="" class="logo-resa" style="width:40px;height:40px;border-radius:12px;background:#0f112d;padding:4px"><h2>Prendre rendez-vous<br><span style="font-size:12.5px;font-weight:500;color:var(--texte-3)">Page publique · vue par vos clients</span></h2><button class="btn btn-icone" data-action="fermer">${icone("fermer")}</button></div>
  <div class="etapes" style="margin-bottom:16px">${["Objet", "Créneau", "Coordonnées", "Confirmé"].map((t, i) => `<div class="etape ${i < etape ? "ok" : ""}" style="padding:8px 10px;min-width:0;${i === etape ? "border-color:rgba(230,184,106,.6)" : ""}"><span>${i + 1}</span><strong style="margin:0">${t}</strong></div>`).join("")}</div>
  ${corps[etape]}`;
}

/* ================================================================ DEMANDES ================================================================ */

function demandes(st) {
  return `
  <div class="vue">
    <div class="barre-outils">
      
      <span class="espace"></span>
      <span class="pastille vert masquer-tel">${icone("bouclier")} Anti-spam actif · 47 indésirables bloqués ce mois</span>
    </div>
    <div class="grille g-2-1">
      <div class="liste" style="gap:10px">
        ${st.demandes
          .map(
            (d) => `<section class="carte verre" style="padding:16px;${d.nouveau ? "animation:arriver .9s var(--ressort) both;box-shadow:0 0 0 2px var(--or-1)" : ""}">
          <div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap">
            <span class="avatar">${esc(d.nom.split(" ").map((x) => x[0]).slice(0, 2).join(""))}</span>
            <div style="flex:1;min-width:180px">
              <strong style="font-size:15px">${pastilleNature(d)}${esc(d.nom)}</strong>${d.pro ? ` <span style="color:var(--texte-3);font-size:12.5px">· ${esc(d.pro.raison)}</span>` : ""} <span style="color:var(--texte-3);font-size:12.5px">· ${d.age} ans · ${esc(d.ville)} · ${esc(d.quand)}</span>
              <div style="margin:4px 0 8px;display:flex;gap:6px;flex-wrap:wrap"><span class="pastille or">${esc(d.objet)}</span><span class="pastille">${esc(d.montant)}</span><span class="pastille">TMI estimée ${d.tmi} %</span>${d.statut !== "Nouvelle" ? `<span class="pastille vert">${esc(d.statut)}</span>` : `<span class="pastille bleu"><span class="point"></span> Nouvelle</span>`}</div>
              <p style="margin:0;color:var(--texte-2);font-size:13px">« ${esc(d.message)} »</p>
              <div style="font-size:12px;color:var(--texte-3);margin-top:6px">Provenance : ${esc(d.source)}</div>
            </div>
            <div style="text-align:center;flex:none">
              <div style="font-size:11px;color:var(--texte-3)">Intérêt</div>
              <div class="texte-or" style="font-size:24px;font-weight:700">${d.score}</div>
              ${d.chaud ? `<span class="pastille rouge">Prioritaire</span>` : ""}
            </div>
          </div>
          <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
            <button class="btn btn-or btn-petit" data-action="proposer-rdv" data-nom="${esc(d.nom)}">${icone("agenda")} Proposer 3 créneaux</button>
            <button class="btn btn-petit" data-action="toast" data-texte="Fiche prospect créée avec les réponses du formulaire">${icone("clients")} Créer la fiche</button>
            <button class="btn btn-petit" data-action="toast" data-texte="Appel lancé">${icone("telephone")} Appeler</button>
          </div>
        </section>`,
          )
          .join("")}
      </div>
      <div>
        <section class="carte verre">
          ${tete("Ce qui se passe tout seul", "", "", "eclair")}
          <div class="liste">
            ${[
              ["Accusé de réception immédiat", "Le prospect reçoit un e-mail à vos couleurs avec votre lien de prise de rendez-vous."],
              ["Questions de qualification", "Objectif, montant, situation : le formulaire du site les pose, le cockpit calcule une TMI estimée et un niveau d'intérêt."],
              ["Alerte sur votre téléphone", "Une demande prioritaire ? Notification immédiate."],
              ["Relance si pas de réponse", "À J+2 puis J+5, sans y penser."],
              ["Provenance mesurée", "Google, recommandation, LinkedIn, partenaire : vous savez ce qui rapporte."],
            ]
              .map(([t, d]) => `<div class="ligne"><span class="case cochee">${icone("coche")}</span><div class="ligne-texte"><strong>${t}</strong><span style="white-space:normal">${d}</span></div></div>`)
              .join("")}
          </div>
          <button class="btn mt" style="width:100%" data-aller-anim="demande">${icone("film")} Voir l'animation</button>
        </section>
      </div>
    </div>
  </div>`;
}

/* ================================================================ CLIENTS ================================================================ */

function clients(st, p) {
  if (p.id) return ficheClient(clientParId(p.id), p.onglet ?? "synthese");
  const filtre = p.segment ?? "Tous";
  const liste = CLIENTS.filter((c) => filtre === "Tous" || c.segment === filtre).sort((a, b) => encoursClient(b) - encoursClient(a));
  return `
  <div class="vue">
    <div class="barre-outils">
      <div class="onglets">${["Tous", "Premium", "Patrimonial", "Essentiel"].map((s) => `<button class="onglet ${s === filtre ? "actif" : ""}" ${lien("clients", { segment: s })}>${s}</button>`).join("")}</div>
      <span class="espace"></span>
      <button class="btn masquer-tel" data-action="toast" data-texte="Export Excel prêt">${icone("telecharger")} Exporter</button>
      <button class="btn btn-or" data-action="nouveau-client">${icone("plus")} Nouveau client</button>
    </div>
    <section class="carte verre" style="padding:8px 10px">
      <table class="tableau tableau-mobile">
        <thead><tr><th>Client</th><th>Segment</th><th>Profil</th><th class="droite">Encours</th><th>Conformité</th><th>Prochain rendez-vous</th></tr></thead>
        <tbody>
          ${liste
            .map((c) => {
              const e = etatConformite(c);
              return `<tr class="cliquable" ${lien("clients", { id: c.id })}>
              <td><div class="cellule-client">${avatar(c)}<div><strong>${pastilleNature(c)}${esc(nomComplet(c))}</strong><span>${esc(c.pro ? c.pro.raison : c.profession)} · ${esc(c.ville)}</span></div></div></td>
              <td><span class="pastille ${c.segment === "Premium" ? "or" : c.segment === "Patrimonial" ? "violet" : ""}">${c.segment}</span></td>
              <td class="masquer-tel-cell">${PROFILS[c.profil.risque]}</td>
              <td class="droite num"><strong>${montantCourt(encoursClient(c))}</strong></td>
              <td>${e.complet ? `<span class="pastille vert">${icone("coche")} Complet</span>` : `<span class="pastille orange">${e.manquants.length} à revoir</span>`}</td>
              <td class="masquer-tel-cell">${c.prochain ? `${dateFr(c.prochain.date, { day: "numeric", month: "short" })} · ${c.prochain.heure}` : `<span style="color:var(--texte-3)">—</span>`}</td>
            </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </section>
  </div>`;
}

function ficheClient(c, onglet) {
  const b = bilan(c);
  const e = etatConformite(c);
  const opps = opportunites().filter((o) => o.clients.includes(c));
  const ong = [
    ["synthese", "Synthèse"],
    ["patrimoine", "Patrimoine"],
    ["contrats", "Contrats"],
    ["conformite", "Conformité"],
    ["historique", "Historique"],
  ];
  let corps = "";
  if (onglet === "synthese") {
    corps = `
    <div class="grille g-2">
      <section class="carte verre">
        ${tete("Foyer", c.regime ?? "", "", "famille")}
        <div class="liste">
          <div class="ligne"><div class="ligne-texte"><strong>${pastilleNature(c)}${esc(nomComplet(c))}</strong><span>${c.age} ans${c.ageConjoint ? ` · conjoint ${c.ageConjoint} ans` : ""} · ${esc(c.profession)}</span></div></div>
          ${(c.enfants ?? []).map((en) => `<div class="ligne"><div class="ligne-texte"><strong>${esc(en.prenom)}, ${en.age} ans</strong><span>${esc(en.note || "Enfant")}</span></div></div>`).join("")}
          <div class="ligne"><div class="ligne-texte"><strong>Revenus ${eur(c.revenus)} / an</strong><span>Tranche marginale d'imposition ${c.tmi} %</span></div></div>
        </div>
      </section>
      <section class="carte verre">
        ${tete("Objectifs et profil", `Profil mis à jour le ${dateFr(c.profil.date)}`, "", "cible")}
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">${(c.objectifs ?? ["Valoriser l'épargne"]).map((o) => `<span class="pastille or">${esc(o)}</span>`).join("")}</div>
        <div class="liste">
          <div class="ligne"><div class="ligne-texte"><strong>Profil ${PROFILS[c.profil.risque]} (risque ${c.profil.risque}/7)</strong><span>Horizon ${esc(c.profil.horizon)} · expérience ${esc(c.profil.experience).toLowerCase()}</span></div></div>
          <div class="ligne"><div class="ligne-texte"><strong>Préférences de durabilité</strong><span>${esc(c.profil.esg)}</span></div></div>
          <div class="ligne"><div class="ligne-texte"><strong>Vigilance anti-blanchiment : ${e.vigilance}</strong><span>${esc(c.conformite?.origine ?? "Origine des fonds documentée")}</span></div></div>
        </div>
      </section>
    </div>
    <section class="carte verre mt">
      ${tete("Opportunités pour ce client", "proposées par le radar", "", "radar")}
      <div class="grille g-2" style="gap:10px">${opps.map((o) => carteOpp(o, c)).join("") || `<p style="color:var(--texte-3)">Rien à signaler : tout est optimisé.</p>`}</div>
    </section>`;
  } else if (onglet === "patrimoine") {
    const cats = Object.entries(b.parCat);
    corps = `
    <section class="carte verre">
      ${tete("Bilan patrimonial", `Patrimoine brut ${montantCourt(b.brut)} · dettes ${montantCourt(b.passif)}`, `<button class="btn btn-petit" data-action="toast" data-texte="Bilan patrimonial PDF prêt, à vos couleurs">${icone("pdf")} Bilan PDF</button>`, "maison")}
      <div class="bilan-barre">${cats.map(([k, v]) => `<div style="flex:${v};background:${COULEURS_CAT[k]}">${(v / b.brut) * 100 > 9 ? `${k} ${Math.round((v / b.brut) * 100)} %` : ""}</div>`).join("")}</div>
      <div class="grille g-2" style="gap:20px">
        <div><h3 style="font-size:13px;color:var(--texte-3);margin:6px 0">ACTIF</h3><div class="liste">${b.actifs.map((a) => `<div class="ligne"><i style="width:9px;height:9px;border-radius:3px;background:${COULEURS_CAT[a.cat]}"></i><div class="ligne-texte"><strong>${esc(a.libelle)}</strong><span>${a.cat}</span></div><div class="ligne-droite num"><strong>${eur(a.valeur)}</strong></div></div>`).join("")}</div></div>
        <div><h3 style="font-size:13px;color:var(--texte-3);margin:6px 0">PASSIF</h3><div class="liste">${b.passifs.map((p) => `<div class="ligne"><div class="ligne-texte"><strong>${esc(p.libelle)}</strong><span>Fin ${p.fin} · taux ${p.taux}</span></div><div class="ligne-droite num"><strong>${eur(p.crd)}</strong></div></div>`).join("") || `<p style="color:var(--texte-3)">Aucune dette.</p>`}</div>
          <div class="resultat-sim mt"><span style="font-size:12px;color:var(--texte-2)">Patrimoine net</span><div class="grand-chiffre texte-or">${eur(b.net)}</div></div>
        </div>
      </div>
    </section>`;
  } else if (onglet === "contrats") {
    corps = `
    <section class="carte verre" style="padding:8px 10px">
      <table class="tableau tableau-mobile">
        <thead><tr><th>Contrat</th><th>Partenaire</th><th>Ouverture</th><th class="droite">Versé</th><th class="droite">Valeur</th><th class="droite">Perf. 2026</th></tr></thead>
        <tbody>${c.contrats
          .map((k) => {
            const p = PARTENAIRES.find((x) => x.id === k.partenaire);
            return `<tr><td><strong>${esc(k.nom)}</strong><br><span style="font-size:11.5px;color:var(--texte-3)">${k.type} · ${k.uc} % unités de compte${k.programme ? ` · ${eur(k.programme)}/mois` : ""}</span>${anneesDepuis(k.ouverture) >= 8 && k.type === "Assurance-vie" ? ` <span class="pastille bleu">+ de 8 ans</span>` : ""}</td><td class="masquer-tel-cell"><span class="pastille"><span class="point" style="color:${p.couleur}"></span>${p.nom}</span></td><td class="masquer-tel-cell">${dateFr(k.ouverture)}</td><td class="droite num masquer-tel-cell">${eur(k.verse)}</td><td class="droite num"><strong>${eur(k.valeur)}</strong></td><td class="droite"><span class="hausse">+${pct(k.perf)}</span></td></tr>`;
          })
          .join("")}</tbody>
      </table>
    </section>
    <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn" data-action="toast" data-texte="Bulletin d'arbitrage pré-rempli envoyé à la signature">${icone("signature")} Arbitrage à signer</button><button class="btn" data-action="toast" data-texte="Relevé consolidé PDF prêt">${icone("pdf")} Relevé consolidé</button></div>`;
  } else if (onglet === "conformite") {
    corps = `
    <section class="carte verre">
      ${tete("Parcours réglementaire", e.complet ? "Dossier complet, prêt pour un contrôle" : `${e.manquants.length} point(s) à mettre à jour`, `<button class="btn btn-petit" data-action="toast" data-texte="Dossier réglementaire complet exporté (PDF)">${icone("telecharger")} Dossier complet</button>`, "conformite")}
      <div class="etapes">${e.points.map((pt) => `<div class="etape ${pt.ok ? (pt.alerte ? "alerte" : "ok") : "manque"}"><span class="pastille ${pt.ok ? (pt.alerte ? "orange" : "vert") : "rouge"}">${pt.ok ? (pt.alerte ? "Bientôt" : "✓ OK") : "À faire"}</span><strong>${pt.libelle}</strong><span>${pt.date ? dateFr(pt.date) : "—"}</span></div>`).join("")}</div>
      ${e.manquants.length ? `<button class="btn btn-or mt" data-action="toast" data-texte="Documents pré-remplis envoyés à la signature électronique">${icone("signature")} Tout envoyer à signer en 1 clic</button>` : ""}
    </section>`;
  } else {
    corps = `<section class="carte verre">${tete("Historique", "e-mails, rendez-vous, signatures et appels, rangés automatiquement", "", "horloge")}<div class="chronologie">${(c.historique ?? [{ date: c.profil.date, type: "rdv", texte: "Revue annuelle." }]).map((h) => `<div class="evenement"><time>${dateFr(h.date)} · ${icone(ICONE_HISTO[h.type], "ico")}</time><p>${esc(h.texte)}</p></div>`).join("")}</div></section>`;
  }
  return `
  <div class="vue">
    <button class="retour" ${lien("clients")}>${icone("retour")} Tous les clients</button>
    <section class="carte verre" style="padding:0">
      <div class="fiche-tete">
        ${avatar(c, "grand")}
        <div><h2>${esc(nomComplet(c))}${pastilleNature(c)}</h2><p>${esc(c.type)} · ${esc(c.ville)} · client depuis ${c.depuis}</p>
          <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap"><span class="pastille or">${c.segment}</span>${e.complet ? `<span class="pastille vert">Conformité ✓</span>` : `<span class="pastille orange">Conformité à compléter</span>`}${c.prochain ? `<span class="pastille bleu">${icone("agenda")} ${dateFr(c.prochain.date, { day: "numeric", month: "short" })} · ${c.prochain.heure}</span>` : ""}</div>
        </div>
        <div class="actions">
          <button class="btn" data-action="toast" data-texte="E-mail prêt, signature du cabinet ajoutée">${icone("mail")}</button>
          <button class="btn" ${lien("simulateurs", { client: c.id })}>${icone("simulateurs")} Simuler</button>
          <button class="btn btn-or" data-action="nouveau-rdv" data-nom="${esc(nomComplet(c))}">${icone("agenda")} Rendez-vous</button>
        </div>
      </div>
      <div class="fiche-chiffres">
        <div><span>Patrimoine net</span><strong class="num">${montantCourt(b.net)}</strong></div>
        <div><span>Encours au cabinet</span><strong class="num">${montantCourt(encoursClient(c))}</strong></div>
        <div><span>TMI</span><strong>${c.tmi} %</strong></div>
        <div><span>Rémunération 2026</span><strong class="num">${eur((c.remuneration?.honoraires ?? 0) + (c.remuneration?.encours ?? 0) + (c.remuneration?.entree ?? 0))}</strong></div>
      </div>
    </section>
    <div class="onglets mt" style="margin-bottom:12px">${ong.map(([k, t]) => `<button class="onglet ${k === onglet ? "actif" : ""}" ${lien("clients", { id: c.id, onglet: k })}>${t}</button>`).join("")}</div>
    ${corps}
  </div>`;
}

function carteOpp(o, c) {
  const [fond, coul] = COULEUR_OPP[o.couleur];
  const valeur = c ? o.potentiel(c) : o.total;
  return `<div class="opp"><span class="opp-ico" style="background:${fond};color:${coul}">${icone(o.ico)}</span><div style="min-width:0;flex:1"><h3>${esc(o.titre)}</h3><p>${esc(o.texte)}</p><div class="opp-chiffres"><span><b>${montantCourt(valeur)}</b> ${esc(o.unite)}</span>${o.gain && c ? `<span><b>${eur(o.gain(c))}</b> d'impôt en moins</span>` : ""}</div></div></div>`;
}

/* ================================================================ ENCOURS ET CONTRATS ================================================================ */

function portefeuille(st, p) {
  const type = p.type ?? "Tous";
  const types = { Tous: null, "Assurance-vie": ["Assurance-vie", "Capitalisation"], PER: ["PER individuel"], SCPI: ["SCPI"], Titres: ["PEA", "Compte-titres"], "Private equity": ["Private equity"] };
  const contrats = tousContrats().filter((k) => !types[type] || types[type].includes(k.type)).sort((a, b) => b.valeur - a.valeur);
  const parPart = PARTENAIRES.map((pa) => ({ ...pa, total: tousContrats().filter((k) => k.partenaire === pa.id).reduce((s, k) => s + k.valeur, 0) }));
  const maxP = Math.max(...parPart.map((x) => x.total));
  return `
  <div class="vue">
    <div class="grille g-4 anim-entree">
      <div class="carte verre kpi"><div class="kpi-libelle">${icone("portefeuille")} Encours total</div><div class="kpi-valeur num">${meur(st.encours)}</div><div class="kpi-pied">${st.releves ? `<span class="hausse">Relevés importés à l'instant</span>` : "Relevés importés cette nuit · 04:12"}</div></div>
      <div class="carte verre kpi"><div class="kpi-libelle">${icone("tendance")} Performance moyenne 2026</div><div class="kpi-valeur num hausse">+5,4 %</div><div class="kpi-pied">pondérée par les encours</div></div>
      <div class="carte verre kpi"><div class="kpi-libelle">${icone("eclair")} Versements programmés</div><div class="kpi-valeur num">${eur(58400)}</div><div class="kpi-pied">par mois · 64 contrats</div></div>
      <div class="carte verre kpi"><div class="kpi-libelle">${icone("cloche")} Alertes de marché</div><div class="kpi-valeur num">3</div><div class="kpi-pied">fonds en baisse de plus de 10 %</div></div>
    </div>
    <div class="grille g-2-1 mt anim-entree">
      <section class="carte verre">
        ${tete("Évolution des encours", "12 derniers mois", `<span class="pastille vert">${icone("tendance", "ico")} +${pct(K.encoursEvolution)}</span>`, "tendance")}
        ${courbe(K.encoursMois, MOIS, { format: (v) => `${v.toFixed(0)} M` })}
      </section>
      <section class="carte verre">
        ${tete("Répartition", "par support", "", "cible")}
        ${anneau(K.repartition)}
      </section>
    </div>
    <div class="grille g-2-1 mt">
      <section class="carte verre" style="padding:14px 10px">
        <div class="barre-outils" style="padding:0 6px">
          <div class="onglets">${Object.keys(types).map((t) => `<button class="onglet ${t === type ? "actif" : ""}" ${lien("portefeuille", { type: t })}>${t}</button>`).join("")}</div>
        </div>
        <table class="tableau tableau-mobile">
          <thead><tr><th>Client · contrat</th><th>Partenaire</th><th class="droite">Valeur</th><th class="droite">Perf.</th><th>Signal</th></tr></thead>
          <tbody>${contrats
            .slice(0, 14)
            .map((k) => {
              const pa = PARTENAIRES.find((x) => x.id === k.partenaire);
              const signal = anneesDepuis(k.ouverture) >= 8 && k.type === "Assurance-vie" ? `<span class="pastille bleu">8 ans ✓</span>` : k.uc < 30 && k.client.profil.risque >= 4 ? `<span class="pastille orange">Trop prudent pour le profil</span>` : k.uc > 85 && k.client.profil.risque <= 3 ? `<span class="pastille rouge">Hors profil</span>` : `<span class="pastille vert">Conforme</span>`;
              return `<tr class="cliquable" ${lien("clients", { id: k.client.id, onglet: "contrats" })}><td><div class="cellule-client">${avatar(k.client)}<div><strong>${pastilleNature(k.client)}${esc(nomComplet(k.client))}</strong><span>${esc(k.nom)}</span></div></div></td><td class="masquer-tel-cell"><span class="pastille"><span class="point" style="color:${pa.couleur}"></span>${pa.nom}</span></td><td class="droite num"><strong>${eur(k.valeur)}</strong></td><td class="droite hausse">+${pct(k.perf)}</td><td>${signal}</td></tr>`;
            })
            .join("")}</tbody>
        </table>
      </section>
      <div>
        <section class="carte verre">
          ${tete("Par partenaire", "", "", "carte")}
          <div class="liste">${parPart.map((pa) => `<div class="ligne" style="flex-wrap:wrap"><div class="ligne-texte"><strong>${pa.nom}</strong><span>${pa.type}</span></div><div class="ligne-droite num"><strong>${montantCourt(pa.total)}</strong></div><div class="jauge" style="width:100%;margin-top:4px"><i style="width:${(pa.total / maxP) * 100}%;background:${pa.couleur}"></i></div></div>`).join("")}</div>
        </section>
        <section class="carte verre mt">
          ${tete("Relevés des partenaires", "importés chaque nuit, sans ressaisie", "", "telecharger")}
          <p style="color:var(--texte-2);font-size:13px;margin:0 0 12px">Les fichiers des assureurs et sociétés de gestion sont lus automatiquement : valeurs, mouvements, versements programmés.</p>
          <button class="btn btn-or" style="width:100%" data-action="releves">${icone("rafraichir")} Importer maintenant</button>
          <div id="import-progression" class="liste mt"></div>
        </section>
      </div>
    </div>
  </div>`;
}

/* ================================================================ RADAR ================================================================ */

function radar() {
  const opps = opportunites();
  const collecte = opps.filter((o) => ["per", "avant70", "liquidites"].includes(o.id)).reduce((s, o) => s + o.total, 0);
  return `
  <div class="vue">
    <section class="carte verre bienvenue">
      <div class="radar-scan"><i style="left:30%;top:28%"></i><i style="left:66%;top:40%;animation-delay:.8s"></i><i style="left:44%;top:70%;animation-delay:1.6s"></i><i style="left:76%;top:68%;animation-delay:2.2s"></i></div>
      <div style="flex:1;min-width:220px"><h2>Radar d'opportunités</h2><p>Chaque nuit, le cockpit passe toutes vos fiches au crible de règles patrimoniales que vous choisissez. Vous voyez qui appeler, pourquoi, et combien c'est.</p></div>
      <div class="bienvenue-resume"><div class="resultat-sim" style="padding:14px 18px"><span style="font-size:12px;color:var(--texte-2)">Collecte potentielle identifiée</span><div class="grand-chiffre texte-or" style="font-size:30px">${meur(collecte)}</div></div></div>
    </section>
    <div class="grille g-2 mt anim-entree">
      ${opps
        .map(
          (o) => `<section class="carte verre">
        <div class="opp" style="background:none;border:0;padding:0"><span class="opp-ico" style="background:${COULEUR_OPP[o.couleur][0]};color:${COULEUR_OPP[o.couleur][1]}">${icone(o.ico)}</span><div style="flex:1;min-width:0"><h3>${esc(o.titre)}</h3><p>${esc(o.texte)}</p>
          <div class="opp-chiffres"><span><b>${o.clients.length}</b> clients</span><span><b>${montantCourt(o.total)}</b> ${esc(o.unite)}</span>${o.totalGain ? `<span><b>${montantCourt(o.totalGain)}</b> ${esc(o.gainTexte)}</span>` : ""}</div></div></div>
        <div style="display:flex;margin:12px 0 0;align-items:center;gap:8px;flex-wrap:wrap">
          <div style="display:flex">${o.clients.slice(0, 6).map((c, i) => `<span class="avatar" style="width:30px;height:30px;font-size:10.5px;margin-left:${i ? -8 : 0}px">${esc(c.initiales)}</span>`).join("")}</div>
          <span class="espace" style="flex:1"></span>
          <button class="btn btn-petit" data-action="voir-opp" data-opp="${o.id}">Voir les clients</button>
          <button class="btn btn-or btn-petit" data-action="campagne-opp" data-opp="${o.id}">${icone("envoyer")} Proposer à tous</button>
        </div>
      </section>`,
        )
        .join("")}
    </div>
  </div>`;
}

export function feuilleOpp(id, mode) {
  const o = opportunites().find((x) => x.id === id);
  if (mode === "liste")
    return `<div class="feuille-tete"><span class="carte-ico">${icone(o.ico)}</span><h2>${esc(o.titre)}</h2><button class="btn btn-icone" data-action="fermer">${icone("fermer")}</button></div>
    <div class="liste">${o.clients.map((c) => `<button class="ligne" ${lien("clients", { id: c.id })} data-fermer>${avatar(c)}<div class="ligne-texte"><strong>${pastilleNature(c)}${esc(nomComplet(c))}</strong><span>${c.age} ans · TMI ${c.tmi} % · ${esc(c.ville)}</span></div><div class="ligne-droite num"><strong>${montantCourt(o.potentiel(c))}</strong>${o.gain ? `<span>${eur(o.gain(c))} d'impôt en moins</span>` : ""}</div></button>`).join("")}</div>`;
  const c = o.clients[0];
  return `<div class="feuille-tete"><span class="carte-ico">${icone("envoyer")}</span><h2>Proposer à ${o.clients.length} clients</h2><button class="btn btn-icone" data-action="fermer">${icone("fermer")}</button></div>
  <p style="color:var(--texte-2);margin-top:0">Chaque client reçoit un e-mail personnalisé à vos couleurs, avec SES chiffres et votre lien de prise de rendez-vous. Aperçu pour ${esc(nomComplet(c))} :</p>
  <div class="carte verre" style="padding:18px;background:#fbf8f1;color:#11132f">
    <p style="margin:0 0 10px"><strong>Bonjour ${esc(c.prenom)},</strong></p>
    <p style="margin:0 0 10px;font-size:13.5px">${o.id === "per" ? `En versant <b>${eur(o.potentiel(c))}</b> sur un plan d'épargne retraite avant le 31 décembre, vous pourriez réduire votre impôt d'environ <b>${eur(o.gain(c))}</b>, tout en préparant votre retraite.` : esc(o.texte)}</p>
    <p style="margin:0 0 14px;font-size:13.5px">Je vous propose d'en parler 30 minutes, au cabinet ou en visio.</p>
    <span style="display:inline-block;padding:10px 18px;border-radius:999px;background:linear-gradient(120deg,#ffd565,#c7905e);color:#1a1306;font-weight:700;font-size:13px">Choisir un créneau</span>
    ${signatureMail()}
  </div>
  <div class="liste mt"><div class="ligne"><span class="carte-ico">${icone("eclair")}</span><div class="ligne-texte"><strong>Ensuite, automatiquement</strong><span style="white-space:normal">Relance à J+5 si pas d'ouverture · tâche « appeler » si pas de rendez-vous à J+10 · suivi des réponses dans chaque fiche.</span></div></div></div>
  <div class="pied-feuille"><button class="btn" data-action="fermer">Annuler</button><button class="btn btn-or" data-action="envoyer-campagne" data-n="${o.clients.length}">${icone("envoyer")} Envoyer à ${o.clients.length} clients</button></div>`;
}

/* ================================================================ SIMULATEURS ================================================================ */

const SIMS = [
  ["per", "Impôt + PER", "Économie d'impôt d'un versement", "euro"],
  ["succession", "Succession", "Droits à payer et optimisation", "famille"],
  ["ifi", "IFI", "Impôt sur la fortune immobilière", "maison"],
  ["demembrement", "Démembrement", "Valeur usufruit / nue-propriété", "document"],
  ["projection", "Projection", "Évolution d'une épargne", "tendance"],
];

function simulateurs(st, p) {
  const sim = p.sim ?? "per";
  const c = p.client ? clientParId(p.client) : clientParId("delorme");
  return `
  <div class="vue">
    <div class="sim-choix">${SIMS.map(([k, t, d, i]) => `<button class="sim-carte ${k === sim ? "actif" : ""}" ${lien("simulateurs", { sim: k, client: c.id })}><span class="carte-ico">${icone(i)}</span><strong>${t}</strong><span>${d}</span></button>`).join("")}</div>
    <div class="grille g-2">
      <section class="carte verre" id="sim-entrees">${entreesSim(sim, c)}</section>
      <section class="carte verre" id="sim-resultat"></section>
    </div>
    <p style="font-size:11.5px;color:var(--texte-3);margin-top:12px">Barèmes 2026 (revenus 2025) mis à jour chaque année. Estimation indicative, à valider lors de l'étude personnalisée.</p>
  </div>`;
}

function curseur(id, libelle, min, max, pas, valeur, format = "eur") {
  return `<div class="champ"><label>${libelle}<b data-sortie="${id}"></b></label><input type="range" id="${id}" min="${min}" max="${max}" step="${pas}" value="${valeur}" data-format="${format}"></div>`;
}

function entreesSim(sim, c) {
  const titre = (t) => tete(t, `Pré-rempli avec la fiche de ${esc(nomComplet(c))}`, "", "simulateurs");
  if (sim === "per") return titre("Impôt sur le revenu et PER") + curseur("rev", "Revenu net imposable du foyer", 20000, 500000, 1000, c.revenus) + curseur("parts", "Nombre de parts", 1, 5, 0.5, c.enfants ? 2 + Math.min(2, c.enfants.length) * 0.5 + Math.max(0, c.enfants.length - 2) : 1, "parts") + curseur("verse", "Versement sur le PER", 0, 40000, 500, 15000);
  if (sim === "succession") return titre("Succession en ligne directe") + curseur("patri", "Patrimoine transmis (hors résidence du conjoint)", 200000, 6000000, 50000, Math.min(6000000, Math.max(400000, bilan(c).net))) + curseur("enf", "Nombre d'enfants", 1, 5, 1, Math.max(1, c.enfants?.length ?? 2), "n") + curseur("av", "Dont logé en assurance-vie (versé avant 70 ans)", 0, 2000000, 25000, 600000) + curseur("don", "Donations faites de son vivant (plus de 15 ans avant)", 0, 1500000, 25000, 300000);
  if (sim === "ifi") return titre("Impôt sur la fortune immobilière") + curseur("rp", "Résidence principale", 0, 3000000, 10000, 1180000) + curseur("autres", "Autres biens immobiliers (dont SCPI)", 0, 5000000, 10000, 606000) + curseur("dettes", "Dettes immobilières déductibles", 0, 2000000, 10000, 168000);
  if (sim === "demembrement") return titre("Démembrement de propriété") + curseur("age", "Âge de l'usufruitier", 20, 95, 1, c.age) + curseur("valeur", "Valeur du bien", 50000, 3000000, 10000, 420000);
  return titre("Projection d'épargne") + curseur("cap", "Capital de départ", 0, 1000000, 5000, 100000) + curseur("mens", "Versement mensuel", 0, 5000, 50, 1000, "eur") + curseur("taux", "Rendement net annuel", 0, 8, 0.1, 4.5, "pct") + curseur("ans", "Durée", 1, 30, 1, 15, "ans");
}

export function calculerSim(sim, v) {
  if (sim === "per") {
    const r = S.simulerPer({ revenu: v.rev, parts: v.parts, couple: v.parts >= 2, versement: v.verse });
    return `${tete("Résultat", `TMI ${Math.round(r.tmi * 100)} % · plafond déductible ${eur(r.plafond)}`, "", "euro")}
      <div class="resultat-sim"><span style="color:var(--texte-2)">Impôt économisé cette année</span><div class="grand-chiffre texte-or num">${eur(r.economie)}</div><span style="font-size:12.5px;color:var(--texte-2)">Effort d'épargne réel : ${eur(r.effort)}</span></div>
      <div class="comparaison"><div><span>Impôt sans PER</span><strong class="num">${eur(r.avant)}</strong></div><div><span>Impôt avec PER</span><strong class="num hausse">${eur(r.apres)}</strong></div></div>
      ${actionsSim()}`;
  }
  if (sim === "succession") {
    const r = S.simulerSuccession({ patrimoine: v.patri, enfants: v.enf, assuranceVie: v.av, donations: v.don });
    return `${tete("Résultat", `${v.enf} enfant(s) · abattement de 100 000 € chacun`, "", "famille")}
      <div class="resultat-sim"><span style="color:var(--texte-2)">Droits évités grâce à l'organisation</span><div class="grand-chiffre texte-or num">${eur(r.gain)}</div></div>
      <div class="comparaison"><div><span>Sans préparation</span><strong class="num baisse">${eur(r.sansOptim)}</strong></div><div><span>Avec assurance-vie + donations</span><strong class="num hausse">${eur(r.avecOptim)}</strong></div></div>
      <div class="liste mt"><div class="ligne"><div class="ligne-texte"><strong>Assurance-vie</strong><span>152 500 € par bénéficiaire hors droits</span></div><div class="ligne-droite num"><strong>${eur(r.droitsAv)}</strong></div></div><div class="ligne"><div class="ligne-texte"><strong>Succession restante</strong><span>barème en ligne directe</span></div><div class="ligne-droite num"><strong>${eur(r.droitsSucc + r.droitsDon)}</strong></div></div></div>
      ${actionsSim()}`;
  }
  if (sim === "ifi") {
    const r = S.simulerIfi({ residence: v.rp, autres: v.autres, dettes: v.dettes });
    return `${tete("Résultat", "Abattement de 30 % sur la résidence principale", "", "maison")}
      <div class="resultat-sim"><span style="color:var(--texte-2)">${r.assujetti ? "IFI estimé" : "Non assujetti"}</span><div class="grand-chiffre texte-or num">${r.assujetti ? eur(r.impot) : "0 €"}</div><span style="font-size:12.5px;color:var(--texte-2)">Patrimoine immobilier net taxable : ${eur(r.net)}</span></div>
      <div class="comparaison"><div><span>Seuil d'assujettissement</span><strong>1 300 000 €</strong></div><div><span>${r.assujetti ? "Leviers" : "Marge avant le seuil"}</span><strong class="num">${r.assujetti ? "Dettes, démembrement, SCPI à crédit" : eur(r.marge)}</strong></div></div>
      ${actionsSim()}`;
  }
  if (sim === "demembrement") {
    const u = S.usufruit(v.age);
    return `${tete("Résultat", "Barème fiscal de l'article 669 du CGI", "", "document")}
      <div class="comparaison" style="margin-top:0"><div><span>Usufruit (${Math.round(u * 100)} %)</span><strong class="num">${eur(v.valeur * u)}</strong></div><div><span>Nue-propriété (${Math.round((1 - u) * 100)} %)</span><strong class="num texte-or">${eur(v.valeur * (1 - u))}</strong></div></div>
      <div class="bilan-barre mt" style="height:44px"><div style="flex:${u};background:#8cc8ff">Usufruit</div><div style="flex:${1 - u};background:#e8c07a">Nue-propriété</div></div>
      <p style="color:var(--texte-2);font-size:13px">En donnant la nue-propriété, seuls ${Math.round((1 - u) * 100)} % de la valeur sont taxés ; au décès, l'enfant récupère la pleine propriété sans droits supplémentaires.</p>
      ${actionsSim()}`;
  }
  const pts = S.projeter({ capital: v.cap, mensuel: v.mens, taux: v.taux, annees: v.ans });
  const fin = pts.at(-1);
  return `${tete("Résultat", `Dans ${v.ans} ans`, "", "tendance")}
    <div class="resultat-sim"><span style="color:var(--texte-2)">Capital estimé</span><div class="grand-chiffre texte-or num">${eur(fin.valeur)}</div><span style="font-size:12.5px;color:var(--texte-2)">dont ${eur(fin.valeur - fin.verse)} de gains · ${eur(fin.verse)} versés</span></div>
    <div class="mt">${courbe(pts.map((x) => x.valeur), pts.map((x) => `${x.annee} a`), { hauteur: 160, format: (n) => keur(n) })}</div>
    ${actionsSim()}`;
}

function actionsSim() {
  return `<div class="pied-feuille" style="justify-content:flex-start"><button class="btn" data-action="toast" data-texte="Étude PDF générée à vos couleurs et rangée dans la fiche">${icone("pdf")} Étude PDF</button><button class="btn btn-or" data-action="toast" data-texte="Étude envoyée au client avec un lien de rendez-vous">${icone("envoyer")} Envoyer au client</button></div>`;
}

/* ================================================================ CONFORMITÉ ================================================================ */

function conformite(st) {
  const s = syntheseConformite();
  const score = Math.round((s.complets / s.total) * 100);
  const lignes = [
    ["Connaissance client de plus de 24 mois", s.kyc, "Questionnaire de mise à jour envoyé (signature électronique)", "orange"],
    ["Profil sans préférences de durabilité", s.profil, "Complément de questionnaire envoyé", "orange"],
    ["Déclaration d'adéquation manquante", s.adequation, "Document pré-rempli à partir de la fiche", "rouge"],
    ["Pièce d'identité expirée", s.identite, "Demande de dépôt dans l'espace sécurisé", "rouge"],
    ["Vigilance renforcée (LCB-FT)", s.renforcee.map((x) => x), "Justificatif d'origine des fonds à archiver", "violet"],
  ];
  return `
  <div class="vue">
    <div class="grille g-1-2">
      <section class="carte verre" style="text-align:center">
        ${tete("Dossiers réglementaires", "MIF 2 · DDA · LCB-FT", "", "conformite")}
        <div style="display:grid;place-items:center">${jaugeRonde(score).replace('style="width:110px;height:110px;flex:none"', 'style="width:170px;height:170px"')}</div>
        <p style="color:var(--texte-2);font-size:13px">${s.complets} dossiers complets sur ${s.total}. Chaque pièce manquante est demandée automatiquement au client.</p>
        <button class="btn btn-or" style="width:100%" data-action="toast" data-texte="Export pour contrôle prêt : un dossier PDF par client + registres">${icone("telecharger")} Préparer un contrôle (AMF, association)</button>
      </section>
      <section class="carte verre">
        ${tete("À régulariser", "le cockpit s'en occupe : vous validez", "", "eclair")}
        <div class="liste">${lignes
          .map(
            ([t, l, a, coul]) => `<div class="ligne"><span class="pastille ${coul}" style="min-width:38px;justify-content:center">${l.length}</span><div class="ligne-texte"><strong>${t}</strong><span>${a}</span></div><div class="masquer-tel" style="display:flex">${l
              .slice(0, 4)
              .map(({ c }, i) => `<span class="avatar" style="width:28px;height:28px;font-size:10px;margin-left:${i ? -8 : 0}px">${esc(c.initiales)}</span>`)
              .join("")}</div></div>`,
          )
          .join("")}</div>
      </section>
    </div>
    <section class="carte verre mt">
      ${tete("Parcours d'entrée en relation", "du premier contact au dossier complet, sans papier", `<button class="btn btn-petit" data-aller-anim="conformite">${icone("film")} Animation</button>`, "signature")}
      <div class="etapes">${[
        ["Document d'entrée en relation", "Envoyé avec la confirmation du 1er rendez-vous"],
        ["Recueil d'informations", "Formulaire en ligne, pré-remplit la fiche"],
        ["Profil investisseur", "Questionnaire MIF 2 + durabilité, score calculé"],
        ["Lettre de mission", "Honoraires et missions, signée en ligne"],
        ["Déclaration d'adéquation", "Générée depuis la recommandation"],
        ["Archivage", "Tout est rangé, horodaté, prêt pour un contrôle"],
      ]
        .map(([t, d], i) => `<div class="etape ok"><span class="pastille or">Étape ${i + 1}</span><strong>${t}</strong><span>${d}</span></div>`)
        .join("")}</div>
    </section>
    <div class="grille g-2 mt">
      <section class="carte verre">
        ${tete("Signatures électroniques", "valeur légale, suivi en temps réel", "", "signature")}
        <div class="liste">${st.signatures.map((x) => `<div class="ligne"><span class="carte-ico">${icone("document")}</span><div class="ligne-texte"><strong>${esc(x.doc)}</strong><span>${pastilleNature(clientDe(x))}${esc(x.client)} · envoyé ${esc(x.envoye)}</span></div><span class="pastille ${x.etat.startsWith("Signé") ? "vert" : x.etat.startsWith("Relancé") ? "orange" : "bleu"}">${esc(x.etat)}</span></div>`).join("")}</div>
      </section>
      <section class="carte verre">
        ${tete("Registres et obligations du cabinet", "", "", "document")}
        <div class="liste">${[
          ["Registre des réclamations", "0 réclamation ouverte · délai de réponse suivi", "vert", "À jour"],
          ["Rapport annuel des coûts et frais", "Envoi automatique à chaque client en février", "bleu", "Programmé"],
          ["Conservation des données (5 ans)", "Suppression automatique en fin de délai", "vert", "Actif"],
          ["Statuts et assurances du cabinet", "CIF, courtage, ORIAS, RC pro : échéances suivies", "orange", "RC pro : mars"],
          ["Demandes RGPD des clients", "Accès, rectification, suppression en 1 clic", "vert", "0 en cours"],
        ]
          .map(([t, d, c, e]) => `<div class="ligne"><div class="ligne-texte"><strong>${t}</strong><span>${d}</span></div><span class="pastille ${c}">${e}</span></div>`)
          .join("")}</div>
      </section>
    </div>
  </div>`;
}

/* ================================================================ RÉMUNÉRATION ================================================================ */

function remuneration() {
  const types = [
    { libelle: "Commissions sur encours", valeur: 312600, couleur: "#e8c07a" },
    { libelle: "Honoraires de conseil", valeur: 128400, couleur: "#c7905e" },
    { libelle: "Droits d'entrée", valeur: 71400, couleur: "#8cc8ff" },
    { libelle: "Immobilier et SCPI", valeur: 76000, couleur: "#f0a37a" },
  ];
  const total = types.reduce((s, t) => s + t.valeur, 0);
  return `
  <div class="vue">
    <div class="grille g-4 anim-entree">
      <div class="carte verre kpi"><div class="kpi-libelle">${icone("remuneration")} Rémunération 2026</div><div class="kpi-valeur num">${keur(total)}</div><div class="kpi-pied">Objectif ${keur(K.remunerationObjectif)}</div><div class="jauge"><i style="width:${(total / K.remunerationObjectif) * 100}%"></i></div></div>
      <div class="carte verre kpi"><div class="kpi-libelle">${icone("tendance")} Récurrent annuel</div><div class="kpi-valeur num">${keur(398000)}</div><div class="kpi-pied">encours + abonnements de conseil</div></div>
      <div class="carte verre kpi"><div class="kpi-libelle">${icone("document")} Commissions à recevoir</div><div class="kpi-valeur num">${keur(48200)}</div><div class="kpi-pied">rapprochées automatiquement</div></div>
      <div class="carte verre kpi"><div class="kpi-libelle">${icone("euro")} Résultat estimé</div><div class="kpi-valeur num">${keur(341000)}</div><div class="kpi-pied">après ${keur(247400)} de charges</div></div>
    </div>
    <div class="grille g-2-1 mt">
      <section class="carte verre">
        ${tete("Par mois", "en milliers d'euros", "", "portefeuille")}
        <div class="barres">${K.remunerationMois.map((v, i) => `<div><i style="height:${(v / 70) * 100}%;animation-delay:${i * 0.04}s"></i><span>${MOIS[i].replace(".", "")}</span></div>`).join("")}</div>
      </section>
      <section class="carte verre">${tete("Par nature", "", "", "cible")}${anneau(types.map((t) => ({ ...t, affiche: keur(t.valeur) })))}</section>
    </div>
    <div class="grille g-2 mt">
      <section class="carte verre">
        ${tete("Factures d'honoraires", "émises automatiquement après encaissement", "", "document")}
        <div class="liste">${[
          ["2026-0142", "Philippe & Claire DELORME", "Abonnement conseil · T4", 900, "Payée · prélèvement"],
          ["2026-0141", "Antoine MARCHETTI", "Mission cession · acompte 2", 5000, "Payée · virement"],
          ["2026-0140", "Sophie NGUYEN", "Bilan patrimonial", 1200, "Payée · carte"],
          ["2026-0139", "Karim & Lucie RAHMANI", "Étude prévoyance", 1500, "Envoyée"],
        ]
          .map(([n, c, o, m, e]) => `<div class="ligne"><div class="ligne-texte"><strong>${c}</strong><span>N° ${n} · ${o}</span></div><div class="ligne-droite num"><strong>${eur(m)}</strong><span>${e}</span></div></div>`)
          .join("")}</div>
      </section>
      <section class="carte verre">
        ${tete("Par partenaire", "commissions 2026", "", "carte")}
        <div class="liste">${PARTENAIRES.map((p, i) => `<div class="ligne"><span class="point" style="color:${p.couleur}"></span><div class="ligne-texte"><strong>${p.nom}</strong><span>${p.type}</span></div><div class="ligne-droite num"><strong>${keur([162000, 118000, 64000, 76000, 21000, 18400][i])}</strong><span class="hausse">reçu ✓</span></div></div>`).join("")}</div>
      </section>
    </div>
  </div>`;
}

/* ================================================================ RELANCES ET CAMPAGNES ================================================================ */

function communication(st) {
  return `
  <div class="vue">
    <div class="grille g-3 anim-entree">
      <div class="carte verre kpi"><div class="kpi-libelle">${icone("eclair")} Automatismes actifs</div><div class="kpi-valeur">${st.automatismes.filter((a) => a.actif).length} / ${st.automatismes.length}</div><div class="kpi-pied">${st.automatismes.reduce((s, a) => s + (a.actif ? a.mois : 0), 0)} envois ce mois</div></div>
      <div class="carte verre kpi"><div class="kpi-libelle">${icone("mail")} Taux d'ouverture moyen</div><div class="kpi-valeur">58 %</div><div class="kpi-pied">moyenne du secteur : 25 %</div></div>
      <div class="carte verre kpi"><div class="kpi-libelle">${icone("agenda")} Rendez-vous générés</div><div class="kpi-valeur">21</div><div class="kpi-pied">par les campagnes de l'année</div></div>
    </div>
    <div class="grille g-2-1 mt">
      <section class="carte verre">
        ${tete("Relances automatiques", "réglées une fois, elles tournent toute l'année", `<button class="btn btn-petit" data-aller-anim="revue">${icone("film")} Animation</button>`, "eclair")}
        <div class="liste">${st.automatismes
          .map(
            (a, i) => `<div class="ligne"><button class="ligne-texte texte-auto" data-action="auto-texte" data-i="${i}" title="Lire et modifier le texte"><strong>${esc(a.titre)}</strong><span style="white-space:normal">Quand : ${esc(a.regle)}<br>Action : ${esc(a.action)}</span><span class="lien-modifier">${icone("mail")} Lire et modifier le texte</span></button><div class="ligne-droite" style="display:flex;align-items:center;gap:10px"><span class="masquer-tel" style="font-size:11.5px;color:var(--texte-3)">${a.actif ? `${a.mois} ce mois` : ""}</span><button class="interrupteur ${a.actif ? "actif" : ""}" data-action="basculer" data-i="${i}" aria-label="Activer"></button></div></div>`,
          )
          .join("")}</div>
      </section>
      <div>
        <section class="carte verre">
          ${tete("Campagnes", "", `<button class="btn btn-or btn-petit" data-action="toast" data-texte="Nouvelle campagne : choisissez la cible">${icone("plus")} Nouvelle</button>`, "campagnes")}
          <div class="liste">${CAMPAGNES.map((c) => `<div class="ligne" style="flex-wrap:wrap"><div class="ligne-texte" style="flex-basis:100%"><strong style="white-space:normal">${esc(c.titre)}</strong><span>${dateFr(c.date)} · ${c.envoyes} destinataires</span></div><span class="pastille">${Math.round((c.ouverts / c.envoyes) * 100)} % ouvert</span><span class="pastille bleu">${c.clics} clics</span><span class="pastille or">${c.rdv} rendez-vous</span></div>`).join("")}</div>
        </section>
        <section class="carte verre mt">
          ${tete("Cibles prêtes à l'emploi", "", "", "cible")}
          <div style="display:flex;flex-wrap:wrap;gap:6px">${["TMI ≥ 41 % sans PER", "Clients de 60 ans et plus", "Chefs d'entreprise", "Assurance-vie > 8 ans", "Profil dynamique", "Professions de santé", "Pas vus depuis 12 mois"].map((t) => `<span class="pastille or" style="padding:5px 11px">${t}</span>`).join("")}</div>
        </section>
      </div>
    </div>
  </div>`;
}

/* ================================================================ SITE ET VISIBILITÉ ================================================================ */

function site() {
  const max = Math.max(...K.sources.map((s) => s.valeur));
  return `
  <div class="vue">
    <div class="grille g-4 anim-entree">
      <div class="carte verre kpi"><div class="kpi-libelle">${icone("globe")} Visites du site (30 j)</div><div class="kpi-valeur">4 820</div><div class="kpi-pied"><span class="hausse">+22 %</span></div></div>
      <div class="carte verre kpi"><div class="kpi-libelle">${icone("demandes")} Demandes reçues</div><div class="kpi-valeur">37</div><div class="kpi-pied">dont 11 prioritaires</div></div>
      <div class="carte verre kpi"><div class="kpi-libelle">${icone("clients")} Devenus clients</div><div class="kpi-valeur">9</div><div class="kpi-pied">taux de transformation 24 %</div></div>
      <div class="carte verre kpi"><div class="kpi-libelle">${icone("euro")} Coût par nouveau client</div><div class="kpi-valeur">142 €</div><div class="kpi-pied">publicité comprise</div></div>
    </div>
    <div class="grille g-2 mt">
      <section class="carte verre">
        ${tete("D'où viennent vos clients", "part des nouveaux clients 2026", "", "cible")}
        <div class="liste">${K.sources.map((s) => `<div class="ligne" style="flex-wrap:wrap"><div class="ligne-texte"><strong>${s.libelle}</strong></div><strong>${s.valeur} %</strong><div class="jauge" style="width:100%"><i style="width:${(s.valeur / max) * 100}%"></i></div></div>`).join("")}</div>
      </section>
      <section class="carte verre">
        ${tete("Articles du site", "rédigés à l'avance, publiés automatiquement", "", "document")}
        <div class="liste">${ARTICLES.map((a) => `<div class="ligne"><div class="ligne-texte"><strong>${esc(a.titre)}</strong><span>${dateFr(a.date)} · ${a.statut === "Publié" ? `${a.vues} lectures · ${a.demandes} demandes` : "publication automatique"}</span></div><span class="pastille ${a.statut === "Publié" ? "vert" : "bleu"}">${a.statut}</span></div>`).join("")}</div>
      </section>
    </div>
  </div>`;
}

/* ================================================================ RÉGLAGES ================================================================ */

function reglages(st, p = {}) {
  const onglet = p.onglet ?? "cabinet";
  const connexions = [
    ["agenda", "Agenda Google / Outlook", "Synchronisation dans les deux sens", true],
    ["mail", "E-mails et SMS", "Envoyés depuis l'adresse du cabinet", true],
    ["signature", "Signature électronique", "Lettres de mission, adéquations, arbitrages", true],
    ["document", "Facturation", "Factures d'honoraires conformes, envoyées seules", true],
    ["carte", "Paiement des honoraires", "Carte, prélèvement SEPA pour les abonnements", true],
    ["telecharger", "Relevés des partenaires", "Import des fichiers assureurs et sociétés de gestion", true],
    ["globe", "Site internet", "Formulaires, prise de rendez-vous, articles", true],
    ["visio", "Visio Teams et Google Meet", "Lien créé à chaque rendez-vous", true],
  ];
  const ONGLETS = [["cabinet", "Mon cabinet"], ["securite", "Sécurité"], ["notifications", "Notifications"], ["connexions", "Connexions"], ["comptable", "Accès comptable"]];
  const barre = `<div class="onglets" style="margin-bottom:14px">${ONGLETS.map(([k, t]) => `<button class="onglet ${k === onglet ? "actif" : ""}" ${lien("reglages", { onglet: k })}>${t}</button>`).join("")}</div>`;
  const ligne = (titre, texte, droite = "", ico = "") => `<div class="ligne">${ico ? `<span class="carte-ico">${icone(ico)}</span>` : ""}<div class="ligne-texte"><strong>${titre}</strong><span style="white-space:normal">${texte}</span></div>${droite}</div>`;
  const inter = (cle, actif) => `<button class="interrupteur ${actif ? "actif" : ""}" data-action="notif-basculer" data-cle="${cle}" aria-label="Activer"></button>`;
  if (onglet === "comptable") return `<div class="vue">${barre}${ongletComptable()}</div>`;
  if (onglet === "connexions")
    return `<div class="vue">${barre}
    <section class="carte verre">
      ${tete("Connexions", "tout est relié, rien à ressaisir", "", "lien")}
      <div class="grille g-4" style="gap:10px">${connexions.map(([i, t, d, ok]) => `<div class="opp" style="padding:12px"><span class="carte-ico">${icone(i)}</span><div style="min-width:0"><h3 style="font-size:13px">${t}</h3><p style="margin:2px 0 6px;font-size:11.5px">${d}</p><span class="pastille ${ok ? "vert" : ""}">${ok ? "Connecté" : "À relier"}</span></div></div>`).join("")}</div>
    </section></div>`;
  if (onglet === "securite")
    return `<div class="vue">${barre}
    <div class="grille g-2">
      <section class="carte verre">
        ${tete("Mon code et Face ID", "", "", "cadenas")}
        <div class="liste">
          ${ligne("Code à 6 chiffres", "Blocage après 5 erreurs · alerte par e-mail", `<button class="btn btn-petit" data-action="changer-code">Changer le code</button>`, "cadenas")}
          ${ligne("Face ID / empreinte", "Entrer sans taper le code, sur cet appareil", `<button class="btn btn-petit btn-or" data-action="ajouter-appareil">${icone("faceid")} Ajouter cet appareil</button>`, "faceid")}
        </div>
      </section>
      <section class="carte verre">
        ${tete("Appareils autorisés", `${st.appareils.length} appareil${st.appareils.length > 1 ? "s" : ""}`, "", "ordinateur")}
        <div class="liste">${st.appareils.map((a, i) => ligne(esc(a.nom), esc(a.detail), `<button class="btn btn-petit" data-action="retirer-appareil" data-i="${i}">Retirer</button>`, a.ico)).join("") || `<p style="color:var(--texte-3)">Aucun appareil.</p>`}</div>
      </section>
    </div>
    <section class="carte verre mt">
      ${tete("Mes données", "", "", "bouclier")}
      <div class="liste">
        ${ligne("Sauvegardes", "Chaque nuit, copie de secours verrouillée 30 jours", `<span class="pastille vert">04:00 ✓</span>`)}
        ${ligne("Données hébergées en Europe", "Belgique et Allemagne · chiffrées", `<span class="pastille vert">RGPD</span>`)}
        ${ligne("Export complet de vos données", "À tout moment, en un clic", `<button class="btn btn-petit" data-action="toast" data-texte="Export lancé : vous recevez le fichier par e-mail">${icone("telecharger")} Télécharger</button>`)}
      </div>
    </section></div>`;
  if (onglet === "notifications") {
    const n = st.notifReglages;
    return `<div class="vue">${barre}
    <div class="grille g-2">
      <section class="carte verre">
        ${tete("Sur cet appareil", "", "", "cloche")}
        <div class="liste">
          ${ligne("Notifications", n.appareil ? "Activées : vous êtes prévenu même cockpit fermé" : "Pour être prévenu même quand le cockpit est fermé", n.appareil ? `<span class="pastille vert">Activées</span>` : `<button class="btn btn-petit btn-or" data-action="notif-activer">Activer sur cet appareil</button>`, "mobile")}
          ${ligne("Ne pas me déranger", "De 21 h à 8 h : rien ne sonne, tout vous attend le matin", inter("nuit", n.nuit), "lune")}
          ${ligne("Afficher la cloche", "En haut de l'écran : ce qui vous attend", inter("cloche", n.cloche), "cloche")}
        </div>
        <p style="margin:12px 0 0;font-size:12px;color:var(--texte-3)">Sur iPhone : ajoutez d'abord le cockpit à l'écran d'accueil (Partager → « Sur l'écran d'accueil »).</p>
      </section>
      <section class="carte verre">
        ${tete("Me prévenir quand…", "", "", "eclair")}
        <div class="liste">
          ${ligne("Une demande arrive du site", "Avec le score d'intérêt", inter("demande", n.demande), "demandes")}
          ${ligne("Un client réserve un rendez-vous", "En ligne, depuis votre site ou un e-mail", inter("resa", n.resa), "agenda")}
          ${ligne("Un document est signé", "Lettre de mission, adéquation, arbitrage", inter("signature", n.signature), "signature")}
          ${ligne("Une commission arrive", "Rapprochée avec le relevé du partenaire", inter("commission", n.commission), "euro")}
        </div>
      </section>
    </div></div>`;
  }
  return `
  <div class="vue">${barre}
    <div class="grille g-2">
      <section class="carte verre">
        ${tete("Mon cabinet", "", "", "reglages")}
        <img src="assets/${st.theme === "jour" ? "logo" : "logo-clair"}.svg" alt="Leader Patrimoine" style="width:100%;max-width:340px;display:block;margin:4px 0 16px">
        <div class="liste">
          <div class="ligne"><div class="ligne-texte"><strong>Couleurs</strong><span>Marine profond et or, reprises du logo</span></div><span style="display:flex;gap:6px"><i style="width:22px;height:22px;border-radius:50%;background:#0f112d;border:1px solid var(--lisere)"></i><i style="width:22px;height:22px;border-radius:50%;background:var(--or-degrade)"></i></span></div>
          <div class="ligne"><div class="ligne-texte"><strong>Apparence</strong><span>Verre · nuit ou jour</span></div><button class="btn btn-petit" data-action="theme">${st.theme === "jour" ? icone("lune") + " Nuit" : icone("soleil") + " Jour"}</button></div>
          <div class="ligne"><div class="ligne-texte"><strong>Statuts réglementaires</strong><span>CIF · courtier · IOBSP · carte T · ORIAS n° ${esc(signature().orias)}</span></div></div>
          <div class="ligne"><div class="ligne-texte"><strong>Barèmes fiscaux 2026</strong><span>Mis à jour chaque année par l'agence</span></div><span class="pastille vert">À jour</span></div>
        </div>
      </section>
      <section class="carte verre">
        ${tete("Mon profil", "affiché en bas du menu", "", "clients")}
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:14px">
          ${avatarProfil("grand")}
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <label class="btn btn-petit btn-or" style="cursor:pointer">${icone("plus")} Choisir une photo<input type="file" accept="image/*" id="photo-profil" hidden></label>
            ${photoProfil() ? `<button class="btn btn-petit" data-action="photo-retirer">Retirer</button>` : ""}
          </div>
        </div>
        <label class="champ-reglage">Prénom affiché<input id="prenom-profil" value="${esc(st.prenom)}" autocomplete="off"></label>
        <div style="display:flex;justify-content:flex-end;margin-top:10px"><button class="btn btn-petit" data-action="profil-ok">Enregistrer</button></div>
      </section>
    </div>
    <div class="grille g-2 mt">
      <section class="carte verre">
        ${tete("Signature des e-mails", "ajoutée au bas de chaque e-mail", `<button class="btn btn-petit" data-action="signature-modifier">Modifier</button>`, "mail")}
        <div class="apercu-signature">${signatureMail()}</div>
      </section>
      <section class="carte verre">
        ${tete("Honoraires", "vos tarifs TTC", `<button class="btn btn-petit" data-action="honoraires-modifier">Modifier</button>`, "euro")}
        <div class="liste">${TARIFS.map(([t, v]) => `<div class="ligne"><div class="ligne-texte"><strong>${t}</strong></div><div class="ligne-droite"><strong class="num">${v}</strong></div></div>`).join("")}</div>
        <p style="margin:10px 0 0;font-size:12px;color:var(--texte-3)">Les factures d'honoraires partent toutes seules quand vous validez un paiement.</p>
      </section>
    </div>
  </div>`;
}

/** Réglages → Accès comptable : un lien personnel + un code, en lecture seule, limité à la rémunération. */
function ongletComptable() {
  const a = acces();
  const lienCourt = lienComptable(a.jeton).replace(/^https?:\/\//, "").replace(/#(.{6}).*$/, "#$1…");
  const voit = [
    [true, "Commissions par partenaire et par trimestre"],
    [true, "Factures d'honoraires (HT, TVA, TTC)"],
    [true, "Fichier à télécharger pour la comptabilité"],
    [false, "Fiches clients, patrimoine, contrats et documents"],
    [false, "Modifier quoi que ce soit"],
  ];
  return `
  <div class="grille g-2">
    <section class="carte verre">
      ${tete("Votre comptable", "", `<span class="pastille ${a.actif && !a.expire ? "vert" : "rouge"}"><span class="point"></span>${!a.actif ? "Accès coupé" : a.expire ? "Lien expiré" : "Accès ouvert"}</span>`, "remuneration")}
      <div class="liste">
        <div class="ligne"><span class="avatar" style="width:34px;height:34px;font-size:11px">CM</span><div class="ligne-texte"><strong>${COMPTABLE.nom}</strong><span>${COMPTABLE.fonction} · ${COMPTABLE.cabinet}</span></div></div>
        <div class="ligne"><span class="carte-ico">${icone("lien")}</span><div class="ligne-texte"><strong>Son lien de connexion</strong><span>${esc(lienCourt)}</span></div><button class="btn btn-petit" data-action="comptable-copier">Copier</button></div>
        <div class="ligne"><span class="carte-ico">${icone("horloge")}</span><div class="ligne-texte"><strong>Validité du lien</strong><span>${a.expire ? "Expiré le " + finLisible(a.fin) : a.fin === null ? "Sans limite de durée" : "Jusqu'au " + finLisible(a.fin)}</span></div><select class="choix-duree" id="duree-comptable" aria-label="Validité du lien">${DUREES.map(([d, t]) => `<option value="${d}" ${d === a.duree ? "selected" : ""}>${t}</option>`).join("")}</select></div>
        <div class="ligne"><span class="carte-ico">${icone("cadenas")}</span><div class="ligne-texte"><strong>Code d'accès</strong><span class="num">● ● ● ● ● ●  · 6 chiffres choisis par vous</span></div><button class="btn btn-petit" data-action="comptable-code">Modifier</button></div>
        <div class="ligne"><span class="carte-ico">${icone("mail")}</span><div class="ligne-texte"><strong>Code de confirmation par e-mail</strong><span style="white-space:normal">À chaque connexion, un code est envoyé à ${COMPTABLE.mail}. Recommandé.</span></div><button class="interrupteur ${a.codeMail ? "actif" : ""}" data-action="comptable-mail" aria-label="Code par e-mail"></button></div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
        <button class="btn btn-or" data-action="comptable-envoyer">${icone("envoyer")} Envoyer le lien</button>
        <button class="btn" data-action="comptable-ouvrir">${icone("ordinateur")} Voir son espace</button>
      </div>
    </section>
    <section class="carte verre">
      ${tete("Ce que voit votre comptable", "lecture seule", "", "bouclier")}
      <div class="liste">${voit.map(([ok, t]) => `<div class="ligne"><span class="pastille ${ok ? "vert" : "rouge"}" style="width:24px;height:24px;padding:0;justify-content:center">${icone(ok ? "coche" : "fermer")}</span><div class="ligne-texte"><strong style="font-weight:550;white-space:normal">${t}</strong></div></div>`).join("")}</div>
      <p style="margin:12px 0 0;font-size:12px;color:var(--texte-3)">Bloqué après ${5} codes faux · déconnexion automatique après 15 minutes</p>
    </section>
  </div>
  <div class="grille g-2 mt">
    <section class="carte verre">
      ${tete("Ses dernières connexions", "", "", "horloge")}
      <div class="liste">${CONNEXIONS.map((c) => `<div class="ligne"><div class="ligne-texte"><strong>${c.quand}</strong><span>${c.detail}</span></div></div>`).join("")}</div>
    </section>
    <section class="carte verre">
      ${tete("En cas de besoin", "", "", "cadenas")}
      <div class="liste">
        <div class="ligne"><div class="ligne-texte"><strong>Changer le lien</strong><span style="white-space:normal">L'ancien lien ne marche plus, tout de suite.</span></div><button class="btn btn-petit" data-action="comptable-lien">${icone("rafraichir")} Changer</button></div>
        <div class="ligne"><div class="ligne-texte"><strong>${a.actif ? "Couper l'accès" : "Rouvrir l'accès"}</strong><span style="white-space:normal">${a.actif ? "Fin de mission, changement de comptable…" : "Le même lien et le même code remarchent."}</span></div><button class="btn btn-petit" data-action="comptable-couper" style="${a.actif ? "color:var(--rouge)" : ""}">${a.actif ? "Couper" : "Rouvrir"}</button></div>
      </div>
    </section>
  </div>`;
}

/* ================================================================ Registre des écrans ================================================================ */

export const VUES = {
  accueil: { titre: "Accueil", sous: "Vendredi 20 novembre 2026", ico: "accueil", html: accueil, groupe: "Pilotage" },
  agenda: { titre: "Agenda", sous: "Rendez-vous, rappels et préparation automatiques", ico: "agenda", html: agenda, groupe: "Pilotage" },
  demandes: { titre: "Demandes", sous: "Reçues depuis votre site, qualifiées automatiquement", ico: "demandes", html: demandes, groupe: "Pilotage" },
  clients: { titre: "Clients", sous: "Fiches patrimoniales complètes", ico: "clients", html: clients, groupe: "Clientèle" },
  portefeuille: { titre: "Encours et contrats", sous: "Tous les contrats, tous les partenaires", ico: "portefeuille", html: portefeuille, groupe: "Clientèle" },
  radar: { titre: "Opportunités", sous: "Qui appeler, pourquoi, combien", ico: "radar", html: radar, groupe: "Clientèle" },
  simulateurs: { titre: "Simulateurs", sous: "Impôt, PER, succession, IFI, démembrement", ico: "simulateurs", html: simulateurs, groupe: "Conseil" },
  conformite: { titre: "Conformité", sous: "Dossiers réglementaires et signatures, toujours prêts", ico: "conformite", html: conformite, groupe: "Conseil" },
  remuneration: { titre: "Rémunération", sous: "Commissions, honoraires, factures", ico: "remuneration", html: remuneration, groupe: "Cabinet" },
  communication: { titre: "Relances", sous: "Le suivi client qui tourne tout seul", ico: "campagnes", html: communication, groupe: "Cabinet" },
  site: { titre: "Mon site", sous: "D'où viennent vos clients", ico: "site", html: site, groupe: "Cabinet" },
  reglages: { titre: "Réglages", sous: "Cabinet, sécurité, connexions", ico: "reglages", html: reglages, groupe: "Cabinet" },
};
