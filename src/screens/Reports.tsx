import React, { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Colors } from '../constants/colors'
import api from '../services/api'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Reports({ navigation }: any) {
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [summary, setSummary]       = useState<any>(null)
  const [sixMonths, setSixMonths]   = useState<any[]>([])
  const [recurring, setRecurring]   = useState<{ merchant: string; avgAmount: number; months: number }[]>([])

  const now          = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear  = now.getFullYear()

  const loadData = useCallback(async () => {
    try {
      // Current month summary — top5, dayOfWeek, byCategory
      const summaryRes = await api.get(`/reports/summary?month=${currentMonth}&year=${currentYear}`)
      setSummary(summaryRes.data)

      // Last 6 months for monthly trend chart
      const months: any[] = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - 1 - i, 1)
        const m = d.getMonth() + 1
        const y = d.getFullYear()
        const res = await api.get(`/reports/summary?month=${m}&year=${y}`)
        months.push({ label: MONTH_NAMES[m - 1], total: res.data.total, byCategory: res.data.byCategory, isCurrent: i === 0 })
      }
      setSixMonths(months)

      // Recurring: merchants in 2+ of last 3 months
      const merchantMap: Record<string, { total: number; count: number; monthSet: Set<number> }> = {}
      for (let i = 0; i < 3; i++) {
        const d = new Date(currentYear, currentMonth - 1 - (2 - i), 1)
        const m = d.getMonth() + 1
        const y = d.getFullYear()
        const txnRes = await api.get(`/transactions?month=${m}&year=${y}&status=CONFIRMED`)
        for (const t of txnRes.data.transactions) {
          const key = t.merchant.toLowerCase().trim()
          if (!merchantMap[key]) merchantMap[key] = { total: 0, count: 0, monthSet: new Set() }
          merchantMap[key].total += parseFloat((t.my_share || t.amount).toString())
          merchantMap[key].count++
          merchantMap[key].monthSet.add(i)
        }
      }
      const recurringList = Object.entries(merchantMap)
        .filter(([, v]) => v.monthSet.size >= 2)
        .map(([merchant, v]) => ({
          merchant: merchant.charAt(0).toUpperCase() + merchant.slice(1),
          avgAmount: v.total / v.count,
          months: v.monthSet.size
        }))
        .sort((a, b) => b.avgAmount - a.avgAmount)
        .slice(0, 5)
      setRecurring(recurringList)
    } catch (e) {
      console.error('Reports load error:', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { loadData() }, [loadData]))

  const onRefresh = () => { setRefreshing(true); loadData() }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  // ── Derived values ──────────────────────────────────────────────────────────
  const maxMonthly    = Math.max(...sixMonths.map(d => d.total), 1)
  const nonZeroMonths = sixMonths.filter(d => d.total > 0)
  const avgMonthly    = nonZeroMonths.length > 0
    ? nonZeroMonths.reduce((s, d) => s + d.total, 0) / nonZeroMonths.length
    : 0

  // Category trends: current vs previous month
  const currCats  = summary?.byCategory || []
  const prevCats  = sixMonths[4]?.byCategory || []
  const catTrends = currCats.slice(0, 6).map((cat: any) => {
    const prev   = prevCats.find((c: any) => c.name === cat.name)
    const change = prev?.amount > 0 ? ((cat.amount - prev.amount) / prev.amount) * 100 : null
    return { ...cat, change }
  })

  // Day of week
  const dowData = summary?.dayOfWeek || []
  const peakDay = dowData.reduce((best: any, d: any) => (d.avg > (best?.avg || 0) ? d : best), null)
  const maxDow  = Math.max(...dowData.map((d: any) => d.avg), 1)

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
        <Text style={styles.subtitle}>{MONTH_NAMES[currentMonth - 1]} {currentYear}</Text>
      </View>

      {/* Year in Review banner */}
      <TouchableOpacity style={styles.yearBanner} onPress={() => navigation.navigate('YearInReview')} activeOpacity={0.85}>
        <View>
          <Text style={styles.yearBannerTitle}>✨ {currentYear} in Review</Text>
          <Text style={styles.yearBannerSub}>See your full year breakdown →</Text>
        </View>
        <Text style={styles.yearBannerArrow}>›</Text>
      </TouchableOpacity>

      {/* ── 1. Monthly Trend ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Monthly Trend</Text>
        <View style={styles.barChartRow}>
          {sixMonths.map((d, i) => {
            const barH = maxMonthly > 0 ? Math.max(4, (d.total / maxMonthly) * 88) : 4
            return (
              <View key={i} style={styles.barCol}>
                <Text style={styles.barValue}>
                  {d.total >= 1000 ? `₹${(d.total / 1000).toFixed(0)}k` : d.total > 0 ? `₹${d.total.toFixed(0)}` : ''}
                </Text>
                <View style={[styles.bar, { height: barH, backgroundColor: d.isCurrent ? Colors.primary : Colors.primary + '40' }]} />
                <Text style={[styles.barLabel, d.isCurrent && { color: Colors.primary, fontWeight: '700' }]}>
                  {d.label}
                </Text>
              </View>
            )
          })}
        </View>
        <View style={styles.trendMeta}>
          <Text style={styles.trendAvg}>Avg ₹{avgMonthly.toFixed(0)}/month</Text>
          {summary?.vsLastMonth !== 0 && (
            <Text style={[styles.trendBadge, { color: summary?.vsLastMonth > 0 ? Colors.danger : Colors.primary }]}>
              {summary?.vsLastMonth > 0 ? '▲' : '▼'} {Math.abs(summary?.vsLastMonth || 0).toFixed(1)}% vs last month
            </Text>
          )}
        </View>
      </View>

      {/* ── 2. Category Trends ── */}
      {catTrends.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Category Trends</Text>
          <Text style={styles.cardSubtitle}>vs last month</Text>
          {catTrends.map((cat: any, i: number) => (
            <View key={i} style={[styles.listRow, i > 0 && styles.rowBorder]}>
              <View style={[styles.iconBox, { backgroundColor: cat.color + '22' }]}>
                <Text style={styles.iconEmoji}>{cat.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{cat.name}</Text>
                <Text style={styles.rowSub}>₹{cat.amount.toFixed(0)}</Text>
              </View>
              {cat.change !== null ? (
                <View style={[styles.badge, {
                  backgroundColor: cat.change > 10 ? Colors.danger + '18' : cat.change < -10 ? Colors.primary + '18' : Colors.warning + '18'
                }]}>
                  <Text style={[styles.badgeText, {
                    color: cat.change > 10 ? Colors.danger : cat.change < -10 ? Colors.primary : Colors.warning
                  }]}>
                    {cat.change > 0 ? '▲' : '▼'} {Math.abs(cat.change).toFixed(0)}%
                  </Text>
                </View>
              ) : (
                <View style={[styles.badge, { backgroundColor: Colors.border }]}>
                  <Text style={[styles.badgeText, { color: Colors.textHint }]}>NEW</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* ── 3. Top 5 Expenses ── */}
      {summary?.top5?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top 5 Expenses</Text>
          {summary.top5.map((txn: any, i: number) => (
            <View key={txn.id} style={[styles.listRow, i > 0 && styles.rowBorder]}>
              <View style={[styles.rankBadge, { backgroundColor: i === 0 ? '#FFD700' : Colors.border }]}>
                <Text style={[styles.rankText, { color: i === 0 ? '#7A5800' : Colors.textHint }]}>#{i + 1}</Text>
              </View>
              <View style={[styles.iconBox, { backgroundColor: (txn.category?.color || '#888') + '22' }]}>
                <Text style={styles.iconEmoji}>{txn.category?.icon || '💰'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle} numberOfLines={1}>{txn.merchant}</Text>
                <Text style={styles.rowSub}>{txn.category?.name || 'Uncategorized'}</Text>
              </View>
              <Text style={styles.rowAmount}>₹{txn.amount.toFixed(0)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* ── 4. Day of Week Pattern ── */}
      {dowData.some((d: any) => d.count > 0) && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Day of Week Pattern</Text>
          {peakDay?.count > 0 && (
            <Text style={styles.cardSubtitle}>{peakDay.name} is your highest spending day</Text>
          )}
          {dowData.map((d: any, i: number) => {
            const isPeak = peakDay && d.name === peakDay.name && d.count > 0
            return (
              <View key={i} style={styles.dowRow}>
                <Text style={[styles.dowLabel, isPeak && { color: Colors.primary, fontWeight: '700' }]}>{d.name}</Text>
                <View style={styles.dowBarBg}>
                  <View style={[styles.dowBarFill, {
                    width: `${maxDow > 0 ? (d.avg / maxDow) * 100 : 0}%`,
                    backgroundColor: isPeak ? Colors.primary : Colors.primary + '50'
                  }]} />
                </View>
                <Text style={styles.dowAmt}>{d.count > 0 ? `₹${d.avg.toFixed(0)}` : '—'}</Text>
              </View>
            )
          })}
        </View>
      )}

      {/* ── 5. Recurring Expenses ── */}
      {recurring.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recurring Expenses</Text>
          <Text style={styles.cardSubtitle}>
            Fixed monthly cost: ₹{recurring.reduce((s, r) => s + r.avgAmount, 0).toFixed(0)}
          </Text>
          {recurring.map((r, i) => (
            <View key={i} style={[styles.listRow, i > 0 && styles.rowBorder]}>
              <View style={[styles.iconBox, { backgroundColor: Colors.primary + '18' }]}>
                <Text style={styles.iconEmoji}>🔄</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{r.merchant}</Text>
                <Text style={styles.rowSub}>{r.months} of last 3 months</Text>
              </View>
              <Text style={styles.rowAmount}>~₹{r.avgAmount.toFixed(0)}</Text>
            </View>
          ))}
        </View>
      )}

      {!summary && (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 52 }}>📊</Text>
          <Text style={styles.emptyTitle}>Not enough data yet</Text>
          <Text style={styles.emptySub}>Tag more transactions to see your reports</Text>
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.background },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:         { backgroundColor: Colors.white, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  title:          { fontSize: 28, fontWeight: '700', color: Colors.textPrimary },
  subtitle:       { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  yearBanner:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.primary, margin: 16, borderRadius: 14, padding: 16 },
  yearBannerTitle:{ fontSize: 16, fontWeight: '700', color: Colors.white },
  yearBannerSub:  { fontSize: 13, color: 'rgba(255,255,255,0.82)', marginTop: 2 },
  yearBannerArrow:{ fontSize: 30, color: Colors.white, fontWeight: '200' },
  card:           { backgroundColor: Colors.white, marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16 },
  cardTitle:      { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  cardSubtitle:   { fontSize: 12, color: Colors.textHint, marginBottom: 12 },
  // Bar chart
  barChartRow:    { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 4, marginTop: 12 },
  barCol:         { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar:            { width: '80%', borderRadius: 4 },
  barValue:       { fontSize: 9, color: Colors.textHint, marginBottom: 2 },
  barLabel:       { fontSize: 10, color: Colors.textSecondary, marginTop: 4 },
  trendMeta:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  trendAvg:       { fontSize: 12, color: Colors.textHint },
  trendBadge:     { fontSize: 12, fontWeight: '600' },
  // Shared list row
  listRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  rowBorder:      { borderTopWidth: 0.5, borderColor: Colors.border },
  iconBox:        { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  iconEmoji:      { fontSize: 18 },
  rowTitle:       { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  rowSub:         { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  rowAmount:      { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  // Badge
  badge:          { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText:      { fontSize: 11, fontWeight: '700' },
  // Top 5
  rankBadge:      { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  rankText:       { fontSize: 11, fontWeight: '700' },
  // Day of week
  dowRow:         { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 5 },
  dowLabel:       { width: 34, fontSize: 12, color: Colors.textSecondary },
  dowBarBg:       { flex: 1, height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden' },
  dowBarFill:     { height: '100%', borderRadius: 4 },
  dowAmt:         { width: 52, fontSize: 11, color: Colors.textSecondary, textAlign: 'right' },
  // Empty
  emptyState:     { alignItems: 'center', padding: 48 },
  emptyTitle:     { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginTop: 16 },
  emptySub:       { fontSize: 14, color: Colors.textSecondary, marginTop: 8, textAlign: 'center' },
})