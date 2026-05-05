export function getCsrfTokenFromCookie() {
  if (typeof document === "undefined") return "";
  const parts = document.cookie.split("; ").find((row) => row.startsWith("csrf_token="));
  return parts?.split("=")[1] ?? "";
}
