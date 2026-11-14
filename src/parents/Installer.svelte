<script lang="ts">
  // Aide à l'installation : l'histoire sur l'écran d'accueil de la tablette, sans store
  import { appareil, installable, installer, surChangement, lienChrome } from '../lib/installation';

  const quoi = appareil();
  let peutInstaller = $state(installable());
  let message = $state('');
  $effect(() => surChangement(() => { peutInstaller = installable(); }));

  async function lancer() {
    message = (await installer()) ? "C'est fait : l'icône de Quenotte est sur l'écran d'accueil." : '';
  }
</script>

<details class="installer carte" open={quoi !== 'installee'}>
  <summary>Installer l'appli sur cet appareil</summary>
  {#if quoi === 'installee'}
    <p>L'appli est déjà installée : vous l'utilisez en ce moment.</p>
  {:else}
    <p class="aide">Gratuit, sans store : l'icône de Quenotte sur l'écran d'accueil, l'histoire en plein écran, et elle fonctionne même sans réseau.</p>

    {#if peutInstaller}
      <button type="button" class="btn btn-or" onclick={lancer}>Installer l'appli</button>
    {/if}
    {#if message}<p class="ok" role="status">{message}</p>{/if}

    {#if quoi === 'ios'}
      <ol>
        <li>Ouvrez cette page dans <b>Safari</b>.</li>
        <li>Touchez le bouton <b>Partager</b> (le carré avec une flèche vers le haut).</li>
        <li>Choisissez <b>« Sur l'écran d'accueil »</b>, puis <b>Ajouter</b>.</li>
      </ol>
    {:else if quoi === 'android-autre'}
      <p class="attention">
        Installez l'appli depuis <b>Chrome</b>. Avec un autre navigateur (Samsung Internet notamment),
        Android peut afficher « Appli non sécurisée bloquée » : il s'agit de l'emballage créé par ce navigateur,
        pas de l'histoire, mais Chrome évite cet avertissement.
      </p>
      <a class="btn" href={lienChrome()}>Ouvrir dans Chrome</a>
      <ol>
        <li>Dans Chrome, touchez le menu <b>⋮</b> en haut à droite.</li>
        <li>Choisissez <b>« Ajouter à l'écran d'accueil »</b>, puis <b>Installer</b>.</li>
      </ol>
    {:else if quoi === 'android-chrome'}
      {#if !peutInstaller}
        <ol>
          <li>Touchez le menu <b>⋮</b> en haut à droite de Chrome.</li>
          <li>Choisissez <b>« Ajouter à l'écran d'accueil »</b>, puis <b>Installer</b>.</li>
        </ol>
      {/if}
    {:else if !peutInstaller}
      <p>Sur ordinateur, avec Chrome ou Edge : l'icône d'installation se trouve à droite de la barre d'adresse.
        Pour la tablette de l'enfant, ouvrez cette page directement sur la tablette.</p>
    {/if}
  {/if}
</details>
