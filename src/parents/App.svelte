<script lang="ts">
  // L'espace parents : verrou anti-enfant, formulaire en cinq étapes, puis le QR code.
  import { stockage } from '../lib/stockage';
  import { chargerProfil } from '../lib/profilCourant';
  import { TYPES_DOUDOU, BILLETS, CACHETTES } from '../lib/profil';
  import { type Brouillon, nouveauBrouillon, depuisProfil, versProfil, erreursEtape, erreursProfil, ETAPES } from './brouillon';
  import { DOUDOUS, CACHETTES_INFO, svgBillet } from './icones';
  import SchemaDents from './SchemaDents.svelte';
  import ChoixVille from './ChoixVille.svelte';
  import Resultat from './Resultat.svelte';

  const CLE_BROUILLON = 'souris.parents.brouillon';

  // ---------- Verrou : maintenir le bouton 3 secondes ----------
  let deverrouille = $state(sessionOuverte());
  let progression = $state(0);
  let minuteur: ReturnType<typeof setInterval> | undefined;
  function sessionOuverte() { try { return sessionStorage.getItem('souris.parents') === '1'; } catch { return false; } }
  function appuyer(e: PointerEvent) {
    e.preventDefault();
    clearInterval(minuteur); progression = 0;
    minuteur = setInterval(() => {
      progression = Math.min(1, progression + 0.05);
      if (progression >= 1) {
        clearInterval(minuteur); deverrouille = true;
        try { sessionStorage.setItem('souris.parents', '1'); } catch { /* session privée */ }
      }
    }, 150);
  }
  function relacher() { clearInterval(minuteur); if (!deverrouille) progression = 0; }

  // ---------- Formulaire ----------
  // Reprise : le brouillon en cours, sinon le profil déjà créé sur cet appareil, sinon un formulaire vide
  function brouillonInitial(): Brouillon {
    try { const b = stockage.lire(CLE_BROUILLON); if (b) return { ...nouveauBrouillon(), ...JSON.parse(b) }; } catch { /* brouillon illisible */ }
    const pc = chargerProfil();
    return pc.origine === 'exemple' ? nouveauBrouillon() : depuisProfil(pc.profil);
  }
  let b = $state<Brouillon>(brouillonInitial());
  let etape = $state(0);
  let tente = $state(false); // on n'affiche les erreurs qu'après une tentative
  let fini = $state(false);
  const erreurs = $derived(erreursEtape(b, etape));

  $effect(() => { stockage.ecrire(CLE_BROUILLON, JSON.stringify(b)); });

  function suivant() {
    tente = true;
    if (erreurs.length) return;
    tente = false;
    if (etape < ETAPES.length - 1) { etape++; haut(); return; }
    if (!erreursProfil(b).length) { fini = true; haut(); }
  }
  function precedent() { tente = false; if (etape > 0) { etape--; haut(); } }
  function aller(n: number) {
    // On ne saute en avant que si les étapes intermédiaires sont complètes
    for (let i = 0; i < n; i++) if (erreursEtape(b, i).length) { etape = i; tente = true; return; }
    tente = false; etape = n; fini = false; haut();
  }
  function recommencer() {
    if (!confirm('Effacer toutes les informations et recommencer ?')) return;
    b = nouveauBrouillon(); etape = 0; fini = false; tente = false;
  }
  function haut() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

  const profil = $derived(fini ? versProfil(b) : null);
  const accord = $derived(b.genre === 'g' ? 'il' : b.genre === 'f' ? 'elle' : 'il ou elle');
</script>

{#if !deverrouille}
  <main class="verrou">
    <div class="carte">
      <h1>Espace parents</h1>
      <p>Ici, vous préparez l'histoire de votre enfant : prénom, doudou, dent tombée, cadeau…</p>
      <button
        class="tenir" type="button"
        onpointerdown={appuyer} onpointerup={relacher} onpointerleave={relacher} onpointercancel={relacher}
        oncontextmenu={(e) => e.preventDefault()}
        style="--p:{progression}"
      >
        <span>Maintenez ce bouton 3 secondes</span>
      </button>
      <p class="petit">Un petit verrou pour que les enfants ne tombent pas dessus par hasard.</p>
      <a class="retour" href="../">Retour à l'histoire</a>
    </div>
  </main>
{:else}
  <main class="parents">
    <header>
      <h1>Espace parents</h1>
      <a class="retour" href="../">Retour à l'histoire</a>
    </header>

    {#if !fini}
      <nav class="etapes" aria-label="Étapes">
        {#each ETAPES as nom, i}
          <button type="button" class:active={i === etape} class:faite={i < etape} aria-current={i === etape ? 'step' : undefined} onclick={() => aller(i)}>
            <span class="num">{i + 1}</span><span class="nom">{nom}</span>
          </button>
        {/each}
      </nav>

      <form class="carte" onsubmit={(e) => { e.preventDefault(); suivant(); }} novalidate>
        {#if etape === 0}
          <h2>L'enfant</h2>
          <label>Prénom
            <input type="text" bind:value={b.prenom} maxlength="40" autocomplete="off" autocapitalize="words" required />
          </label>
          <fieldset>
            <legend>C'est…</legend>
            <div class="choix deux">
              <label class="option" class:choisi={b.genre === 'f'}><input type="radio" bind:group={b.genre} value="f" /> une fille</label>
              <label class="option" class:choisi={b.genre === 'g'}><input type="radio" bind:group={b.genre} value="g" /> un garçon</label>
            </div>
          </fieldset>
          <fieldset>
            <legend>Son doudou</legend>
            <div class="choix grille">
              {#each TYPES_DOUDOU as t}
                <label class="option icone" class:choisi={b.doudouType === t}>
                  <input type="radio" bind:group={b.doudouType} value={t} />
                  {@html DOUDOUS[t].svg}<span>{DOUDOUS[t].nom}</span>
                </label>
              {/each}
            </div>
          </fieldset>
          {#if b.doudouType !== 'aucun'}
            <label>Le nom du doudou
              <input type="text" bind:value={b.doudouNom} maxlength="40" autocomplete="off" autocapitalize="words" />
            </label>
          {/if}
          <fieldset>
            <legend>Un frère ou une sœur ?</legend>
            <label class="case"><input type="checkbox" bind:checked={b.fratrie} /> Oui, Quenotte pourra en parler</label>
            {#if b.fratrie}
              <div class="choix deux">
                <label class="option" class:choisi={b.fratrieGenre === 'f'}><input type="radio" bind:group={b.fratrieGenre} value="f" /> une sœur</label>
                <label class="option" class:choisi={b.fratrieGenre === 'g'}><input type="radio" bind:group={b.fratrieGenre} value="g" /> un frère</label>
              </div>
              <label>Son prénom
                <input type="text" bind:value={b.fratriePrenom} maxlength="40" autocomplete="off" autocapitalize="words" />
              </label>
              <label class="case"><input type="checkbox" bind:checked={b.fratrieACote} /> Dort dans la même chambre</label>
            {/if}
          </fieldset>
        {:else if etape === 1}
          <h2>La dent</h2>
          <p class="aide">Touchez la dent tombée cette nuit, puis celles déjà tombées avant. L'histoire change selon le cas.</p>
          <SchemaDents bind:nuit={b.dentNuit} bind:deja={b.dentsDeja} />
        {:else if etape === 2}
          <h2>Le cadeau</h2>
          <fieldset>
            <legend>Le billet laissé par Quenotte</legend>
            <div class="choix billets">
              {#each BILLETS as v}
                <label class="option billet" class:choisi={b.billet === v}>
                  <input type="radio" bind:group={b.billet} value={v} />{@html svgBillet(v)}<span>{v} €</span>
                </label>
              {/each}
            </div>
          </fieldset>
          <fieldset>
            <legend>Où sèchera-t-il ?</legend>
            <p class="aide">Dans l'histoire, le billet sert de bateau, puis sèche à cet endroit jusqu'au matin. Le mot sous l'oreiller l'indiquera à votre enfant.</p>
            <div class="choix grille">
              {#each CACHETTES as k}
                <label class="option icone" class:choisi={b.cachette === k}>
                  <input type="radio" bind:group={b.cachette} value={k} />
                  {@html CACHETTES_INFO[k].svg}<span>{CACHETTES_INFO[k].nom}{#if CACHETTES_INFO[k].conseil}<small> ({CACHETTES_INFO[k].conseil})</small>{/if}</span>
                </label>
              {/each}
            </div>
          </fieldset>
        {:else if etape === 3}
          <h2>La maison</h2>
          <div class="champ">
            <span class="libelle">La ville où {accord} habite</span>
            <ChoixVille bind:ville={b.ville} />
            <p class="aide">Quenotte y arrive en montgolfière. Seul le nom tapé est envoyé au service public des communes, pour proposer des suggestions.</p>
          </div>
          <label>Le chat du voisin, qui dort devant la porte
            <input type="text" bind:value={b.chat} maxlength="40" autocomplete="off" autocapitalize="words" />
          </label>
        {:else}
          <h2>La nuit</h2>
          <label>Le soir où la Petite Souris passe
            <input type="date" bind:value={b.nuit} />
          </label>
          <p class="aide">L'histoire commence ce soir-là à 0 h 45 et se termine vers 3 h du matin.</p>
        {/if}

        {#if tente && erreurs.length}
          <ul class="erreurs" role="alert">{#each erreurs as e}<li>{e}</li>{/each}</ul>
        {/if}

        <div class="nav">
          {#if etape > 0}<button type="button" class="btn" onclick={precedent}>Retour</button>{/if}
          <button type="submit" class="btn btn-or">{etape < ETAPES.length - 1 ? 'Suivant' : 'Créer le QR code'}</button>
        </div>
      </form>
      <button type="button" class="lien" onclick={recommencer}>Tout effacer et recommencer</button>
    {:else if profil}
      <div class="carte"><Resultat {profil} modifier={() => aller(0)} /></div>
    {/if}

    <p class="vie-privee">Rien n'est enregistré sur un serveur : les informations voyagent dans le QR code, et restent sur cet appareil.</p>
  </main>
{/if}
