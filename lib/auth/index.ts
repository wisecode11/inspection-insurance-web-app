export { AUTH_COOKIE, AUTH_SESSION_PATH } from "./constants"
export { parseRole } from "./role"
export { roleDestinations } from "./destinations"
export { getSessionRole, persistSession, destroySession, getStoredUser } from "./session"
export { toPortalRole, displayName, initials } from "./portal"
export {
  pathAfterSignup,
  pathAfterLogin,
  pathAfterOrganization,
  pathForCompany,
  companyNeedsSubscription,
} from "./next-path"
