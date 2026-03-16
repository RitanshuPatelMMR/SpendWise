import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Colors } from '../../constants/colors'
import AsyncStorage from '@react-native-async-storage/async-storage'
import messaging from '@react-native-firebase/messaging'

export default function NotificationPermission({ navigation }: any) {
  const requestPermission = async () => {
    await messaging().requestPermission()
    await AsyncStorage.setItem('onboarding_done', 'true')
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🔔</Text>
      <Text style={styles.title}>Enable Notifications</Text>
      <Text style={styles.subtitle}>
        Get notified instantly when a new transaction is detected so you can tag it quickly.
      </Text>
      <TouchableOpacity style={styles.button} onPress={requestPermission}>
        <Text style={styles.buttonText}>Enable Notifications</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={async () => {
        await AsyncStorage.setItem('onboarding_done', 'true')
        navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] })
      }}>
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