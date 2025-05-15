// SoundNotification.js
export class SoundNotification {
  constructor() {
    this._audio = null;
    this._enabled = true;
    this._initialized = false;
  }

  /**
   * Précharge le fichier audio pour éviter les délais lors de la lecture
   */
  preload() {
    if (this._initialized) return;
    
    this._audio = new Audio('/sound/notification.mp3');
    this._audio.preload = 'auto';
    
    // Tentative de préchargement
    this._audio.load();
    this._initialized = true;
  }

  /**
   * Joue le son de notification si activé
   * @returns {Promise} Une promesse qui se résout lorsque le son est joué
   */
  play() {
    if (!this._enabled || !this._initialized) return Promise.resolve();
    
    // Assurez-vous que l'audio est prêt à être joué depuis le début
    this._audio.currentTime = 0;
    
    return this._audio.play()
      .catch(error => {
        console.warn("Impossible de jouer la notification sonore:", error);
        
        // Si le son est bloqué par le navigateur, on pourrait demander une interaction utilisateur
        if (error.name === 'NotAllowedError') {
          console.info("Les notifications sonores nécessitent une interaction utilisateur.");
        }
      });
  }

  /**
   * Active ou désactive les notifications sonores
   * @param {boolean} value - true pour activer, false pour désactiver
   */
  setEnabled(value) {
    this._enabled = Boolean(value);
    // Sauvegarder la préférence dans le localStorage
    localStorage.setItem('sound_notifications_enabled', this._enabled);
    return this._enabled;
  }

  /**
   * Vérifie si les notifications sonores sont activées
   * @returns {boolean} true si activées, false sinon
   */
  isEnabled() {
    // Récupérer la préférence du localStorage si disponible
    if (typeof localStorage !== 'undefined') {
      const storedPref = localStorage.getItem('sound_notifications_enabled');
      if (storedPref !== null) {
        this._enabled = storedPref === 'true';
      }
    }
    return this._enabled;
  }
}