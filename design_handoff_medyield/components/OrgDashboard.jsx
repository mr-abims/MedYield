// OrgDashboard.jsx — Org bounty list, create wizard, monitor + compute, results

// ─── Mock org bounty data ────────────────────────────────────────────────────
const ORG_BOUNTIES_INIT = [
  {
    id: 'ob1',
    title: 'Blood Pressure Cohort Study',
    description: 'Understanding systolic patterns in smokers aged 40–60 for cardiovascular risk modeling.',
    fields: [
      { name: 'Age', type: 'integer', min: 40, max: 60, unit: 'yrs' },
      { name: 'Systolic BP', type: 'integer', min: 80, max: 200, unit: 'mmHg' },
      { name: 'Smoker', type: 'boolean', min: 0, max: 1, unit: 'yes/no' },
    ],
    template: 'aggregate_stats',
    templateLabel: 'Aggregate Stats',
    pricePerRecord: 3.50,
    escrow: 7000, escrowUsed: 4340,
    minSubmissions: 500, maxSubmissions: 2000,
    totalSubmissions: 1247, validatedSubmissions: 1240,
    deadline: Date.now() + 8 * 86400000,
    status: 'OPEN',
    batchCursor: 0,
    results: null,
  },
  {
    id: 'ob2',
    title: 'Diabetes Risk Assessment',
    description: 'Identifying HbA1c and BMI patterns in pre-diabetic adults for early intervention research.',
    fields: [
      { name: 'Age', type: 'integer', min: 30, max: 75, unit: 'yrs' },
      { name: 'HbA1c', type: 'decimal', min: 5.0, max: 10.0, unit: '%' },
      { name: 'BMI', type: 'decimal', min: 18, max: 45, unit: 'kg/m²' },
    ],
    template: 'eligibility_screening',
    templateLabel: 'Eligibility Count',
    pricePerRecord: 5.00,
    escrow: 5000, escrowUsed: 4500,
    minSubmissions: 300, maxSubmissions: 1000,
    totalSubmissions: 900, validatedSubmissions: 900,
    deadline: Date.now() + 2 * 86400000,
    status: 'COMPUTING',
    batchCursor: 540,
    results: null,
  },
  {
    id: 'ob3',
    title: 'Sleep Quality Research',
    description: 'Mapping sleep duration and snoring to predict apnea risk across adult populations.',
    fields: [
      { name: 'Age', type: 'integer', min: 18, max: 75, unit: 'yrs' },
      { name: 'Sleep Hours', type: 'decimal', min: 3, max: 12, unit: 'hrs' },
      { name: 'Snoring', type: 'boolean', min: 0, max: 1, unit: 'yes/no' },
    ],
    template: 'risk_scoring',
    templateLabel: 'Risk Score',
    pricePerRecord: 4.00,
    escrow: 6000, escrowUsed: 6000,
    minSubmissions: 400, maxSubmissions: 1500,
    totalSubmissions: 1500, validatedSubmissions: 1487,
    deadline: Date.now() - 2 * 86400000,
    status: 'COMPLETED',
    batchCursor: 1487,
    results: { avgRiskScore: 0.63, totalWeightedSum: 936.81, validCount: 1487 },
  },
];

// ─── Shared helpers ───────────────────────────────────────────────────────────
function OrgStatusBadge({ status }) {
  const map = {
    OPEN: { bg: '#d1fae5', color: '#065f46', label: 'OPEN' },
    COMPUTING: { bg: '#dbeafe', color: '#1e40af', label: 'COMPUTING' },
    COMPLETED: { bg: '#f3f4f6', color: '#374151', label: 'COMPLETED' },
    EXPIRED: { bg: '#fee2e2', color: '#991b1b', label: 'EXPIRED' },
  };
  const s = map[status] || map.EXPIRED;
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20,
      background: s.bg, color: s.color,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
      fontFamily: 'DM Sans',
    }}>{s.label}</span>
  );
}

function fmtDeadline(ts) {
  const diff = ts - Date.now();
  if (diff < 0) return 'Expired';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  return d > 0 ? `${d}d ${h}h left` : `${h}h left`;
}

// ─── Org Bounty List ──────────────────────────────────────────────────────────
function OrgBountyList({ bounties, accent, onSelect, onCreate }) {
  const accentColor = accent === 'emerald' ? '#059669' : '#6c4ff5';
  const accentLight = accent === 'emerald' ? '#d1fae5' : '#ede9fe';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
        <div>
          <div style={{ fontFamily: 'DM Sans', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: accentColor, marginBottom: 8, textTransform: 'uppercase' }}>Organization dashboard</div>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 36, fontWeight: 500, color: '#1c1917', margin: 0 }}>Your bounties</h1>
        </div>
        <button onClick={onCreate} style={{
          padding: '11px 22px', borderRadius: 10, border: 'none',
          background: accentColor, color: '#fff',
          fontFamily: 'DM Sans', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>+ New bounty</button>
      </div>

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 36 }}>
        {[
          { label: 'Active bounties', value: bounties.filter(b => b.status === 'OPEN').length },
          { label: 'Total spend', value: '$' + bounties.reduce((s, b) => s + b.escrowUsed, 0).toLocaleString() },
          { label: 'Records collected', value: bounties.reduce((s, b) => s + b.validatedSubmissions, 0).toLocaleString() },
        ].map(c => (
          <div key={c.label} style={{ padding: '18px 20px', borderRadius: 14, background: '#fff', border: '1px solid #ede9e4', boxShadow: '0 1px 4px rgba(28,25,23,0.04)' }}>
            <div style={{ fontFamily: 'Playfair Display', fontSize: 28, fontWeight: 500, color: '#1c1917' }}>{c.value}</div>
            <div style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#78716c', marginTop: 3 }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {bounties.map(b => {
          const fillPct = Math.round((b.escrowUsed / b.escrow) * 100);
          return (
            <div key={b.id} onClick={() => onSelect(b.id)} style={{
              background: '#fff', borderRadius: 14, border: '1px solid #ede9e4',
              padding: '22px 24px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 24,
              transition: 'box-shadow 0.18s, transform 0.18s',
              boxShadow: '0 1px 4px rgba(28,25,23,0.04)',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(28,25,23,0.09)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(28,25,23,0.04)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'Playfair Display', fontSize: 17, fontWeight: 500, color: '#1c1917' }}>{b.title}</span>
                  <OrgStatusBadge status={b.status} />
                </div>
                <div style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#a8a29e' }}>{b.templateLabel} · {fmtDeadline(b.deadline)}</div>
              </div>
              <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexShrink: 0 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Playfair Display', fontSize: 20, fontWeight: 500, color: '#1c1917' }}>{b.validatedSubmissions.toLocaleString()}</div>
                  <div style={{ fontFamily: 'DM Sans', fontSize: 10, color: '#a8a29e' }}>Validated</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Playfair Display', fontSize: 20, fontWeight: 500, color: '#1c1917' }}>${(b.escrow - b.escrowUsed).toLocaleString()}</div>
                  <div style={{ fontFamily: 'DM Sans', fontSize: 10, color: '#a8a29e' }}>Remaining</div>
                </div>
                <div style={{
                  padding: '7px 16px', borderRadius: 8,
                  background: b.status === 'COMPLETED' ? '#f3f4f6' : accentLight,
                  color: b.status === 'COMPLETED' ? '#78716c' : accentColor,
                  fontFamily: 'DM Sans', fontSize: 12, fontWeight: 600,
                }}>
                  {b.status === 'OPEN' ? 'Monitor →' : b.status === 'COMPUTING' ? 'Continue →' : 'View results →'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Create Bounty Wizard ─────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: 'aggregate_stats',
    label: 'Aggregate Stats',
    description: 'Compute sum, count, min, max, and mean across selected fields.',
    resultShape: 'One row per field: sum, min, max, mean + validCount',
    icon: '∑',
  },
  {
    id: 'eligibility_screening',
    label: 'Eligibility Screening',
    description: 'Count how many submissions match all criteria in your list.',
    resultShape: 'Two numbers: eligibleCount + validCount',
    icon: '✓',
  },
  {
    id: 'risk_scoring',
    label: 'Risk Scoring',
    description: 'Weighted composite score averaged across the cohort.',
    resultShape: 'Three numbers: avgRiskScore, totalWeightedSum, validCount',
    icon: '⚖',
  },
];

function WizardStep({ step, total, accent }) {
  const accentColor = accent === 'emerald' ? '#059669' : '#6c4ff5';
  const labels = ['Template', 'Schema', 'Parameters', 'Economics', 'Review'];
  return (
    <div style={{ display: 'flex', gap: 0, marginBottom: 36 }}>
      {labels.map((l, i) => (
        <React.Fragment key={l}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: i < step ? accentColor : i === step ? accentColor : '#ede9e4',
              opacity: i < step ? 0.45 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: i <= step ? '#fff' : '#a8a29e',
              fontFamily: 'DM Sans', fontSize: 11, fontWeight: 700,
              transition: 'all 0.2s',
            }}>
              {i < step ? '✓' : i + 1}
            </div>
            <span style={{ fontFamily: 'DM Sans', fontSize: 10, fontWeight: i === step ? 700 : 400, color: i === step ? accentColor : '#a8a29e', whiteSpace: 'nowrap' }}>{l}</span>
          </div>
          {i < labels.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < step ? accentColor : '#ede9e4', marginTop: 13, opacity: i < step ? 0.45 : 1, transition: 'background 0.2s' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function CreateBountyWizard({ accent, onComplete, onCancel }) {
  const accentColor = accent === 'emerald' ? '#059669' : '#6c4ff5';
  const accentLight = accent === 'emerald' ? '#d1fae5' : '#ede9fe';
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState({
    template: null,
    fields: [{ name: 'Age', type: 'integer', min: 18, max: 120, unit: 'yrs' }],
    templateParams: {},
    description: '',
    pricePerRecord: '',
    minSubmissions: '',
    maxSubmissions: '',
    deadlineDays: '30',
    escrowAmount: '',
  });
  const [funding, setFunding] = React.useState('idle');

  const setF = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const addField = () => setForm(f => ({ ...f, fields: [...f.fields, { name: '', type: 'integer', min: 0, max: 100, unit: '' }] }));
  const updateField = (i, key, val) => setForm(f => { const fields = [...f.fields]; fields[i] = { ...fields[i], [key]: val }; return { ...f, fields }; });
  const removeField = (i) => setForm(f => ({ ...f, fields: f.fields.filter((_, idx) => idx !== i) }));

  const handleFund = () => {
    setFunding('confirming');
    setTimeout(() => { setFunding('done'); setTimeout(() => onComplete(form), 1200); }, 2200);
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <div style={{ fontFamily: 'DM Sans', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: accentColor, marginBottom: 6, textTransform: 'uppercase' }}>New bounty</div>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 30, fontWeight: 500, color: '#1c1917', margin: 0 }}>Create a study</h1>
        </div>
        <button onClick={onCancel} style={{ padding: '7px 14px', borderRadius: 8, border: '1.5px solid #ede9e4', background: 'transparent', color: '#78716c', fontFamily: 'DM Sans', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
      </div>

      <WizardStep step={step} total={5} accent={accent} />

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #ede9e4', padding: '32px', boxShadow: '0 2px 12px rgba(28,25,23,0.04)' }}>

        {/* Step 0: Template */}
        {step === 0 && (
          <div>
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 500, color: '#1c1917', margin: '0 0 6px' }}>Choose a computation</h2>
            <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#78716c', margin: '0 0 24px', lineHeight: 1.6 }}>
              Pick the type of aggregate result you want. This cannot be changed after the bounty is created.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {TEMPLATES.map(t => (
                <div key={t.id} onClick={() => setF('template', t.id)} style={{
                  padding: '18px 20px', borderRadius: 12,
                  border: `2px solid ${form.template === t.id ? accentColor : '#ede9e4'}`,
                  background: form.template === t.id ? accentLight : '#fff',
                  cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', gap: 16, alignItems: 'flex-start',
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: form.template === t.id ? accentColor : '#f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, transition: 'background 0.15s' }}>
                    {t.icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'DM Sans', fontSize: 14, fontWeight: 600, color: '#1c1917', marginBottom: 3 }}>{t.label}</div>
                    <div style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#78716c', marginBottom: 4, lineHeight: 1.5 }}>{t.description}</div>
                    <div style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#a8a29e' }}>Result: {t.resultShape}</div>
                  </div>
                </div>
              ))}
            </div>
            <button disabled={!form.template} onClick={() => setStep(1)} style={{
              width: '100%', padding: '12px', borderRadius: 10, border: 'none',
              background: form.template ? accentColor : '#e8e4e0', color: form.template ? '#fff' : '#a8a29e',
              fontFamily: 'DM Sans', fontSize: 14, fontWeight: 600, cursor: form.template ? 'pointer' : 'default',
            }}>Next: Define schema →</button>
          </div>
        )}

        {/* Step 1: Schema */}
        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 500, color: '#1c1917', margin: '0 0 6px' }}>Define the data schema</h2>
            <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#78716c', margin: '0 0 24px', lineHeight: 1.6 }}>Add the fields patients will submit. Set valid ranges carefully — they're enforced on-chain and can't be changed.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
              {form.fields.map((f, i) => (
                <div key={i} style={{ padding: '14px 16px', borderRadius: 10, border: '1px solid #ede9e4', background: '#faf8f5' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px 80px 70px 32px', gap: 8, alignItems: 'center' }}>
                    <input placeholder="Field name" value={f.name} onChange={e => updateField(i, 'name', e.target.value)}
                      style={{ padding: '7px 10px', borderRadius: 7, border: '1.5px solid #ede9e4', fontFamily: 'DM Sans', fontSize: 12, color: '#1c1917', background: '#fff', outline: 'none' }} />
                    <select value={f.type} onChange={e => updateField(i, 'type', e.target.value)}
                      style={{ padding: '7px 8px', borderRadius: 7, border: '1.5px solid #ede9e4', fontFamily: 'DM Sans', fontSize: 12, color: '#1c1917', background: '#fff', outline: 'none' }}>
                      <option value="integer">Integer</option>
                      <option value="decimal">Decimal</option>
                      <option value="boolean">Boolean</option>
                    </select>
                    <input placeholder="Min" value={f.min} onChange={e => updateField(i, 'min', e.target.value)} type="number"
                      style={{ padding: '7px 8px', borderRadius: 7, border: '1.5px solid #ede9e4', fontFamily: 'DM Sans', fontSize: 12, color: '#1c1917', background: '#fff', outline: 'none' }} />
                    <input placeholder="Max" value={f.max} onChange={e => updateField(i, 'max', e.target.value)} type="number"
                      style={{ padding: '7px 8px', borderRadius: 7, border: '1.5px solid #ede9e4', fontFamily: 'DM Sans', fontSize: 12, color: '#1c1917', background: '#fff', outline: 'none' }} />
                    <input placeholder="Unit" value={f.unit} onChange={e => updateField(i, 'unit', e.target.value)}
                      style={{ padding: '7px 8px', borderRadius: 7, border: '1.5px solid #ede9e4', fontFamily: 'DM Sans', fontSize: 12, color: '#1c1917', background: '#fff', outline: 'none' }} />
                    {form.fields.length > 1 && (
                      <button onClick={() => removeField(i)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #ede9e4', background: '#fff', color: '#ef4444', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addField} style={{ width: '100%', padding: '10px', borderRadius: 9, border: '1.5px dashed #d6d3d1', background: 'transparent', color: '#78716c', fontFamily: 'DM Sans', fontSize: 13, cursor: 'pointer', marginBottom: 24 }}>
              + Add field
            </button>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(0)} style={{ flex: '0 0 80px', padding: '11px', borderRadius: 9, border: '1.5px solid #ede9e4', background: 'transparent', color: '#78716c', fontFamily: 'DM Sans', fontSize: 13, cursor: 'pointer' }}>← Back</button>
              <button onClick={() => setStep(2)} style={{ flex: 1, padding: '11px', borderRadius: 9, border: 'none', background: accentColor, color: '#fff', fontFamily: 'DM Sans', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Next: Parameters →</button>
            </div>
          </div>
        )}

        {/* Step 2: Template params */}
        {step === 2 && (
          <div>
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 500, color: '#1c1917', margin: '0 0 6px' }}>Configure parameters</h2>
            <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#78716c', margin: '0 0 24px', lineHeight: 1.6 }}>
              {form.template === 'aggregate_stats' && 'Select which fields to include in the aggregate computation.'}
              {form.template === 'eligibility_screening' && 'Define the criteria a patient must meet to be counted as eligible.'}
              {form.template === 'risk_scoring' && 'Set a weight for each field. The weighted sum is averaged across all validated submissions.'}
            </p>

            {form.template === 'aggregate_stats' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {form.fields.filter(f => f.name).map((f, i) => (
                  <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 9, border: '1px solid #ede9e4', background: '#faf8f5', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked style={{ accentColor }} />
                    <span style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#1c1917' }}>{f.name}</span>
                    <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#a8a29e', marginLeft: 'auto' }}>{f.type === 'boolean' ? 'yes/no' : `${f.min}–${f.max} ${f.unit}`}</span>
                  </label>
                ))}
              </div>
            )}

            {form.template === 'eligibility_screening' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {form.fields.filter(f => f.name && f.type !== 'boolean').map((f, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px', gap: 8, padding: '10px 14px', borderRadius: 9, border: '1px solid #ede9e4', background: '#faf8f5', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#1c1917' }}>{f.name}</span>
                    <select style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ede9e4', fontFamily: 'DM Sans', fontSize: 12, background: '#fff' }}>
                      <option>≥</option><option>≤</option><option>=</option>
                    </select>
                    <input type="number" placeholder={`${f.min}–${f.max}`} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ede9e4', fontFamily: 'DM Sans', fontSize: 12, background: '#fff', outline: 'none' }} />
                  </div>
                ))}
              </div>
            )}

            {form.template === 'risk_scoring' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {form.fields.filter(f => f.name).map((f, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12, padding: '10px 14px', borderRadius: 9, border: '1px solid #ede9e4', background: '#faf8f5', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#1c1917' }}>{f.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#a8a29e' }}>Weight</span>
                      <input type="number" defaultValue="1" min="0" style={{ width: 60, padding: '6px 8px', borderRadius: 6, border: '1px solid #ede9e4', fontFamily: 'DM Sans', fontSize: 12, background: '#fff', outline: 'none' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ flex: '0 0 80px', padding: '11px', borderRadius: 9, border: '1.5px solid #ede9e4', background: 'transparent', color: '#78716c', fontFamily: 'DM Sans', fontSize: 13, cursor: 'pointer' }}>← Back</button>
              <button onClick={() => setStep(3)} style={{ flex: 1, padding: '11px', borderRadius: 9, border: 'none', background: accentColor, color: '#fff', fontFamily: 'DM Sans', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Next: Economics →</button>
            </div>
          </div>
        )}

        {/* Step 3: Economics */}
        {step === 3 && (
          <div>
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 500, color: '#1c1917', margin: '0 0 6px' }}>Set economics</h2>
            <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#78716c', margin: '0 0 24px', lineHeight: 1.6 }}>Define what you'll pay and how many submissions you need.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
              {[
                { key: 'description', label: 'Study description', placeholder: 'One sentence explaining what this bounty is for…', type: 'textarea' },
                { key: 'pricePerRecord', label: 'Price per valid record (USDC)', placeholder: 'e.g. 3.50', type: 'number' },
                { key: 'minSubmissions', label: 'Minimum submissions', placeholder: 'e.g. 500', type: 'number' },
                { key: 'maxSubmissions', label: 'Maximum submissions', placeholder: 'e.g. 2000', type: 'number' },
                { key: 'deadlineDays', label: 'Deadline (days from now)', placeholder: 'e.g. 30', type: 'number' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontFamily: 'DM Sans', fontSize: 12, fontWeight: 600, color: '#44403c', marginBottom: 6 }}>{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea value={form[field.key]} onChange={e => setF(field.key, e.target.value)} placeholder={field.placeholder} rows={2}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #ede9e4', fontFamily: 'DM Sans', fontSize: 13, color: '#1c1917', background: '#fff', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                  ) : (
                    <input type={field.type} value={form[field.key]} onChange={e => setF(field.key, e.target.value)} placeholder={field.placeholder}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #ede9e4', fontFamily: 'DM Sans', fontSize: 13, color: '#1c1917', background: '#fff', outline: 'none', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = accentColor}
                      onBlur={e => e.target.style.borderColor = '#ede9e4'} />
                  )}
                </div>
              ))}
              {form.pricePerRecord && form.maxSubmissions && (
                <div style={{ padding: '12px 14px', borderRadius: 9, background: accentLight }}>
                  <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: accentColor, fontWeight: 500 }}>
                    Max escrow needed: <strong>${(parseFloat(form.pricePerRecord || 0) * parseFloat(form.maxSubmissions || 0)).toLocaleString()} USDC</strong>
                  </span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(2)} style={{ flex: '0 0 80px', padding: '11px', borderRadius: 9, border: '1.5px solid #ede9e4', background: 'transparent', color: '#78716c', fontFamily: 'DM Sans', fontSize: 13, cursor: 'pointer' }}>← Back</button>
              <button onClick={() => setStep(4)} style={{ flex: 1, padding: '11px', borderRadius: 9, border: 'none', background: accentColor, color: '#fff', fontFamily: 'DM Sans', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Review & fund →</button>
            </div>
          </div>
        )}

        {/* Step 4: Review + Fund */}
        {step === 4 && (
          <div>
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 500, color: '#1c1917', margin: '0 0 6px' }}>Review & fund escrow</h2>
            <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#78716c', margin: '0 0 24px', lineHeight: 1.6 }}>Once funded, the schema and template are immutable. Review carefully.</p>

            {funding === 'done' ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M6 14l5 5 11-10" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <div style={{ fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 500, color: '#1c1917', marginBottom: 6 }}>Bounty created!</div>
                <div style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#78716c' }}>Escrow funded. Your bounty is now live on the marketplace.</div>
              </div>
            ) : funding === 'confirming' ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'pulse 1s ease-in-out infinite' }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <rect x="4" y="10" width="20" height="14" rx="3" stroke={accentColor} strokeWidth="1.5" fill={accentColor} fillOpacity="0.1" />
                    <path d="M9 10V8a5 5 0 0110 0v2" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="14" cy="18" r="2" fill={accentColor} />
                  </svg>
                </div>
                <div style={{ fontFamily: 'DM Sans', fontSize: 14, color: '#78716c' }}>Waiting for wallet confirmation…</div>
              </div>
            ) : (
              <>
                <div style={{ background: '#faf8f5', borderRadius: 12, border: '1px solid #ede9e4', padding: '20px', marginBottom: 20 }}>
                  {[
                    ['Template', TEMPLATES.find(t => t.id === form.template)?.label],
                    ['Fields', form.fields.filter(f => f.name).map(f => f.name).join(', ')],
                    ['Price/record', form.pricePerRecord ? `$${parseFloat(form.pricePerRecord).toFixed(2)} USDC` : '—'],
                    ['Min submissions', form.minSubmissions || '—'],
                    ['Max submissions', form.maxSubmissions || '—'],
                    ['Deadline', form.deadlineDays ? `${form.deadlineDays} days` : '—'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f0ede8' }}>
                      <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#78716c' }}>{k}</span>
                      <span style={{ fontFamily: 'DM Sans', fontSize: 12, fontWeight: 500, color: '#1c1917' }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0' }}>
                    <span style={{ fontFamily: 'DM Sans', fontSize: 13, fontWeight: 600, color: '#1c1917' }}>Total escrow to deposit</span>
                    <span style={{ fontFamily: 'Playfair Display', fontSize: 20, fontWeight: 500, color: accentColor }}>
                      ${(parseFloat(form.pricePerRecord || 0) * parseFloat(form.maxSubmissions || 0)).toLocaleString()} USDC
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setStep(3)} style={{ flex: '0 0 80px', padding: '11px', borderRadius: 9, border: '1.5px solid #ede9e4', background: 'transparent', color: '#78716c', fontFamily: 'DM Sans', fontSize: 13, cursor: 'pointer' }}>← Back</button>
                  <button onClick={handleFund} style={{ flex: 1, padding: '12px', borderRadius: 9, border: 'none', background: accentColor, color: '#fff', fontFamily: 'DM Sans', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    Fund escrow & launch ↗
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Org Bounty Detail (monitor + compute + results) ─────────────────────────
function OrgBountyDetail({ bountyId, bounties, setBounties, accent, onBack }) {
  const accentColor = accent === 'emerald' ? '#059669' : '#6c4ff5';
  const accentLight = accent === 'emerald' ? '#d1fae5' : '#ede9fe';
  const bounty = bounties.find(b => b.id === bountyId);
  const [processing, setProcessing] = React.useState(false);
  const [cursor, setCursor] = React.useState(bounty?.batchCursor || 0);
  const [localStatus, setLocalStatus] = React.useState(bounty?.status);

  if (!bounty) return null;
  const fillPct = Math.round((bounty.escrowUsed / bounty.escrow) * 100);
  const canTrigger = localStatus === 'OPEN' && bounty.validatedSubmissions >= bounty.minSubmissions;
  const batchSize = 100;

  const triggerCompute = () => {
    setLocalStatus('COMPUTING');
    setBounties(bs => bs.map(b => b.id === bountyId ? { ...b, status: 'COMPUTING' } : b));
  };

  const processBatch = () => {
    setProcessing(true);
    setTimeout(() => {
      const newCursor = Math.min(cursor + batchSize, bounty.validatedSubmissions);
      setCursor(newCursor);
      setProcessing(false);
    }, 1400);
  };

  const finalize = () => {
    setProcessing(true);
    setTimeout(() => {
      const results = bounty.template === 'aggregate_stats'
        ? { fields: bounty.fields.map(f => ({ name: f.name, mean: ((f.min + f.max) / 2 + Math.random() * 10 - 5).toFixed(1), min: f.min, max: f.max - Math.floor(Math.random() * 10), sum: null })) }
        : bounty.template === 'eligibility_screening'
        ? { eligibleCount: Math.floor(bounty.validatedSubmissions * 0.34), validCount: bounty.validatedSubmissions }
        : { avgRiskScore: (0.45 + Math.random() * 0.3).toFixed(3), totalWeightedSum: (bounty.validatedSubmissions * 1.8).toFixed(1), validCount: bounty.validatedSubmissions };
      setLocalStatus('COMPLETED');
      setBounties(bs => bs.map(b => b.id === bountyId ? { ...b, status: 'COMPLETED', results } : b));
      setProcessing(false);
    }, 1800);
  };

  const computeProgress = Math.round((cursor / bounty.validatedSubmissions) * 100);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28, background: 'transparent', border: 'none', color: '#78716c', fontFamily: 'DM Sans', fontSize: 13, cursor: 'pointer', padding: 0 }}>
        ← Back to bounties
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h1 style={{ fontFamily: 'Playfair Display', fontSize: 30, fontWeight: 500, color: '#1c1917', margin: 0 }}>{bounty.title}</h1>
            <OrgStatusBadge status={localStatus} />
          </div>
          <div style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#78716c' }}>{bounty.templateLabel} · {fmtDeadline(bounty.deadline)}</div>
        </div>
      </div>

      {/* Live counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Total submissions', value: bounty.totalSubmissions.toLocaleString() },
          { label: 'Validated', value: bounty.validatedSubmissions.toLocaleString(), highlight: true },
          { label: 'Escrow remaining', value: `$${(bounty.escrow - bounty.escrowUsed).toLocaleString()}` },
          { label: 'Min required', value: bounty.minSubmissions.toLocaleString() },
        ].map(c => (
          <div key={c.label} style={{ padding: '16px', borderRadius: 12, background: c.highlight ? accentLight : '#fff', border: `1px solid ${c.highlight ? 'transparent' : '#ede9e4'}` }}>
            <div style={{ fontFamily: 'Playfair Display', fontSize: 24, fontWeight: 500, color: c.highlight ? accentColor : '#1c1917' }}>{c.value}</div>
            <div style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#78716c', marginTop: 2 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Fill progress */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #ede9e4', padding: '20px 22px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontFamily: 'DM Sans', fontSize: 13, fontWeight: 600, color: '#1c1917' }}>Escrow utilization</span>
          <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#78716c' }}>{fillPct}%</span>
        </div>
        <div style={{ height: 8, background: '#f0ede8', borderRadius: 4 }}>
          <div style={{ height: '100%', width: `${fillPct}%`, background: accentColor, borderRadius: 4, transition: 'width 0.6s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#a8a29e' }}>${bounty.escrowUsed.toLocaleString()} used</span>
          <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#a8a29e' }}>${bounty.escrow.toLocaleString()} total</span>
        </div>
      </div>

      {/* Action panel */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #ede9e4', padding: '24px', marginBottom: 24 }}>
        <div style={{ fontFamily: 'DM Sans', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#a8a29e', marginBottom: 14, textTransform: 'uppercase' }}>Action required</div>

        {localStatus === 'OPEN' && !canTrigger && (
          <div>
            <div style={{ fontFamily: 'DM Sans', fontSize: 14, color: '#44403c', marginBottom: 12 }}>
              Waiting for <strong>{bounty.minSubmissions - bounty.validatedSubmissions}</strong> more validated submissions before computation can begin.
            </div>
            <div style={{ height: 6, background: '#f0ede8', borderRadius: 3, marginBottom: 6 }}>
              <div style={{ height: '100%', width: `${Math.min((bounty.validatedSubmissions / bounty.minSubmissions) * 100, 100)}%`, background: accentColor, borderRadius: 3 }} />
            </div>
            <div style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#a8a29e' }}>{bounty.validatedSubmissions} / {bounty.minSubmissions} minimum</div>
          </div>
        )}

        {localStatus === 'OPEN' && canTrigger && (
          <div>
            <div style={{ fontFamily: 'DM Sans', fontSize: 14, color: '#44403c', marginBottom: 16 }}>
              You have enough validated submissions. Trigger the computation to start processing.
            </div>
            <button onClick={triggerCompute} style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: accentColor, color: '#fff', fontFamily: 'DM Sans', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Trigger computation →
            </button>
          </div>
        )}

        {localStatus === 'COMPUTING' && (
          <div>
            <div style={{ fontFamily: 'DM Sans', fontSize: 14, color: '#44403c', marginBottom: 12 }}>
              {cursor < bounty.validatedSubmissions
                ? `Process batches until all ${bounty.validatedSubmissions.toLocaleString()} submissions are consumed. Each batch is a separate transaction.`
                : 'All batches processed. Click Finalize to produce results.'}
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#78716c' }}>Batch progress</span>
                <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#78716c' }}>{cursor.toLocaleString()} / {bounty.validatedSubmissions.toLocaleString()}</span>
              </div>
              <div style={{ height: 8, background: '#f0ede8', borderRadius: 4 }}>
                <div style={{ height: '100%', width: `${computeProgress}%`, background: '#3b82f6', borderRadius: 4, transition: 'width 0.5s ease' }} />
              </div>
            </div>
            {cursor < bounty.validatedSubmissions ? (
              <button onClick={processBatch} disabled={processing} style={{
                padding: '11px 24px', borderRadius: 10, border: 'none',
                background: processing ? '#e8e4e0' : '#3b82f6', color: processing ? '#a8a29e' : '#fff',
                fontFamily: 'DM Sans', fontSize: 13, fontWeight: 600, cursor: processing ? 'default' : 'pointer',
              }}>
                {processing ? 'Processing…' : `Process next batch (${Math.min(batchSize, bounty.validatedSubmissions - cursor)} records)`}
              </button>
            ) : (
              <button onClick={finalize} disabled={processing} style={{
                padding: '11px 24px', borderRadius: 10, border: 'none',
                background: processing ? '#e8e4e0' : accentColor, color: processing ? '#a8a29e' : '#fff',
                fontFamily: 'DM Sans', fontSize: 13, fontWeight: 600, cursor: processing ? 'default' : 'pointer',
              }}>
                {processing ? 'Finalizing…' : 'Finalize & reveal results'}
              </button>
            )}
          </div>
        )}

        {localStatus === 'COMPLETED' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7l3 3 5-5" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <span style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#44403c' }}>Computation complete. Aggregate results are displayed below.</span>
          </div>
        )}
      </div>

      {/* Results */}
      {localStatus === 'COMPLETED' && bounty.results && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #ede9e4', padding: '24px', animation: 'fadeIn 0.4s ease' }}>
          <div style={{ fontFamily: 'DM Sans', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#a8a29e', marginBottom: 18, textTransform: 'uppercase' }}>Aggregate results</div>
          <div style={{ padding: '10px 14px', borderRadius: 8, background: accentLight, marginBottom: 18, display: 'flex', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginTop: 1, flexShrink: 0 }}>
              <circle cx="7" cy="7" r="6" stroke={accentColor} strokeWidth="1.2" />
              <path d="M7 6v4M7 4.5v.5" stroke={accentColor} strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: accentColor, lineHeight: 1.5 }}>These are cohort-level statistics. No individual record is addressable or recoverable from these numbers.</span>
          </div>

          {bounty.template === 'aggregate_stats' && bounty.results.fields && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bounty.results.fields.map(f => (
                <div key={f.name} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr 1fr', gap: 10, padding: '12px 14px', borderRadius: 9, background: '#faf8f5' }}>
                  <span style={{ fontFamily: 'DM Sans', fontSize: 12, fontWeight: 600, color: '#1c1917' }}>{f.name}</span>
                  {[['Mean', f.mean], ['Min', f.min], ['Max', f.max]].map(([lbl, val]) => (
                    <div key={lbl}>
                      <div style={{ fontFamily: 'Playfair Display', fontSize: 18, fontWeight: 500, color: accentColor }}>{val}</div>
                      <div style={{ fontFamily: 'DM Sans', fontSize: 10, color: '#a8a29e' }}>{lbl}</div>
                    </div>
                  ))}
                </div>
              ))}
              <div style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#a8a29e', marginTop: 4 }}>Based on {bounty.validatedSubmissions.toLocaleString()} validated records</div>
            </div>
          )}

          {bounty.template === 'eligibility_screening' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'Eligible count', value: bounty.results.eligibleCount?.toLocaleString(), sub: 'Matched all criteria' },
                { label: 'Valid submissions', value: bounty.results.validCount?.toLocaleString(), sub: 'Passed range check' },
              ].map(c => (
                <div key={c.label} style={{ padding: '20px', borderRadius: 12, background: '#faf8f5', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Playfair Display', fontSize: 36, fontWeight: 500, color: accentColor }}>{c.value}</div>
                  <div style={{ fontFamily: 'DM Sans', fontSize: 12, fontWeight: 600, color: '#44403c', marginTop: 4 }}>{c.label}</div>
                  <div style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#a8a29e' }}>{c.sub}</div>
                </div>
              ))}
            </div>
          )}

          {bounty.template === 'risk_scoring' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { label: 'Avg risk score', value: bounty.results.avgRiskScore },
                { label: 'Total weighted sum', value: Number(bounty.results.totalWeightedSum).toLocaleString() },
                { label: 'Valid records', value: Number(bounty.results.validCount).toLocaleString() },
              ].map(c => (
                <div key={c.label} style={{ padding: '20px', borderRadius: 12, background: '#faf8f5', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Playfair Display', fontSize: 28, fontWeight: 500, color: accentColor }}>{c.value}</div>
                  <div style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#78716c', marginTop: 4 }}>{c.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── OrgSection router ────────────────────────────────────────────────────────
function OrgSection({ accent, navigate }) {
  const [view, setView] = React.useState('list'); // list | create | detail
  const [selectedId, setSelectedId] = React.useState(null);
  const [bounties, setBounties] = React.useState(ORG_BOUNTIES_INIT);

  if (view === 'create') return (
    <CreateBountyWizard accent={accent}
      onComplete={form => {
        const newB = {
          id: 'ob' + Date.now(),
          title: form.description?.slice(0, 40) || 'New Study',
          description: form.description || '',
          fields: form.fields,
          template: form.template,
          templateLabel: TEMPLATES.find(t => t.id === form.template)?.label,
          pricePerRecord: parseFloat(form.pricePerRecord) || 3,
          escrow: parseFloat(form.pricePerRecord) * parseFloat(form.maxSubmissions) || 3000,
          escrowUsed: 0,
          minSubmissions: parseInt(form.minSubmissions) || 100,
          maxSubmissions: parseInt(form.maxSubmissions) || 1000,
          totalSubmissions: 0, validatedSubmissions: 0,
          deadline: Date.now() + (parseInt(form.deadlineDays) || 30) * 86400000,
          status: 'OPEN', batchCursor: 0, results: null,
        };
        setBounties(bs => [newB, ...bs]);
        setView('list');
      }}
      onCancel={() => setView('list')}
    />
  );

  if (view === 'detail') return (
    <OrgBountyDetail bountyId={selectedId} bounties={bounties} setBounties={setBounties} accent={accent} onBack={() => setView('list')} />
  );

  return (
    <OrgBountyList bounties={bounties} accent={accent}
      onSelect={id => { setSelectedId(id); setView('detail'); }}
      onCreate={() => setView('create')}
    />
  );
}

Object.assign(window, { OrgSection });
