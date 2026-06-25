import "@/global.css";
import { Link } from "expo-router";
import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNSafeaAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeaAreaView)
export default function App() {
  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
      <Text className="text-5xl font-sans-extrabold">
        Home
      </Text>
      <Link className="mt-4 font-sans-bold rounded bg-primary p-4 text-white" href="/onboarding">Go to Onboarding</Link>
      <Link className="mt-4 font-sans-bold rounded bg-primary p-4 text-white" href="/(auth)/sign-in">Go to Sign in</Link>
      <Link className="mt-4 font-sans-bold rounded bg-primary p-4 text-white" href="/(auth)/sign-up">Go to Sign up</Link>
    </SafeAreaView>
  );
}