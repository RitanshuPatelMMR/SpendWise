import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '../constants/colors'

export default function Budget() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Budget</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  text: { fontSize: 24, fontWeight: '600', color: Colors.textPrimary },
})