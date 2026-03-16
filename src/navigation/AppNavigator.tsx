import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ActivityIndicator, View } from 'react-native'
import OnboardingNavigator from './OnboardingNavigator'
import TabNavigator from './TabNavigator'
import { Colors } from '../constants/colors'
import { useCategoryStore } from '../store/categoryStore'
import { useUserStore } from '../store/userStore'
import api from '../services/api'

export default function AppNavigator() {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null)
  const [loading, setLoading] = useState(true)
  const [onboardingDone, setOnboardingDone] = useState(false)
  const { setCategories } = useCategoryStore()
  const { setUser: setStoreUser } = useUserStore()

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (u) => {
      setUser(u)
      if (u) {
        const done = await AsyncStorage.getItem('onboarding_done')
        setOnboardingDone(done === 'true')

        // Verify user with backend and load data
        try {
  const res = await api.post('/auth/verify', {
    email: u.email,
    name: u.displayName,
  })
  setStoreUser(res.data.user)
  console.log('✅ 1. Firebase Auth done')
  console.log('✅ 2. User in PostgreSQL:', res.data.user.id)

  const catRes = await api.get('/categories')
  setCategories(catRes.data.categories)
  console.log('✅ 3. Categories loaded:', catRes.data.categories.length)
} catch (e) {
  console.error('❌ Backend sync error:', e)
}
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  return (
    <NavigationContainer>
      {user && onboardingDone ? <TabNavigator /> : <OnboardingNavigator />}
    </NavigationContainer>
  )
}