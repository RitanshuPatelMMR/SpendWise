import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Colors } from '../../constants/colors'

const steps = [
  { emoji: '📱', title: 'SMS is read', desc: 'App reads bank SMS in background' },
  { emoji: '🏷️', title: 'You tag it', desc: 'One tap to categorize each expense' },
  { emoji: '📊', title: 'See reports', desc: 'Monthly insights and budget tracking' },
]

export default function HowItWorks({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How it works</Text>
      {steps.map((step, i) => (
        <View key={i} style={styles.step}>
          <Text style={styles.emoji}>{step.emoji}</Text>
          <View>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDesc}>{step.desc}</Text>
          </View>
        </View>
      ))}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 32, backgroundColor: Colors.white },
  title: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary, marginBottom: 40, textAlign: 'center' },
  step: { flexDirection: 'row', alignItems: 'center', marginBottom: 32, gap: 16 },
  emoji: { fontSize: 40 },
  stepTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  stepDesc: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  button: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  buttonText: { color: Colors.white, fontSize: 18, fontWeight: '600' },
})