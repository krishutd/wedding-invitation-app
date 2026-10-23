/** The travelling strands resolve into these quiet corner vines. */
export default function ThreadBorder({ children }) {
  return <div className="invitation-border-host" aria-hidden="true">
    <div className="outer-frame">{children}</div>
    {[0,1,2,3].map(i => <svg key={i} className="invitation-vine" viewBox="0 0 65 65">
      <path d="M60 6 C34 6 35 17 25 25 S6 33 6 60 M45 8 Q36 0 32 6 Q34 13 45 8 M30 20 Q20 10 17 17 Q18 25 30 20 M20 30 Q30 24 33 31 Q29 39 20 30 M8 44 Q0 34 5 31 Q13 34 8 44 M7 53 Q17 43 20 50 Q17 57 7 53" />
    </svg>)}
  </div>;
}
