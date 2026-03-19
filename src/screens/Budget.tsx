import React, { useEffect, useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal, TextInput, Alert, RefreshControl
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Colors } from '../constants/colors'
import { useCategoryStore } from '../store/categoryStore'
import api from '../services/api'

type Budget = {
  id: string
  category_id: string
  amount: number
  month: number
  year: number
  category: { name: string, icon: string, color: string }
}

type CategorySpend = {
  category_id: string
  name: string
  icon: string
  color: string
  spent: number
  budget: Budget | null
}

export default function Budget() {
  const { categories } = useCategoryStore()
  const [data, setData] = useState<CategorySpend[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [editSheet, setEditSheet] = useState(false)
  const [selectedCat, setSelectedCat] = useState<CategorySpend | null>(null)
  const [budgetAmount, setBudgetAmount] = useState('')
  const [saving, setSaving] = useState(false)

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const daysInMonth = new Date(year, month, 0).getDate()
  const daysLeft = daysInMonth - now.getDate()

  const loadData = useCallback(async () => {
    try {
      const [summaryRes, budgetsRes] = await Promise.all([
        api.get(`/reports/summary?month=${month}&year=${year}`),
        api.get(`/budgets?month=${month}&year=${year}`)
      ])

      const spendMap: Record<string, number> = {}
      summaryRes.data.byCategory.forEach((c: any) => {
        const cat = categories.find(x => x.name === c.name)
        if (cat) spendMap[cat.id] = c.amount
      })

     const budgetMap: Record<string, Budget> = {}
budgetsRes.data.budgets.forEach((b: any) => {
  budgetMap[b.category_id] = {
    ...b,
    amount: parseFloat(b.amount.toString())  // ← convert Decimal to number
  }
})

      const result = categories
        .filter(c => !c.is_hidden)
        .map(c => ({
          category_id: c.id,
          name: c.name,
          icon: c.icon,
          color: c.color,
          spent: spendMap[c.id] || 0,
          budget: budgetMap[c.id] || null,
        }))
        .sort((a, b) => b.spent - a.spent)

      setData(result)
    } catch (e) {
      console.error('Budget load error:', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [categories, month, year])

  useFocusEffect(useCallback(() => { loadData() }, [loadData]))

const totalBudget = data.reduce((s, d) => s + (d.budget ? parseFloat(d.budget.amount.toString()) : 0), 0)
const totalSpent = data.reduce((s, d) => s + d.spent, 0)
  const remaining = totalBudget - totalSpent
  const safePerDay = daysLeft > 0 ? remaining / daysLeft : 0

  const openEdit = (cat: CategorySpend) => {
    setSelectedCat(cat)
    setBudgetAmount(cat.budget?.amount.toString() || '')
    setEditSheet(true)
  }

const handleSaveBudget = async () => {
  if (!selectedCat || !budgetAmount) return
  setSaving(true)
  try {
    const res = await api.post('/budgets', {
      category_id: selectedCat.category_id,
      amount: parseFloat(budgetAmount),
      month,
      year,
    })
    console.log('Budget saved:', res.data)
    await loadData()
    setEditSheet(false)
  } catch (e: any) {
    console.error('Budget save error:', e.response?.data || e.message)
    Alert.alert('Error', e.response?.data?.error || 'Failed to save budget')
  } finally {
    setSaving(false)
  }
} 

  const handleDeleteBudget = async () => {
    if (!selectedCat?.budget) return
    Alert.alert('Remove Budget', 'Remove budget for this category?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/budgets/${selectedCat.budget!.id}`)
            await loadData()
            setEditSheet(false)
          } catch (e) {
            Alert.alert('Error', 'Failed to remove budget')
          }
        }
      }
    ])
  }

  const getBarColor = (spent: number, budget: number) => {
    const pct = (spent / budget) * 100
    if (pct >= 100) return Colors.danger
    if (pct >= 80) return Colors.warning
    return Colors.primary
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  const monthName = now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData() }} />}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Budget</Text>
          <Text style={styles.subtitle}>{monthName}</Text>
        </View>

        {/* Overall Budget Card */}
        {totalBudget > 0 && (
          <View style={styles.overallCard}>
            <View style={styles.overallRow}>
              <View style={styles.overallItem}>
                <Text style={styles.overallLabel}>Total Budget</Text>
                <Text style={styles.overallValue}>₹{totalBudget.toFixed(0)}</Text>
              </View>
              <View style={styles.overallDivider} />
              <View style={styles.overallItem}>
                <Text style={styles.overallLabel}>Spent</Text>
                <Text style={[styles.overallValue, { color: totalSpent > totalBudget ? Colors.danger : Colors.textPrimary }]}>
                  ₹{totalSpent.toFixed(0)}
                </Text>
              </View>
              <View style={styles.overallDivider} />
              <View style={styles.overallItem}>
                <Text style={styles.overallLabel}>Safe/day</Text>
                <Text style={[styles.overallValue, { color: safePerDay < 0 ? Colors.danger : Colors.success }]}>
                  ₹{Math.max(0, safePerDay).toFixed(0)}
                </Text>
              </View>
            </View>

            <View style={styles.overallBarBg}>
              <View style={[styles.overallBarFill, {
                width: `${Math.min(100, (totalSpent / totalBudget) * 100)}%`,
                backgroundColor: totalSpent > totalBudget ? Colors.danger :
                  totalSpent > totalBudget * 0.8 ? Colors.warning : Colors.primary
              }]} />
            </View>
            <Text style={styles.overallBarText}>
              ₹{remaining.toFixed(0)} remaining · {daysLeft} days left
            </Text>
          </View>
        )}

        {/* Category Budgets */}
        <Text style={styles.sectionTitle}>Categories</Text>

        {data.map((cat) => {
          const hasBudget = !!cat.budget
          const pct = hasBudget ? Math.min(100, (cat.spent / cat.budget!.amount) * 100) : 0
          const barColor = hasBudget ? getBarColor(cat.spent, cat.budget!.amount) : Colors.border

          return (
            <TouchableOpacity
              key={cat.category_id}
              style={styles.catCard}
              onPress={() => openEdit(cat)}>
              <View style={styles.catHeader}>
                <View style={[styles.catIcon, { backgroundColor: cat.color + '20' }]}>
                  <Text style={styles.catEmoji}>{cat.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.catTitleRow}>
                    <Text style={styles.catName}>{cat.name}</Text>
                    {hasBudget ? (
                      <Text style={styles.catAmounts}>
                        ₹{cat.spent.toFixed(0)} / ₹{cat.budget!.amount.toFixed(0)}
                      </Text>
                    ) : (
                      <Text style={styles.setBudgetBtn}>+ Set budget</Text>
                    )}
                  </View>
                  {hasBudget && (
                    <>
                      <View style={styles.progressBg}>
                        <View style={[styles.progressFill, {
                          width: `${pct}%`,
                          backgroundColor: barColor
                        }]} />
                      </View>
                      <Text style={[styles.pctText, { color: barColor }]}>
                        {pct.toFixed(0)}% used
                        {pct >= 100 ? ' — Over budget!' : pct >= 80 ? ' — Almost there!' : ''}
                      </Text>
                    </>
                  )}
                  {!hasBudget && cat.spent > 0 && (
                    <Text style={styles.spentText}>Spent ₹{cat.spent.toFixed(0)} · no budget set</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* Edit Budget Sheet */}
      <Modal visible={editSheet} transparent animationType="slide" onRequestClose={() => setEditSheet(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>
              {selectedCat?.icon} {selectedCat?.name} Budget
            </Text>

            <Text style={styles.sheetLabel}>Monthly budget amount</Text>
            <View style={styles.amountRow}>
              <Text style={styles.rupee}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={budgetAmount}
                onChangeText={setBudgetAmount}
                keyboardType="numeric"
                placeholder="0"
                autoFocus
                placeholderTextColor={Colors.textHint}
              />
            </View>

            {/* Quick amounts */}
            <View style={styles.quickAmounts}>
              {['500', '1000', '2000', '5000', '10000'].map(amt => (
                <TouchableOpacity
                  key={amt}
                  style={styles.quickChip}
                  onPress={() => setBudgetAmount(amt)}>
                  <Text style={styles.quickText}>₹{amt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sheetActions}>
              {selectedCat?.budget && (
                <TouchableOpacity style={styles.removeBtn} onPress={handleDeleteBudget}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveBudget}
                disabled={saving}>
                <Text style={styles.saveBtnText}>
                  {saving ? 'Saving...' : 'Set Budget'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: Colors.white, padding: 20, paddingTop: 56 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  overallCard: { backgroundColor: Colors.white, margin: 16, borderRadius: 16, padding: 20 },
  overallRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  overallItem: { flex: 1, alignItems: 'center' },
  overallDivider: { width: 1, height: 40, backgroundColor: Colors.border },
  overallLabel: { fontSize: 11, color: Colors.textSecondary, marginBottom: 4 },
  overallValue: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  overallBarBg: { height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  overallBarFill: { height: '100%', borderRadius: 4 },
  overallBarText: { fontSize: 12, color: Colors.textHint, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, margin: 16, marginBottom: 8 },
  catCard: { backgroundColor: Colors.white, marginHorizontal: 16, marginBottom: 8, borderRadius: 14, padding: 14 },
  catHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  catIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  catEmoji: { fontSize: 22 },
  catTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  catName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  catAmounts: { fontSize: 13, color: Colors.textSecondary },
  setBudgetBtn: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  progressBg: { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', borderRadius: 3 },
  pctText: { fontSize: 11, fontWeight: '500' },
  spentText: { fontSize: 11, color: Colors.textHint },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  sheetHandle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 20 },
  sheetLabel: { fontSize: 14, color: Colors.textSecondary, marginBottom: 8 },
  amountRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16 },
  rupee: { fontSize: 24, color: Colors.primary, marginRight: 8 },
  amountInput: { fontSize: 32, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  quickAmounts: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 20 },
  quickChip: { backgroundColor: Colors.primaryLight, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  quickText: { color: Colors.primary, fontWeight: '600', fontSize: 13 },
  sheetActions: { flexDirection: 'row', gap: 12 },
  removeBtn: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: Colors.danger },
  removeText: { color: Colors.danger, fontWeight: '500' },
  saveBtn: { flex: 1, backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: Colors.white, fontWeight: '600', fontSize: 16 },
})