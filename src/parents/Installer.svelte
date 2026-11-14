<script lang="ts">
  // Aide à l'installation : l'histoire sur l'écran d'accueil du téléphone ou de la tablette, sans store
  import { appareil, installable, installer, surChangement, lienChrome, vientDEtreInstallee } from '../lib/installation';

  const quoi = appareil();
  let peutInstaller = $state(installable());
  let fait = $state(vientDEtreInstallee());
  $effect(() => surChangement(() => { peutInstaller = installable(); fait = vientDEtreInstallee(); }));
</script>

<details class="installer carte" open={quoi !== 'installee'}>
  <summary>Installer l'appli sur cet appareil</summary>
  {#if quoi === 'installee'}
    <p>L'appli est déjà installée : vous l'utilisez en ce moment.</p>
  {:else}
    <p class="aide">Gratuit, sans store : l'icône de Quenotte sur l'écran d'accueil, l'histoire en plein écran, et elle fonctionne même sans réseau.</p>

    <!-- Samsung Internet propose aussi l'installation, mais son appli est bloquée par Play Protect : on passe par Chrome -->
    {#if peutInstaller && quoi !== 'android-autre'}
      <button type="button" class="btn btn-or" onclick={installer}>Installer l'appli</button>
    {/if}
    {#if fait}
      <p class="ok" role="status">C'est fait : l'icône de Quenotte est sur l'écran d'accueil.</p>
    {:else if quoi === 'ios'}
      <ol>
        <li>Ouvrez cette page dans <b>Safari</b>.</li>
        <li>Touchez le bouton <b>Partager</b> (le carré avec une flèche vers le haut).</li>
        <li>Choisissez <b>« Sur l'écran d'accueil »</b>, puis <b>Ajouter</b>.</li>
      </ol>
    {:else if quoi === 'android-autre'}
      <p>Pour installer l'appli, passez par <b>Chrome</b> : un seul clic suffira.</p>
      <a class="btn btn-or" href={lienChrome()}>Ouvrir dans Chrome</a>
    {:else if quoi === 'android-chrome'}
      {#if !peutInstaller}
        <ol>
          <li>Touchez le menu <b>⋮</b> en haut à droite de Chrome.</li>
          <li>Choisissez <b>« Ajouter à l'écran d'accueil »</b>, puis <b>Installer</b>.</li>
        </ol>
      {/if}
    {:else if !peutInstaller}
      <p>Sur ordinateur, avec Chrome ou Edge : l'icône d'installation se trouve à droite de la barre d'adresse.
        Pour le téléphone ou la tablette de l'enfant, ouvrez cette page directement dessus.</p>
    {/if}
  {/if}
</details>
