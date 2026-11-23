/**
 * Bouton « Présentation » : sur toute page ouverte seule (plein écran, animations, espace comptable, télécommande),
 * un clic ramène à la page de présentation (ordinateur + iPhone côte à côte). Absent quand la page est déjà affichée
 * dans la présentation (cadre de l'ordinateur ou du téléphone, calque des animations).
 */
if (window.parent === window) {
  const a = document.createElement("a");
  a.className = "vers-presentation";
  a.href = "./";
  a.title = "Revenir à la présentation (ordinateur + iPhone)";
  a.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5" width="13" height="9" rx="1.5"/><path d="M6 17.5h6"/><rect x="17" y="8" width="5" height="10" rx="1.2"/></svg><span>Présentation</span>`;
  // Si la présentation est déjà ouverte dans un autre onglet (page ouverte avec « Plein écran »), on y retourne.
  a.addEventListener("click", (e) => {
    if (window.opener && !window.opener.closed) {
      try {
        if (window.opener.location.pathname.replace(/index\.html$/, "").endsWith("/")) {
          e.preventDefault();
          window.opener.focus();
          window.close();
        }
      } catch {}
    }
  });
  document.body.append(a);
}
