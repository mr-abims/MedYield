// EarningsScreen.jsx — Patient earnings history

function EarningsScreen({ submissions, accent }) {
  const accentColor = accent === 'emerald' ? '#059669' : '#6c4ff5';
  const accentLight = accent === 'emerald' ? '#d1fae5' : '#ede9fe';

  const totalEarned = submissions.reduce((s, x) => s + (x.status === 'paid' ? x.amount : 0), 0);
  const totalPending = submissions.reduce((s, x) => s + (x.status === 'pending' ? x.amount : 0), 0);

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: 'DM Sans', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: accentColor, marginBottom: 10, textTransform: 'uppercase' }}>
          My earnings
        </div>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 36, fontWeight: 500, color: '#1c1917', margin: '0 0 8px' }}>
          Your submissions
        </h1>
        <p style={{ fontFamily: 'DM Sans', fontSize: 14, color: '#78716c', margin: 0 }}>
          Every study you've contributed to, and the payment status of each.
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 36 }}>
        {[
          { label: 'Total earned', value: `$${totalEarned.toFixed(2)}`, sub: 'USDC received', highlight: true },
          { label: 'Pending', value: `$${totalPending.toFixed(2)}`, sub: 'Awaiting validation', highlight: false },
          { label: 'Submissions', value: submissions.length, sub: 'Bounties contributed to', highlight: false },
        ].map(card => (
          <div key={card.label} style={{
            padding: '18px 20px', borderRadius: 14,
            background: card.highlight ? accentLight : '#fff',
            border: `1px solid ${card.highlight ? 'transparent' : '#ede9e4'}`,
            boxShadow: card.highlight ? 'none' : '0 1px 4px rgba(28,25,23,0.04)',
          }}>
            <div style={{ fontFamily: 'Playfair Display', fontSize: 28, fontWeight: 500, color: card.highlight ? accentColor : '#1c1917' }}>
              {card.value}
            </div>
            <div style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#78716c', marginTop: 3 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Submission list */}
      {submissions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#a8a29e' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.3 }}>
              <rect x="8" y="14" width="32" height="26" rx="4" stroke="#1c1917" strokeWidth="2" />
              <path d="M16 14V12a8 8 0 0116 0v2" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />
              <circle cx="24" cy="28" r="3" fill="#1c1917" />
            </svg>
          </div>
          <div style={{ fontFamily: 'Playfair Display', fontSize: 20, color: '#44403c', marginBottom: 6 }}>No submissions yet</div>
          <div style={{ fontFamily: 'DM Sans', fontSize: 13 }}>Head to the marketplace to start earning.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {submissions.map((sub, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '16px 20px', borderRadius: 12,
              background: '#fff', border: '1px solid #ede9e4',
              boxShadow: '0 1px 4px rgba(28,25,23,0.04)',
            }}>
              {/* Status icon */}
              <div style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: sub.status === 'paid' ? '#d1fae5' : sub.status === 'pending' ? '#fef3c7' : '#fee2e2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {sub.status === 'paid' && (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M4 9l3.5 3.5L14 5" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {sub.status === 'pending' && (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="7" stroke="#d97706" strokeWidth="1.5" strokeDasharray="14 10" />
                  </svg>
                )}
                {sub.status === 'rejected' && (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M6 6l6 6M12 6l-6 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'DM Sans', fontSize: 14, fontWeight: 600, color: '#1c1917', marginBottom: 2 }}>
                  {sub.bountyTitle}
                </div>
                <div style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#a8a29e' }}>
                  {sub.org} · {sub.date}
                </div>
              </div>

              {/* Status + Amount */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  fontFamily: 'Playfair Display', fontSize: 18, fontWeight: 500,
                  color: sub.status === 'paid' ? '#059669' : sub.status === 'pending' ? '#d97706' : '#ef4444',
                }}>
                  {sub.status === 'rejected' ? '—' : `$${sub.amount.toFixed(2)}`}
                </div>
                <div style={{
                  fontFamily: 'DM Sans', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: sub.status === 'paid' ? '#059669' : sub.status === 'pending' ? '#d97706' : '#ef4444',
                  marginTop: 2,
                }}>
                  {sub.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { EarningsScreen });
