import auth from '@react-native-firebase/auth'
import { GoogleSignin } from '@react-native-google-signin/google-signin'

GoogleSignin.configure({
  webClientId: '1028385885139-eoa85qcd5drkcumgi4oer1kboe1sprav.apps.googleusercontent.com',
})

export const signInWithGoogle = async () => {
  await GoogleSignin.hasPlayServices()
  const response = await GoogleSignin.signIn()
  const idToken = response.data?.idToken
  if (!idToken) throw new Error('No ID token found')
  const googleCredential = auth.GoogleAuthProvider.credential(idToken)
  return auth().signInWithCredential(googleCredential)
}

export const signInWithEmail = async (email: string, password: string) => {
  return auth().signInWithEmailAndPassword(email, password)
}

export const signUpWithEmail = async (email: string, password: string) => {
  return auth().createUserWithEmailAndPassword(email, password)
}

export const signOut = async () => {
  await auth().signOut()
}

export const getCurrentUser = () => {
  return auth().currentUser
}