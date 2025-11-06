/**
 * Composable pour la connexion WebSocket
 */
import { ref, onMounted, onUnmounted } from 'vue'

export function useWebSocket() {
  const ws = ref(null)
  const connected = ref(false)
  const messages = ref([])
  const error = ref(null)

  const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000'

  /**
   * Connexion au WebSocket
   */
  function connect(token) {
    try {
      // Connexion avec le token en query parameter
      const url = token ? `${WS_URL}?token=${token}` : WS_URL
      ws.value = new WebSocket(url)

      ws.value.onopen = () => {
        connected.value = true
        error.value = null
        console.log('✅ WebSocket connecté')
      }

      ws.value.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          messages.value.push({
            ...data,
            timestamp: new Date().toISOString()
          })
          console.log('📨 Message WebSocket reçu:', data)
        } catch (err) {
          console.error('Erreur parsing message WebSocket:', err)
        }
      }

      ws.value.onerror = (err) => {
        error.value = 'Erreur WebSocket'
        console.error('❌ Erreur WebSocket:', err)
      }

      ws.value.onclose = () => {
        connected.value = false
        console.log('🔌 WebSocket déconnecté')
      }
    } catch (err) {
      error.value = err.message
      console.error('Erreur connexion WebSocket:', err)
    }
  }

  /**
   * Déconnexion du WebSocket
   */
  function disconnect() {
    if (ws.value) {
      ws.value.close()
      ws.value = null
      connected.value = false
      messages.value = []
    }
  }

  /**
   * Envoie un message
   */
  function send(data) {
    if (ws.value && connected.value) {
      ws.value.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket non connecté')
    }
  }

  /**
   * Efface les messages
   */
  function clearMessages() {
    messages.value = []
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    ws,
    connected,
    messages,
    error,
    connect,
    disconnect,
    send,
    clearMessages
  }
}
