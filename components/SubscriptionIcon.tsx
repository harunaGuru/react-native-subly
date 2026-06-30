import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useState } from "react";
import { Image, ImageSourcePropType, View } from "react-native";
import { SvgUri } from "react-native-svg";

interface SubscriptionIconProps {
  icon: ImageSourcePropType;
  name: string;
}

const isRemoteIcon = (
  icon: ImageSourcePropType
): icon is { uri: string } =>
  typeof icon === "object" &&
  icon !== null &&
  "uri" in icon &&
  typeof icon.uri === "string";

const SubscriptionIcon = ({ icon, name }: SubscriptionIconProps) => {
  const [hasError, setHasError] = useState(false);

  if (!isRemoteIcon(icon) || hasError) {
    if (!isRemoteIcon(icon)) {
      return <Image source={icon} className="sub-icon" accessibilityLabel={name} />;
    }

    return (
      <View className="sub-icon items-center justify-center rounded-lg bg-muted">
        <MaterialCommunityIcons
          name="card-account-details-outline"
          size={32}
          color="#081126"
        />
      </View>
    );
  }

  return (
    <View className="sub-icon overflow-hidden rounded-lg bg-card">
      <SvgUri
        width="100%"
        height="100%"
        uri={icon.uri}
        onError={() => setHasError(true)}
      />
    </View>
  );
};

export default SubscriptionIcon;
