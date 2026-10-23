/** Quiet static decoration; the artwork owns the opening's visual emphasis. */
export default function ThreadBorder({ children }) {
  return <div className="invitation-border-host" aria-hidden="true">
    <div className="outer-frame">{children}</div>
  </div>;
}
