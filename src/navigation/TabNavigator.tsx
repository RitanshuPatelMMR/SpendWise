import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text } from 'react-native'
import Dashboard from '../screens/Dashboard'
import Categories from '../screens/Categories'
import Budget from '../screens/Budget'
import Reports from '../screens/Reports'
import Settings from '../screens/Settings'
import { Colors } from '../constants/colors'

const Tab = createBottomTabNavigator()

const icon = (emoji: string) => () => <Text style={{ fontSize: 20 }}>{emoji}</Text>

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textHint,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
      }}>
      <Tab.Screen name="Dashboard" component={Dashboard}
        options={{ tabBarIcon: icon('🏠'), tabBarLabel: 'Home' }} />
      <Tab.Screen name="Categories" component={Categories}
        options={{ tabBarIcon: icon('📊'), tabBarLabel: 'Categories' }} />
      <Tab.Screen name="Budget" component={Budget}
        options={{ tabBarIcon: icon('💰'), tabBarLabel: 'Budget' }} />
      <Tab.Screen name="Reports" component={Reports}
        options={{ tabBarIcon: icon('📈'), tabBarLabel: 'Reports' }} />
      <Tab.Screen name="Settings" component={Settings}
        options={{ tabBarIcon: icon('⚙️'), tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  )
}