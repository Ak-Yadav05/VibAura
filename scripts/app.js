import { initThemeManager } from './themeManager.js';
import { initMusicPlayer } from './musicPlayer.js';
import './uiRenderer.js'; // This import runs the router setup

document.addEventListener('DOMContentLoaded', () => {
  initThemeManager();
  initMusicPlayer();
});