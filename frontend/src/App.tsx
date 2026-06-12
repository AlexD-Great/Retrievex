import type { RetrievalRequest } from "@retrievex/shared";
import { useState } from "react";
import { DashboardPage } from "./pages/DashboardPage";
import { NewRetrievalRequestPage } from "./pages/NewRetrievalRequestPage";
import { ProviderAnalyticsPage } from "./pages/ProviderAnalyticsPage";

type View = "dashboard" | "new-retrieval" | "provider-analytics";

export function App() {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [requests, setRequests] = useState<RetrievalRequest[]>([]);

  function handleRequestCreated(request: RetrievalRequest) {
    setRequests((currentRequests) => [request, ...currentRequests]);
    setActiveView("dashboard");
  }

  return (
    <div className="app-shell">
      <nav className="nav">
        <button
          className={activeView === "dashboard" ? "nav-link active" : "nav-link"}
          type="button"
          onClick={() => setActiveView("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={activeView === "new-retrieval" ? "nav-link active" : "nav-link"}
          type="button"
          onClick={() => setActiveView("new-retrieval")}
        >
          New Retrieval Request
        </button>
        <button
          className={activeView === "provider-analytics" ? "nav-link active" : "nav-link"}
          type="button"
          onClick={() => setActiveView("provider-analytics")}
        >
          Provider Analytics
        </button>
      </nav>
      {activeView === "dashboard" && <DashboardPage requests={requests} />}
      {activeView === "new-retrieval" && (
        <NewRetrievalRequestPage onRequestCreated={handleRequestCreated} />
      )}
      {activeView === "provider-analytics" && <ProviderAnalyticsPage />}
    </div>
  );
}
