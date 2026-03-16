import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator
} from 'react-native'
import { Colors } from '../constants/colors'
import api from '../services/api'

type CategoryData = {
  name: string
  icon: string
  color: string
  amount: number
}

export default function Categories({ navigation }: any) {
  const [data, setData] = useState<CategoryData[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    loadData()
  }, [month, year])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/reports/summary?month=${month}&year=${year}`)
      setData(res.data.byCategory)
      setTotal(res.data.total)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const monthName = new Date(year, month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  return (
    <View style={styles.container}>
      {/* Month Selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={prevMonth} style={styles.arrow}>
          <Text style={styles.arrowText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>{monthName}</Text>
        <TouchableOpacity onPress={nextMonth} style={styles.arrow}>
          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : data.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={styles.emptyText}>No spending this month</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Simple Donut visualization */}
          <View style={styles.donutCard}>
            <View style={styles.donutCenter}>
              <Text style={styles.donutTotal}>₹{total.toFixed(0)}</Text>
              <Text style={styles.donutLabel}>Total spent</Text>
            </View>
            <View style={styles.donutBars}>
              {data.map((cat, i) => (
                <View key={i} style={styles.donutBar}>
                  <View style={[styles.donutBarFill, {
                    width: `${(cat.amount / total) * 100}%`,
                    backgroundColor: cat.color
                  }]} />
                </View>
              ))}
            </View>
          </View>

          {/* Category breakdown */}
          <Text style={styles.sectionTitle}>Breakdown</Text>
          {data.map((cat, i) => (
            <TouchableOpacity key={i} style={styles.catRow}>
              <View style={[styles.catIcon, { backgroundColor: cat.color + '20' }]}>
                <Text style={styles.catEmoji}>{cat.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.catHeader}>
                  <Text style={styles.catName}>{cat.name}</Text>
                  <Text style={styles.catAmount}>₹{cat.amount.toFixed(0)}</Text>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, {
                    width: `${(cat.amount / total) * 100}%`,
                    backgroundColor: cat.color
                  }]} />
                </View>
                <Text style={styles.catPercent}>
                  {((cat.amount / total) * 100).toFixed(1)}% of total
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  monthSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.white, paddingHorizontal: 20, paddingVertical: 16, paddingTop: 56 },
  arrow: { padding: 8 },
  arrowText: { fontSize: 28, color: Colors.primary, fontWeight: '300' },
  monthText: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  scroll: { padding: 16 },
  donutCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 20, marginBottom: 16, alignItems: 'center' },
  donutCenter: { alignItems: 'center', marginBottom: 20 },
  donutTotal: { fontSize: 36, fontWeight: '700', color: Colors.textPrimary },
  donutLabel: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  donutBars: { width: '100%', gap: 4 },
  donutBar: { height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden' },
  donutBarFill: { height: '100%', borderRadius: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  catRow: { backgroundColor: Colors.white, borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', gap: 12, alignItems: 'center' },
  catIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  catEmoji: { fontSize: 22 },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  catName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  catAmount: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  progressBg: { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', borderRadius: 3 },
  catPercent: { fontSize: 11, color: Colors.textHint },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
})