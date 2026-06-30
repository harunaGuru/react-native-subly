import {
  getBrandIconUri,
  getRandomSubscriptionColor,
} from "@/lib/subscriptionIcon";
import clsx from "clsx";
import dayjs from "dayjs";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

type Frequency = "Monthly" | "Yearly";

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (subscription: Subscription) => void;
}

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const CreateSubscriptionModal = ({
  visible,
  onClose,
  onSubmit,
}: CreateSubscriptionModalProps) => {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  const [category, setCategory] =
    useState<(typeof CATEGORIES)[number]>("Entertainment");

  const parsedPrice = parseFloat(price);
  const isValidName = name.trim().length > 0;
  const isValidPrice = !Number.isNaN(parsedPrice) && parsedPrice > 0;
  const canSubmit = isValidName && isValidPrice;

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Entertainment");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    const startDate = dayjs().toISOString();
    const renewalDate =
      frequency === "Monthly"
        ? dayjs().add(1, "month").toISOString()
        : dayjs().add(1, "year").toISOString();

    onSubmit({
      id: `${slugify(name) || "subscription"}-${Date.now()}`,
      name: name.trim(),
      price: parsedPrice,
      category,
      status: "active",
      startDate,
      renewalDate,
      icon: { uri: getBrandIconUri(name.trim()) },
      billing: frequency,
      color: getRandomSubscriptionColor(),
      currency: "USD",
    });

    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <Pressable className="modal-overlay" onPress={handleClose}>
          <Pressable
            className="modal-container"
            style={{ paddingBottom: insets.bottom }}
            onPress={() => {}}
          >
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <Pressable
                className="modal-close"
                onPress={handleClose}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Text className="modal-close-text">×</Text>
              </Pressable>
            </View>

            <ScrollView
              className="modal-body"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="auth-field">
                <Text className="auth-label">Name</Text>
                <TextInput
                  className={clsx(
                    "auth-input",
                    !isValidName && name.length > 0 && "auth-input-error"
                  )}
                  value={name}
                  onChangeText={setName}
                  placeholder="Netflix, Spotify, etc."
                  placeholderTextColor="rgba(0, 0, 0, 0.35)"
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label">Price</Text>
                <TextInput
                  className={clsx(
                    "auth-input",
                    price.length > 0 && !isValidPrice && "auth-input-error"
                  )}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="9.99"
                  placeholderTextColor="rgba(0, 0, 0, 0.35)"
                  keyboardType="decimal-pad"
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label">Frequency</Text>
                <View className="picker-row">
                  {(["Monthly", "Yearly"] as const).map((option) => (
                    <Pressable
                      key={option}
                      className={clsx(
                        "picker-option",
                        frequency === option && "picker-option-active"
                      )}
                      onPress={() => {
                        Keyboard.dismiss();
                        setFrequency(option);
                      }}
                    >
                      <Text
                        className={clsx(
                          "picker-option-text",
                          frequency === option && "picker-option-text-active"
                        )}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View className="auth-field">
                <Text className="auth-label">Category</Text>
                <View className="category-scroll">
                  {CATEGORIES.map((option) => (
                    <Pressable
                      key={option}
                      className={clsx(
                        "category-chip",
                        category === option && "category-chip-active"
                      )}
                      onPress={() => {
                        Keyboard.dismiss();
                        setCategory(option);
                      }}
                    >
                      <Text
                        className={clsx(
                          "category-chip-text",
                          category === option && "category-chip-text-active"
                        )}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Pressable
                className={clsx(
                  "auth-button",
                  !canSubmit && "auth-button-disabled"
                )}
                onPress={handleSubmit}
                disabled={!canSubmit}
              >
                <Text className="auth-button-text">Add Subscription</Text>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateSubscriptionModal;
