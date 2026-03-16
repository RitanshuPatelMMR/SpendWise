import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ActivityIndicator, View } from 'react-native'
import OnboardingNavigator from './OnboardingNavigator'
import TabNavigator from './TabNavigator'
import { Colors } from '../constants/colors'

export default function AppNavigator() {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null)
  const [loading, setLoading] = useState(true)
  const [onboardingDone, setOnboardingDone] = useState(false)

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (u) => {
      setUser(u)
      if (u) {
        const done = await AsyncStorage.getItem('onboarding_done')
        setOnboardingDone(done === 'true')
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