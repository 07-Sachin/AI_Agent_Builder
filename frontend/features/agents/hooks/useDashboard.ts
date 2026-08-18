import { useEffect, useState } from "react";

import type { Agent } from "@/services/agent.service";
import { getAgents } from "@/features/agents/services/agent.service";

export function useDashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    async function loadAgents() {
      try {
        const data = await getAgents();

        setAgents(data);
      } catch (error) {
        console.error(
          "Failed to load dashboard agents:",
          error
        );
      }
    }

    loadAgents();
  }, []);

  return {
    agents,
  };
}