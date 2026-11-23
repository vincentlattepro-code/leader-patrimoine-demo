/**
 * Page « Refonte site » : la maquette du futur site dans une fenêtre de navigateur, en version ordinateur ou téléphone.
 * Si les vidéos ont été téléchargées sur le PC (refonte-medias/scripts/localiser-medias.mjs), on affiche la version
 * hors ligne ; sinon le site lit ses médias sur le site actuel du cabinet (il faut alors internet).
 */
const $ = (s) => document.querySelector(s);
const site = $("#site");
const scene = $("#scene");

let adresse = "refonte/index.html";
try {
  const r = await fetch("refonte/index-hors-ligne.html", { method: "HEAD", cache: "no-store" });
  if (r.ok) adresse = "refonte/index-hors-ligne.html";
} catch {}
site.src = adresse;
$("#onglet").href = adresse;

// Ordinateur / téléphone : même site, largeur différente (le site passe tout seul en affichage mobile).
$("#ecrans").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  document.querySelectorAll("#ecrans button").forEach((x) => x.classList.toggle("actif", x === b));
  scene.dataset.ecran = b.dataset.ecran;
});

$("#plein").addEventListener("click", () => {
  const f = $("#fenetre");
  (f.requestFullscreen || f.webkitRequestFullscreen)?.call(f);
});
