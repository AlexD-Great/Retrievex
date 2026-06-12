export function NewRetrievalRequestPage() {
  return (
    <main className="page">
      <h1>New Retrieval Request</h1>
      <form className="request-form">
        <label>
          CID
          <input name="cid" type="text" required />
        </label>
        <label>
          Storage Provider
          <input name="sp_address" type="text" required />
        </label>
        <label>
          Payment Amount (FIL)
          <input name="amount_fil" type="number" min="0" step="0.000000000000000001" required />
        </label>
        <div className="request-summary">
          <span>Estimated retrieval time</span>
          <span>SP reliability score</span>
        </div>
        <button type="submit">Initiate Retrieval</button>
      </form>
    </main>
  );
}
