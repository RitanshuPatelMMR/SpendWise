import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Colors } from '../../constants/colors'

export default function Welcome({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💸</Text>
      <Text style={styles.title}>Welcome to Spendwise</Text>
      <Text style={styles.subtitle}>
        Automatically track your UPI & bank transactions. No manual entry needed.
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('HowItWorks')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: Colors.white },
  emoji: { fontSize: 64, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', marginBottom: 16 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 48 },
  button: { backgroundColor: Colors.primary, paddingHorizontal: 48, paddingVertical: 16, borderRadius: 12, width: '100%', alignItems: 'center' },
  buttonText: { color: Colors.white, fontSize: 18, fontWeight: '600' },
})