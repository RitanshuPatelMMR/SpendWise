import React, { useEffect, useState } from 'react'
import AppNavigator from './src/navigation/AppNavigator'
import { startSMSListener, setOnTransactionReceived } from './src/services/smsListener'
import TaggingBottomSheet from './src/components/TaggingBottomSheet'
import api from './src/services/api'

export default function App() {
  const [pendingTransaction, setPendingTransaction] = useState<any>(null)
  const [sheetVisible, setSheetVisible] = useState(false)

  useEffect(() => {
    setOnTransactionReceived((transaction) => {
      setPendingTransaction(transaction)
      setSheetVisible(true)
    })
    const cleanup = startSMSListener()
    return cleanup
  }, [])

  return (
    <>
      <AppNavigator />
      <TaggingBottomSheet
        visible={sheetVisible}
        transaction={pendingTransaction}
        onClose={() => setSheetVisible(false)}
        onSaved={() => {
          setSheetVisible(false)
          setPendingTransaction(null)
        }}
      />
    </>
  )
}