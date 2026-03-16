import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Modal, Alert, ScrollView
} from 'react-native'
import { Colors } from '../constants/colors'
import { useCategoryStore } from '../store/categoryStore'
import api from '../services/api'

type Props = {
  visible: boolean
  transaction: any | null
  onClose: () => void
  onUpdated: () => void
}

export default function TransactionDetailSheet({ visible, transaction, onClose, onUpdated }: Props) {
  const { categories } = useCategoryStore()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [myShare, setMyShare] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (transaction) {
      setSelectedCategoryId(transaction.category_id || null)
      setMyShare(parseFloat((transaction.my_share || transaction.amount).toString()).toString())
      setNote(transaction.note || '')
    }
  }, [transaction])

  const handleSave = async () => {
    if (!transaction) return
    setSaving(true)
    try {
      await api.put(`/transactions/${transaction.id}`, {
        category_id: selectedCategoryId,
        my_share: parseFloat(myShare),
        status: 'CONFIRMED',
        note: note || null,
      })
      onUpdated()
      onClose()
    } catch (e) {
      Alert.alert('Error', 'Failed to update transaction')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    Alert.alert('Delete Transaction', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/transactions/${transaction.id}`)
            onUpdated()
            onClose()
          } catch (e) {
            Alert.alert('Error', 'Failed to delete')
          }
        }
      }
    ])
  }

  if (!transaction) return null

  const amount = parseFloat(transaction.amount.toString())
  const selectedCategory = categories.find(c => c.id === selectedCategoryId)

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Transaction header */}
            <View style={styles.header}>
              <View style={[styles.iconBg, { backgroundColor: (selectedCategory?.color || '#888') + '20' }]}>
                <Text style={styles.icon}>{selectedCategory?.icon || '💰'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.merchant}>{transaction.merchant}</Text>
                <Text style={styles.bank}>{transaction.bank} · {transaction.mode}</Text>
              </View>
              <Text style={styles.amount}>₹{amount.toFixed(2)}</Text>
            </View>

            {/* Details */}
            <View style={styles.detailsCard}>
              <DetailRow label="Date" value={new Date(transaction.transaction_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
              <DetailRow label="Status" value={transaction.status} />
              {transaction.upi_ref && <DetailRow label="UPI Ref" value={transaction.upi_ref} />}
              {transaction.account_masked && <DetailRow label="Account" value={transaction.account_masked} />}
            </View>

            {/* My Share */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>My Share</Text>
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

            {/* Category */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.catRow}>
                  {categories.map(cat => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.catChip,
                        selectedCategoryId === cat.id && { backgroundColor: cat.color + '20', borderColor: cat.color }
                      ]}
                      onPress={() => setSelectedCategoryId(cat.id)}>
                      <Text style={styles.catEmoji}>{cat.icon}</Text>
                      <Text style={styles.catName}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Note */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Note</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="Add a note..."
                value={note}
                onChangeText={setNote}
                placeholderTextColor={Colors.textHint}
              />
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <Text style={styles.deleteText}>🗑 Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                disabled={saving}>
                <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save changes'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

function DetailRow({ label, value }: { label: string, value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' },
  handle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  iconBg: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 26 },
  merchant: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  bank: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  amount: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  detailsCard: { backgroundColor: Colors.background, borderRadius: 12, padding: 16, marginBottom: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  detailLabel: { fontSize: 13, color: Colors.textSecondary },
  detailValue: { fontSize: 13, color: Colors.textPrimary, fontWeight: '500' },
  section: { marginBottom: 16 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 },
  shareInput: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  rupee: { fontSize: 16, color: Colors.textPrimary, marginRight: 4 },
  shareField: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  catRow: { flexDirection: 'row', gap: 8 },
  catChip: { alignItems: 'center', padding: 10, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border, minWidth: 72 },
  catEmoji: { fontSize: 22, marginBottom: 4 },
  catName: { fontSize: 10, color: Colors.textPrimary, textAlign: 'center' },
  noteInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 12, fontSize: 14, color: Colors.textPrimary },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 8 },
  deleteBtn: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: Colors.danger },
  deleteText: { color: Colors.danger, fontWeight: '500' },
  saveBtn: { flex: 1, backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveText: { color: Colors.white, fontWeight: '600', fontSize: 16 },
})