export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  // Protect /developer routes
  if (to.path.startsWith('/developer') && !user.value) {
    return navigateTo('/auth/login')
  }

  // Redirect logged-in users away from auth pages
  if (to.path.startsWith('/auth') && user.value) {
    return navigateTo('/developer')
  }
})
