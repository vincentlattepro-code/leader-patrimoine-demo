/**
 * Signature des e-mails automatiques du cabinet (aperçus de la maquette).
 * Modifiable dans Réglages → Mon cabinet → Signature des e-mails. Coordonnées FICTIVES par défaut (zéros).
 */
import { signature, echapper as esc } from "./profil.js";

export function signatureMail() {
  const s = signature();
  return `<div class="signature-mail">
    <img class="signature-mono" src="assets/mono.svg" alt="">
    <div class="signature-texte">
      <strong>${esc(s.nom)}</strong>
      <span class="signature-fonction">${esc(s.fonction)}</span>
      <span class="signature-cabinet">LEADER PATRIMOINE</span>
      <span class="signature-coord">Tél. ${esc(s.tel)} · <u>Prendre rendez-vous en ligne</u></span>
    </div>
  </div>
  <p class="signature-legal">La valeur de l'humain, la force du patrimoine · Conseiller en investissements financiers, courtier en assurance · ORIAS n° ${esc(s.orias)}</p>`;
}
