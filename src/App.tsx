import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import OverviewPage from "@/pages/OverviewPage";
import FlightSimulatorPage from "@/pages/FlightSimulatorPage";
import MissionPlannerPage from "@/pages/MissionPlannerPage";
import FlightLogsPage from "@/pages/FlightLogsPage";
import SettingsPage from "@/pages/SettingsPage";
import ManualControlPage from "@/pages/ManualControlPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="simulator" element={<FlightSimulatorPage />} />
        <Route path="mission-planner" element={<MissionPlannerPage />} />
        <Route path="flight-logs" element={<FlightLogsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="manual-control" element={<ManualControlPage />} />
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Route>
    </Routes>
  );
}
