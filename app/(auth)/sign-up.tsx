import { useAuth, useSignUp } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useCallback, useState } from "react";
import { usePostHog } from "posthog-react-native";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

/* ──────────────────────────── helpers ──────────────────────────── */

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const MIN_PASSWORD = 8;
const logAuthIssue = (message: string) => {
  if (__DEV__) {
    console.warn(message);
  }
};

/* ──────────────────────────── screen ──────────────────────────── */

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const posthog = usePostHog();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [apiError, setApiError] = useState("");

  const isBusy = fetchStatus === "fetching";

  /* ── local validation ── */
  const emailErr =
    touched.email && !email.trim()
      ? "Email is required"
      : touched.email && !isValidEmail(email)
        ? "Enter a valid email address"
        : undefined;

  const passwordErr =
    touched.password && !password.trim()
      ? "Password is required"
      : touched.password && password.length < MIN_PASSWORD
        ? `Password must be at least ${MIN_PASSWORD} characters`
        : undefined;

  const canSubmit =
    isValidEmail(email) && password.length >= MIN_PASSWORD && !isBusy;

  /* ── create account ── */
  const handleSubmit = useCallback(async () => {
    setTouched({ email: true, password: true });
    setApiError("");
    if (!canSubmit) return;

    try {
      const { error } = await signUp.password({
        emailAddress: email,
        password,
      });

      if (error) {
        setApiError(
          error.longMessage || error.message || "Unable to create account",
        );
        return;
      }

      const { error: verificationError } =
        await signUp.verifications.sendEmailCode();

      if (verificationError) {
        setApiError(
          verificationError.longMessage ||
            verificationError.message ||
            "Unable to send verification code",
        );
      }
    } catch (err: any) {
      logAuthIssue("Sign-up request failed.");
      setApiError(
        err.errors?.[0]?.longMessage || err.message || "An error occurred",
      );
    }
  }, [canSubmit, email, password, signUp]);

  /* ── verify email code ── */
  const handleResendCode = useCallback(async () => {
    setApiError("");

    try {
      const { error } = await signUp.verifications.sendEmailCode();

      if (error) {
        setApiError(
          error.longMessage ||
            error.message ||
            "Unable to resend verification code",
        );
      }
    } catch (err: any) {
      logAuthIssue("Sign-up verification resend failed.");
      setApiError(
        err.errors?.[0]?.longMessage ||
          err.message ||
          "Unable to resend verification code",
      );
    }
  }, [signUp]);

  const handleVerify = useCallback(async () => {
    setApiError("");
    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code });

      if (error) {
        setApiError(error.longMessage || error.message || "Invalid code");
        return;
      }

      if (signUp.status === "complete") {
        posthog.identify(email, {
          $set: { email },
          $set_once: { first_seen: new Date().toISOString() },
        });
        posthog.capture("user_signed_up", { method: "email" });
        await signUp.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) return;
            router.replace(decorateUrl("/") as Href);
          },
        });
      } else {
        logAuthIssue("Sign-up attempt did not complete.");
        setApiError("Sign-up not complete");
      }
    } catch (err: any) {
      logAuthIssue("Sign-up verification failed.");
      setApiError(
        err.errors?.[0]?.longMessage || err.message || "Invalid code",
      );
    }
  }, [code, signUp, router, email, posthog]);

  /* ── already signed in ── */
  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  /* ───────────── verification step ───────────── */
  const isVerifying =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  if (isVerifying) {
    return (
      <SafeAreaView className="auth-safe-area">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            className="auth-scroll"
            contentContainerClassName="auth-content"
            keyboardShouldPersistTaps="handled"
          >
            {/* ── brand ── */}
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">S</Text>
                </View>
                <View>
                  <Text className="auth-wordmark">Subly</Text>
                  <Text className="auth-wordmark-sub">Subscription Tracker</Text>
                </View>
              </View>

              <Text className="auth-title">Verify your email</Text>
              <Text className="auth-subtitle">
                We sent a 6-digit code to {email}
              </Text>
            </View>

            {/* ── card ── */}
            <View className="auth-card">
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Verification code</Text>
                  <TextInput
                    className={`auth-input ${errors?.fields?.code ? "auth-input-error" : ""}`}
                    value={code}
                    onChangeText={setCode}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    keyboardType="number-pad"
                    autoFocus
                  />
                  {errors?.fields?.code && (
                    <Text className="auth-error">
                      {errors.fields.code.message}
                    </Text>
                  )}
                  {apiError ? (
                    <Text className="auth-error">{apiError}</Text>
                  ) : null}
                </View>

                <Pressable
                  className={`auth-button ${isBusy || !code.trim() ? "auth-button-disabled" : ""}`}
                  onPress={handleVerify}
                  disabled={isBusy || !code.trim()}
                >
                  {isBusy ? (
                    <ActivityIndicator color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Verify</Text>
                  )}
                </Pressable>

                <Pressable
                  className="auth-secondary-button"
                  onPress={handleResendCode}
                >
                  <Text className="auth-secondary-button-text">
                    Resend code
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  /* ───────────── main sign-up form ───────────── */
  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
        >
          {/* ── brand block ── */}
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">S</Text>
              </View>
              <View>
                <Text className="auth-wordmark">Subly</Text>
                <Text className="auth-wordmark-sub">Subscription Tracker</Text>
              </View>
            </View>

            <Text className="auth-title">Create your account</Text>
            <Text className="auth-subtitle">
              Start tracking and managing all your subscriptions in one place
            </Text>
          </View>

          {/* ── form card ── */}
          <View className="auth-card">
            <View className="auth-form">
              {/* email */}
              <View className="auth-field">
                <Text className="auth-label">Email</Text>
                <TextInput
                  className={`auth-input ${emailErr || errors?.fields?.emailAddress ? "auth-input-error" : ""}`}
                  value={email}
                  onChangeText={setEmail}
                  onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                />
                {emailErr && <Text className="auth-error">{emailErr}</Text>}
                {!emailErr && errors?.fields?.emailAddress && (
                  <Text className="auth-error">
                    {errors.fields.emailAddress.message}
                  </Text>
                )}
              </View>

              {/* password */}
              <View className="auth-field">
                <Text className="auth-label">Password</Text>
                <TextInput
                  className={`auth-input ${passwordErr || errors?.fields?.password ? "auth-input-error" : ""}`}
                  value={password}
                  onChangeText={setPassword}
                  onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                  placeholder="Create a password"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  secureTextEntry
                  autoComplete="new-password"
                  textContentType="newPassword"
                />
                {passwordErr && (
                  <Text className="auth-error">{passwordErr}</Text>
                )}
                {!passwordErr && errors?.fields?.password && (
                  <Text className="auth-error">
                    {errors.fields.password.message}
                  </Text>
                )}
                {apiError ? (
                  <Text className="auth-error">{apiError}</Text>
                ) : null}
                <Text className="auth-helper">
                  Must be at least {MIN_PASSWORD} characters
                </Text>
              </View>

              {/* submit */}
              <Pressable
                className={`auth-button ${!canSubmit ? "auth-button-disabled" : ""}`}
                onPress={handleSubmit}
                disabled={!canSubmit}
              >
                {isBusy ? (
                  <ActivityIndicator color="#081126" />
                ) : (
                  <Text className="auth-button-text">Create account</Text>
                )}
              </Pressable>
            </View>
          </View>

          {/* ── footer link ── */}
          <View className="auth-link-row">
            <Text className="auth-link-copy">Already have an account? </Text>
            <Link href="/(auth)/sign-in" asChild>
              <Pressable>
                <Text className="auth-link">Sign in</Text>
              </Pressable>
            </Link>
          </View>

          {/* Required for Clerk bot sign-up protection */}
          <View nativeID="clerk-captcha" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
