import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptions } from "@/contexts/SubscriptionsContext";
import { useFocusEffect } from "@react-navigation/native";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const filterSubscriptions = (subscriptions: Subscription[], query: string) => {
  const term = query.trim().toLowerCase();
  if (!term) return subscriptions;

  return subscriptions.filter((subscription) =>
    [
      subscription.name,
      subscription.category,
      subscription.plan,
      subscription.status,
      subscription.billing,
      subscription.paymentMethod,
    ]
      .filter(Boolean)
      .some((field) => field!.toLowerCase().includes(term))
  );
};

const Subscription = () => {
  const posthog = usePostHog();
  const { subscriptions } = useSubscriptions();
  const [query, setQuery] = useState("");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  const filteredSubscriptions = useMemo(
    () => filterSubscriptions(subscriptions, query),
    [subscriptions, query]
  );

  useFocusEffect(
    useCallback(() => {
      posthog.capture("subscriptions_list_viewed");
    }, [posthog])
  );

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-20"
        extraData={[expandedSubscriptionId, filteredSubscriptions]}
        ItemSeparatorComponent={() => <View className="h-4" />}
        ListHeaderComponent={
          <>
            <Text className="list-title mb-4">Subscriptions</Text>
            <TextInput
              className="mb-5 rounded-2xl border border-border bg-card px-4 py-3 text-base font-sans-medium text-primary"
              placeholder="Search subscriptions..."
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </>
        }
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
        ListEmptyComponent={
          <Text className="home-empty-state">
            {query.trim()
              ? "No subscriptions match your search."
              : "No subscriptions yet."}
          </Text>
        }
      />
    </SafeAreaView>
  );
};

export default Subscription;
