import DashboardLayout from "@/components/layout/DashboardLayout";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import Dashboard from "@/components/dashboard/Dashboard";

export default function Home() {
  return (
    <DashboardLayout>

      <div className="space-y-8">

        <WelcomeBanner />

        <Dashboard />

      </div>

    </DashboardLayout>
  );
}