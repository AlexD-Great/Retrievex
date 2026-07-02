import type { RetrievalRequest } from "@retrievex/shared";
import { RequestActions } from "../components/RequestActions";
import { StatusBadge } from "../components/StatusBadge";

interface DashboardPageProps {
  requests: RetrievalRequest[];
  onRequestUpdated: (request: RetrievalRequest) => void;
}

export function DashboardPage({ requests, onRequestUpdated }: DashboardPageProps) {
  const activeRequests = requests.filter((request) =>
    ["pending", "in-progress"].includes(request.status)
  );
  const completedRequests = requests.filter((request) => request.status === "completed");
  const failedRequests = requests.filter((request) =>
    ["failed", "timeout"].includes(request.status)
  );

  return (
    <main className="page" id="dashboard">
      <header className="page-header">
        <div>
          <p className="eyebrow">Retrievex Phase 1</p>
          <h1>Dashboard</h1>
        </div>
        <div className="state-strip" aria-label="Retrieval states">
          <StatusBadge status="pending" />
          <StatusBadge status="in-progress" />
          <StatusBadge status="completed" />
          <StatusBadge status="failed" />
          <StatusBadge status="timeout" />
        </div>
      </header>

      <section className="metrics-grid" aria-label="Retrieval activity summary">
        <div className="metric">
          <span className="metric-label">Active retrievals</span>
          <strong>{activeRequests.length}</strong>
        </div>
        <div className="metric">
          <span className="metric-label">Escrow pending</span>
          <strong>{requests.filter((request) => request.escrow_status === "pending").length}</strong>
        </div>
        <div className="metric">
          <span className="metric-label">Completed</span>
          <strong>{completedRequests.length}</strong>
        </div>
        <div className="metric">
          <span className="metric-label">Failed or timeout</span>
          <strong>{failedRequests.length}</strong>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>Active Retrieval Requests</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>CID</th>
                <th>Storage Provider</th>
                <th>Amount FIL</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {activeRequests.length === 0 ? (
                <tr>
                  <td colSpan={5}>No active retrieval requests.</td>
                </tr>
              ) : (
                activeRequests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.cid}</td>
                    <td>{request.sp_address}</td>
                    <td>{request.amount_fil}</td>
                    <td>
                      <StatusBadge status={request.status} />
                    </td>
                    <td>
                      <RequestActions request={request} onUpdated={onRequestUpdated} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <h2>Escrow Status</h2>
        <div className="status-list">
          <div>
            <span>Pending</span>
            <strong>{requests.filter((request) => request.escrow_status === "pending").length}</strong>
          </div>
          <div>
            <span>Completed</span>
            <strong>
              {requests.filter((request) => request.escrow_status === "completed").length}
            </strong>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>Recent Retrieval History</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Request</th>
                <th>CID</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={3}>No retrieval history.</td>
                </tr>
              ) : (
                requests.slice(0, 6).map((request) => (
                  <tr key={request.id}>
                    <td>{request.id}</td>
                    <td>{request.cid}</td>
                    <td>
                      <StatusBadge status={request.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <h2>SP Performance Summary</h2>
        <div className="status-list">
          <div>
            <span>Providers represented</span>
            <strong>{new Set(requests.map((request) => request.sp_address)).size}</strong>
          </div>
          <div>
            <span>Successful retrievals</span>
            <strong>{completedRequests.length}</strong>
          </div>
        </div>
      </section>
    </main>
  );
}
