import axios from 'axios'
import auth from '@react-native-firebase/auth'
import { Config } from '../constants/config'

const api = axios.create({
  baseURL: Config.API_URL,
  timeout: 10000,
})

api.interceptors.request.use(async (config) => {
  const user = auth().currentUser
  if (user) {
    const token = await user.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default api
