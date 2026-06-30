import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscription from "@/components/UpcomingSubscription";
import {
  HOME_BALANCE,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { useSubscriptions } from "@/contexts/SubscriptionsContext";
import "@/global.css";
import { formatCurrency } from "@/lib/utils";
import CreateSubscriptionModal from "@/src/components/CreateSubscriptionModal";
import { useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { usePostHog } from "posthog-react-native";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const { user } = useUser();
  const posthog = usePostHog();
  const router = useRouter();
  const { subscriptions, addSubscription } = useSubscriptions();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  const displayName =
    user?.firstName ??
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ??
    "User";

  const avatarUri = user?.imageUrl;

  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image
                  className="home-avatar"
                  source={
                    avatarUri ? { uri: avatarUri } : images.avatar
                  }
                />
                <Text className="home-user-name">{displayName}</Text>
              </View>
                <Pressable
                  onPress={() => {
                    posthog.capture("add_subscription_tapped");
                    setIsCreateModalVisible(true);
                  }}
                >
                  <Image source={icons.add} className="home-add-icon" />
                </Pressable>
            </View>
            <View className="home-balance-card">
              <Text className="home-balance-label">Total spent</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                </Text>
              </View>
            </View>
            <View className="mb-5">
              <ListHeading title="Upcoming" />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => <UpcomingSubscription {...item} />}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No upcoming subscriptions
                  </Text>
                }
              />
            </View>
            <ListHeading
              title="All Subscriptions"
              onActionPress={() => router.push("/subscriptions")}
            />
          </>
        )}
        data={subscriptions}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => {
              const isExpanding = expandedSubscriptionId !== item.id;
              setExpandedSubscriptionId((currentId) =>
                currentId === item.id ? null : item.id
              );
              if (isExpanding) {
                posthog.capture("subscription_card_expanded", {
                  subscription_id: item.id,
                  subscription_name: item.name,
                  subscription_category: item.category as string,
                });
              }
            }}
          />
        )}
        extraData={[expandedSubscriptionId, subscriptions]}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text className="home-empty-state">No subscriptions yet.</Text>
        }
        contentContainerClassName="pb-20"
      />
      <CreateSubscriptionModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onSubmit={addSubscription}
      />
    </SafeAreaView>
  );
}