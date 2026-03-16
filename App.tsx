// import React from 'react'
// import AppNavigator from './src/navigation/AppNavigator'

// export default function App() {
//   return <AppNavigator />
// }

import React, { useEffect } from 'react'
import AppNavigator from './src/navigation/AppNavigator'
import { testParser } from './src/utils/smsParser'
import { startSMSListener } from './src/services/smsListener'

export default function App() {
  useEffect(() => {
    testParser()
    const cleanup = startSMSListener()
    return cleanup
  }, [])

  return <AppNavigator />
}