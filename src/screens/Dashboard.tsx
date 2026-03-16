import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Colors } from '../constants/colors'
import api from '../services/api'

export default function Dashboard({ navigation }: any) {
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    loadPendingCount()
  }, [])

  const loadPendingCount = async () => {
    try {
      const res = await api.get('/transactions?status=PENDING')
      setPendingCount(res.data.transactions.length)
    } catch (e) {}
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spendwise</Text>

      {pendingCount > 0 && (
        <TouchableOpacity
          style={styles.pendingBanner}
          onPress={() => navigation.navigate('BulkTag')}>
          <Text style={styles.pendingEmoji}>🏷️</Text>
          <View>
            <Text style={styles.pendingTitle}>
              {pendingCount} expense{pendingCount > 1 ? 's' : ''} to tag
            </Text>
            <Text style={styles.pendingSubtext}>Tap to categorize now</Text>
          </View>
          <Text style={styles.pendingArrow}>›</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.placeholder}>Dashboard coming in Week 7!</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary, marginTop: 48, marginBottom: 24 },
  pendingBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 16, gap: 12, borderLeftWidth: 4, borderLeftColor: Colors.warning },
  pendingEmoji: { fontSize: 32 },
  pendingTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  pendingSubtext: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  pendingArrow: { marginLeft: 'auto', fontSize: 24, color: Colors.textHint },
  placeholder: { fontSize: 16, color: Colors.textHint, textAlign: 'center', marginTop: 40 },
})