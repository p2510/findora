import { useStat } from "@/stores/stat";
import { useUser } from "@/stores/user";
import { useCustomer } from "@/stores/customer";
import { useGroup } from "@/stores/group";
import { useWhatsapp } from "@/stores/whatsapp";
import { useAgentConfig } from "@/stores/agent/config";
import { useAgentKnow } from "@/stores/agent/know";
import { useChatStore } from "@/stores/agent/chat";

export const reset = () => {
  const stat = useStat();
  const user = useUser();
  const customer = useCustomer();
  const group = useGroup();
  const whatsapp = useWhatsapp();
  const agentConfig = useAgentConfig();
  const agentKnow = useAgentKnow();
  const chatStore = useChatStore();

  stat.$reset();
  user.$reset();
  customer.$reset();
  group.$reset();
  whatsapp.$reset();
  agentConfig.$reset();
  agentKnow.$reset();
  chatStore.$reset();
};
