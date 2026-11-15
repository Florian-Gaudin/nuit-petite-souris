// Typographie française : une espace insécable devant « ! » et « ? », partout où du texte s'affiche
// (histoire, espace parents, pages annexes). Appliquée à l'affichage : aucun texte n'est oublié,
// même ceux ajoutés plus tard. Les adresses (liens, QR code) ne sont pas touchées.
const INSECABLE = ' ';

export function typographier(t: string): string {
  if (!/[!?]/.test(t) || /:\/\/|#p=/.test(t)) return t;
  return t
    // « Bravo ! » : l'espace ordinaire devient insécable
    .replace(/[ \t]+([!?])/g, INSECABLE + '$1')
    // « Bravo! » : on ajoute l'espace manquante (seulement en fin de phrase, pas au milieu d'une adresse)
    .replace(/([\p{L}\d»)…])([!?])(?=$|[\s!?»"'’)…])/gu, '$1' + INSECABLE + '$2');
}

const ATTRIBUTS = ['aria-label', 'title', 'placeholder', 'alt', 'data-info', 'data-nom'];
const IGNORES = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'CODE']);

function corrigerTexte(n: Text) {
  const p = n.parentElement;
  if (p && (IGNORES.has(p.tagName) || p.closest('.url, code'))) return;
  const avant = n.data, apres = typographier(avant);
  if (apres !== avant) n.data = apres;
}
function corrigerElement(el: Element) {
  for (const a of ATTRIBUTS) {
    const v = el.getAttribute(a);
    if (v) { const w = typographier(v); if (w !== v) el.setAttribute(a, w); }
  }
}
function corriger(racine: Node) {
  if (racine.nodeType === Node.TEXT_NODE) { corrigerTexte(racine as Text); return; }
  if (racine.nodeType !== Node.ELEMENT_NODE) return;
  const el = racine as Element;
  if (IGNORES.has(el.tagName)) return;
  corrigerElement(el);
  el.querySelectorAll(ATTRIBUTS.map(a => `[${a}]`).join(',')).forEach(corrigerElement);
  const marche = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = marche.nextNode(); n; n = marche.nextNode()) corrigerTexte(n as Text);
}

export function activerTypographie() {
  const lancer = () => {
    corriger(document.body);
    // Tout ce qui s'affiche ensuite (texte de l'histoire, formulaire, bulles…) est corrigé au passage
    new MutationObserver(liste => {
      for (const m of liste) {
        if (m.type === 'characterData') corriger(m.target);
        else if (m.type === 'attributes') corrigerElement(m.target as Element);
        else m.addedNodes.forEach(corriger);
      }
    }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRIBUTS });
  };
  if (document.body) lancer(); else document.addEventListener('DOMContentLoaded', lancer);
}
