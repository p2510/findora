// plugins/color-mode.client.js
export default defineNuxtPlugin((nuxtApp) => {
  const colorMode = useColorMode()
  
  // Récupérer la préférence sauvegardée au chargement
  onMounted(() => {
    const savedTheme = localStorage.getItem('color-theme')
    if (savedTheme) {
      colorMode.preference = savedTheme
      colorMode.value = savedTheme
    }
  })
  
  // Sauvegarder la préférence quand elle change
  watch(() => colorMode.value, (newValue) => {
    localStorage.setItem('color-theme', newValue)
  })
})