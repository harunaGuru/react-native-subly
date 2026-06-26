import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscription from "@/components/UpcomingSubscription";
import { HOME_BALANCE, HOME_SUBSCRIPTIONS, HOME_USER, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from '@/constants/images';
import "@/global.css";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import { styled } from "nativewind";
import React, { useState } from "react";
import { FlatList, Image, Text, View } from "react-native";
import { SafeAreaView as RNSafeaAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeaAreaView)
export default function App() {
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  // const handleToggle = (id: string) => {
  //   setExpandedSubscriptionId((prev) => prev === id ? null : id);
  // }
  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image className="home-avatar" source={images.avatar} />
                <Text className="home-user-name">{HOME_USER.name}</Text>
              </View>
              <Image source={icons.add} className="home-add-icon" />
            </View>
            <View className="home-balance-card">
              <Text className="home-balance-label">Total spent</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">{formatCurrency(HOME_BALANCE.amount)}</Text>
                <Text className="home-balance-date">{dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}</Text>
              </View>
            </View>
            <View className="mb-5">
              <ListHeading title='Upcoming' />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => <UpcomingSubscription {...item} />}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={<Text className="home-empty-state">No upcoming subscriptions</Text>}
              />
            </View>
            <ListHeading title='All Subscriptions' />
          </>
        )}
        data={HOME_SUBSCRIPTIONS}
        renderItem={({ item }) => <SubscriptionCard {...item} expanded={expandedSubscriptionId === item.id} onPress={() => setExpandedSubscriptionId(currentId => currentId === item.id ? null : item.id)} />}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text className="home-empty-state">No subscriptions yet.</Text>}
        contentContainerClassName="pb-20"
      />
    </SafeAreaView>
  );
}