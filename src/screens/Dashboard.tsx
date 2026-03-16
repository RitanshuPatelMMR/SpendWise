// import React from 'react'
// import { View, Text, StyleSheet } from 'react-native'
// import { Colors } from '../constants/colors'

// export default function Dashboard() {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.text}>Dashboard</Text>
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
//   text: { fontSize: 24, fontWeight: '600', color: Colors.textPrimary },
// })

import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Colors } from '../constants/colors'
import { setOnTransactionReceived } from '../services/smsListener'

export default function Dashboard() {
  const testBottomSheet = () => {
    const fakeTransaction = {
      id: 'test-123',
      amount: 299,
      merchant: 'ZOMATO',
      suggested_category_id: null,
    }
    // Trigger the callback that App.tsx is listening to
    const event = new CustomEvent('test', { detail: fakeTransaction })
    setOnTransactionReceived((t) => {
      console.log('Bottom sheet triggered with:', t)
    })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dashboard</Text>
      <TouchableOpacity style={styles.btn} onPress={testBottomSheet}>
        <Text style={styles.btnText}>Test Bottom Sheet</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  text: { fontSize: 24, fontWeight: '600', color: Colors.textPrimary, marginBottom: 24 },
  btn: { backgroundColor: Colors.primary, padding: 16, borderRadius: 12 },
  btnText: { color: Colors.white, fontWeight: '600' },
})