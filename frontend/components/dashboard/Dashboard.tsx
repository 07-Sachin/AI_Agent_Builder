"use client";

import { useEffect, useMemo, useState } from "react";

import StatsGrid from "./StatsGrid";
import RecentAgents from "./RecentAgents";

import {
  Agent,
  getAgents,
} from "@/services/agent.service";

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    }

    loadAgents();
  }, []);

  const modelCount = useMemo(() => {
    const models = new Set(
      agents.map((agent) => agent.model)
    );

    return models.size;
  }, [agents]);

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center">
        <p className="text-slate-500">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <StatsGrid
        agents={agents.length}
        chats={0}
        models={modelCount}
        executions={0}
      />

      <RecentAgents agents={agents} />

    </div>
  );
}