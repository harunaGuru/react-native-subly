# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into Subly. A new `PostHogProvider` wraps the app in `app/_layout.tsx`, with a pre-initialized client in `src/config/posthog.ts` that reads credentials via `expo-constants` from `app.config.js`. Screen views are tracked automatically using `usePathname` on every navigation change. Users are identified by email on successful sign-in and sign-up, and `posthog.reset()` is called on logout to unlink the session.

| Event | Description | File |
|---|---|---|
| `user_signed_up` | User successfully created a new account | `app/(auth)/sign-up.tsx` |
| `user_signed_in` | User successfully signed in to their account | `app/(auth)/sign-in.tsx` |
| `user_signed_out` | User signed out from the settings screen | `app/(tabs)/settings.tsx` |
| `onboarding_viewed` | User viewed the onboarding screen (top of the sign-up funnel) | `app/onboarding.tsx` |
| `subscription_card_expanded` | User expanded a subscription card on the home screen | `app/(tabs)/index.tsx` |
| `add_subscription_tapped` | User tapped the add subscription button on the home screen | `app/(tabs)/index.tsx` |
| `subscription_viewed` | User navigated to a subscription detail page | `app/subscriptions/[id].tsx` |
| `insights_viewed` | User opened the Insights tab | `app/(tabs)/insights.tsx` |
| `subscriptions_list_viewed` | User opened the Subscriptions list tab | `app/(tabs)/subscriptions.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/490613/dashboard/1778530)
- [New User Signups](https://us.posthog.com/project/490613/insights/QzQzpdTF)
- [Sign-ins vs Sign-outs](https://us.posthog.com/project/490613/insights/02OjoeIa)
- [Sign-up to Subscription Engagement Funnel](https://us.posthog.com/project/490613/insights/PlYCwU6c)
- [Subscription Feature Engagement](https://us.posthog.com/project/490613/insights/B9jT1bcA)
- [App Tab Usage](https://us.posthog.com/project/490613/insights/Jpzr6HMp)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` to `.env.example` and any onboarding docs so collaborators know what to set.
- [ ] Confirm the returning-visitor path also calls `identify` — currently `identify` is only called on fresh sign-in and sign-up; a returning session that bypasses those screens (e.g. a user with a stored Clerk session) will stay anonymous until the next explicit login. Consider calling `identify` in `app/_layout.tsx` once `useUser()` resolves a signed-in user.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
