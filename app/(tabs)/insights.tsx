import { styled } from "nativewind";
import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { SafeAreaView as RNSafeaAreaView } from "react-native-safe-area-context";
import { usePostHog } from "posthog-react-native";

const SafeAreaView = styled(RNSafeaAreaView)
const Insight = () => {
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture("insights_viewed");
  }, [posthog]);

  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
      <Text>insights</Text>
    </SafeAreaView>
  )
}

export default Insight