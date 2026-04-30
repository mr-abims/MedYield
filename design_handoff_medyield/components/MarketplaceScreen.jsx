// MarketplaceScreen.jsx — Bounty cards + filter bar

const BOUNTIES = [
  {
    id: 'b1',
    org: 'Novartis Research',
    verified: true,
    title: 'Cardiovascular Risk Study',
    description: 'Understanding blood pressure patterns in adults aged 40–65.',
    fields: [
      { name: 'Age', min: 40, max: 65, unit: 'yrs', type: 'integer' },
      { name: 'Systolic BP', min: 80, max: 200, unit: 'mmHg', type: 'integer' },
      { name: 'Smoker', min: 0, max: 1, unit: 'yes/no', type: 'boolean' },
    ],
    templateLabel: 'Aggregate Stats',
    computeDescription: "We'll compute average blood pressure across participants — individual readings are never revealed.",
    pricePerRecord: 3.50,
    escrow: 7000,
    escrowUsed: 4200,
    minSubmissions: 500,
    maxSubmissions: 2000,
    submissions: 1200,
    validatedSubmissions: 1147,
    deadline: Date.now() + 8 * 86400000,
    status: 'OPEN',
    color: 'violet',
  },
  {
    id: 'b2',
    org: 'MIT Health Lab',
    verified: true,
    title: 'Diabetes Screening Cohort',
    description: 'Identifying HbA1c patterns in pre-diabetic adults for a prevention study.',
    fields: [
      { name: 'Age', min: 30, max: 75, unit: 'yrs', type: 'integer' },
      { name: 'HbA1c', min: 5.0, max: 10.0, unit: '%', type: 'decimal' },
      { name: 'BMI', min: 18, max: 45, unit: 'kg/m²', type: 'decimal' },
    ],
    templateLabel: 'Eligibility Count',
    computeDescription: "We'll count how many of you qualify for our prevention trial — we never see your individual answers.",
    pricePerRecord: 5.00,
    escrow: 5000,
    escrowUsed: 1500,
    minSubmissions: 300,
    maxSubmissions: 1000,
    submissions: 300,
    validatedSubmissions: 284,
    deadline: Date.now() + 3 * 86400000,
    status: 'OPEN',
    color: 'emerald',
  },
  {
    id: 'b3',
    org: 'PulmoHealth Inc.',
    verified: false,
    title: 'Respiratory Health Survey',
    description: 'Studying peak expiratory flow in adults with respiratory conditions.',
    fields: [
      { name: 'Age', min: 18, max: 80, unit: 'yrs', type: 'integer' },
      { name: 'Peak Flow', min: 100, max: 700, unit: 'L/min', type: 'integer' },
      { name: 'Smoker', min: 0, max: 1, unit: 'yes/no', type: 'boolean' },
    ],
    templateLabel: 'Risk Score',
    computeDescription: "We'll calculate an average respiratory risk score — individual scores are never revealed.",
    pricePerRecord: 2.00,
    escrow: 2000,
    escrowUsed: 400,
    minSubmissions: 200,
    maxSubmissions: 1000,
    submissions: 198,
    validatedSubmissions: 192,
    deadline: Date.now() + 14 * 86400000,
    status: 'OPEN',
    color: 'amber',
  },
  {
    id: 'b4',
    org: 'Stanford Sleep Center',
    verified: true,
    title: 'Sleep Disorders Research',
    description: 'Mapping sleep quality metrics to predict apnea risk across age groups.',
    fields: [
      { name: 'Age', min: 18, max: 75, unit: 'yrs', type: 'integer' },
      { name: 'Sleep Hours', min: 3, max: 12, unit: 'hrs/night', type: 'decimal' },
      { name: 'Snoring', min: 0, max: 1, unit: 'yes/no', type: 'boolean' },
    ],
    templateLabel: 'Risk Score',
    computeDescription: "We'll compute an average sleep apnea risk score — no individual data is ever exposed.",
    pricePerRecord: 4.00,
    escrow: 8000,
    escrowUsed: 2400,
    minSubmissions: 400,
    maxSubmissions: 2000,
    submissions: 600,
    validatedSubmissions: 577,
    deadline: Date.now() + 20 * 86400000,
    status: 'OPEN',
    color: 'violet',
  },
];

function formatDeadline(ts) {
  const diff = ts - Date.now();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d left`;
  if (hours > 0) return `${hours}h left`;
  return 'Closing soon';
}

function FieldPill({ field }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20,
      background: '#f0ede8', color: '#6b6560',
      fontSize: 11, fontWeight: 500, letterSpacing: '0.02em',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      {field.name}
    </span>
  );
}

function StatusBadge({ status, fillPct }) {
  let label = status;
  let bg, color;
  if (fillPct >= 80 && status === 'OPEN') { label = 'FILLING FAST'; bg = '#fef3c7'; color = '#92400e'; }
  else if (status === 'OPEN') { bg = '#d1fae5'; color = '#065f46'; }
  else if (status === 'COMPUTING') { bg = '#dbeafe'; color = '#1e40af'; }
  else if (status === 'COMPLETED') { bg = '#f3f4f6'; color = '#374151'; }
  else { bg = '#fee2e2'; color = '#991b1b'; }
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20,
      background: bg, color,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
      fontFamily: 'DM Sans, sans-serif',
    }}>{label}</span>
  );
}

function BountyCard({ bounty, layout, accent, onSelect }) {
  const fillPct = Math.round((bounty.escrowUsed / bounty.escrow) * 100);
  const accentColor = accent === 'emerald' ? '#059669' : '#6c4ff5';
  const accentLight = accent === 'emerald' ? '#d1fae5' : '#ede9fe';

  if (layout === 'list') {
    return (
      <div onClick={() => onSelect(bounty)} style={{
        background: '#fff', borderRadius: 14,
        border: '1px solid #ede9e4',
        padding: '22px 28px',
        display: 'flex', alignItems: 'center', gap: 28,
        cursor: 'pointer',
        transition: 'box-shadow 0.18s, transform 0.18s',
        boxShadow: '0 1px 4px rgba(28,25,23,0.05)',
      }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(28,25,23,0.10)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(28,25,23,0.05)'; e.currentTarget.style.transform = 'none'; }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: 'DM Sans', fontSize: 12, fontWeight: 600, color: '#78716c' }}>
              {bounty.org}
            </span>
            {bounty.verified && <VerifiedIcon color={accentColor} />}
            <StatusBadge status={bounty.status} fillPct={fillPct} />
          </div>
          <div style={{ fontFamily: 'Playfair Display', fontSize: 18, fontWeight: 500, color: '#1c1917', marginBottom: 4 }}>
            {bounty.title}
          </div>
          <div style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#78716c', marginBottom: 8, lineHeight: 1.5 }}>
            {bounty.description}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {bounty.fields.map(f => <FieldPill key={f.name} field={f} />)}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, minWidth: 160 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Playfair Display', fontSize: 24, fontWeight: 600, color: accentColor }}>
              ${bounty.pricePerRecord.toFixed(2)}
            </div>
            <div style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#a8a29e' }}>per record · USDC</div>
          </div>
          <div style={{ width: 160 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#a8a29e' }}>{fillPct}% filled</span>
              <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#a8a29e' }}>{formatDeadline(bounty.deadline)}</span>
            </div>
            <div style={{ height: 4, background: '#f0ede8', borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${Math.min(fillPct, 100)}%`, background: accentColor, borderRadius: 2, transition: 'width 0.6s ease' }} />
            </div>
          </div>
          <button onClick={e => { e.stopPropagation(); onSelect(bounty); }} style={{
            padding: '8px 18px', borderRadius: 8, border: 'none',
            background: accentColor, color: '#fff',
            fontFamily: 'DM Sans', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', transition: 'opacity 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >Submit my data</button>
        </div>
      </div>
    );
  }

  // Grid card
  return (
    <div onClick={() => onSelect(bounty)} style={{
      background: '#fff', borderRadius: 18,
      border: '1px solid #ede9e4',
      padding: '24px',
      cursor: 'pointer',
      display: 'flex', flexDirection: 'column',
      transition: 'box-shadow 0.18s, transform 0.18s',
      boxShadow: '0 1px 4px rgba(28,25,23,0.05)',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(28,25,23,0.10)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(28,25,23,0.05)'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontFamily: 'DM Sans', fontSize: 12, fontWeight: 600, color: '#78716c' }}>{bounty.org}</span>
            {bounty.verified && <VerifiedIcon color={accentColor} />}
          </div>
          <StatusBadge status={bounty.status} fillPct={fillPct} />
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 600, color: accentColor }}>${bounty.pricePerRecord.toFixed(2)}</div>
          <div style={{ fontFamily: 'DM Sans', fontSize: 10, color: '#a8a29e' }}>per record</div>
        </div>
      </div>

      <div style={{ fontFamily: 'Playfair Display', fontSize: 19, fontWeight: 500, color: '#1c1917', lineHeight: 1.3, marginBottom: 8 }}>
        {bounty.title}
      </div>
      <div style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#78716c', lineHeight: 1.55, marginBottom: 14, flex: 1 }}>
        {bounty.description}
      </div>

      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 16 }}>
        {bounty.fields.map(f => <FieldPill key={f.name} field={f} />)}
      </div>

      <div style={{ padding: '12px 14px', borderRadius: 10, background: accentLight, marginBottom: 16 }}>
        <div style={{ fontFamily: 'DM Sans', fontSize: 11, fontWeight: 600, color: accentColor, marginBottom: 2, letterSpacing: '0.04em' }}>
          PRIVACY GUARANTEE
        </div>
        <div style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#44403c', lineHeight: 1.5 }}>
          {bounty.computeDescription}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#a8a29e' }}>{bounty.validatedSubmissions.toLocaleString()} validated</span>
          <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#a8a29e' }}>{formatDeadline(bounty.deadline)}</span>
        </div>
        <div style={{ height: 5, background: '#f0ede8', borderRadius: 3 }}>
          <div style={{ height: '100%', width: `${Math.min(fillPct, 100)}%`, background: accentColor, borderRadius: 3 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontFamily: 'DM Sans', fontSize: 10, color: '#c8c3bc' }}>{fillPct}% of escrow used</span>
          <span style={{ fontFamily: 'DM Sans', fontSize: 10, color: '#c8c3bc' }}>${(bounty.escrow - bounty.escrowUsed).toLocaleString()} remaining</span>
        </div>
      </div>

      <button onClick={e => { e.stopPropagation(); onSelect(bounty); }} style={{
        width: '100%', padding: '11px', borderRadius: 10, border: 'none',
        background: accentColor, color: '#fff',
        fontFamily: 'DM Sans', fontSize: 14, fontWeight: 600,
        cursor: 'pointer', transition: 'opacity 0.15s',
        letterSpacing: '0.01em',
      }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        Submit my data →
      </button>
    </div>
  );
}

function VerifiedIcon({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="7" fill={color} />
      <path d="M4 7l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MarketplaceScreen({ layout, accent, onSelectBounty }) {
  const [search, setSearch] = React.useState('');
  const [sort, setSort] = React.useState('payout');
  const accentColor = accent === 'emerald' ? '#059669' : '#6c4ff5';

  const filtered = BOUNTIES
    .filter(b => b.title.toLowerCase().includes(search.toLowerCase()) ||
                 b.org.toLowerCase().includes(search.toLowerCase()) ||
                 b.description.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === 'payout' ? b.pricePerRecord - a.pricePerRecord :
                    sort === 'deadline' ? a.deadline - b.deadline :
                    b.validatedSubmissions - a.validatedSubmissions);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
      {/* Hero */}
      <div style={{ marginBottom: 48, maxWidth: 560 }}>
        <div style={{ fontFamily: 'DM Sans', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: accentColor, marginBottom: 10, textTransform: 'uppercase' }}>
          Open bounties
        </div>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 40, fontWeight: 500, color: '#1c1917', lineHeight: 1.2, margin: '0 0 14px' }}>
          Earn from your health data.<br />Keep it encrypted. Always.
        </h1>
        <p style={{ fontFamily: 'DM Sans', fontSize: 15, color: '#78716c', lineHeight: 1.7, margin: 0 }}>
          Submit to any study below. Your data is encrypted in your browser before it reaches the blockchain — researchers only ever see aggregate results.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="5" stroke="#1c1917" strokeWidth="1.5" />
            <path d="M10.5 10.5L14 14" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search bounties…"
            style={{
              width: '100%', padding: '10px 12px 10px 36px', borderRadius: 10,
              border: '1px solid #ede9e4', background: '#fff',
              fontFamily: 'DM Sans', fontSize: 13, color: '#1c1917',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 2, background: '#f0ede8', borderRadius: 8, padding: 3 }}>
          {[['payout','Highest pay'],['deadline','Closing soon'],['activity','Most active']].map(([val, label]) => (
            <button key={val} onClick={() => setSort(val)} style={{
              padding: '6px 12px', borderRadius: 6, border: 'none',
              background: sort === val ? '#fff' : 'transparent',
              color: sort === val ? '#1c1917' : '#a8a29e',
              fontFamily: 'DM Sans', fontSize: 12, fontWeight: sort === val ? 600 : 400,
              cursor: 'pointer', transition: 'all 0.15s',
              boxShadow: sort === val ? '0 1px 3px rgba(28,25,23,0.08)' : 'none',
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {layout === 'list' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(b => <BountyCard key={b.id} bounty={b} layout="list" accent={accent} onSelect={onSelectBounty} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filtered.map(b => <BountyCard key={b.id} bounty={b} layout="grid" accent={accent} onSelect={onSelectBounty} />)}
        </div>
      )}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#a8a29e', fontFamily: 'DM Sans' }}>
          No bounties match your search.
        </div>
      )}
    </div>
  );
}

Object.assign(window, { MarketplaceScreen, BOUNTIES });
