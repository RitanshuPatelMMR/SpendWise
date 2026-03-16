import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator
} from 'react-native'
import { Colors } from '../constants/colors'
import { useCategoryStore } from '../store/categoryStore'
import api from '../services/api'

type Transaction = {
  id: string
  amount: any
  merchant: string
  transaction_date: string
  status: string
  category_id: string | null
}

export default function BulkTag({ navigation }: any) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTxn, setSelectedTxn] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { categories } = useCategoryStore()

  useEffect(() => {
    loadPending()
  }, [])

  const loadPending = async () => {
    try {
      const res = await api.get('/transactions?status=PENDING')
      setTransactions(res.data.transactions)
    } catch (e) {
      console.error('Failed to load pending:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleTag = async (txnId: string, categoryId: string) => {
    try {
      await api.put(`/transactions/${txnId}`, {
        category_id: categoryId,
        status: 'CONFIRMED',
      })
      setTransactions(prev => prev.filter(t => t.id !== txnId))
    } catch (e) {
      console.error('Failed to tag:', e)
    }
  }

  const handleSkipAll = async () => {
    try {
      await Promise.all(
        transactions.map(t =>
          api.put(`/transactions/${t.id}`, { status: 'SKIPPED' })
        )
      )
      setTransactions([])
    } catch (e) {
      console.error('Failed to skip all:', e)
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  if (transactions.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyEmoji}>🎉</Text>
        <Text style={styles.emptyText}>All caught up!</Text>
        <Text style={styles.emptySubtext}>No pending transactions to tag</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tag Expenses</Text>
        <Text style={styles.count}>{transactions.length} pending</Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.txnCard}>
            <View style={styles.txnInfo}>
              <Text style={styles.merchant}>{item.merchant}</Text>
              <Text style={styles.amount}>
                ₹{parseFloat(item.amount.toString()).toFixed(2)}
              </Text>
            </View>
            <Text style={styles.date}>
              {new Date(item.transaction_date).toLocaleDateString('en-IN')}
            </Text>

            {/* Quick category buttons */}
            <View style={styles.catRow}>
              {categories.slice(0, 5).map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.catChip}
                  onPress={() => handleTag(item.id, cat.id)}>
                  <Text style={styles.catChipText}>{cat.icon} {cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => handleTag(item.id, categories.find(c => c.is_default)?.id || '')}>
              <Text style={styles.skipText}>Skip → Others</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ padding: 16 }}
      />

      <TouchableOpacity style={styles.skipAllBtn} onPress={handleSkipAll}>
        <Text style={styles.skipAllText}>Skip All</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: Colors.white },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  count: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  emptySubtext: { fontSize: 14, color: Colors.textSecondary, marginTop: 8 },
  txnCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 12 },
  txnInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  merchant: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  amount: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  date: { fontSize: 12, color: Colors.textHint, marginBottom: 12 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  catChip: { backgroundColor: Colors.primaryLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  catChipText: { fontSize: 12, color: Colors.primary, fontWeight: '500' },
  skipBtn: { alignSelf: 'flex-start', marginTop: 4 },
  skipText: { fontSize: 12, color: Colors.textHint },
  skipAllBtn: { margin: 16, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  skipAllText: { color: Colors.textSecondary, fontWeight: '500' },
})