import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Modal, Vibration, Alert
} from 'react-native'
import { Colors } from '../constants/colors'
import { useCategoryStore } from '../store/categoryStore'
import api from '../services/api'

type Props = {
  visible: boolean
  transaction: {
    id: string
    amount: number
    merchant: string
    suggested_category_id?: string
  } | null
  onClose: () => void
  onSaved: () => void
}

export default function TaggingBottomSheet({ visible, transaction, onClose, onSaved }: Props) {
  const { categories } = useCategoryStore()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [myShare, setMyShare] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
  if (transaction) {
    const amount = parseFloat(transaction.amount.toString())
    setMyShare(amount.toString())
    setSelectedCategoryId(transaction.suggested_category_id || null)
    setNote('')
    setSaved(false)
  }
}, [transaction])

  const handleSave = async () => {
    if (!selectedCategoryId || !transaction) {
      Alert.alert('Please select a category')
      return
    }
    setSaving(true)
    try {
      await api.put(`/transactions/${transaction.id}`, {
        category_id: selectedCategoryId,
        my_share: parseFloat(myShare) || transaction.amount,
        status: 'CONFIRMED',
        note: note || null,
      })
      Vibration.vibrate(100)
      setSaved(true)
      setTimeout(() => {
        onSaved()
        onClose()
      }, 1000)
    } catch (e) {
      Alert.alert('Error', 'Failed to save transaction')
    } finally {
      setSaving(false)
    }
  }

  const handleSkip = async () => {
    if (!transaction) return
    try {
      await api.put(`/transactions/${transaction.id}`, {
        status: 'SKIPPED',
      })
    } catch (e) {}
    onClose()
  }

  const handleSplit = async () => {
    if (!transaction) return
    try {
      await api.put(`/transactions/${transaction.id}`, {
        status: 'SPLITTABLE',
        is_splittable: true,
      })
    } catch (e) {}
    onClose()
  }

  if (!transaction) return null

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Handle bar */}
          <View style={styles.handle} />

          {/* Transaction info */}
          <View style={styles.txnInfo}>
            <Text style={styles.merchant}>{transaction.merchant}</Text>
<Text style={styles.amount}>₹{parseFloat(transaction.amount.toString()).toFixed(2)}</Text>          </View>

          {/* My Share input */}
          <View style={styles.shareRow}>
            <Text style={styles.shareLabel}>My share</Text>
            <View style={styles.shareInput}>
              <Text style={styles.rupee}>₹</Text>
              <TextInput
                style={styles.shareField}
                value={myShare}
                onChangeText={setMyShare}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Category grid */}
          <Text style={styles.sectionTitle}>Select category</Text>
          <ScrollView style={styles.grid} showsVerticalScrollIndicator={false}>
            <View style={styles.gridInner}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.catItem,
                    selectedCategoryId === cat.id && styles.catItemSelected,
                    { borderColor: selectedCategoryId === cat.id ? cat.color : Colors.border }
                  ]}
                  onPress={() => setSelectedCategoryId(cat.id)}>
                  <Text style={styles.catIcon}>{cat.icon}</Text>
                  <Text style={styles.catName}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Note input */}
          <TextInput
            style={styles.noteInput}
            placeholder="Add a note (optional)"
            value={note}
            onChangeText={setNote}
            placeholderTextColor={Colors.textHint}
          />

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.splitBtn} onPress={handleSplit}>
  <Text style={styles.splitText}>Split</Text>
</TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, saved && styles.saveBtnDone]}
              onPress={handleSave}
              disabled={saving || saved}>
              <Text style={styles.saveText}>
                {saved ? '✅ Saved!' : saving ? 'Saving...' : `Save ₹${myShare || transaction.amount}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  handle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  txnInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  merchant: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  amount: { fontSize: 22, fontWeight: '700', color: Colors.primary },
  shareRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  shareLabel: { fontSize: 16, color: Colors.textSecondary },
  shareInput: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  rupee: { fontSize: 16, color: Colors.textPrimary, marginRight: 4 },
  shareField: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary, minWidth: 80 },
  sectionTitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 12 },
  grid: { maxHeight: 200 },
  gridInner: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catItem: { width: '30%', alignItems: 'center', padding: 10, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.background },
  catItemSelected: { backgroundColor: '#E1F5EE' },
  catIcon: { fontSize: 24, marginBottom: 4 },
  catName: { fontSize: 11, color: Colors.textPrimary, textAlign: 'center' },
  noteInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, marginTop: 12, marginBottom: 16, fontSize: 14, color: Colors.textPrimary },
  actions: { flexDirection: 'row', gap: 8 },
  skipBtn: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  skipText: { color: Colors.textSecondary, fontWeight: '500' },
  splitBtn: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.warning },
  splitText: { color: Colors.warning, fontWeight: '500' },
  saveBtn: { flex: 1, backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnDone: { backgroundColor: Colors.success },
  saveText: { color: Colors.white, fontWeight: '600', fontSize: 16 },
})