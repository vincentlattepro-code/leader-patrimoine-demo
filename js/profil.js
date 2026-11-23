/**
 * Mon profil et ma signature (maquette) : photo, signature des e-mails. Gardés dans le navigateur, communs aux deux
 * écrans de la présentation. Coordonnées FICTIVES par défaut.
 */
const lire = (k, d) => {
  try {
    return localStorage.getItem(k) ?? d;
  } catch {
    return d;
  }
};
const ecrire = (k, v) => {
  try {
    v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v);
  } catch {}
};
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const photoProfil = () => lire("lp-photo", "");
export const changerPhoto = (url) => ecrire("lp-photo", url || null);

/** Avatar du gérant : sa photo s'il en a mis une, sinon ses initiales. */
export function avatarProfil(classe = "", style = "") {
  const p = photoProfil();
  return p ? `<img class="avatar ${classe}" src="${p}" alt="" style="object-fit:cover;padding:0;${style}">` : `<span class="avatar ${classe}" style="${style}">SB</span>`;
}

/* ---------------------------------------------------------------- Photo de profil : recadrage automatique sur le visage
 * 1. On cherche le visage : détecteur de visages du navigateur s'il existe, sinon repérage des zones de peau dans le haut
 *    de la photo (aucune bibliothèque, rien ne sort de l'ordinateur).
 * 2. On découpe un carré « portrait » : visage centré, un peu de place au-dessus de la tête, les épaules en bas.
 * 3. On réduit par étapes (haute qualité) jusqu'à 512 × 512 px : net même sur les écrans Retina. */
const TAILLE_PHOTO = 512;

async function chargerImage(fichier) {
  try {
    return await createImageBitmap(fichier, { imageOrientation: "from-image" });
  } catch {
    const url = URL.createObjectURL(fichier);
    const img = new Image();
    img.src = url;
    await img.decode();
    URL.revokeObjectURL(url);
    return img;
  }
}

/** Boîte du visage { x, y, l, h } en pixels de l'image d'origine, ou null si rien de sûr. */
async function trouverVisage(img) {
  const L = img.width;
  const H = img.height;
  if ("FaceDetector" in window) {
    try {
      const v = await new window.FaceDetector({ fastMode: false, maxDetectedFaces: 1 }).detect(img);
      if (v[0]) return { x: v[0].boundingBox.x, y: v[0].boundingBox.y, l: v[0].boundingBox.width, h: v[0].boundingBox.height };
    } catch {}
  }
  // Repérage de la peau sur une copie réduite (rapide).
  const e = Math.min(1, 200 / Math.max(L, H));
  const w = Math.max(1, Math.round(L * e));
  const h = Math.max(1, Math.round(H * e));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d", { willReadFrequently: true });
  g.drawImage(img, 0, 0, w, h);
  const px = g.getImageData(0, 0, w, h).data;
  // 1. Carte des points « couleur de peau ».
  const peau = new Uint8Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = px[i], v = px[i + 1], b = px[i + 2];
      const Y = 0.299 * r + 0.587 * v + 0.114 * b;
      const Cb = 128 - 0.169 * r - 0.331 * v + 0.5 * b;
      const Cr = 128 + 0.5 * r - 0.419 * v - 0.081 * b;
      if (Y > 50 && Cr > 135 && Cr < 180 && Cb > 80 && Cb < 135 && r > v && r > b) peau[y * w + x] = 1;
    }
  // 2. Regroupement en zones (points voisins), puis choix de la zone qui ressemble le plus à une tête :
  //    assez grande, compacte, plutôt en haut, pas une bande collée au bord (rideau, mur beige…).
  const zone = new Int32Array(w * h).fill(-1);
  let meilleure = null;
  let n = 0;
  const pile = [];
  for (let d = 0; d < w * h; d++) {
    if (!peau[d] || zone[d] >= 0) continue;
    const z = { taille: 0, g: w, dr: 0, haut: h, bas: 0, sy: 0, id: n };
    pile.push(d);
    zone[d] = n;
    while (pile.length) {
      const p = pile.pop();
      const x = p % w;
      const y = (p - x) / w;
      z.taille++;
      z.sy += y;
      if (x < z.g) z.g = x;
      if (x > z.dr) z.dr = x;
      if (y < z.haut) z.haut = y;
      if (y > z.bas) z.bas = y;
      for (const q of [p - 1, p + 1, p - w, p + w]) {
        if (q < 0 || q >= w * h || zone[q] >= 0 || !peau[q]) continue;
        if ((q === p - 1 && x === 0) || (q === p + 1 && x === w - 1)) continue;
        zone[q] = n;
        pile.push(q);
      }
    }
    n++;
    if (z.taille < w * h * 0.006) continue;
    const zl = z.dr - z.g + 1;
    const zh = z.bas - z.haut + 1;
    const remplissage = z.taille / (zl * zh);
    const allure = zh / zl;
    const bord = z.g <= 1 || z.dr >= w - 2 ? 0.45 : 1;
    const hauteur = 1.25 - z.sy / z.taille / h;
    z.score = z.taille * (0.4 + remplissage) * (allure > 0.6 && allure < 3.5 ? 1 : 0.35) * bord * hauteur;
    if (!meilleure || z.score > meilleure.score) meilleure = z;
  }
  if (!meilleure) return null;
  // 3. Dans cette zone seulement : la tête est en haut ; sa largeur se mesure juste sous le sommet du crâne
  //    (le cou, les épaules, un vêtement rose… sont plus bas et ne comptent pas).
  const nb = [];
  const gauche = [];
  const droite = [];
  for (let y = meilleure.haut; y <= meilleure.bas; y++) {
    let k = 0, a = w, b = -1;
    for (let x = meilleure.g; x <= meilleure.dr; x++)
      if (zone[y * w + x] === meilleure.id) {
        k++;
        if (x < a) a = x;
        if (x > b) b = x;
      }
    nb.push(k);
    gauche.push(a);
    droite.push(b);
  }
  const seuil = Math.max(2, w * 0.02);
  const debut = nb.findIndex((k, i) => k >= seuil && nb[i + 1] >= seuil);
  if (debut < 0) return null;
  const tri = (t) => t.slice().sort((a, b) => a - b);
  const centile = (t, p) => (t.length ? tri(t)[Math.floor(p * (t.length - 1))] : 0);
  const largeurLigne = (i) => Math.min(nb[i] * 1.15, droite[i] - gauche[i] + 1);
  let lv = 0;
  for (let i = debut; i < Math.min(nb.length, debut + Math.round(h * 0.08)); i++) if (nb[i] >= seuil) lv = Math.max(lv, largeurLigne(i));
  let cx = 0;
  for (let passe = 0; passe < 2; passe++) {
    const fin = Math.min(nb.length, debut + Math.round(lv * 1.1));
    const largeurs = [];
    const centres = [];
    for (let i = debut; i < fin; i++)
      if (nb[i] >= seuil) {
        largeurs.push(largeurLigne(i));
        centres.push((gauche[i] + droite[i]) / 2);
      }
    if (!largeurs.length) return null;
    lv = Math.max(4, centile(largeurs, 0.6));
    cx = centile(centres, 0.5);
  }
  const haut = meilleure.haut + debut;
  return { x: (cx - lv / 2) / e, y: haut / e, l: lv / e, h: (lv * 1.3) / e };
}

/** Prépare la photo de profil : recadrée sur le visage, 512 × 512, haute qualité. */
export async function preparerPhoto(fichier) {
  const img = await chargerImage(fichier);
  const L = img.width;
  const H = img.height;
  const v = await trouverVisage(img);
  let cote;
  let cx;
  let cy;
  if (v) {
    // Cadrage portrait : le visage fait environ la moitié de la hauteur, le haut du crâne à ~17 % du bord,
    // les épaules en bas. Le carré ne sort jamais de la photo.
    cote = Math.min(Math.max(v.l, v.h / 1.3) * 2.6, L, H);
    cx = v.x + v.l / 2;
    cy = v.y + cote * 0.33;
  } else {
    // Sans visage repéré : carré centré, remonté sur les photos en hauteur (la tête est en haut).
    cote = Math.min(L, H);
    cx = L / 2;
    cy = H > L ? cote / 2 + (H - cote) * 0.15 : H / 2;
  }
  const sx = Math.min(Math.max(0, cx - cote / 2), L - cote);
  const sy = Math.min(Math.max(0, cy - cote / 2), H - cote);
  // Réduction par étapes (moitié par moitié) : bien plus net qu'une réduction en une fois.
  let source = img;
  let sxx = sx, syy = sy, cc = cote;
  while (cc / 2 > TAILLE_PHOTO) {
    const t = Math.round(cc / 2);
    const c = document.createElement("canvas");
    c.width = c.height = t;
    const g = c.getContext("2d");
    g.imageSmoothingQuality = "high";
    g.drawImage(source, sxx, syy, cc, cc, 0, 0, t, t);
    source = c;
    sxx = 0;
    syy = 0;
    cc = t;
  }
  const fin = document.createElement("canvas");
  fin.width = fin.height = Math.min(TAILLE_PHOTO, Math.round(cc)) || TAILLE_PHOTO;
  const g = fin.getContext("2d");
  g.imageSmoothingQuality = "high";
  g.drawImage(source, sxx, syy, cc, cc, 0, 0, fin.width, fin.height);
  const webp = fin.toDataURL("image/webp", 0.92);
  return webp.startsWith("data:image/webp") ? webp : fin.toDataURL("image/jpeg", 0.92);
}

export const SIGNATURE_DEFAUT = { nom: "Serkan BULUT", fonction: "Gérant · Conseiller en gestion de patrimoine", tel: "04 00 00 00 00", orias: "00 000 000" };
export function signature() {
  try {
    return { ...SIGNATURE_DEFAUT, ...JSON.parse(lire("lp-signature", "{}")) };
  } catch {
    return { ...SIGNATURE_DEFAUT };
  }
}
export const changerSignature = (s) => ecrire("lp-signature", JSON.stringify(s));
export { esc as echapper };

export const TARIFS = [
  ["Bilan patrimonial", "1 200 €"],
  ["Abonnement conseil", "300 € / mois"],
  ["Audit successoral", "3 000 €"],
  ["Étude prévoyance", "1 500 €"],
  ["Mission cession d'entreprise", "sur devis"],
];
