"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, MessageSquare } from "lucide-react";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import ToolsSection from "@/components/agent/ToolsSection";
import KnowledgeBase from "@/components/agent/KnowledgeBase";

import {
  Agent,
  getAgent,
} from "@/services/agent.service";


export default function AgentDetailsPage() {
  const params = useParams();

  const id = Number(params.id);

  const [agent, setAgent] =
    useState<Agent | null>(null);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {
    async function loadAgent() {
      try {
        const data = await getAgent(id);

        setAgent(data);
      } catch (error) {
        console.error(
          "Failed to load agent:",
          error,
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadAgent();
    }
  }, [id]);


  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <p className="text-muted-foreground">
          Loading agent...
        </p>
      </div>
    );
  }


  if (!agent) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold">
          Agent not found
        </h1>

        <Link href="/agents">
          <Button className="mt-6">
            Back to Agents
          </Button>
        </Link>
      </div>
    );
  }


  return (
    <div className="mx-auto max-w-5xl pb-12">

      <div className="mb-6">
        <Link href="/agents">
          <Button
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Agents
          </Button>
        </Link>

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-4">

            <div className="rounded-2xl bg-blue-100 p-4">
              <Bot className="h-8 w-8 text-blue-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                {agent.name}
              </h1>

              <p className="text-muted-foreground">
                {agent.description}
              </p>
            </div>

          </div>

          <Link
            href={`/chat?agentId=${agent.id}`}
          >
            <Button>
              <MessageSquare className="mr-2 h-4 w-4" />
              Start Chat
            </Button>
          </Link>

        </div>
      </div>


      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>
            Configuration
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">

            <div>
              <p className="text-sm text-muted-foreground">
                Provider
              </p>

              <p className="font-medium">
                {agent.provider}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Model
              </p>

              <p className="font-medium">
                {agent.model}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Temperature
              </p>

              <p className="font-medium">
                {agent.temperature}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Max Tokens
              </p>

              <p className="font-medium">
                {agent.max_tokens}
              </p>
            </div>

          </div>
        </CardContent>
      </Card>


      <ToolsSection
        agentId={agent.id}
      />


      <KnowledgeBase
        agentId={agent.id}
      />

    </div>
  );
}