import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Modal, Alert, ScrollView
} from 'react-native'
import { Colors } from '../constants/colors'
import { useCategoryStore } from '../store/categoryStore'
import api from '../services/api'

type Props = {
  visible: boolean
  onClose: () => void
  onAdded: () => void
}

export default function ManualAddSheet({ visible, onClose, onAdded }: Props) {
  const { categories } = useCategoryStore()
  const [amount, setAmount] = useState('')
  const [merchant, setMerchant] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
  if (!amount || !merchant) {
    Alert.alert('Please fill amount and merchant')
    return
  }
  setSaving(true)
  try {
    const res = await api.post('/transactions', {
      amount: parseFloat(amount),
      merchant,
      bank: 'Manual',
      account_masked: '',
      mode: 'Manual',
      txn_type: 'P2M',
      upi_ref: '',
      sms_raw: '',
      transaction_date: new Date().toISOString(),
    })

    // ← Save category if selected
    if (categoryId) {
      await api.put(`/transactions/${res.data.transaction.id}`, {
        category_id: categoryId,
        my_share: parseFloat(amount),
        status: 'CONFIRMED',
        note: note || null,
      })
    }

    setAmount('')
    setMerchant('')
    setCategoryId(null)
    setNote('')
    onAdded()
    onClose()
  } catch (e) {
    Alert.alert('Error', 'Failed to add transaction')
  } finally {
    setSaving(false)
  }
}

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Add Transaction</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Amount */}
            <View style={styles.amountRow}>
              <Text style={styles.rupeeSign}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                autoFocus
                placeholderTextColor={Colors.textHint}
              />
            </View>

            {/* Merchant */}
            <TextInput
              style={styles.input}
              placeholder="Where did you spend?"
              value={merchant}
              onChangeText={setMerchant}
              placeholderTextColor={Colors.textHint}
            />

            {/* Category */}
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.catRow}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catChip,
                      categoryId === cat.id && { backgroundColor: cat.color + '20', borderColor: cat.color }
                    ]}
                    onPress={() => setCategoryId(cat.id)}>
                    <Text style={styles.catEmoji}>{cat.icon}</Text>
                    <Text style={styles.catName}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Note */}
            <TextInput
              style={[styles.input, { marginTop: 12 }]}
              placeholder="Note (optional)"
              value={note}
              onChangeText={setNote}
              placeholderTextColor={Colors.textHint}
            />

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                disabled={saving}>
                <Text style={styles.saveText}>
                  {saving ? 'Adding...' : `Add ₹${amount || '0'}`}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  handle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 20 },
  amountRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 12 },
  rupeeSign: { fontSize: 28, color: Colors.primary, marginRight: 8 },
  amountInput: { fontSize: 36, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 14, fontSize: 16, color: Colors.textPrimary, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 },
  catRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  catChip: { alignItems: 'center', padding: 10, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border, minWidth: 72 },
  catEmoji: { fontSize: 22, marginBottom: 4 },
  catName: { fontSize: 10, color: Colors.textPrimary, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16, marginBottom: 8 },
  cancelBtn: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  cancelText: { color: Colors.textSecondary, fontWeight: '500' },
  saveBtn: { flex: 1, backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveText: { color: Colors.white, fontWeight: '600', fontSize: 16 },
})