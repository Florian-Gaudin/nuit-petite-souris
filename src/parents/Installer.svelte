<script lang="ts">
  // Aide à l'installation : l'histoire sur l'écran d'accueil du téléphone ou de la tablette, sans store
  import { appareil, installable, installer, surChangement, lienChrome, vientDEtreInstallee } from '../lib/installation';

  const quoi = appareil();
  let fait = $state(vientDEtreInstallee());
  let secours = $state(false); // Chrome ne propose pas (encore) l'installation : l'explication, après le clic seulement
  $effect(() => surChangement(() => { fait = vientDEtreInstallee(); if (installable()) secours = false; }));

  // Toujours un bouton : la fenêtre d'installation du navigateur si elle est prête, sinon l'explication
  async function lancer() {
    if (installable()) await installer();
    else secours = true;
  }
</script>

<details class="installer carte" open={quoi !== 'installee'}>
  <summary>Installer l'appli sur cet appareil</summary>
  {#if quoi === 'installee'}
    <p>L'appli est déjà installée : vous l'utilisez en ce moment.</p>
  {:else if fait}
    <p class="ok" role="status">C'est fait : l'icône de Quenotte est sur l'écran d'accueil.</p>
  {:else}
    <p class="aide">Gratuit, sans store : l'icône de Quenotte sur l'écran d'accueil, l'histoire en plein écran, et elle fonctionne même sans réseau.</p>

    {#if quoi === 'ios'}
      <!-- Sur iPhone et iPad, aucun navigateur ne permet de bouton d'installation : seuls les gestes de Safari -->
      <ol>
        <li>Ouvrez cette page dans <b>Safari</b>.</li>
        <li>Touchez le bouton <b>Partager</b> (le carré avec une flèche vers le haut).</li>
        <li>Choisissez <b>« Sur l'écran d'accueil »</b>, puis <b>Ajouter</b>.</li>
      </ol>
    {:else if quoi === 'android-autre'}
      <!-- Samsung Internet propose aussi l'installation, mais son appli est bloquée par Play Protect : on passe par Chrome -->
      <p>Pour installer l'appli, passez par <b>Chrome</b> : un seul clic suffira.</p>
      <a class="btn btn-or" href={lienChrome()}>Ouvrir dans Chrome</a>
    {:else}
      <button type="button" class="btn btn-or" onclick={lancer}>Installer l'appli</button>
      {#if secours}
        <p class="secours" role="status">
          {#if quoi === 'android-chrome'}
            Chrome ne propose pas l'installation pour l'instant : l'appli est peut-être déjà installée (cherchez l'icône de Quenotte).
            Sinon, menu <b>⋮</b> en haut à droite, puis <b>« Ajouter à l'écran d'accueil »</b>.
          {:else}
            Le navigateur ne propose pas l'installation ici : avec Chrome ou Edge, utilisez l'icône d'installation à droite de la barre d'adresse.
            Pour le téléphone ou la tablette de l'enfant, ouvrez cette page directement dessus.
          {/if}
        </p>
      {/if}
    {/if}
  {/if}
</details>
