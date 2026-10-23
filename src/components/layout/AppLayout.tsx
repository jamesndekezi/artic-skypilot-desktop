import { Outlet } from "react-router-dom";
import SimulationBanner from "./SimulationBanner";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

/**
 * AppLayout
 *
 * ┌─────────────────────────────────────────┐
 * │  SimulationBanner (full width, always)  │
 * ├───────────┬─────────────────────────────┤
 * │           │  TopBar                     │
 * │  Sidebar  ├─────────────────────────────┤
 * │           │  <Outlet /> (page content)  │
 * └───────────┴─────────────────────────────┘
 */
export default function AppLayout() {
  return (
    <div className="flex flex-col h-full">
      <SimulationBanner />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6" role="main">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
