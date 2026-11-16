// Le diplôme, utilisé à l'écran (chapitre 5) et sur la page d'impression (certificat/).
window.CERTIFICAT = (function () {
  'use strict';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function tamponSVG() {
    return `<svg class="tampon" viewBox="0 0 120 120" aria-hidden="true">
<defs><path id="cercleTxt" d="M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1 -88 0"/></defs>
<circle cx="60" cy="60" r="56" fill="none" stroke="#C9A227" stroke-width="3"/><circle cx="60" cy="60" r="50" fill="none" stroke="#C9A227" stroke-width="1"/>
<text font-family="Libre Baskerville, serif" font-size="9.5" fill="#C9A227" letter-spacing="1.5"><textPath href="#cercleTxt">CHÂTEAU FORT DE SEDAN · ARDENNES · VU ET APPROUVÉ ·</textPath></text>
<use href="#dent" x="47" y="26" width="26" height="26"/>
<g fill="#C9A227"><ellipse cx="58" cy="70" rx="17" ry="9"/><path d="M71 64q10-1 13 8l3 1q0 4-3 4l-12 1q-6-2-6-8z"/><path d="M71 64l3-6 3 6z"/><path d="M45 74v6M52 76v5M64 76v5M70 75v5" stroke="#C9A227" stroke-width="3" stroke-linecap="round"/><path d="M42 68q-6 0-5-6" fill="none" stroke="#C9A227" stroke-width="2"/></g>
<text x="60" y="97" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="9" fill="#C9A227">OFFICIEL</text>
</svg>`;
  }

  const Tc = s0 => { const C = window.CONFIG, s = window.RECIT.resoudre(s0); return s == null ? '' : String(s).replace(/\{(\w+)\}/g, (m, k) => (C[k] != null ? C[k] : m)); };
  // Le nom d'un badge (le badge secret garde son nom caché tant qu'il n'est pas gagné), et ce qu'il raconte
  function nomBadge(id, gagne) { const b = window.DATA.badges.find(x => x.id === id); return b ? Tc(b.secret && !gagne ? b.nomCache : b.nom) : ''; }
  function texteBadge(id, gagne) { const b = window.DATA.badges.find(x => x.id === id); return b ? Tc(gagne ? b.obtenu : b.aGagner) : ''; }

  // Le diplôme : l'essentiel seulement (le prénom, la nuit, la dent, la signature).
  // À l'écran, les étoiles et les badges tiennent en une ligne (ils ont leur étagère, « Mes trésors ») ;
  // à l'impression (opts.impression), les médailles gagnées s'alignent sous la mâchoire, jamais celles qui manquent.
  // opts : { badges: [ids], secret: bool, nuitTexte: "nuit du …", etoiles: n, total: n, impression: bool }
  function html(opts) {
    const C = window.CONFIG, D = window.DATA;
    const gagnes = D.badges.filter(b => (opts.badges || []).indexOf(b.id) >= 0);
    // Témoin : le doudou, sinon le frère ou la sœur de la chambre, sinon la lune
    const temoin = C.aDoudou ? C.poupee + ' (dormait)' : C.fratrieACote ? C.frere + ' (dormait)' : 'la lune (veillait)';
    const total = opts.total || D.scenes.reduce((n, s) => n + s.bonus.length, 0);
    const etoiles = Math.max(0, Math.min(total, opts.etoiles || 0));
    const pl = (n, mot) => n + ' ' + mot + (n > 1 ? 's' : '');
    const bilan = `<p class="dip-bilan">
      <span><svg class="dip-ico" viewBox="0 0 24 24" aria-hidden="true"><use href="#etoile5"/></svg>${pl(etoiles, 'étoile')} ${etoiles > 1 ? 'trouvées' : 'trouvée'} sur ${total}</span>
      <span><svg class="dip-ico med" viewBox="-32 -50 64 86" aria-hidden="true"><circle cy="4" r="25" fill="#E8B83A" stroke="#8a6a12" stroke-width="3"/><path d="M-13-45h10l8 22h-10zM13-45h-10l-8 22h10z" fill="#D64045"/></svg>${pl(gagnes.length, 'badge')} ${gagnes.length > 1 ? 'gagnés' : 'gagné'}</span>
    </p>`;
    const medailles = opts.impression && gagnes.length ? `<div class="dip-medailles">
      <div class="dip-medailles-titre">Ses badges de la nuit</div>
      <div class="dip-medailles-liste">${gagnes.map(b => `<figure class="dip-medaille">${window.ART.medaille(b.id, true)}<figcaption>${esc(nomBadge(b.id, true))}</figcaption></figure>`).join('')}</div>
    </div>` : '';
    return `<div class="diplome${opts.impression ? ' imprime' : ''}">
  <div class="dip-bord">
    <div class="dip-coin c1"></div><div class="dip-coin c2"></div><div class="dip-coin c3"></div><div class="dip-coin c4"></div>
    <div class="dip-entete">Certificat officiel</div>
    <div class="dip-sous">de dent de lait perdue</div>
    <div class="dip-decerne">décerné à</div>
    <div class="dip-nom">${esc(C.enfant)}</div>
    <p class="dip-texte">qui a perdu sa <b>${C.ordinalHtml} dent de lait</b>, ${esc(C.dentNom)}, qui a guidé ${esc(C.souris)} jusqu'à ${C.logement === 'appartement' ? 'son appartement' : 'sa maison'} et l'a aidée à passer devant le chat ${esc(C.chat)}.<br>${{ piece: 'Sa pièce de ' + C.euros + ' €', billet: 'Son billet de ' + C.euros + ' €', paquet: 'Son petit paquet surprise', chocolat: 'Sa boîte de chocolats' }[C.cadeau] || 'Son cadeau'} a traversé ${esc(C.riviere)} en bateau.</p>
    <div class="dip-machoire">${window.MACHOIRE(C.profil)}</div>
    ${bilan}
    ${medailles}
    <div class="dip-pied">
      <div class="dip-date">Fait au château fort de Sedan,<br>dans les Ardennes,<br>${esc(opts.nuitTexte || '')}</div>
      <div class="dip-tampon">${tamponSVG()}</div>
      <div class="dip-sign"><span class="sign">${esc(C.souris)}</span><small>Petite Souris des Ardennes</small><small>Témoin officiel : ${esc(temoin)}</small></div>
    </div>
  </div>
</div>`;
  }
  // (Plus rien à brancher : le diplôme ne porte plus les badges. Gardé pour les pages qui l'appellent encore.)
  function brancher() { }
  return { html, tamponSVG, brancher, nomBadge, texteBadge };
})();

// Module ES (chargé par src/main.ts) : le contenu reste un script qui expose ses objets sur window.
export {};
