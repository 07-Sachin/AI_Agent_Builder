"use client";

import {
  Bot,
  MessageSquare,
  Cpu,
  Activity,
} from "lucide-react";

import StatCard from "./StatCard";

interface StatsGridProps {
  agents: number;
  chats: number;
  models: number;
  executions: number;
}

export default function StatsGrid({
  agents,
  chats,
  models,
  executions,
}: StatsGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      <StatCard
        title="Agents"
        value={agents}
        icon={Bot}
      />

      <StatCard
        title="Chats"
        value={chats}
        icon={MessageSquare}
      />

      <StatCard
        title="Models"
        value={models}
        icon={Cpu}
      />

      <StatCard
        title="Executions"
        value={executions}
        icon={Activity}
      />

    </div>
  );
}