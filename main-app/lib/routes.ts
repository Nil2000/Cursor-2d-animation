export const protectedRoutes = [""];
export const authRoutes = ["/login", "/signup"];
export const authPrefix = "/api/auth";
export const DEFAULT_REDIRECT = "/";
export const protectedRoutePatterns = [
  /^\/chat\/[^\/]+$/, // matches /chat/anything
  // add more patterns as needed
];
