import { useSignIn } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useCallback, useState } from "react";
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

/* ──────────────────────────── screen ──────────────────────────── */

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

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
    touched.password && !password.trim() ? "Password is required" : undefined;

  const canSubmit = isValidEmail(email) && password.trim().length > 0 && !isBusy;

  /* ── submit ── */
  const handleSubmit = useCallback(async () => {
    setTouched({ email: true, password: true });
    setApiError("");
    if (!canSubmit) return;

    try {
      const { error } = await signIn.password({
        emailAddress: email,
        password,
      });

      if (error) {
        setApiError(error.longMessage || error.message || "Unable to sign in");
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) return;
            router.replace(decorateUrl("/") as Href);
          },
        });
      } else if (
        signIn.status === "needs_second_factor" ||
        signIn.status === "needs_client_trust"
      ) {
        const emailCodeFactor = signIn.supportedSecondFactors.find(
          (factor) => factor.strategy === "email_code",
        );

        if (emailCodeFactor) {
          const { error: mfaError } = await signIn.mfa.sendEmailCode();
          if (mfaError) {
            setApiError(
              mfaError.longMessage ||
                mfaError.message ||
                "Unable to send verification code",
            );
          }
        } else {
          setApiError(
            "This account requires a second factor that is not supported here.",
          );
        }
      } else {
        console.error("Sign-in attempt not complete:", signIn);
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setApiError(err.errors?.[0]?.longMessage || err.message || "An error occurred");
    }
  }, [canSubmit, email, password, signIn, router]);

  /* ── verify MFA ── */
  const handleVerify = useCallback(async () => {
    setApiError("");
    try {
      const { error } = await signIn.mfa.verifyEmailCode({ code });

      if (error) {
        setApiError(error.longMessage || error.message || "Invalid code");
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) return;
            router.replace(decorateUrl("/") as Href);
          },
        });
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setApiError(err.errors?.[0]?.longMessage || err.message || "Invalid code");
    }
  }, [code, signIn, router]);

  /* ───────────── MFA verification step ───────────── */
  if (
    signIn.status === "needs_second_factor" ||
    signIn.status === "needs_client_trust"
  ) {
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

              <Text className="auth-title">Verify your identity</Text>
              <Text className="auth-subtitle">
                We sent a verification code to your email
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
                  className={`auth-button ${isBusy ? "auth-button-disabled" : ""}`}
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
                  onPress={() => signIn.mfa.sendEmailCode()}
                >
                  <Text className="auth-secondary-button-text">
                    Resend code
                  </Text>
                </Pressable>

                <Pressable
                  className="auth-secondary-button"
                  onPress={() => signIn.reset()}
                >
                  <Text className="auth-secondary-button-text">Start over</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  /* ───────────── main sign-in form ───────────── */
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

            <Text className="auth-title">Welcome back</Text>
            <Text className="auth-subtitle">
              Sign in to continue managing your subscriptions
            </Text>
          </View>

          {/* ── form card ── */}
          <View className="auth-card">
            <View className="auth-form">
              {/* email */}
              <View className="auth-field">
                <Text className="auth-label">Email</Text>
                <TextInput
                  className={`auth-input ${emailErr || errors?.fields?.identifier ? "auth-input-error" : ""}`}
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
                {!emailErr && errors?.fields?.identifier && (
                  <Text className="auth-error">
                    {errors.fields.identifier.message}
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
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  secureTextEntry
                  autoComplete="password"
                  textContentType="password"
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
                  <Text className="auth-button-text">Sign in</Text>
                )}
              </Pressable>
            </View>
          </View>

          {/* ── footer link ── */}
          <View className="auth-link-row">
            <Text className="auth-link-copy">New to Subly? </Text>
            <Link href="/(auth)/sign-up" asChild>
              <Pressable>
                <Text className="auth-link">Create an account</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
