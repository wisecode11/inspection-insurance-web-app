export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  platform: {
    root: "/platform",
    dashboard: "/platform/dashboard",
    tenants: "/platform/tenants",
    billing: "/platform/billing",
    usage: "/platform/usage",
    settings: "/platform/settings",
    support: "/platform/support",
  },
  company: {
    root: "/company",
    dashboard: "/company/dashboard",
    jobs: "/company/jobs",
    job: (id: string) => `/company/jobs/${id}`,
    staff: "/company/staff",
    branding: "/company/branding",
    templates: "/company/templates",
    analytics: "/company/analytics",
  },
  onboarding: {
    organization: "/onboarding/organization",
    subscription: "/onboarding/subscription",
    select: "/onboarding/select",
  },
} as const
