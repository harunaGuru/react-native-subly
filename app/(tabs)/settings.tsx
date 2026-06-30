import { useClerk, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeaAreaView } from "react-native-safe-area-context";
import { usePostHog } from "posthog-react-native";

const SafeAreaView = styled(RNSafeaAreaView);

const formatDate = (date: Date | null | undefined) => {
  if (!date) return "Not available";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row items-start justify-between gap-4 border-b border-border py-4 last:border-b-0">
    <Text className="flex-1 text-sm font-sans-semibold text-muted-foreground">
      {label}
    </Text>
    <Text className="max-w-52.5 text-right text-sm font-sans-bold text-primary">
      {value}
    </Text>
  </View>
);

const Setting = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();
  const posthog = usePostHog();

  const displayName = user?.fullName || user?.username || "Subly user";
  const email = user?.primaryEmailAddress?.emailAddress || "No email address";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    posthog.capture("user_signed_out");
    posthog.reset();
    await signOut();
    router.replace("/(auth)/sign-in");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-5 pb-28 pt-5"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-sans-bold text-primary">Settings</Text>

        <View className="rounded-3xl border border-border bg-card p-5">
          <View className="flex-row items-center gap-4">
            {user?.imageUrl ? (
              <Image
                source={{ uri: user.imageUrl }}
                className="size-20 rounded-3xl bg-muted"
              />
            ) : (
              <View className="size-20 items-center justify-center rounded-3xl bg-accent">
                <Text className="text-2xl font-sans-extrabold text-background">
                  {initials || "S"}
                </Text>
              </View>
            )}

            <View className="min-w-0 flex-1">
              <Text
                className="text-xl font-sans-bold text-primary"
                numberOfLines={1}
              >
                {displayName}
              </Text>
              <Text
                className="mt-1 text-sm font-sans-medium text-muted-foreground"
                numberOfLines={1}
              >
                {email}
              </Text>
            </View>
          </View>
        </View>

        <View className="rounded-3xl border border-border bg-card p-5">
          <Text className="text-lg font-sans-bold text-primary">
            Account details
          </Text>

          <View className="mt-2">
            <DetailRow label="Account ID" value={user?.id || "Not available"} />
            <DetailRow label="Date joined" value={formatDate(user?.createdAt)} />
            <DetailRow
              label="Last sign in"
              value={formatDate(user?.lastSignInAt)}
            />
            <DetailRow
              label="Email addresses"
              value={`${user?.emailAddresses.length ?? 0}`}
            />
            <DetailRow
              label="Password"
              value={user?.passwordEnabled ? "Enabled" : "Not enabled"}
            />
            <DetailRow
              label="Two-factor auth"
              value={user?.twoFactorEnabled ? "Enabled" : "Not enabled"}
            />
          </View>
        </View>

        <Pressable className="auth-button mt-2" onPress={handleLogout}>
          <Text className="auth-button-text">Log out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Setting;
