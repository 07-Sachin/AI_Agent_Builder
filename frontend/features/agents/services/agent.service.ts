import api from "@/services/api";
import type { Agent } from "@/services/agent.service";

export async function getAgent(
  agentId: number
): Promise<Agent> {
  const response = await api.get<Agent>(
    `/agents/${agentId}`
  );

  return response.data;
}

export async function getAgents(): Promise<Agent[]> {
  const response = await api.get<Agent[]>(
    "/agents"
  );

  return response.data;
}