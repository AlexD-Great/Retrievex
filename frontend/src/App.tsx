import { DashboardPage } from "./pages/DashboardPage.js";
import { NewRetrievalRequestPage } from "./pages/NewRetrievalRequestPage.js";
import { ProviderAnalyticsPage } from "./pages/ProviderAnalyticsPage.js";

export function App() {
  return (
    <>
      <nav className="nav">
        <a href="#dashboard">Dashboard</a>
        <a href="#new-retrieval">New Retrieval Request</a>
        <a href="#provider-analytics">Provider Analytics</a>
      </nav>
      <DashboardPage />
      <NewRetrievalRequestPage />
      <ProviderAnalyticsPage />
    </>
  );
}
