// Espace parents : créer le profil de l'enfant et son QR code
import '../styles/style.css';
import './parents.css';
import { mount } from 'svelte';
import '../lib/plateforme';
import { activerTypographie } from '../lib/typographie';
activerTypographie(); // une espace insécable devant ! et ?
import { initStockage } from '../lib/stockage';
import App from './App.svelte';
import { activerHorsLigne } from '../lib/horsLigne';
import { pleinEcranAuPremierToucher } from '../lib/pleinEcran';

activerHorsLigne();
pleinEcranAuPremierToucher();

await initStockage();
mount(App, { target: document.getElementById('app')! });
