import type { View } from "../types";

const publicViews: View[] = ["login", "signup"];

export function initialView(session: { role?: string } | null): View {
  return session && session.role !== "admin" ? "dashboard" : "login";
}

export function resolveNavigationView(
  requestedView: View,
  state: {
    authenticated: boolean;
    role: "user" | "admin";
    setupRequired: boolean;
    consentAccepted: boolean;
  },
): View {
  if (!state.authenticated) {
    return publicViews.includes(requestedView) ? requestedView : "login";
  }
  if (publicViews.includes(requestedView)) return "dashboard";
  if (requestedView === "admin" && state.role !== "admin") return "dashboard";

  // Onboarding belongs to an explicitly started application, not normal navigation.
  if (
    requestedView === "application"
    && state.role === "user"
    && state.consentAccepted
    && state.setupRequired
  ) {
    return "profile-edit";
  }
  return requestedView;
}
