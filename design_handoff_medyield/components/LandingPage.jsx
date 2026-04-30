// LandingPage.jsx — Marketing home page (clean, no Fhenix branding)

function HeroEncryptViz({ accent }) {
  const accentColor = accent === 'emerald' ? '#059669' : '#6c4ff5';
  const accentLight = accent === 'emerald' ? '#d1fae5' : '#ede9fe';
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1400);
    return () => clearInterval(id);
  }, []);

  const fields = [
    { label: 'Age', plain: '47', enc: '0x3fa2…c1' },
    { label: 'Systolic BP', plain: '128', enc: '0x9d4b…e8' },
    { label: 'Smoker', plain: 'No', enc: '0x1c77…a3' },
  ];
  const encrypted = tick % 3 !== 0;

  return (
    <div style={{
      background: '#fff', borderRadius: 20, border: '1px solid #ede9e4',
      padding: 28, width: 300, flexShrink: 0,
      boxShadow: '0 8px 40px rgba(28,25,23,0.08)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: encrypted ? accentColor : '#d97706', transition: 'background 0.4s' }} />
        <span style={{ fontFamily: 'DM Sans', fontSize: 11, fontWeight: 600, color: '#78716c', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {encrypted ? 'Encrypted' : 'Encrypting…'}
        </span>
      </div>
      {fields.map(f => (
        <div key={f.label} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '9px 12px', borderRadius: 8, marginBottom: 6,
          background: '#faf8f5', border: '1px solid #f0ede8', transition: 'all 0.3s',
        }}>
          <span style={{ fontFamily: 'DM Sans', fontSize: 12, fontWeight: 500, color: '#44403c' }}>{f.label}</span>
          <span style={{
            fontFamily: encrypted ? 'DM Mono, monospace' : 'DM Sans',
            fontSize: encrypted ? 10 : 13, color: encrypted ? accentColor : '#1c1917',
            fontWeight: encrypted ? 400 : 600, transition: 'all 0.4s', letterSpacing: encrypted ? '0.03em' : 0,
          }}>{encrypted ? f.enc : f.plain}</span>
        </div>
      ))}
      <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 8, background: accentLight, display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1.5L2 3.75v3.5C2 10 4.4 12.5 7 13.2 9.6 12.5 12 10 12 7.25v-3.5L7 1.5z" fill={accentColor} opacity="0.2" stroke={accentColor} strokeWidth="1.2"/>
          <path d="M4.5 7l2 2 3-3" stroke={accentColor} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: accentColor, fontWeight: 500 }}>Raw values never leave this browser</span>
      </div>
    </div>
  );
}

function HowItWorksStep({ number, title, body, accent }) {
  const accentColor = accent === 'emerald' ? '#059669' : '#6c4ff5';
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: accentColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Playfair Display', fontSize: 16, fontWeight: 500 }}>{number}</div>
      <div>
        <div style={{ fontFamily: 'DM Sans', fontSize: 14, fontWeight: 600, color: '#1c1917', marginBottom: 4 }}>{title}</div>
        <div style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#78716c', lineHeight: 1.6 }}>{body}</div>
      </div>
    </div>
  );
}

function LandingPage({ accent, navigate }) {
  const accentColor = accent === 'emerald' ? '#059669' : '#6c4ff5';
  const accentLight = accent === 'emerald' ? '#d1fae5' : '#ede9fe';

  return (
    <div>
      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', paddingTop: 66 }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'radial-gradient(circle, #1c1917 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, background: 'linear-gradient(transparent, #faf8f5)' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 24px 96px', display: 'flex', alignItems: 'center', gap: 60, position: 'relative', zIndex: 1 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 20, background: accentLight, marginBottom: 22 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: accentColor }} />
              <span style={{ fontFamily: 'DM Sans', fontSize: 11, fontWeight: 600, color: accentColor, letterSpacing: '0.04em' }}>Powered by Fully Homomorphic Encryption</span>
            </div>
            <h1 style={{ fontFamily: 'Playfair Display', fontSize: 52, fontWeight: 500, color: '#1c1917', lineHeight: 1.13, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
              Earn from your<br/>health data.<br/>
              <span style={{ color: accentColor }}>Keep it encrypted.</span><br/>Always.
            </h1>
            <p style={{ fontFamily: 'DM Sans', fontSize: 16, color: '#78716c', lineHeight: 1.75, margin: '0 0 36px', maxWidth: 440 }}>
              Researchers post paid bounties. You submit encrypted health data directly from your browser. Your raw values never touch a server — math runs on the ciphertext.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => navigate('marketplace')} style={{ padding: '13px 28px', borderRadius: 10, border: 'none', background: accentColor, color: '#fff', fontFamily: 'DM Sans', fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Browse bounties →</button>
              <button onClick={() => navigate('org')} style={{ padding: '13px 28px', borderRadius: 10, border: '1.5px solid #ede9e4', background: '#fff', color: '#44403c', fontFamily: 'DM Sans', fontSize: 15, fontWeight: 500, cursor: 'pointer', transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = accentColor}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#ede9e4'}>Post a bounty</button>
            </div>
          </div>
          <HeroEncryptViz accent={accent} />
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ background: '#fff', borderTop: '1px solid #ede9e4', borderBottom: '1px solid #ede9e4' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { value: '14', label: 'Active bounties', sub: 'Open for submissions' },
            { value: '$47B', label: 'Health data market', sub: 'Patients earn $0 today' },
            { value: '100%', label: 'Client-side encryption', sub: 'FHE on every field' },
            { value: '$0', label: 'Plaintext exposure', sub: 'Mathematical guarantee' },
          ].map((s, i, arr) => (
            <div key={s.label} style={{ borderRight: i < arr.length - 1 ? '1px solid #ede9e4' : 'none', padding: '24px 16px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Playfair Display', fontSize: 36, fontWeight: 500, color: '#1c1917', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontFamily: 'DM Sans', fontSize: 13, fontWeight: 600, color: '#44403c', marginTop: 6 }}>{s.label}</div>
              <div style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#a8a29e', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontFamily: 'DM Sans', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: accentColor, marginBottom: 10, textTransform: 'uppercase' }}>How it works</div>
          <h2 style={{ fontFamily: 'Playfair Display', fontSize: 38, fontWeight: 500, color: '#1c1917', margin: 0 }}>Two sides. One encrypted vault.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #ede9e4', padding: '32px', boxShadow: '0 2px 12px rgba(28,25,23,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="4" stroke={accentColor} strokeWidth="1.5"/><path d="M3 18c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <div>
                <div style={{ fontFamily: 'DM Sans', fontSize: 13, fontWeight: 700, color: '#1c1917' }}>For patients</div>
                <div style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#a8a29e' }}>Earn from your data</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[['1','Browse open bounties','See what researchers are paying for — field list, payout, deadline, and exactly what computation will run on your data.'],
                ['2','Enter & encrypt your data','Fill in a simple form. Your browser encrypts every field using FHE before anything leaves your device.'],
                ['3','Submit & get paid instantly','One wallet signature submits the ciphertext. The contract validates your range — no one sees the value — and pays you on the spot.']
              ].map(([n,t,b]) => <HowItWorksStep key={n} number={n} title={t} body={b} accent={accent}/>)}
            </div>
            <button onClick={() => navigate('marketplace')} style={{ marginTop: 28, width: '100%', padding: '11px', borderRadius: 9, background: accentColor, color: '#fff', border: 'none', fontFamily: 'DM Sans', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Browse bounties →</button>
          </div>
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #ede9e4', padding: '32px', boxShadow: '0 2px 12px rgba(28,25,23,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="8" width="14" height="10" rx="2" stroke="#44403c" strokeWidth="1.5"/><path d="M7 8V6a3 3 0 016 0v2" stroke="#44403c" strokeWidth="1.5" strokeLinecap="round"/><circle cx="10" cy="13" r="1.5" fill="#44403c"/></svg>
              </div>
              <div>
                <div style={{ fontFamily: 'DM Sans', fontSize: 13, fontWeight: 700, color: '#1c1917' }}>For organizations</div>
                <div style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#a8a29e' }}>Pharma, CROs, researchers</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[['1','Create a bounty & fund escrow','Pick a computation template, define the data schema and valid ranges, set your price per record, and deposit stablecoin into on-chain escrow.'],
                ['2','Collect encrypted submissions','Patients submit ciphertexts that are range-validated on-chain. Watch your cohort fill in real time — no PHI ever touches your systems.'],
                ['3','Run the computation, get results','Trigger the aggregate computation when ready. Results are the only thing ever decrypted. Never individual records.']
              ].map(([n,t,b]) => <HowItWorksStep key={n} number={n} title={t} body={b} accent={accent}/>)}
            </div>
            <button onClick={() => navigate('org')} style={{ marginTop: 28, width: '100%', padding: '11px', borderRadius: 9, background: '#1c1917', color: '#fff', border: 'none', fontFamily: 'DM Sans', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Post a bounty →</button>
          </div>
        </div>
      </section>

      {/* Privacy guarantee section */}
      <section style={{ background: '#1c1917', padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontFamily: 'DM Sans', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: accentColor, marginBottom: 16, textTransform: 'uppercase' }}>The privacy guarantee</div>
          <h2 style={{ fontFamily: 'Playfair Display', fontSize: 36, fontWeight: 500, color: '#faf8f5', lineHeight: 1.25, margin: '0 0 20px' }}>
            Your data is never decrypted.<br/>Not once. Not ever.
          </h2>
          <p style={{ fontFamily: 'DM Sans', fontSize: 16, color: '#a8a29e', lineHeight: 1.75, margin: '0 0 40px' }}>
            Fully Homomorphic Encryption lets the network run range checks and aggregate computations directly on ciphertexts. Researchers get their cohort answer. Your blood pressure value stays a secret — mathematically, not by policy.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { icon: '🔒', title: 'Client-side only', body: 'Encryption happens in your browser. Ciphertexts are what gets transmitted — nothing else.' },
              { icon: '⛓', title: 'On-chain validation', body: 'Range checks run on the encrypted values. The chain learns only pass/fail — never the number.' },
              { icon: '∑', title: 'Aggregate results only', body: 'Computation outputs are cohort-level statistics. Individual records are mathematically inaccessible.' },
            ].map(item => (
              <div key={item.title} style={{ padding: '24px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{item.icon}</div>
                <div style={{ fontFamily: 'DM Sans', fontSize: 13, fontWeight: 600, color: '#faf8f5', marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#78716c', lineHeight: 1.6 }}>{item.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Playfair Display', fontSize: 40, fontWeight: 500, color: '#1c1917', margin: '0 0 16px' }}>Ready to get started?</h2>
        <p style={{ fontFamily: 'DM Sans', fontSize: 16, color: '#78716c', margin: '0 0 36px' }}>Submit to a study in under 90 seconds, or post a bounty and have data flowing today.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => navigate('marketplace')} style={{ padding: '14px 32px', borderRadius: 10, border: 'none', background: accentColor, color: '#fff', fontFamily: 'DM Sans', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Browse open bounties</button>
          <button onClick={() => navigate('org')} style={{ padding: '14px 32px', borderRadius: 10, border: '1.5px solid #ede9e4', background: '#fff', color: '#44403c', fontFamily: 'DM Sans', fontSize: 15, cursor: 'pointer' }}>I'm a researcher</button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #ede9e4', padding: '28px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'Playfair Display', fontSize: 16, fontWeight: 500, color: '#1c1917' }}>MedYield</div>
          <div style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#a8a29e' }}>Built on Arbitrum Sepolia · Powered by CoFHE</div>
        </div>
      </footer>
    </div>
  );
}

Object.assign(window, { LandingPage });
