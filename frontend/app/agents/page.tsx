"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import {
  Bot,
  MessageSquare,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Agent,
  deleteAgent,
  getAgents,
} from "@/services/agent.service";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAgents() {
    try {
      setLoading(true);

      const data = await getAgents();

      setAgents(data);
    } catch (error) {
      console.error(
        "Failed to load agents:",
        error,
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAgents();
  }, []);

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this agent?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteAgent(id);

      setAgents((current) =>
        current.filter(
          (agent) => agent.id !== id,
        ),
      );
    } catch (error) {
      console.error(
        "Failed to delete agent:",
        error,
      );

      alert("Failed to delete agent.");
    }
  }

  return (
    <div className="mx-auto max-w-7xl">

      <div className="mb-8 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            My Agents
          </h1>

          <p className="mt-1 text-muted-foreground">
            Manage and reuse your AI agents.
          </p>
        </div>

        <Link href="/create-agent">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Agent
          </Button>
        </Link>

      </div>

      {loading ? (

        <div className="flex justify-center py-20">
          <p className="text-muted-foreground">
            Loading agents...
          </p>
        </div>

      ) : agents.length === 0 ? (

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">

            <Bot className="h-12 w-12 text-muted-foreground" />

            <h2 className="mt-5 text-xl font-semibold">
              No agents yet
            </h2>

            <p className="mt-2 text-muted-foreground">
              Create your first AI agent.
            </p>

            <Link href="/create-agent">
              <Button className="mt-6">
                <Plus className="mr-2 h-4 w-4" />
                Create Agent
              </Button>
            </Link>

          </CardContent>
        </Card>

      ) : (

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {agents.map((agent) => (

            <Card
              key={agent.id}
              className="rounded-2xl transition hover:shadow-lg"
            >

              <CardHeader>

                <div className="flex items-start justify-between">

                  <div className="flex gap-3">

                    <div className="rounded-xl bg-blue-100 p-3">
                      <Bot className="h-6 w-6 text-blue-600" />
                    </div>

                    <div>
                      <CardTitle>
                        {agent.name}
                      </CardTitle>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {agent.provider}
                      </p>
                    </div>

                  </div>

                  <Badge>
                    Active
                  </Badge>

                </div>

              </CardHeader>

              <CardContent>

                <p className="min-h-12 text-sm text-muted-foreground">
                  {agent.description}
                </p>

                <div className="mt-5 rounded-lg bg-muted p-3">

                  <p className="text-xs text-muted-foreground">
                    Model
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {agent.model}
                  </p>

                </div>
                <div className="mt-5 flex gap-2">

               <Link
                 href={`/agents/${agent.id}`}
                 className="flex-1"
               >
                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    Manage
                 </Button>
               </Link>

               <Link
                 href={`/chat?agentId=${agent.id}`}
                 className="flex-1"
               >
                 <Button className="w-full">
                   <MessageSquare className="mr-2 h-4 w-4" />
                   Chat
                 </Button>
               </Link>

               <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                   handleDelete(agent.id)
                  }
                >
                 <Trash2 className="h-4 w-4 text-red-500" />
               </Button>

              </div>

               

              </CardContent>

            </Card>

          ))}

        </div>

      )}

    </div>
  );
}