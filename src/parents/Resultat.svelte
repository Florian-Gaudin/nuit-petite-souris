<script lang="ts">
  // L'écran final : le QR code de l'histoire et ce qu'on peut en faire.
  import { type Profil, encoderProfil, nomDent, rangDent, LIEU_CACHETTE } from '../lib/profil';
  import { baseHistoire } from '../lib/profilCourant';
  import { surpriseActive } from '../lib/profil';
  import { svgQr, pngQr } from '../lib/qr';
  import { DOUDOUS } from './icones';

  let { profil, modifier }: { profil: Profil; modifier: () => void } = $props();

  const code = $derived(encoderProfil(profil));
  const url = $derived(baseHistoire() + '#p=' + code);
  const qr = $derived(svgQr(url));
  let info = $state('');
  const surprise = $derived(surpriseActive(profil));

  const rang = $derived(rangDent(profil.dents));
  const lieu = $derived(LIEU_CACHETTE[profil.cachette].replace(/ta/, 'sa').replace(/ton/, 'son'));
  const date = $derived(new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(profil.nuit + 'T12:00:00')));

  async function telecharger() {
    const blob = await pngQr(url, { titre: 'Pour ' + profil.prenom });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `petite-souris-${profil.prenom.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-')}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    info = 'QR code téléchargé.';
  }
  async function partager() {
    const donnees = { title: 'La nuit de la Petite Souris', text: `L'histoire de ${profil.prenom}`, url };
    try {
      if (navigator.share) { await navigator.share(donnees); return; }
      await navigator.clipboard.writeText(url);
      info = 'Lien copié : vous pouvez le coller dans un message.';
    } catch (e) {
      if ((e as Error).name !== 'AbortError') info = 'Partage impossible sur cet appareil.';
    }
  }
</script>

<section class="resultat">
  <h2>L'histoire de {profil.prenom} est prête !</h2>
  <div class="qr" aria-label="QR code de l'histoire">{@html qr}</div>

  <ul class="recap">
    <li>Doudou : {profil.doudou.type === 'aucun' ? 'pas de doudou' : `${profil.doudou.nom} (${DOUDOUS[profil.doudou.type].nom.toLowerCase()})`}</li>
    <li>Dent : {nomDent(profil.dents.nuit)}, {rang === 1 ? '1re' : rang + 'e'} dent</li>
    <li>Cadeau : un billet de {profil.billet} € qui sèchera {lieu}</li>
    <li>Ville : {profil.ville.nom}</li>
    <li>Nuit du {date}</li>
  </ul>

  <div class="actions">
    <a class="btn btn-or" href={'mot.html#p=' + code} target="_blank" rel="noopener">Imprimer le mot de la souris</a>
    <button class="btn" type="button" onclick={telecharger}>Télécharger le QR code</button>
    <button class="btn" type="button" onclick={partager}>Partager le lien</button>
    <a class="btn" href={'index.html?apercu=1#p=' + code}>{surprise ? "Voir l'aperçu de l'histoire" : "Lancer l'histoire ici"}</a>
  </div>
  {#if surprise}<p class="note">Avant le grand matin, l'histoire reste secrète : si {profil.prenom} scanne le QR code trop tôt, Quenotte lui dira de revenir à son réveil. Vous, vous pouvez la voir dès maintenant en aperçu.</p>{/if}
  {#if info}<p class="info" role="status">{info}</p>{/if}

  <div class="conseil">
    <strong>Pour le grand matin :</strong> imprimez le mot de la souris et glissez-le sous l'oreiller, à la place de la dent.
    Posez le vrai billet de {profil.billet} € {lieu}{profil.cachette === 'cheminee' || profil.cachette === 'radiateur' ? ' (bien éteint !)' : ''}.
    Au réveil, {profil.prenom} scanne le QR code avec la tablette.
  </div>

  <button class="lien" type="button" onclick={modifier}>Modifier les informations</button>
</section>

<style>
  .resultat { display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; }
  h2 { margin: 0; font-size: 1.5rem; }
  .qr { width: min(72vw, 260px); padding: 10px; background: #fff; border-radius: 16px; box-shadow: 0 6px 18px rgba(0, 0, 0, .12); }
  .qr :global(svg) { display: block; width: 100%; height: auto; }
  .recap { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; font-size: .98rem; color: #4a3f22; }
  .actions { display: grid; gap: 10px; width: 100%; max-width: 420px; }
  .info { margin: 0; color: #2F5D50; font-weight: 700; }
  .note { margin: 0; font-size: .9rem; color: #6b5a2a; max-width: 30em; }
  .conseil { text-align: left; background: #fff; border: 1px solid #e2d3ad; border-radius: 12px; padding: 12px 14px; font-size: .95rem; line-height: 1.45; max-width: 520px; }
  .lien { background: none; border: 0; color: var(--rouge2); font: 700 1rem var(--display); text-decoration: underline; cursor: pointer; min-height: 44px; }
</style>
