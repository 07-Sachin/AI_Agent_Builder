import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function QuickActions() {
  return (
    <Card className="p-6 rounded-2xl">
      <h2 className="text-xl font-semibold mb-6">
        Quick Actions
      </h2>

      <div className="space-y-4">
        <Button className="w-full">
          Create Agent
        </Button>

        <Button
          variant="secondary"
          className="w-full"
        >
          New Chat
        </Button>

        <Button
          variant="outline"
          className="w-full"
        >
          Import Agent
        </Button>
      </div>
    </Card>
  );
}