import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function WelcomeBanner() {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-lg">

      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

        <div>

          <h1 className="text-4xl font-bold">
            Welcome Back 👋
          </h1>

          <p className="mt-3 text-lg text-blue-100">
            Build, manage and deploy AI Agents from one dashboard.
          </p>

        </div>

        <Link href="/create-agent">
          <Button
            variant="secondary"
            className="font-semibold"
          >
            Create Agent
          </Button>
        </Link>

      </div>

    </div>
  );
}