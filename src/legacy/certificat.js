// Le diplôme, utilisé à l'écran (chapitre 5) et sur la page d'impression (certificat.html).
window.CERTIFICAT = (function () {
  'use strict';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function tamponSVG() {
    return `<svg class="tampon" viewBox="0 0 120 120" aria-hidden="true">
<defs><path id="cercleTxt" d="M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1 -88 0"/></defs>
<circle cx="60" cy="60" r="56" fill="none" stroke="#C9A227" stroke-width="3"/><circle cx="60" cy="60" r="50" fill="none" stroke="#C9A227" stroke-width="1"/>
<text font-family="Libre Baskerville, serif" font-size="9.5" fill="#C9A227" letter-spacing="1.5"><textPath href="#cercleTxt">CHÂTEAU DES DENTS DE LAIT · ARDENNES · VU ET APPROUVÉ ·</textPath></text>
<use href="#dent" x="44" y="40" width="32" height="32"/><text x="60" y="88" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="11" fill="#C9A227">OFFICIEL</text>
</svg>`;
  }

  // opts : { badges: [ids], secret: bool, nuitTexte: "nuit du …", dents, etoiles: n, total: n }
  function html(opts) {
    const C = window.CONFIG, D = window.DATA;
    const T = s0 => { const s = window.RECIT.resoudre(s0); return s == null ? '' : String(s).replace(/\{(\w+)\}/g, (m, k) => (C[k] != null ? C[k] : m)); };
    const gagnes = opts.badges || [];
    const visibles = D.badges.filter(b => !b.secret || opts.secret);
    const nbGagnes = visibles.filter(b => gagnes.indexOf(b.id) >= 0).length;
    const badges = visibles.map(b => {
      const ok = gagnes.indexOf(b.id) >= 0, msg = T(ok ? b.obtenu : b.aGagner);
      return `<button type="button" class="badge-dip ${ok ? '' : 'off'}" data-nom="${esc(T(b.nom))}" data-ok="${ok ? 1 : 0}" data-info="${esc(msg)}" title="${esc(msg)}">${window.ART.badgeIcone(b.id, 46)}<span>${esc(T(b.nom))}</span></button>`;
    }).join('');
    // Témoin : le doudou, sinon le frère ou la sœur de la chambre, sinon la lune
    const temoin = C.aDoudou ? C.poupee + ' (dormait)' : C.fratrieACote ? C.frere + ' (dormait)' : 'la lune (veillait)';
    const total = opts.total || D.scenes.reduce((n, s) => n + s.bonus.length, 0);
    const etoiles = Math.max(0, Math.min(total, opts.etoiles || 0));
    let etoilesSVG = '';
    for (let i = 0; i < total; i++) etoilesSVG += `<svg class="dip-etoile ${i < etoiles ? '' : 'off'}" viewBox="0 0 24 24" aria-hidden="true"><use href="#etoile5"/></svg>`;
    return `<div class="diplome">
  <div class="dip-bord">
    <div class="dip-coin c1"></div><div class="dip-coin c2"></div><div class="dip-coin c3"></div><div class="dip-coin c4"></div>
    <div class="dip-entete">Certificat officiel</div>
    <div class="dip-sous">de dent de lait perdue</div>
    <div class="dip-decerne">décerné à</div>
    <div class="dip-nom">${esc(C.enfant)}</div>
    <p class="dip-texte">qui a perdu sa <b>${C.ordinalHtml} dent de lait</b>, ${esc(C.dentNom)}, qui a guidé ${esc(C.souris)} jusqu'à sa maison et l'a aidée à passer devant le chat ${esc(C.chat)}.<br>Son billet de ${C.euros} € a traversé la Meuse en bateau.</p>
    <div class="dip-etoiles" aria-label="${etoiles} étoiles découvertes sur ${total}">${etoilesSVG}<span>${etoiles} étoile${etoiles > 1 ? 's' : ''} découverte${etoiles > 1 ? 's' : ''} sur ${total}</span></div>
    <div class="dip-milieu">
      <div class="dip-machoire">${window.MACHOIRE(C.profil)}</div>
      <div class="dip-badges-bloc">
        <div class="dip-badges-titre">Mes badges <span class="dip-compte">${nbGagnes}/${visibles.length}</span></div>
        <div class="dip-badges">${badges}</div>
        <p class="dip-badge-info" aria-live="polite">Touche un badge pour savoir comment il se gagne.</p>
      </div>
    </div>
    <div class="dip-pied">
      <div class="dip-date">Fait à ${esc(C.ville)},<br>${esc(opts.nuitTexte || '')}</div>
      <div class="dip-tampon">${tamponSVG()}</div>
      <div class="dip-sign"><span class="sign">${esc(C.souris)}</span><small>Petite Souris des Ardennes</small><small>Témoin officiel : ${esc(temoin)}</small></div>
    </div>
  </div>
</div>`;
  }
  // Survol ou toucher d'un badge : la ligne sous les badges explique comment il a été gagné, ou comment le gagner
  function brancher(racine) {
    const info = racine.querySelector('.dip-badge-info'); if (!info) return;
    const montre = b => {
      racine.querySelectorAll('.badge-dip.choisi').forEach(x => x.classList.remove('choisi')); b.classList.add('choisi');
      info.innerHTML = '<b>' + esc(b.dataset.nom) + (b.dataset.ok === '1' ? ' ✓' : ' (à gagner)') + '</b> : ' + esc(b.dataset.info);
    };
    racine.querySelectorAll('.badge-dip').forEach(b => {
      b.addEventListener('click', () => montre(b));
      b.addEventListener('mouseenter', () => montre(b));
      b.addEventListener('focus', () => montre(b));
    });
  }
  return { html, tamponSVG, brancher };
})();

// Module ES (chargé par src/main.ts) : le contenu reste un script qui expose ses objets sur window.
export {};
