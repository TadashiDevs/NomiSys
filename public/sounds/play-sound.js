// Función para reproducir sonido de notificación
function playNotificationSound() {
  try {
    // Crear elemento de audio
    const audioElement = new Audio('/sounds/notification.mp3');
    audioElement.volume = 0.5; // Volumen al 50%

    // Precargar el audio
    audioElement.load();

    // Reproducir el sonido cuando el usuario interactúe con la página
    const playAudio = () => {
      audioElement.play().catch(err => {
        console.error('Error al reproducir sonido:', err);
      });
      // Eliminar el evento después de la primera interacción
      document.removeEventListener('click', playAudio);
      document.removeEventListener('keydown', playAudio);
    };

    // Intentar reproducir inmediatamente
    audioElement.play().catch(err => {
      console.log('Reproducción automática bloqueada, esperando interacción del usuario');
      // Si falla, esperar a que el usuario interactúe
      document.addEventListener('click', playAudio);
      document.addEventListener('keydown', playAudio);
    });
  } catch (error) {
    console.error('Error al crear objeto de audio:', error);
  }
}

// Exponer la función globalmente
window.playNotificationSound = playNotificationSound;

// Inicializar el audio cuando la página esté lista
document.addEventListener('DOMContentLoaded', () => {
  // Crear un audio silencioso para "desbloquear" la reproducción de audio
  const silentAudio = new Audio("data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
  silentAudio.play().catch(() => {});
});
