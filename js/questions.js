/**
 * Page « Questions du rendez-vous » : Vincent coche et écrit pendant le rendez-vous, tout s'enregistre tout seul
 * (serveur local → `prospects/leader-patrimoine/REPONSES-RENDEZ-VOUS.md`). Copie de secours dans le navigateur.
 */
import { QUESTIONS, reponsesEnTexte } from "./questions-donnees.mjs";

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const SECOURS = "lp-questionnaire";
let rep = {};

function champ(q, c) {
  const v = rep[q.id]?.[c.id] ?? (c.type === "coches" ? [] : (c.valeur ?? ""));
  const nom = `${q.id}.${c.id}`;
  if (c.type === "choix" || c.type === "coches")
    return `<div class="q-champ"><span class="q-libelle">${esc(c.libelle)}</span><div class="q-puces">${c.options
      .map((o) => {
        const actif = c.type === "choix" ? v === o : v.includes(o);
        return `<button type="button" class="q-puce ${actif ? "actif" : ""}" data-nom="${nom}" data-type="${c.type}" data-valeur="${esc(o)}">${c.type === "coches" ? `<i></i>` : ""}${esc(o)}</button>`;
      })
      .join("")}</div></div>`;
  if (c.type === "note") return `<label class="q-champ"><span class="q-libelle">${esc(c.libelle)}</span><textarea rows="3" data-nom="${nom}" placeholder="${esc(c.aide ?? "")}">${esc(v)}</textarea></label>`;
  return `<label class="q-champ"><span class="q-libelle">${esc(c.libelle)}</span><input data-nom="${nom}" value="${esc(v)}" placeholder="${esc(c.aide ?? "")}" autocomplete="off"></label>`;
}

function rempli(q) {
  return q.champs.some((c) => {
    const v = rep[q.id]?.[c.id];
    return Array.isArray(v) ? v.length : String(v ?? "").trim() && v !== c.valeur;
  });
}

function dessiner() {
  $("#questions").innerHTML = QUESTIONS.map(
    (q, n) => `<section class="q-bloc verre" id="q-${q.id}">
      <div class="q-entete"><span class="q-num">${n + 1}</span><div><h2>${esc(q.titre)}</h2><p>${esc(q.pourquoi)}</p></div></div>
      <div class="q-champs">${q.champs.map((c) => champ(q, c)).join("")}</div>
    </section>`,
  ).join("");
  sommaire();
}

function sommaire() {
  const faits = QUESTIONS.filter(rempli).length;
  $("#sommaire").innerHTML = `<span class="q-avance">${faits} / ${QUESTIONS.length}</span>${QUESTIONS.map((q, n) => `<a href="#q-${q.id}" class="${rempli(q) ? "fait" : ""}" title="${esc(q.titre)}">${n + 1}</a>`).join("")}`;
}

function fixer(nom, valeur) {
  const [q, c] = nom.split(".");
  (rep[q] ??= {})[c] = valeur;
  sommaire();
  enregistrerBientot();
}

/* Enregistrement : 0,6 s après la dernière modification, vers le serveur local ; copie de secours dans le navigateur. */
let minuteur;
function enregistrerBientot() {
  $("#etat").textContent = "Modification…";
  $("#etat").className = "q-etat";
  clearTimeout(minuteur);
  minuteur = setTimeout(enregistrer, 600);
}
async function enregistrer() {
  try {
    localStorage.setItem(SECOURS, JSON.stringify(rep));
  } catch {}
  try {
    const r = await fetch("api/questionnaire", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rep) });
    if (!r.ok) throw new Error();
    const { quand } = await r.json();
    $("#etat").textContent = `✓ Enregistré · ${quand.split(" à ")[1] ?? quand}`;
    $("#etat").className = "q-etat ok";
  } catch {
    // Version en ligne (pas de serveur local) : gardé dans ce navigateur, à télécharger à la fin.
    $("#etat").textContent = "✓ Gardé sur cet appareil";
    $("#etat").className = "q-etat ok";
  }
}

document.addEventListener("click", (e) => {
  const b = e.target.closest(".q-puce");
  if (!b) return;
  const [q, c] = b.dataset.nom.split(".");
  if (b.dataset.type === "choix") {
    const deja = rep[q]?.[c] === b.dataset.valeur;
    b.parentElement.querySelectorAll(".q-puce").forEach((x) => x.classList.remove("actif"));
    if (!deja) b.classList.add("actif");
    fixer(b.dataset.nom, deja ? "" : b.dataset.valeur);
  } else {
    b.classList.toggle("actif");
    fixer(b.dataset.nom, [...b.parentElement.querySelectorAll(".q-puce.actif")].map((x) => x.dataset.valeur));
  }
});
// Télécharger les réponses (fichier lisible), utile surtout sur la version en ligne.
document.getElementById("telecharger").addEventListener("click", () => {
  const quand = new Date().toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
  const url = URL.createObjectURL(new Blob([reponsesEnTexte(rep, quand)], { type: "text/markdown;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "Reponses-rendez-vous-Leader-Patrimoine.md";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
});

document.addEventListener("input", (e) => {
  if (e.target.dataset.nom) fixer(e.target.dataset.nom, e.target.value);
});

// Au démarrage : on reprend les réponses déjà enregistrées (fichier du dossier prospect, sinon copie de secours).
(async () => {
  try {
    const r = await fetch("api/questionnaire");
    rep = r.ok ? await r.json() : {};
  } catch {}
  if (!Object.keys(rep).length) {
    try {
      rep = JSON.parse(localStorage.getItem(SECOURS) ?? "{}");
    } catch {}
  }
  dessiner();
})();
