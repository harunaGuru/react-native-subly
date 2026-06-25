import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNSafeaAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeaAreaView)
const Setting = () => {
  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
      <Text>Setting</Text>
    </SafeAreaView>
  );
};

export default Setting;