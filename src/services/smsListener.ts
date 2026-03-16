import { Platform, DeviceEventEmitter } from 'react-native'
import { parseSMS } from '../utils/smsParser'
import { matchCategory } from '../utils/categoryRules'
import api from './api'

type OnTransactionCallback = (transaction: any) => void

let onTransactionReceived: OnTransactionCallback | null = null

export function setOnTransactionReceived(callback: OnTransactionCallback) {
  onTransactionReceived = callback
}

export function startSMSListener() {
  if (Platform.OS !== 'android') return

  console.log('📱 SMS Listener started')

  const subscription = DeviceEventEmitter.addListener(
    'onSMSReceived',
    async (sms: string) => {
      console.log('📨 SMS received:', sms)

      const parsed = parseSMS(sms)
      if (!parsed) {
        console.log('Not a transaction SMS')
        return
      }

      console.log('✅ Parsed:', parsed)
      const suggestedCategory = matchCategory(parsed.merchant)

      try {
        const response = await api.post('/transactions', {
          ...parsed,
          suggested_category: suggestedCategory,
        })
        console.log('💾 Transaction saved!')

        // Trigger bottom sheet if app is open
        if (onTransactionReceived) {
          onTransactionReceived(response.data.transaction)
        }
      } catch (e) {
        console.error('Failed to save:', e)
      }
    }
  )

  return () => subscription.remove()
}