"use client";

import Link from "next/link";
import { Bot, ArrowRight } from "lucide-react";

import type { Agent } from "@/services/agent.service";

interface RecentAgentsProps {
  agents: Agent[];
}

export default function RecentAgents({
  agents,
}: RecentAgentsProps) {
  const recentAgents = agents.slice(0, 5);

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">

      <div className="mb-5 flex items-center justify-between">

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Agents
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your recently created agents
          </p>
        </div>

        <Link
          href="/agents"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>

      </div>

      {recentAgents.length === 0 ? (

        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">

          <Bot className="h-10 w-10 text-slate-400" />

          <h3 className="mt-4 font-medium text-slate-800">
            No agents yet
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Create your first AI agent.
          </p>

          <Link
            href="/create-agent"
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
          >
            Create Agent
          </Link>

        </div>

      ) : (

        <div className="space-y-3">

          {recentAgents.map((agent) => (

            <Link
              key={agent.id}
              href={`/chat?agentId=${agent.id}`}
              className="flex items-center justify-between rounded-xl border p-4 transition hover:bg-slate-50"
            >

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-blue-100 p-3">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>

                <div>
                  <p className="font-medium text-slate-900">
                    {agent.name}
                  </p>

                  <p className="text-sm text-slate-500">
                    {agent.provider} · {agent.model}
                  </p>
                </div>

              </div>

              <ArrowRight className="h-4 w-4 text-slate-400" />

            </Link>

          ))}

        </div>

      )}

    </div>
  );
}