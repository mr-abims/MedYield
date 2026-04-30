// SubmitFlow.jsx — Bounty detail drawer + multi-step submission flow

function EncryptLockIcon({ size = 16, color = '#6c4ff5' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="3" y="7" width="10" height="7" rx="2" fill={color} opacity="0.15" stroke={color} strokeWidth="1.3" />
      <path d="M5 7V5a3 3 0 016 0v2" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="11" r="1" fill={color} />
    </svg>
  );
}

function ShieldIcon({ size = 32, color = '#6c4ff5' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 3L5 7.5v7C5 20.5 9.9 26.3 16 28c6.1-1.7 11-7.5 11-13.5v-7L16 3z" fill={color} opacity="0.12" stroke={color} strokeWidth="1.5" />
      <path d="M11 16l3 3 7-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StepIndicator({ step, total, accent }) {
  const accentColor = accent === 'emerald' ? '#059669' : '#6c4ff5';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28 }}>
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <div style={{
            width: i < step ? 24 : 8, height: 6, borderRadius: 3,
            background: i < step ? accentColor : i === step ? accentColor : '#e8e4e0',
            opacity: i === step ? 1 : i < step ? 0.4 : 1,
            transition: 'all 0.3s ease',
          }} />
        </React.Fragment>
      ))}
      <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#a8a29e', marginLeft: 4 }}>
        {step + 1} of {total}
      </span>
    </div>
  );
}

// Step 0: Bounty detail overview
function StepOverview({ bounty, accent, onNext, onClose }) {
  const accentColor = accent === 'emerald' ? '#059669' : '#6c4ff5';
  const accentLight = accent === 'emerald' ? '#d1fae5' : '#ede9fe';
  return (
    <div>
      <StepIndicator step={0} total={4} accent={accent} />
      <div style={{ fontFamily: 'DM Sans', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: accentColor, marginBottom: 8, textTransform: 'uppercase' }}>
        About this study
      </div>
      <h2 style={{ fontFamily: 'Playfair Display', fontSize: 26, fontWeight: 500, color: '#1c1917', margin: '0 0 8px' }}>
        {bounty.title}
      </h2>
      <p style={{ fontFamily: 'DM Sans', fontSize: 14, color: '#78716c', lineHeight: 1.65, margin: '0 0 24px' }}>
        {bounty.description}
      </p>

      {/* Fields requested */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'DM Sans', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: '#a8a29e', marginBottom: 10, textTransform: 'uppercase' }}>
          Data requested
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {bounty.fields.map(f => (
            <div key={f.name} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 14px', borderRadius: 8, background: '#faf8f5',
              border: '1px solid #ede9e4',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <EncryptLockIcon color={accentColor} />
                <span style={{ fontFamily: 'DM Sans', fontSize: 13, fontWeight: 500, color: '#1c1917' }}>{f.name}</span>
              </div>
              <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#78716c' }}>
                {f.type === 'boolean' ? 'Yes / No' : `${f.min}–${f.max} ${f.unit}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy guarantee */}
      <div style={{ padding: '14px 16px', borderRadius: 12, background: accentLight, marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <ShieldIcon size={28} color={accentColor} />
        <div>
          <div style={{ fontFamily: 'DM Sans', fontSize: 11, fontWeight: 700, color: accentColor, letterSpacing: '0.06em', marginBottom: 3, textTransform: 'uppercase' }}>Privacy guarantee</div>
          <div style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#44403c', lineHeight: 1.55 }}>
            {bounty.computeDescription}
          </div>
        </div>
      </div>

      {/* Economics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 28 }}>
        {[
          { label: 'You earn', value: `$${bounty.pricePerRecord.toFixed(2)}`, sub: 'USDC · on-chain' },
          { label: 'Closes in', value: formatCountdown(bounty.deadline), sub: 'Deadline' },
          { label: 'Slots left', value: (bounty.maxSubmissions - bounty.validatedSubmissions).toLocaleString(), sub: 'of ' + bounty.maxSubmissions.toLocaleString() },
        ].map(item => (
          <div key={item.label} style={{ padding: '12px 14px', borderRadius: 10, background: '#faf8f5', border: '1px solid #ede9e4', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Playfair Display', fontSize: 18, fontWeight: 500, color: '#1c1917' }}>{item.value}</div>
            <div style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#a8a29e', marginTop: 2 }}>{item.label}</div>
          </div>
        ))}
      </div>

      <button onClick={onNext} style={{
        width: '100%', padding: '13px', borderRadius: 10, border: 'none',
        background: accentColor, color: '#fff',
        fontFamily: 'DM Sans', fontSize: 14, fontWeight: 600,
        cursor: 'pointer', letterSpacing: '0.01em',
      }}>
        I understand — enter my data →
      </button>
    </div>
  );
}

// Step 1: Fill form
function StepForm({ bounty, accent, onNext, onBack }) {
  const accentColor = accent === 'emerald' ? '#059669' : '#6c4ff5';
  const [values, setValues] = React.useState({});
  const [errors, setErrors] = React.useState({});

  const validate = () => {
    const errs = {};
    bounty.fields.forEach(f => {
      const v = values[f.name];
      if (v === undefined || v === '') { errs[f.name] = 'Required'; return; }
      if (f.type !== 'boolean') {
        const num = parseFloat(v);
        if (isNaN(num)) { errs[f.name] = 'Must be a number'; return; }
        if (num < f.min || num > f.max) errs[f.name] = `Must be between ${f.min} and ${f.max} ${f.unit}`;
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => { if (validate()) onNext(values); };

  return (
    <div>
      <StepIndicator step={1} total={4} accent={accent} />
      <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, fontWeight: 500, color: '#1c1917', margin: '0 0 6px' }}>
        Enter your data
      </h2>
      <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#78716c', margin: '0 0 24px', lineHeight: 1.55 }}>
        Your values are validated against the allowed ranges in your browser, then encrypted before anything is sent.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
        {bounty.fields.map(f => (
          <div key={f.name}>
            <label style={{ display: 'block', fontFamily: 'DM Sans', fontSize: 12, fontWeight: 600, color: '#44403c', marginBottom: 6, letterSpacing: '0.02em' }}>
              {f.name}
              <span style={{ fontWeight: 400, color: '#a8a29e', marginLeft: 4 }}>
                {f.type === 'boolean' ? '' : `(${f.min}–${f.max} ${f.unit})`}
              </span>
            </label>
            {f.type === 'boolean' ? (
              <div style={{ display: 'flex', gap: 8 }}>
                {['Yes', 'No'].map(opt => (
                  <button key={opt} onClick={() => setValues(v => ({ ...v, [f.name]: opt === 'Yes' ? 1 : 0 }))}
                    style={{
                      flex: 1, padding: '10px', borderRadius: 8,
                      border: `1.5px solid ${values[f.name] === (opt === 'Yes' ? 1 : 0) ? accentColor : '#ede9e4'}`,
                      background: values[f.name] === (opt === 'Yes' ? 1 : 0) ? (accent === 'emerald' ? '#d1fae5' : '#ede9fe') : '#fff',
                      color: values[f.name] === (opt === 'Yes' ? 1 : 0) ? accentColor : '#78716c',
                      fontFamily: 'DM Sans', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="number" value={values[f.name] ?? ''}
                onChange={e => setValues(v => ({ ...v, [f.name]: e.target.value }))}
                placeholder={`e.g. ${Math.round((f.min + f.max) / 2)}`}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8, boxSizing: 'border-box',
                  border: `1.5px solid ${errors[f.name] ? '#ef4444' : '#ede9e4'}`,
                  fontFamily: 'DM Sans', fontSize: 14, color: '#1c1917',
                  background: '#fff', outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = accentColor}
                onBlur={e => e.target.style.borderColor = errors[f.name] ? '#ef4444' : '#ede9e4'}
              />
            )}
            {errors[f.name] && (
              <div style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#ef4444', marginTop: 4 }}>
                ⚠ {errors[f.name]}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onBack} style={{
          flex: '0 0 80px', padding: '12px', borderRadius: 10, border: '1.5px solid #ede9e4',
          background: 'transparent', color: '#78716c',
          fontFamily: 'DM Sans', fontSize: 14, cursor: 'pointer',
        }}>← Back</button>
        <button onClick={handleNext} style={{
          flex: 1, padding: '12px', borderRadius: 10, border: 'none',
          background: accentColor, color: '#fff',
          fontFamily: 'DM Sans', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>Encrypt & preview →</button>
      </div>
    </div>
  );
}

// Step 2: Encrypting animation
function StepEncrypting({ bounty, values, accent, onNext }) {
  const accentColor = accent === 'emerald' ? '#059669' : '#6c4ff5';
  const [progress, setProgress] = React.useState(0);
  const [fieldsDone, setFieldsDone] = React.useState([]);

  React.useEffect(() => {
    const fields = bounty.fields;
    let i = 0;
    const tick = () => {
      if (i >= fields.length) {
        setTimeout(() => setProgress(100), 300);
        return;
      }
      setTimeout(() => {
        setFieldsDone(d => [...d, fields[i].name]);
        setProgress(Math.round(((i + 1) / fields.length) * 90));
        i++;
        tick();
      }, 700 + Math.random() * 400);
    };
    tick();
  }, []);

  React.useEffect(() => {
    if (progress === 100) setTimeout(onNext, 800);
  }, [progress]);

  return (
    <div style={{ textAlign: 'center' }}>
      <StepIndicator step={2} total={4} accent={accent} />

      <div style={{ marginBottom: 24 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: accent === 'emerald' ? '#d1fae5' : '#ede9fe',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px',
          animation: progress < 100 ? 'pulse 1.2s ease-in-out infinite' : 'none',
        }}>
          <ShieldIcon size={36} color={accentColor} />
        </div>
        <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, fontWeight: 500, color: '#1c1917', margin: '0 0 8px' }}>
          {progress < 100 ? 'Encrypting your data…' : 'Encryption complete'}
        </h2>
        <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#78716c', margin: '0 0 14px', lineHeight: 1.55 }}>
          {progress < 100
            ? 'Each field is being encrypted in your browser using Fully Homomorphic Encryption. Your raw values never leave this device.'
            : 'Your data is encrypted and ready. A wallet signature is all that\'s needed to submit.'}
        </p>
        {/* CoFHE attribution */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '5px 12px 5px 8px', borderRadius: 20,
          background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'linear-gradient(135deg, #4fffb0 0%, #00d4ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5h6M6 3l2 2-2 2" stroke="#0e1117" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontFamily: 'DM Sans', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', color: '#fff', textTransform: 'uppercase' }}>
            Encrypted by <span style={{ color: '#4fffb0' }}>Fhenix CoFHE</span>
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ height: 5, background: '#f0ede8', borderRadius: 3, marginBottom: 6, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, borderRadius: 3, transition: 'width 0.5s ease',
            background: progress < 100 ? accentColor : 'linear-gradient(90deg, #4fffb0, #00d4ff)',
          }} />
        </div>
        <div style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#a8a29e' }}>{progress}% complete</div>
      </div>

      {/* Field status */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left', marginBottom: 24 }}>
        {bounty.fields.map(f => (
          <div key={f.name} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 12px', borderRadius: 8,
            background: fieldsDone.includes(f.name) ? (accent === 'emerald' ? '#d1fae5' : '#ede9fe') : '#faf8f5',
            transition: 'background 0.3s',
          }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: fieldsDone.includes(f.name) ? accentColor : '#e8e4e0', transition: 'background 0.3s',
            }}>
              {fieldsDone.includes(f.name) && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span style={{ fontFamily: 'DM Sans', fontSize: 12, fontWeight: 500, color: fieldsDone.includes(f.name) ? accentColor : '#a8a29e' }}>
              {f.name}
            </span>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: fieldsDone.includes(f.name) ? '#a8a29e' : '#d6d3d1', marginLeft: 'auto' }}>
              {fieldsDone.includes(f.name) ? '0x' + Math.random().toString(16).slice(2, 8) + '…' : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Step 3: Confirm + pending
function StepConfirm({ bounty, accent, onSubmit, onBack }) {
  const accentColor = accent === 'emerald' ? '#059669' : '#6c4ff5';
  const [state, setState] = React.useState('idle'); // idle → confirming → pending → done
  const [subState, setSubState] = React.useState('');

  const handleSubmit = () => {
    setState('confirming');
    setSubState('Waiting for wallet signature…');
    setTimeout(() => {
      setState('pending');
      setSubState('Encrypted data submitted. Running range check…');
      setTimeout(() => {
        setState('done');
        setSubState('');
        setTimeout(() => onSubmit(), 1200);
      }, 2800);
    }, 1600);
  };

  if (state === 'done') return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%', background: '#d1fae5',
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
      }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M8 16l5 5 11-11" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 style={{ fontFamily: 'Playfair Display', fontSize: 26, fontWeight: 500, color: '#1c1917', margin: '0 0 8px' }}>
        Validated & paid!
      </h2>
      <p style={{ fontFamily: 'DM Sans', fontSize: 14, color: '#78716c', lineHeight: 1.6 }}>
        Your encrypted submission passed the range check.<br />
        <strong style={{ color: '#059669' }}>${bounty.pricePerRecord.toFixed(2)} USDC</strong> has been released to your wallet.
      </p>
    </div>
  );

  if (state === 'pending') return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%', background: '#fef3c7',
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
        animation: 'spin 1.4s linear infinite',
      }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="12" stroke="#d97706" strokeWidth="2" strokeDasharray="50 26" />
        </svg>
      </div>
      <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, fontWeight: 500, color: '#1c1917', margin: '0 0 8px' }}>
        Awaiting validation
      </h2>
      <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#78716c', lineHeight: 1.6, margin: '0 0 16px' }}>
        The network is range-checking your encrypted values. This takes a few seconds — you'll be paid the moment it passes.
      </p>
      <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fef3c7', display: 'inline-block' }}>
        <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#92400e' }}>⏳ {subState}</span>
      </div>
    </div>
  );

  if (state === 'confirming') return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: accent === 'emerald' ? '#d1fae5' : '#ede9fe',
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
        animation: 'pulse 1s ease-in-out infinite',
      }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="4" y="12" width="24" height="16" rx="3" fill={accentColor} opacity="0.15" stroke={accentColor} strokeWidth="1.5" />
          <path d="M10 12V9a6 6 0 0112 0v3" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="16" cy="21" r="2" fill={accentColor} />
        </svg>
      </div>
      <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, fontWeight: 500, color: '#1c1917', margin: '0 0 8px' }}>
        Confirm in wallet
      </h2>
      <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#78716c', margin: 0 }}>{subState}</p>
    </div>
  );

  return (
    <div>
      <StepIndicator step={3} total={4} accent={accent} />
      <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, fontWeight: 500, color: '#1c1917', margin: '0 0 6px' }}>
        Ready to submit
      </h2>
      <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#78716c', margin: '0 0 24px', lineHeight: 1.55 }}>
        Your data is encrypted and ready. One wallet signature submits the ciphertext on-chain.
      </p>

      <div style={{ padding: '16px', borderRadius: 12, background: '#faf8f5', border: '1px solid #ede9e4', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#78716c' }}>Bounty</span>
          <span style={{ fontFamily: 'DM Sans', fontSize: 13, fontWeight: 500, color: '#1c1917' }}>{bounty.title}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#78716c' }}>Fields encrypted</span>
          <span style={{ fontFamily: 'DM Sans', fontSize: 13, fontWeight: 500, color: '#1c1917' }}>{bounty.fields.length} fields</span>
        </div>
        <div style={{ height: 1, background: '#ede9e4', margin: '10px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#78716c' }}>You will receive</span>
          <span style={{ fontFamily: 'Playfair Display', fontSize: 20, fontWeight: 600, color: accentColor }}>${bounty.pricePerRecord.toFixed(2)} USDC</span>
        </div>
      </div>

      <div style={{ padding: '12px 14px', borderRadius: 10, background: '#0e1117', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -12, right: -12, width: 64, height: 64, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,255,176,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg, #4fffb0 0%, #00d4ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5h6M6 3l2 2-2 2" stroke="#0e1117" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div>
          <div style={{ fontFamily: 'DM Sans', fontSize: 10, fontWeight: 700, color: '#4fffb0', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3 }}>Fhenix CoFHE guarantee</div>
          <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>
            Your raw values never leave this browser. Only ciphertexts and cryptographic proofs are written on-chain.
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onBack} style={{
          flex: '0 0 80px', padding: '12px', borderRadius: 10, border: '1.5px solid #ede9e4',
          background: 'transparent', color: '#78716c',
          fontFamily: 'DM Sans', fontSize: 14, cursor: 'pointer',
        }}>← Back</button>
        <button onClick={handleSubmit} style={{
          flex: 1, padding: '13px', borderRadius: 10, border: 'none',
          background: accentColor, color: '#fff',
          fontFamily: 'DM Sans', fontSize: 14, fontWeight: 600,
          cursor: 'pointer',
        }}>
          Submit encrypted data ↗
        </button>
      </div>
    </div>
  );
}

function formatCountdown(ts) {
  const diff = ts - Date.now();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h`;
  return 'Closing soon';
}

function SubmitFlow({ bounty, accent, onClose, onComplete }) {
  const [step, setStep] = React.useState(0);
  const [formValues, setFormValues] = React.useState(null);

  if (!bounty) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
    }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(28,25,23,0.35)',
        backdropFilter: 'blur(2px)',
      }} />

      {/* Drawer */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: 480, height: '100vh',
        background: '#fff',
        overflowY: 'auto',
        padding: '32px 32px 40px',
        boxShadow: '-8px 0 40px rgba(28,25,23,0.12)',
        animation: 'slideIn 0.25s ease',
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 20, right: 20,
          width: 32, height: 32, borderRadius: '50%',
          border: '1.5px solid #ede9e4', background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#78716c', fontSize: 16, lineHeight: 1,
        }}>×</button>

        {step === 0 && <StepOverview bounty={bounty} accent={accent} onNext={() => setStep(1)} onClose={onClose} />}
        {step === 1 && <StepForm bounty={bounty} accent={accent} onNext={v => { setFormValues(v); setStep(2); }} onBack={() => setStep(0)} />}
        {step === 2 && <StepEncrypting bounty={bounty} values={formValues} accent={accent} onNext={() => setStep(3)} />}
        {step === 3 && <StepConfirm bounty={bounty} accent={accent} onSubmit={() => { onComplete(bounty); onClose(); }} onBack={() => setStep(1)} />}
      </div>
    </div>
  );
}

Object.assign(window, { SubmitFlow });
