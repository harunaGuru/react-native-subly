import { styled } from "nativewind";
import { useEffect } from 'react';
import { Text } from 'react-native';
import { SafeAreaView as RNSafeaAreaView } from "react-native-safe-area-context";
import { usePostHog } from "posthog-react-native";

const SafeAreaView = styled(RNSafeaAreaView)
const Subscription = () => {
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture("subscriptions_list_viewed");
  }, [posthog]);

  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
      <Text>Subscriptions</Text>
    </SafeAreaView>
  )
}

export default Subscription