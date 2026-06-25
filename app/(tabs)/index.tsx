import "@/global.css";
import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>
      <Link className="mt-4 rounded bg-primary p-4 text-white" href="/(auth)/sign-in">Sign In</Link>
      <Link className="mt-4 rounded bg-primary p-4 text-white" href="/(auth)/sign-up">Sign Up</Link>
      <Link className="mt-4 rounded bg-primary p-4 text-white" href="/onboarding">Onboarding</Link>
      <Link href={{ pathname: "/subscriptions/[id]", params: { id: "spotify" } }}>Spotify Subscription</Link>
      <Link href={{
        pathname: "/subscriptions/[id]",
        params: {
          id: "claude"
        }
      }}>
        Claude Max Subscription
      </Link>
    </View>
  );
}