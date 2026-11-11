// Espace parents : créer le profil de l'enfant et son QR code
import '../styles/style.css';
import './parents.css';
import { mount } from 'svelte';
import '../lib/plateforme';
import { initStockage } from '../lib/stockage';
import App from './App.svelte';

await initStockage();
mount(App, { target: document.getElementById('app')! });
