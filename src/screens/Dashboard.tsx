import React, { useEffect, useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator
} from 'react-native'
import { Colors } from '../constants/colors'
import { useUserStore } from '../store/userStore'
import api from '../services/api'

type Summary = {
  total: number
  lastTotal: number
  vsLastMonth: number
  byCategory: { name: string, icon: string, color: string, amount: number }[]
  dailySpending: { day: number, amount: number }[]
  totalBudget: number
  remaining: number
  safePerDay: number
  daysLeft: number
  transactionCount: number
}

type Transaction = {
  id: string
  amount: any
  my_share: any
  merchant: string
  transaction_date: string
  status: string
  category: { name: string, icon: string, color: string } | null
}

export default function Dashboard({ navigation }: any) {
  const { user } = useUserStore()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const monthName = now.toLocaleString('en-IN', { month: 'long' })

  const loadData = useCallback(async () => {
    try {
      const [summaryRes, txnRes, pendingRes] = await Promise.all([
        api.get(`/reports/summary?month=${month}&year=${year}`),
        api.get(`/transactions?month=${month}&year=${year}&status=CONFIRMED`),
        api.get('/transactions?status=PENDING'),
      ])
      setSummary(summaryRes.data)
      setTransactions(txnRes.data.transactions)
      setPendingCount(pendingRes.data.transactions.length)
    } catch (e) {
      console.error('Dashboard load error:', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [month, year])

  useEffect(() => { loadData() }, [loadData])

  const onRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  // Group transactions by date
  const grouped = transactions.reduce((acc, t) => {
    const date = new Date(t.transaction_date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    let label = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    if (date.toDateString() === today.toDateString()) label = 'Today'
    else if (date.toDateString() === yesterday.toDateString()) label = 'Yesterday'

    if (!acc[label]) acc[label] = []
    acc[label].push(t)
    return acc
  }, {} as Record<string, Transaction[]>)

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  const greeting = () => {
    const h = now.getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting()}, {firstName} 👋</Text>
          <Text style={styles.month}>{monthName} {year}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => {}}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Pending Banner */}
      {pendingCount > 0 && (
        <TouchableOpacity
          style={styles.pendingBanner}
          onPress={() => navigation.navigate('BulkTag')}>
          <Text style={styles.pendingEmoji}>🏷️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.pendingTitle}>
              {pendingCount} expense{pendingCount > 1 ? 's' : ''} to tag
            </Text>
            <Text style={styles.pendingSubtext}>Tap to categorize now</Text>
          </View>
          <Text style={styles.pendingArrow}>›</Text>
        </TouchableOpacity>
      )}

      {/* Summary Card */}
      {summary && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Spent this month</Text>
              <Text style={styles.summaryValue}>₹{summary.total.toFixed(0)}</Text>
              <Text style={[styles.summaryChange,
                { color: summary.vsLastMonth > 0 ? Colors.danger : Colors.success }]}>
                {summary.vsLastMonth > 0 ? '▲' : '▼'} {Math.abs(summary.vsLastMonth).toFixed(0)}% vs last month
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Safe to spend/day</Text>
              <Text style={[styles.summaryValue,
                { color: summary.safePerDay < 0 ? Colors.danger : Colors.success }]}>
                ₹{Math.max(0, summary.safePerDay).toFixed(0)}
              </Text>
              <Text style={styles.summaryChange}>{summary.daysLeft} days left</Text>
            </View>
          </View>

          {summary.totalBudget > 0 && (
            <View style={styles.budgetBar}>
              <View style={styles.budgetBarBg}>
                <View style={[styles.budgetBarFill, {
                  width: `${Math.min(100, (summary.total / summary.totalBudget) * 100)}%`,
                  backgroundColor: summary.total > summary.totalBudget ? Colors.danger :
                    summary.total > summary.totalBudget * 0.8 ? Colors.warning : Colors.primary
                }]} />
              </View>
              <Text style={styles.budgetText}>
                ₹{summary.remaining.toFixed(0)} of ₹{summary.totalBudget.toFixed(0)} remaining
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Daily Bar Chart */}
      {summary && summary.dailySpending.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Daily spending</Text>
          <View style={styles.barsContainer}>
            {summary.dailySpending.slice(-14).map((d) => {
              const max = Math.max(...summary.dailySpending.map(x => x.amount), 1)
              const height = Math.max(4, (d.amount / max) * 80)
              const isToday = d.day === now.getDate()
              const isHigh = d.amount > (summary.total / summary.dailySpending.filter(x => x.amount > 0).length) * 1.5
              return (
                <View key={d.day} style={styles.barWrapper}>
                  <View style={[styles.bar, {
                    height,
                    backgroundColor: isToday ? Colors.primary :
                      isHigh ? Colors.danger : Colors.secondary
                  }]} />
                  <Text style={styles.barLabel}>{d.day}</Text>
                </View>
              )
            })}
          </View>
        </View>
      )}

      {/* Transaction List */}
      <View style={styles.txnSection}>
        <Text style={styles.sectionTitle}>Transactions</Text>
        {transactions.length === 0 ? (
          <View style={styles.emptyTxn}>
            <Text style={styles.emptyEmoji}>💸</Text>
            <Text style={styles.emptyText}>No transactions this month</Text>
            <Text style={styles.emptySubtext}>They'll appear here automatically when you make UPI payments</Text>
          </View>
        ) : (
          Object.entries(grouped).map(([date, txns]) => (
            <View key={date}>
              <Text style={styles.dateLabel}>{date}</Text>
              {txns.map(t => (
                <TouchableOpacity key={t.id} style={styles.txnRow}>
                  <View style={[styles.txnIcon, { backgroundColor: t.category?.color + '20' || '#eee' }]}>
                    <Text style={styles.txnEmoji}>{t.category?.icon || '💰'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.txnMerchant}>{t.merchant}</Text>
                    <Text style={styles.txnCategory}>{t.category?.name || 'Uncategorized'}</Text>
                  </View>
                  <Text style={styles.txnAmount}>
                    -₹{parseFloat((t.my_share || t.amount).toString()).toFixed(0)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </View>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 56, backgroundColor: Colors.white },
  greeting: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  month: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  addBtn: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: Colors.white, fontWeight: '600', fontSize: 14 },
  pendingBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF9E6', borderLeftWidth: 4, borderLeftColor: Colors.warning, margin: 16, borderRadius: 12, padding: 14, gap: 12 },
  pendingEmoji: { fontSize: 28 },
  pendingTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  pendingSubtext: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  pendingArrow: { fontSize: 24, color: Colors.textHint },
  summaryCard: { backgroundColor: Colors.white, margin: 16, borderRadius: 16, padding: 20 },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, height: 50, backgroundColor: Colors.border },
  summaryLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  summaryValue: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  summaryChange: { fontSize: 11, color: Colors.textHint, marginTop: 4 },
  budgetBar: { marginTop: 16 },
  budgetBarBg: { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  budgetBarFill: { height: '100%', borderRadius: 3 },
  budgetText: { fontSize: 11, color: Colors.textHint, marginTop: 6, textAlign: 'center' },
  chartCard: { backgroundColor: Colors.white, margin: 16, marginTop: 0, borderRadius: 16, padding: 20 },
  chartTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginBottom: 16 },
  barsContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 4 },
  barWrapper: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '80%', borderRadius: 3 },
  barLabel: { fontSize: 9, color: Colors.textHint, marginTop: 4 },
  txnSection: { padding: 16, paddingTop: 0 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  dateLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginTop: 16, marginBottom: 8 },
  txnRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 12, padding: 14, marginBottom: 8, gap: 12 },
  txnIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  txnEmoji: { fontSize: 22 },
  txnMerchant: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  txnCategory: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  txnAmount: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  emptyTxn: { alignItems: 'center', padding: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  emptySubtext: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20 },
})