import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator
} from 'react-native'
import { Colors } from '../constants/colors'
import api from '../services/api'

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTH_FULL  = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function YearInReview({ navigation }: any) {
  const [loading, setLoading] = useState(true)
  const [data, setData]       = useState<any>(null)

  const year = new Date().getFullYear()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const res = await api.get(`/reports/yearly?year=${year}`)
      setData(res.data)
    } catch (e) {
      console.error('Year in review error:', e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: Colors.primary }]}>
        <ActivityIndicator size="large" color={Colors.white} />
      </View>
    )
  }

  if (!data || data.count === 0) {
    return (
      <View style={[styles.center, { backgroundColor: Colors.primary }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 56, marginBottom: 16 }}>📊</Text>
        <Text style={[styles.heroTotal, { fontSize: 22 }]}>Not enough data yet</Text>
        <Text style={[styles.heroSub, { textAlign: 'center', marginTop: 8 }]}>
          Keep tagging transactions throughout {year}!
        </Text>
      </View>
    )
  }

  const { total, count, monthly, biggestMonth, bestMonth, dailyAvg, topCategory } = data

  const maxMonthly = Math.max(...monthly, 1)
  const insight    = buildInsight({ total, count, monthly, biggestMonth, bestMonth, topCategory, year })

  return (
    <ScrollView style={styles.container} bounces={false}>

      {/* ── Hero header ── */}
      <View style={styles.hero}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Reports</Text>
        </TouchableOpacity>
        <Text style={styles.heroYear}>{year} in Review ✨</Text>
        <Text style={styles.heroTotal}>
          ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </Text>
        <Text style={styles.heroSub}>spent across {count} transactions</Text>
      </View>

      {/* ── Stat tiles ── */}
      <View style={styles.tilesRow}>
        <View style={[styles.tile, { backgroundColor: '#FFF3F3' }]}>
          <Text style={styles.tileEmoji}>📈</Text>
          <Text style={styles.tileLabel}>Biggest month</Text>
          <Text style={[styles.tileValue, { color: Colors.danger }]}>
            {biggestMonth >= 0 ? MONTH_FULL[biggestMonth] : '—'}
          </Text>
          {biggestMonth >= 0 && (
            <Text style={styles.tileAmt}>₹{monthly[biggestMonth].toFixed(0)}</Text>
          )}
        </View>
        <View style={[styles.tile, { backgroundColor: '#F0FBF5' }]}>
          <Text style={styles.tileEmoji}>💚</Text>
          <Text style={styles.tileLabel}>Best month</Text>
          <Text style={[styles.tileValue, { color: Colors.primary }]}>
            {bestMonth >= 0 ? MONTH_FULL[bestMonth] : '—'}
          </Text>
          {bestMonth >= 0 && (
            <Text style={styles.tileAmt}>₹{monthly[bestMonth].toFixed(0)}</Text>
          )}
        </View>
      </View>

      <View style={styles.tilesRow}>
        <View style={[styles.tile, { backgroundColor: '#FFF9F0' }]}>
          <Text style={styles.tileEmoji}>🏆</Text>
          <Text style={styles.tileLabel}>Top category</Text>
          <Text style={[styles.tileValue, { color: Colors.warning }]}>
            {topCategory ? `${topCategory.icon} ${topCategory.name}` : '—'}
          </Text>
        </View>
        <View style={[styles.tile, { backgroundColor: '#F0F5FF' }]}>
          <Text style={styles.tileEmoji}>📅</Text>
          <Text style={styles.tileLabel}>Daily average</Text>
          <Text style={[styles.tileValue, { color: Colors.secondary }]}>
            ₹{dailyAvg.toFixed(0)}
          </Text>
          <Text style={styles.tileAmt}>per day</Text>
        </View>
      </View>

      {/* ── 12-month bar chart ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your {year}</Text>

        <View style={styles.yearChartRow}>
          {monthly.map((amt: number, i: number) => {
            const isBiggest = i === biggestMonth && amt > 0
            const isBest    = i === bestMonth && amt > 0
            const barH      = amt > 0 ? Math.max(6, (amt / maxMonthly) * 96) : 4

            return (
              <View key={i} style={styles.yearBarCol}>
                <View style={[styles.yearBar, {
                  height: barH,
                  backgroundColor: isBiggest
                    ? Colors.danger
                    : isBest
                    ? Colors.primary
                    : amt > 0
                    ? Colors.primary + '55'
                    : Colors.border
                }]} />
                <Text style={styles.yearBarLabel}>{MONTH_SHORT[i][0]}</Text>
              </View>
            )
          })}
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.danger }]} />
            <Text style={styles.legendText}>Highest spend</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
            <Text style={styles.legendText}>Best month</Text>
          </View>
        </View>
      </View>

      {/* ── Insight paragraph ── */}
      <View style={[styles.card, { marginBottom: 40 }]}>
        <Text style={styles.cardTitle}>Your year in numbers 🎯</Text>
        <Text style={styles.insightText}>{insight}</Text>
      </View>

    </ScrollView>
  )
}

function buildInsight({ total, count, monthly, biggestMonth, bestMonth, topCategory, year }: any) {
  const nonZero  = monthly.filter((m: number) => m > 0)
  const avgMonth = nonZero.length > 0 ? total / nonZero.length : 0
  const parts: string[] = []

  parts.push(
    `In ${year}, you made ${count} tracked transaction${count !== 1 ? 's' : ''} totalling ₹${total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}.`
  )

  if (avgMonth > 0) {
    parts.push(`Your average monthly spend was ₹${avgMonth.toFixed(0)}.`)
  }

  if (biggestMonth >= 0 && monthly[biggestMonth] > 0) {
    parts.push(
      `${MONTH_FULL[biggestMonth]} was your biggest month at ₹${monthly[biggestMonth].toFixed(0)}.`
    )
  }

  if (bestMonth >= 0 && bestMonth !== biggestMonth && monthly[bestMonth] > 0) {
    parts.push(
      `You spent the least in ${MONTH_FULL[bestMonth]} — just ₹${monthly[bestMonth].toFixed(0)}.`
    )
  }

  if (topCategory) {
    parts.push(
      `${topCategory.icon} ${topCategory.name} was your biggest spending category this year.`
    )
  }

  return parts.join(' ')
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.background },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },

  // Hero
  hero:           { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 32 },
  backBtn:        { marginBottom: 20 },
  backText:       { color: 'rgba(255,255,255,0.82)', fontSize: 14 },
  heroYear:       { fontSize: 17, fontWeight: '600', color: 'rgba(255,255,255,0.88)', marginBottom: 8 },
  heroTotal:      { fontSize: 48, fontWeight: '800', color: Colors.white, letterSpacing: -1 },
  heroSub:        { fontSize: 14, color: 'rgba(255,255,255,0.78)', marginTop: 6 },

  // Tiles
  tilesRow:       { flexDirection: 'row', gap: 12, marginHorizontal: 16, marginTop: 12 },
  tile:           { flex: 1, borderRadius: 14, padding: 14 },
  tileEmoji:      { fontSize: 22, marginBottom: 6 },
  tileLabel:      { fontSize: 11, color: Colors.textSecondary, marginBottom: 2 },
  tileValue:      { fontSize: 15, fontWeight: '700' },
  tileAmt:        { fontSize: 11, color: Colors.textHint, marginTop: 2 },

  // Card
  card:           { backgroundColor: Colors.white, marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 16 },
  cardTitle:      { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 16 },

  // 12-month chart
  yearChartRow:   { flexDirection: 'row', alignItems: 'flex-end', height: 110, gap: 3 },
  yearBarCol:     { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  yearBar:        { width: '90%', borderRadius: 3 },
  yearBarLabel:   { fontSize: 9, color: Colors.textHint, marginTop: 4 },

  // Legend
  legend:         { flexDirection: 'row', gap: 16, marginTop: 14 },
  legendItem:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:      { width: 8, height: 8, borderRadius: 4 },
  legendText:     { fontSize: 11, color: Colors.textSecondary },

  // Insight
  insightText:    { fontSize: 15, color: Colors.textPrimary, lineHeight: 24 },
})