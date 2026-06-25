import { styled } from "nativewind";
import React from 'react';
import { Text } from 'react-native';
import { SafeAreaView as RNSafeaAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeaAreaView)
const Insight = () => {
  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
      <Text>insight</Text>
    </SafeAreaView>
  )
}

export default Insight