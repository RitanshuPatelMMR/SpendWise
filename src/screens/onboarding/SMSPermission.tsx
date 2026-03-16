import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Colors } from '../../constants/colors'
import { PermissionsAndroid } from 'react-native'

export default function SMSPermission({ navigation }: any) {
  const requestPermission = async () => {
    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECEIVE_SMS)
    navigation.navigate('NotificationPermission')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📱</Text>
      <Text style={styles.title}>Allow SMS Access</Text>
      <Text style={styles.subtitle}>
        Spendwise reads your bank SMS to automatically detect transactions. Your messages never leave your phone.
      </Text>
      <TouchableOpacity style={styles.button} onPress={requestPermission}>
        <Text style={styles.buttonText}>Allow SMS Access</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('NotificationPermission')}>
        <Text style={styles.skip}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: Colors.white },
  emoji: { fontSize: 64, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', marginBottom: 16 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 48 },
  button: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', width: '100%', marginBottom: 16 },
  buttonText: { color: Colors.white, fontSize: 18, fontWeight: '600' },
  skip: { color: Colors.textHint, fontSize: 14 },
})