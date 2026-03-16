import React, { useEffect, useState } from 'react'
import AppNavigator from './src/navigation/AppNavigator'
import { startSMSListener, setOnTransactionReceived } from './src/services/smsListener'
import TaggingBottomSheet from './src/components/TaggingBottomSheet'
import api from './src/services/api'  // ← ADD THIS LINEs

export default function App() {
  const [pendingTransaction, setPendingTransaction] = useState<any>(null)
  const [sheetVisible, setSheetVisible] = useState(false)

  useEffect(() => {
    setOnTransactionReceived((transaction) => {
      setPendingTransaction(transaction)
      setSheetVisible(true)
    })

    const cleanup = startSMSListener()

    // TEST — remove before production
// setTimeout(async () => {
//   try {
//     const response = await api.post('/transactions', {
//       amount: 299,
//       merchant: 'ZOMATO',
//       bank: 'Axis Bank',
//       account_masked: 'XX2706',
//       mode: 'UPI',
//       txn_type: 'P2M',
//       upi_ref: '643981255700',
//       sms_raw: 'Test SMS',
//       transaction_date: new Date().toISOString(),
//     })
//     console.log('Test transaction created:', response.data.transaction.id)
//     setPendingTransaction(response.data.transaction)
//     setSheetVisible(true)
//   } catch (e) {
//     console.error('Test transaction error:', e)
//   }
// }, 3000)

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