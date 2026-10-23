/** The travelling strands resolve into the original geometric frame. */
export default function ThreadBorder({ children }) {
  return <div className="invitation-border-host" aria-hidden="true">
    <div className="outer-frame">{children}</div>
  </div>;
}
