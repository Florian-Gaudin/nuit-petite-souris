<script lang="ts">
  // La ville de l'enfant, avec les suggestions du service public des communes (geo.api.gouv.fr).
  // Seul le texte tapé est envoyé à ce service, pour proposer des noms de communes.
  // Sans connexion, ou si le service est trop lent, la ville tapée est gardée telle quelle.
  import { villeValide } from '../lib/profil';

  const DELAI_MAX = 6000; // au-delà, on n'attend plus le service

  type Ville = { nom: string; codePostal: string; departement: string };
  let { ville = $bindable() }: { ville: Ville | null } = $props();

  let saisie = $state(ville ? ville.nom : '');
  let suggestions = $state<Ville[]>([]);
  let message = $state('');
  let ouvert = $state(false);
  let recherche = $state(false);
  let minuteur: ReturnType<typeof setTimeout> | undefined;
  let requete: AbortController | undefined;

  async function chercher(texte: string) {
    requete?.abort();
    const t = texte.trim();
    if (t.length < 2) { suggestions = []; recherche = false; return; }
    const ctrl = new AbortController();
    requete = ctrl;
    let tropLent = false;
    const limite = setTimeout(() => { tropLent = true; ctrl.abort(); }, DELAI_MAX);
    const param = /^\d{5}$/.test(t) ? `codePostal=${t}` : `nom=${encodeURIComponent(t)}&boost=population`;
    recherche = true; message = '';
    try {
      const r = await fetch(`https://geo.api.gouv.fr/communes?${param}&fields=nom,codesPostaux,codeDepartement&limit=8`, { signal: ctrl.signal });
      if (!r.ok) throw new Error('réponse ' + r.status);
      const liste = (await r.json()) as { nom: string; codesPostaux: string[]; codeDepartement: string }[];
      suggestions = liste
        .map(c => ({ nom: c.nom, codePostal: c.codesPostaux?.[0] ?? '', departement: c.codeDepartement ?? '' }))
        .filter(c => villeValide(c.nom));
      message = suggestions.length ? '' : 'Aucune commune trouvée. Vérifiez l\'orthographe, ou gardez le nom tapé.';
      ouvert = true;
    } catch (e) {
      if ((e as Error).name === 'AbortError' && !tropLent) return; // remplacée par une recherche plus récente
      suggestions = [];
      message = tropLent
        ? 'Le service des communes répond lentement. Vous pouvez réessayer, ou garder le nom tapé tel quel.'
        : 'Suggestions indisponibles (pas de connexion ?). Le nom tapé sera utilisé tel quel.';
    } finally {
      clearTimeout(limite);
      if (requete === ctrl) recherche = false;
    }
  }

  function taper() {
    // Tant qu'aucune commune n'est choisie, le nom tapé fait office de ville (sans département)
    const t = saisie.trim();
    ville = villeValide(t) ? { nom: t, codePostal: '', departement: '' } : null;
    clearTimeout(minuteur);
    minuteur = setTimeout(() => chercher(saisie), 250);
  }
  function choisir(v: Ville) {
    ville = v; saisie = v.nom; ouvert = false; suggestions = []; message = '';
  }
</script>

<div class="ville">
  <input
    type="text" role="combobox" bind:value={saisie} oninput={taper} onfocus={() => (ouvert = suggestions.length > 0)}
    placeholder="Nom de la ville ou code postal" autocomplete="off" autocapitalize="words"
    aria-autocomplete="list" aria-expanded={ouvert} aria-controls="liste-villes" maxlength="60"
  />
  {#if ouvert && suggestions.length}
    <ul id="liste-villes" role="listbox">
      {#each suggestions as s (s.nom + s.codePostal)}
        <li role="option" aria-selected={ville?.nom === s.nom && ville?.codePostal === s.codePostal}>
          <button type="button" onclick={() => choisir(s)}>
            <strong>{s.nom}</strong> <span>{s.codePostal}{s.departement ? ` · ${s.departement}` : ''}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
  {#if recherche}
    <p class="message" role="status">Recherche…</p>
  {:else if ville && ville.departement}
    <p class="choisie">✓ {ville.nom} ({ville.codePostal})</p>
  {:else if message}
    <p class="message">{message}</p>
  {/if}
</div>

<style>
  .ville { position: relative; }
  input { width: 100%; }
  ul { list-style: none; margin: 4px 0 0; padding: 4px; border-radius: 12px; background: #fff; border: 1px solid #e2d3ad; box-shadow: 0 8px 20px rgba(0, 0, 0, .15); }
  li button { width: 100%; text-align: left; min-height: 44px; border: 0; background: none; border-radius: 8px; padding: 6px 10px; font: 600 1rem var(--display); color: var(--encre); cursor: pointer; }
  li button:hover, li button:focus-visible { background: #fdf3dc; }
  li span { color: #7a6220; font-weight: 500; font-size: .9rem; }
  .choisie { margin: 6px 0 0; color: #2F5D50; font-weight: 700; }
  .message { margin: 6px 0 0; color: #7a6220; font-size: .95rem; }
</style>
