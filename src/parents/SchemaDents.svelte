<script lang="ts">
  // Schéma des 20 dents de lait, vu de face (la droite de l'enfant est à gauche du schéma).
  // Deux modes : choisir la dent tombée cette nuit, ou cocher celles déjà tombées.
  import { nomDent, rangDent, varianteDent } from '../lib/profil';
  import { PLACES, ETOILE } from '../lib/geometrieDents';

  let { nuit = $bindable(), deja = $bindable() }: { nuit: number | null; deja: number[] } = $props();
  let mode = $state<'nuit' | 'deja'>(nuit == null ? 'nuit' : 'deja');

  const DENTS = PLACES;

  function toucher(d: number) {
    if (mode === 'nuit') {
      nuit = d;
      deja = deja.filter(x => x !== d);
      mode = 'deja'; // la suite logique : cocher les dents déjà tombées
    } else {
      if (d === nuit) return;
      deja = deja.includes(d) ? deja.filter(x => x !== d) : [...deja, d];
    }
  }
  function clavier(e: KeyboardEvent, d: number) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toucher(d); }
  }
  const etat = (d: number) => (d === nuit ? 'nuit' : deja.includes(d) ? 'deja' : 'la');

  const resume = $derived.by(() => {
    if (nuit == null) return null;
    const v = varianteDent({ nuit, deja });
    const rang = rangDent({ nuit, deja });
    const histoire = v === 'premiere'
      ? "C'est sa toute première dent : elle ouvrira la collection du château."
      : v === 'jumelle'
        ? 'Sa jumelle est déjà au château : Quenotte vient les réunir.'
        : `Elle rejoint ${deja.length === 1 ? 'sa grande sœur' : `ses ${deja.length} sœurs`} au château.`;
    return { titre: `${nomDent(nuit)} — ${rang === 1 ? '1re' : rang + 'e'} dent`, histoire };
  });
</script>

<div class="schema">
  <div class="modes" role="radiogroup" aria-label="Que voulez-vous marquer ?">
    <button type="button" role="radio" aria-checked={mode === 'nuit'} class:actif={mode === 'nuit'} onclick={() => (mode = 'nuit')}>
      <span class="pastille nuit"></span> La dent de cette nuit
    </button>
    <button type="button" role="radio" aria-checked={mode === 'deja'} class:actif={mode === 'deja'} onclick={() => (mode = 'deja')}>
      <span class="pastille deja"></span> Les dents déjà tombées
    </button>
  </div>

  <svg viewBox="0 0 340 300" class="bouche" role="group" aria-label="Schéma des dents de lait, vu de face">
    <text x="170" y="154" class="repere">la bouche, vue de face</text>
    <text x="8" y="154" class="cote">sa droite</text>
    <text x="332" y="154" class="cote fin">sa gauche</text>
    <text x="170" y="12" class="arcade">en haut</text>
    <text x="170" y="296" class="arcade">en bas</text>
    {#each DENTS as t (t.d)}
      <g
        class="dent {etat(t.d)}"
        transform="translate({t.x.toFixed(1)} {t.y.toFixed(1)}) rotate({t.angle.toFixed(1)})"
        role="button" tabindex="0"
        aria-label="{nomDent(t.d)}{etat(t.d) === 'nuit' ? ', tombée cette nuit' : etat(t.d) === 'deja' ? ', déjà tombée' : ''}"
        aria-pressed={etat(t.d) !== 'la'}
        onclick={() => toucher(t.d)}
        onkeydown={(e) => clavier(e, t.d)}
      >
        <rect x={-t.l / 2} y={-t.h / 2} width={t.l} height={t.h} rx="7" />
        {#if etat(t.d) === 'nuit'}<path class="etoile" d={ETOILE} />{/if}
      </g>
    {/each}
  </svg>

  {#if resume}
    <p class="resume"><strong>{resume.titre}</strong><br />{resume.histoire}</p>
  {:else}
    <p class="resume aide">Touchez la dent tombée cette nuit.</p>
  {/if}
</div>

<style>
  .schema { display: flex; flex-direction: column; gap: 10px; }
  .modes { display: flex; flex-wrap: wrap; gap: 8px; }
  .modes button { flex: 1 1 180px; display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; border-radius: 14px; border: 2px solid #e2d3ad; background: #fff; font: 700 1rem var(--display); color: var(--encre); cursor: pointer; }
  .modes button.actif { border-color: var(--rouge); background: #fdebec; }
  .pastille { width: 16px; height: 16px; border-radius: 5px; display: inline-block; }
  .pastille.nuit { background: var(--rouge); }
  .pastille.deja { background: #fff; border: 2px dashed #8a8fa3; }
  .bouche { width: 100%; max-width: 440px; margin: 0 auto; display: block; }
  .repere { font: 600 11px var(--display); fill: #a08a4a; text-anchor: middle; }
  .cote { font: 700 11px var(--display); fill: #7a6220; }
  .cote.fin { text-anchor: end; }
  .arcade { font: 700 11px var(--display); fill: #7a6220; text-anchor: middle; }
  .dent { cursor: pointer; outline: none; }
  .dent rect { fill: #fff; stroke: #b9a77a; stroke-width: 2; transition: fill .15s; }
  .dent:hover rect, .dent:focus-visible rect { stroke: var(--encre); stroke-width: 3; }
  .dent.deja rect { fill: #f3ead6; stroke: #8a8fa3; stroke-dasharray: 4 3; }
  .dent.nuit rect { fill: var(--rouge); stroke: var(--rouge2); }
  .etoile { fill: #FFC857; }
  .resume { margin: 0; padding: 10px 14px; border-radius: 12px; background: #fff; border: 1px solid #e2d3ad; font-size: 1rem; line-height: 1.4; }
  .resume.aide { color: #7a6220; }
</style>
