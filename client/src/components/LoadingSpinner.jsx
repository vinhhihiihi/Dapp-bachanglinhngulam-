export function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="loading-wrap" role="status" aria-live="polite">
      <span className="loading-spinner" />
      <span className="loading-label">{label}</span>
    </div>
  );
}
