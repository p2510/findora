export default defineNuxtRouteMiddleware(async (to, _from) => {
  const supabase = useSupabaseClient();
  let { data: subscriptionData, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("subscription_type")
    .single();
  if (subscriptionData) {
    if (subscriptionData?.subscription_type !== "entreprise") {
      return navigateTo("/acces-interdit");
    }
  } else {
    return navigateTo("/acces-interdit");
  }
});
