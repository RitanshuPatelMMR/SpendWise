import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native'
import { Colors } from '../../constants/colors'
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../../services/authService'

export default function SignUp({ navigation }: any) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(false)

  const handleEmail = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill all fields')
    setLoading(true)
    try {
      isLogin
        ? await signInWithEmail(email, password)
        : await signUpWithEmail(email, password)
      navigation.navigate('SMSPermission')
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
      navigation.navigate('SMSPermission')
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Welcome back' : 'Create account'}</Text>
      <TextInput style={styles.input} placeholder="Email" value={email}
        onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={password}
        onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleEmail} disabled={loading}>
        {loading ? <ActivityIndicator color={Colors.white} /> :
          <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Sign Up'}</Text>}
      </TouchableOpacity>
      <Text style={styles.or}>— or —</Text>
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogle} disabled={loading}>
        <Text style={styles.googleText}>🔵 Continue with Google</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.toggle}>
        <Text style={styles.toggleText}>
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 32, backgroundColor: Colors.white },
  title: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary, marginBottom: 32, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16 },
  button: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: Colors.white, fontSize: 18, fontWeight: '600' },
  or: { textAlign: 'center', color: Colors.textHint, marginBottom: 16 },
  googleButton: { borderWidth: 1, borderColor: Colors.border, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 24 },
  googleText: { fontSize: 16, color: Colors.textPrimary, fontWeight: '500' },
  toggle: { alignItems: 'center' },
  toggleText: { color: Colors.primary, fontSize: 14 },
})