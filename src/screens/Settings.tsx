import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView, Switch,
  TouchableOpacity, Modal, TextInput, Alert
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import auth from '@react-native-firebase/auth'
import { Colors } from '../constants/colors'
import { useUserStore } from '../store/userStore'

// ─── Keys ────────────────────────────────────────────────────────────────────
const KEY_MASTER_NOTIF    = 'setting_master_notif'
const KEY_BUDGET_ALERTS   = 'setting_budget_alerts'
const KEY_WEEKLY_SUMMARY  = 'setting_weekly_summary'
const KEY_UNUSUAL_SPEND   = 'setting_unusual_spend'
const KEY_THEME           = 'setting_theme'
const KEY_APP_LOCK        = 'setting_app_lock'
const KEY_MORNING_TIME    = 'notif_morning'
const KEY_EVENING_TIME    = 'notif_evening'
const KEY_AUTO_ASSIGN     = 'auto_assign_days'
const KEY_AUTO_SPLIT      = 'auto_split_days'

const DAY_OPTIONS = ['3', '5', '7', '10', 'Never']

// ─── Sub-sheet: Digest Times ─────────────────────────────────────────────────
function DigestTimesSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [morning, setMorning] = useState('09:00')
  const [evening, setEvening] = useState('21:00')

  useEffect(() => {
    if (!visible) return
    AsyncStorage.multiGet([KEY_MORNING_TIME, KEY_EVENING_TIME]).then(pairs => {
      if (pairs[0][1]) setMorning(pairs[0][1])
      if (pairs[1][1]) setEvening(pairs[1][1])
    })
  }, [visible])

  const save = async () => {
    await AsyncStorage.multiSet([[KEY_MORNING_TIME, morning], [KEY_EVENING_TIME, evening]])
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={sh.overlay}>
        <View style={sh.sheet}>
          <View style={sh.handle} />
          <Text style={sh.title}>Digest Times</Text>

          <Text style={sh.label}>Morning digest</Text>
          <TextInput
            style={sh.input}
            value={morning}
            onChangeText={setMorning}
            placeholder="09:00"
            keyboardType="numbers-and-punctuation"
          />

          <Text style={sh.label}>Evening digest</Text>
          <TextInput
            style={sh.input}
            value={evening}
            onChangeText={setEvening}
            placeholder="21:00"
            keyboardType="numbers-and-punctuation"
          />

          <Text style={sh.hint}>24-hour format — e.g. 09:00, 21:00</Text>

          <View style={sh.btnRow}>
            <TouchableOpacity style={sh.cancelBtn} onPress={onClose}>
              <Text style={sh.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={sh.saveBtn} onPress={save}>
              <Text style={sh.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ─── Sub-sheet: Auto Assign ───────────────────────────────────────────────────
function AutoAssignSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [assignDays, setAssignDays] = useState('7')
  const [splitDays, setSplitDays]   = useState('7')

  useEffect(() => {
    if (!visible) return
    AsyncStorage.multiGet([KEY_AUTO_ASSIGN, KEY_AUTO_SPLIT]).then(pairs => {
      if (pairs[0][1]) setAssignDays(pairs[0][1])
      if (pairs[1][1]) setSplitDays(pairs[1][1])
    })
  }, [visible])

  const save = async () => {
    await AsyncStorage.multiSet([[KEY_AUTO_ASSIGN, assignDays], [KEY_AUTO_SPLIT, splitDays]])
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={sh.overlay}>
        <View style={sh.sheet}>
          <View style={sh.handle} />
          <Text style={sh.title}>Automation</Text>

          <Text style={sh.label}>Auto-assign untagged after</Text>
          <View style={sh.chips}>
            {DAY_OPTIONS.map(d => (
              <TouchableOpacity
                key={d}
                style={[sh.chip, assignDays === d && sh.chipActive]}
                onPress={() => setAssignDays(d)}
              >
                <Text style={[sh.chipText, assignDays === d && sh.chipTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[sh.label, { marginTop: 20 }]}>Auto-confirm split after</Text>
          <View style={sh.chips}>
            {DAY_OPTIONS.map(d => (
              <TouchableOpacity
                key={d}
                style={[sh.chip, splitDays === d && sh.chipActive]}
                onPress={() => setSplitDays(d)}
              >
                <Text style={[sh.chipText, splitDays === d && sh.chipTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={sh.btnRow}>
            <TouchableOpacity style={sh.cancelBtn} onPress={onClose}>
              <Text style={sh.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={sh.saveBtn} onPress={save}>
              <Text style={sh.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ─── Sub-sheet: Export ────────────────────────────────────────────────────────
function ExportSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv')

  const handleExport = () => {
    // Wire to your export API in Phase 4
    Alert.alert('Export', `${format.toUpperCase()} export coming in Phase 4!`)
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={sh.overlay}>
        <View style={sh.sheet}>
          <View style={sh.handle} />
          <Text style={sh.title}>Export Data</Text>

          <Text style={sh.label}>Format</Text>
          <View style={sh.chips}>
            <TouchableOpacity
              style={[sh.chip, format === 'csv' && sh.chipActive]}
              onPress={() => setFormat('csv')}
            >
              <Text style={[sh.chipText, format === 'csv' && sh.chipTextActive]}>📄 CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[sh.chip, format === 'pdf' && sh.chipActive]}
              onPress={() => setFormat('pdf')}
            >
              <Text style={[sh.chipText, format === 'pdf' && sh.chipTextActive]}>📑 PDF Monthly</Text>
            </TouchableOpacity>
          </View>

          <View style={sh.btnRow}>
            <TouchableOpacity style={sh.cancelBtn} onPress={onClose}>
              <Text style={sh.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={sh.saveBtn} onPress={handleExport}>
              <Text style={sh.saveText}>Export</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ─── Sub-sheet: Clear Data ────────────────────────────────────────────────────
function ClearDataSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [input, setInput] = useState('')

  const handleClear = () => {
    if (input !== 'DELETE') {
      Alert.alert('Type DELETE exactly to confirm')
      return
    }
    // Wire to DELETE /account/data in Phase 4
    Alert.alert('Done', 'Clear data coming in Phase 4!')
    setInput('')
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={sh.overlay}>
        <View style={sh.sheet}>
          <View style={sh.handle} />
          <Text style={sh.title}>Clear All Data</Text>
          <Text style={sh.warning}>
            This permanently deletes all transactions, budgets, and merchant overrides. This cannot be undone.
          </Text>

          <Text style={sh.label}>Type DELETE to confirm</Text>
          <TextInput
            style={sh.input}
            value={input}
            onChangeText={setInput}
            placeholder="DELETE"
            autoCapitalize="characters"
          />

          <View style={sh.btnRow}>
            <TouchableOpacity style={sh.cancelBtn} onPress={onClose}>
              <Text style={sh.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[sh.saveBtn, { backgroundColor: Colors.danger }]} onPress={handleClear}>
              <Text style={sh.saveText}>Clear Data</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ─── Main Settings Screen ─────────────────────────────────────────────────────
export default function Settings({ navigation }: any) {
  const { user, clearUser } = useUserStore()

  const [masterNotif,  setMasterNotif]  = useState(true)
  const [budgetAlerts, setBudgetAlerts] = useState(true)
  const [weeklySummary,setWeeklySummary]= useState(true)
  const [unusualSpend, setUnusualSpend] = useState(true)
  const [appLock,      setAppLock]      = useState(false)
  const [theme, setTheme]               = useState<'light' | 'system' | 'dark'>('system')

  const [showDigestTimes, setShowDigestTimes] = useState(false)
  const [showAutoAssign,  setShowAutoAssign]  = useState(false)
  const [showExport,      setShowExport]      = useState(false)
  const [showClearData,   setShowClearData]   = useState(false)

  // Load saved settings
  useEffect(() => {
    AsyncStorage.multiGet([
      KEY_MASTER_NOTIF, KEY_BUDGET_ALERTS, KEY_WEEKLY_SUMMARY,
      KEY_UNUSUAL_SPEND, KEY_THEME, KEY_APP_LOCK
    ]).then(pairs => {
      if (pairs[0][1] !== null) setMasterNotif(pairs[0][1] === 'true')
      if (pairs[1][1] !== null) setBudgetAlerts(pairs[1][1] === 'true')
      if (pairs[2][1] !== null) setWeeklySummary(pairs[2][1] === 'true')
      if (pairs[3][1] !== null) setUnusualSpend(pairs[3][1] === 'true')
      if (pairs[4][1])          setTheme(pairs[4][1] as any)
      if (pairs[5][1] !== null) setAppLock(pairs[5][1] === 'true')
    })
  }, [])

  const saveToggle = async (key: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value)
    await AsyncStorage.setItem(key, String(value))
  }

  const saveTheme = async (t: 'light' | 'system' | 'dark') => {
    setTheme(t)
    await AsyncStorage.setItem(KEY_THEME, t)
  }

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await auth().signOut()
          clearUser()
        }
      }
    ])
  }

  const handleBudgetTemplates = () => {
    Alert.alert('Budget Templates', 'Choose a preset', [
      { text: '🟢 Conservative  ₹12,000', onPress: () => Alert.alert('Applied', 'Conservative template applied.') },
      { text: '🟡 Moderate  ₹18,000',     onPress: () => Alert.alert('Applied', 'Moderate template applied.') },
      { text: '🔴 Liberal  ₹25,000',       onPress: () => Alert.alert('Applied', 'Liberal template applied.') },
      { text: 'Cancel', style: 'cancel' }
    ])
  }

  const avatarInitials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() || '?'

  return (
    <>
      <ScrollView style={styles.container}>

        {/* ── Profile card ── */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarInitials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{user?.name || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          <View style={styles.currencyBadge}>
            <Text style={styles.currencyText}>₹ INR</Text>
          </View>
        </View>

        {/* ── Notifications ── */}
        <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Enable notifications</Text>
            <Switch
              value={masterNotif}
              onValueChange={v => saveToggle(KEY_MASTER_NOTIF, v, setMasterNotif)}
              trackColor={{ true: Colors.primary }}
            />
          </View>
          <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={() => setShowDigestTimes(true)}>
            <Text style={styles.rowLabel}>Digest times</Text>
            <Text style={styles.rowMeta}>9:00 AM / 9:00 PM ›</Text>
          </TouchableOpacity>
          <View style={[styles.row, styles.rowBorder]}>
            <Text style={styles.rowLabel}>Budget alerts</Text>
            <Switch
              value={budgetAlerts}
              onValueChange={v => saveToggle(KEY_BUDGET_ALERTS, v, setBudgetAlerts)}
              trackColor={{ true: Colors.primary }}
            />
          </View>
          <View style={[styles.row, styles.rowBorder]}>
            <Text style={styles.rowLabel}>Weekly summary</Text>
            <Switch
              value={weeklySummary}
              onValueChange={v => saveToggle(KEY_WEEKLY_SUMMARY, v, setWeeklySummary)}
              trackColor={{ true: Colors.primary }}
            />
          </View>
          <View style={[styles.row, styles.rowBorder]}>
            <Text style={styles.rowLabel}>Unusual spending alerts</Text>
            <Switch
              value={unusualSpend}
              onValueChange={v => saveToggle(KEY_UNUSUAL_SPEND, v, setUnusualSpend)}
              trackColor={{ true: Colors.primary }}
            />
          </View>
        </View>

        {/* ── Automation ── */}
        <Text style={styles.sectionHeader}>AUTOMATION</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={() => setShowAutoAssign(true)}>
            <View>
              <Text style={styles.rowLabel}>Auto-assign & split settings</Text>
              <Text style={styles.rowSub}>Untagged after 7 days · Split after 7 days</Text>
            </View>
            <Text style={styles.rowMeta}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── Permissions & Banks ── */}
        <Text style={styles.sectionHeader}>PERMISSIONS & BANKS</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>SMS permission</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          </View>
        </View>

        {/* ── Categories & Budget ── */}
        <Text style={styles.sectionHeader}>CATEGORIES & BUDGET</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Categories')}>
            <Text style={styles.rowLabel}>Manage categories</Text>
            <Text style={styles.rowMeta}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={() => Alert.alert('Merchant Overrides', 'Coming in Phase 4!')}>
            <Text style={styles.rowLabel}>Merchant overrides</Text>
            <Text style={styles.rowMeta}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={handleBudgetTemplates}>
            <Text style={styles.rowLabel}>Budget templates</Text>
            <Text style={styles.rowMeta}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── Preferences ── */}
        <Text style={styles.sectionHeader}>PREFERENCES</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Theme</Text>
            <View style={styles.themeChips}>
              {(['light', 'system', 'dark'] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.themeChip, theme === t && styles.themeChipActive]}
                  onPress={() => saveTheme(t)}
                >
                  <Text style={[styles.themeChipText, theme === t && styles.themeChipTextActive]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={[styles.row, styles.rowBorder]}>
            <Text style={styles.rowLabel}>App lock</Text>
            <Switch
              value={appLock}
              onValueChange={v => saveToggle(KEY_APP_LOCK, v, setAppLock)}
              trackColor={{ true: Colors.primary }}
            />
          </View>
        </View>

        {/* ── Data ── */}
        <Text style={styles.sectionHeader}>DATA</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={() => setShowExport(true)}>
            <Text style={styles.rowLabel}>Export data</Text>
            <Text style={styles.rowMeta}>CSV / PDF ›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={() => Alert.alert('Backup', 'Google Drive backup coming in Phase 4!')}>
            <Text style={styles.rowLabel}>Backup to Google Drive</Text>
            <Text style={styles.rowMeta}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={() => setShowClearData(true)}>
            <Text style={[styles.rowLabel, { color: Colors.danger }]}>Clear all data</Text>
            <Text style={styles.rowMeta}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── About ── */}
        <Text style={styles.sectionHeader}>ABOUT</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>App version</Text>
            <Text style={styles.rowMeta}>1.0.0</Text>
          </View>
          <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={() => Alert.alert('Feedback', 'Opens email compose in Phase 5.')}>
            <Text style={styles.rowLabel}>Send feedback</Text>
            <Text style={styles.rowMeta}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={() => Alert.alert('Privacy Policy', 'Opens in-app webview in Phase 5.')}>
            <Text style={styles.rowLabel}>Privacy policy</Text>
            <Text style={styles.rowMeta}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── Sign out ── */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>

        {/* ── Delete account ── */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => Alert.alert('Delete Account', 'Full deletion flow coming in Phase 5.')}
        >
          <Text style={styles.deleteText}>Delete account</Text>
        </TouchableOpacity>

        <View style={{ height: 48 }} />
      </ScrollView>

      {/* Sub-sheets */}
      <DigestTimesSheet visible={showDigestTimes} onClose={() => setShowDigestTimes(false)} />
      <AutoAssignSheet  visible={showAutoAssign}  onClose={() => setShowAutoAssign(false)} />
      <ExportSheet      visible={showExport}      onClose={() => setShowExport(false)} />
      <ClearDataSheet   visible={showClearData}   onClose={() => setShowClearData(false)} />
    </>
  )
}

// ─── Sub-sheet styles ─────────────────────────────────────────────────────────
const sh = StyleSheet.create({
  overlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:         { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  handle:        { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  title:         { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 20 },
  label:         { fontSize: 13, color: Colors.textSecondary, marginBottom: 8 },
  input:         { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 12, fontSize: 16, color: Colors.textPrimary },
  hint:          { fontSize: 11, color: Colors.textHint, marginTop: 6 },
  warning:       { fontSize: 13, color: Colors.danger, lineHeight: 20, marginBottom: 16 },
  chips:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:          { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.border },
  chipActive:    { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText:      { fontSize: 13, color: Colors.textSecondary },
  chipTextActive:{ color: Colors.white, fontWeight: '600' },
  btnRow:        { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn:     { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  cancelText:    { color: Colors.textSecondary, fontWeight: '500', fontSize: 15 },
  saveBtn:       { flex: 1, backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveText:      { color: Colors.white, fontWeight: '600', fontSize: 15 },
})

// ─── Main screen styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#F0F0F0' },
  profileCard:        { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.white, padding: 20, paddingTop: 56, marginBottom: 24 },
  avatar:             { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText:         { color: Colors.white, fontSize: 20, fontWeight: '700' },
  profileName:        { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  profileEmail:       { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  currencyBadge:      { backgroundColor: Colors.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  currencyText:       { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  sectionHeader:      { fontSize: 11, color: Colors.textHint, fontWeight: '600', letterSpacing: 0.8, paddingHorizontal: 16, marginBottom: 6 },
  section:            { backgroundColor: Colors.white, marginHorizontal: 16, marginBottom: 20, borderRadius: 14, overflow: 'hidden' },
  row:                { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  rowBorder:          { borderTopWidth: 0.5, borderColor: Colors.border },
  rowLabel:           { fontSize: 15, color: Colors.textPrimary },
  rowSub:             { fontSize: 11, color: Colors.textHint, marginTop: 2 },
  rowMeta:            { fontSize: 13, color: Colors.textHint },
  activeBadge:        { backgroundColor: Colors.primaryLight, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  activeBadgeText:    { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  themeChips:         { flexDirection: 'row', gap: 6 },
  themeChip:          { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  themeChipActive:    { backgroundColor: Colors.primary, borderColor: Colors.primary },
  themeChipText:      { fontSize: 12, color: Colors.textSecondary },
  themeChipTextActive:{ color: Colors.white, fontWeight: '600' },
  signOutBtn:         { marginHorizontal: 16, marginTop: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  signOutText:        { fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },
  deleteBtn:          { marginHorizontal: 16, marginTop: 12, paddingVertical: 10, alignItems: 'center' },
  deleteText:         { fontSize: 14, color: Colors.danger },
})