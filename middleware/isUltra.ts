export default defineNuxtRouteMiddleware(async (to, _from) => {
  const supabase = useSupabaseClient();
  let { data: subscriptionData, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("subscription_type")
    .single();
  if (subscriptionData) {
    if (subscriptionData?.subscription_type !== "entreprise" && subscriptionData?.subscription_type !== "ultra") {
      return navigateTo("/acces-interdit/ultra");
    }
  } else {
    return navigateTo("/acces-interdit/ultra");
  }
});
