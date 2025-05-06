// Simple auth utility functions
export function isAuthenticated() {
  if (typeof window === "undefined") return false

  try {
    const user = localStorage.getItem("user")
    return !!user
  } catch (error) {
    return false
  }
}

export function getUser() {
  if (typeof window === "undefined") return null

  try {
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
  } catch (error) {
    return null
  }
}

export function logout() {
  if (typeof window === "undefined") return

  localStorage.removeItem("user")
}
