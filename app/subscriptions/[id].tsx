import { Link, useLocalSearchParams } from 'expo-router'
import React, { useEffect } from 'react'
import { Text, View } from 'react-native'
import { usePostHog } from 'posthog-react-native'

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const posthog = usePostHog()

  useEffect(() => {
    if (id) {
      posthog.capture('subscription_viewed', { subscription_id: id })
    }
  }, [id, posthog])
  return (
    <View>
      <Text>SubscriptionDetails: {id}</Text>
      <Link href="/" className='mt-4 rounded bg-primary p-4 text-white'>Go back</Link>
    </View>
  )
}

export default SubscriptionDetails