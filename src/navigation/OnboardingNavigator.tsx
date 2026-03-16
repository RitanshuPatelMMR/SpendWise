import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import Welcome from '../screens/onboarding/Welcome'
import HowItWorks from '../screens/onboarding/HowItWorks'
import SignUp from '../screens/onboarding/SignUp'
import SMSPermission from '../screens/onboarding/SMSPermission'
import NotificationPermission from '../screens/onboarding/NotificationPermission'

const Stack = createStackNavigator()

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="HowItWorks" component={HowItWorks} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="SMSPermission" component={SMSPermission} />
      <Stack.Screen name="NotificationPermission" component={NotificationPermission} />
    </Stack.Navigator>
  )
}