export const endpoints = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    me: "/auth/me",
  },
  companies: {
    list: "/companies",
    me: "/companies/me",
    create: "/companies",
  },
  subscriptions: {
    plans: "/subscriptions/plans",
    start: "/subscriptions",
  },
  tenants: {
    list: "/tenants",
    byId: (id: string) => `/tenants/${id}`,
    suspend: (id: string) => `/tenants/${id}/suspend`,
  },
  billing: {
    list: "/billing",
    plans: "/billing/plans",
    retry: (id: string) => `/billing/${id}/retry`,
  },
  usage: {
    summary: "/usage",
    apiVolume: "/usage/api-volume",
  },
  support: {
    tickets: "/support/tickets",
  },
  settings: {
    flags: "/settings/flags",
    citations: "/settings/citations",
    template: "/settings/template",
  },
  inspections: {
    list: "/inspections",
    byId: (id: string) => `/inspections/${id}`,
    photos: (id: string) => `/inspections/${id}/photos`,
    damageTags: (id: string) => `/inspections/${id}/damage-tags`,
    testSquares: (id: string) => `/inspections/${id}/test-squares`,
    approve: (id: string) => `/inspections/${id}/approve`,
  },
  jobs: {
    list: "/jobs",
    create: "/jobs",
  },
  staff: {
    list: "/users/inspectors",
    create: "/users/inspectors",
    status: (id: string) => `/users/inspectors/${id}/status`,
    byId: (id: string) => `/users/inspectors/${id}`,
  },
  branding: {
    get: "/branding",
    save: "/branding",
  },
  templates: {
    get: "/templates",
    save: "/templates",
  },
  analytics: {
    company: "/analytics/company",
    platform: "/analytics/platform",
  },
  dashboard: {
    company: "/dashboard/company",
    platform: "/dashboard/platform",
  },
} as const
