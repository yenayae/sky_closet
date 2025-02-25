export const ReportForm = ({ postID, closeModal }) => {
  return (
    <div
      className="report-modal-overlay"
      onClick={() => setShowReportForm(false)}
    >
      <div className="report-modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>Report Post</h2>
        <textarea
          placeholder="Why are you reporting this post?"
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
        ></textarea>
        <button onClick={() => setShowReportForm(false)}>Cancel</button>
        <button onClick={() => console.log("Reported:", reportReason)}>
          Submit
        </button>
      </div>
    </div>
  );
};
