import { useMemo, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import {
  ArrowRight, BarChart3, Camera, Check, ChevronLeft, CircleHelp, Compass,
  Gauge, Link, RotateCcw, X
} from 'lucide-react'
import './App.css'

const axes = [
  { id: 'complexity', icon: '🧠', name: 'Solution complexity', low: 'Instant utility · minimal setup', high: 'Deep configuration · long implementation', hint: 'How hard is it to understand, evaluate, implement, and get value?' },
  { id: 'atom', icon: '🧱', name: 'Atomizability', low: 'Requires org-wide coordination', high: 'One user or team can start', hint: 'Can someone adopt independently, or does the whole organization need to align?' },
  { id: 'technical', icon: '🛠️', name: 'User technical skill', low: 'Non-technical users', high: 'Power users can self-serve', hint: 'Can your user evaluate and implement the product on their own?' },
  { id: 'power', icon: '🏛️', name: 'Internal user power', low: 'User must sell up', high: 'User can champion or buy', hint: 'Does the core user have authority or influence over the purchase?' },
  { id: 'ltv', icon: '💰', name: 'Transaction size / LTV', low: 'Low value · high volume', high: 'High value · long payback', hint: 'How much revenue does a customer generate over their lifetime?' },
  { id: 'maturity', icon: '🧭', name: 'Category maturity', low: 'New category · needs education', high: 'Known category · budget exists', hint: 'Is this category understood and budgeted, or still being defined?' },
  { id: 'urgency', icon: '🔥', name: 'Urgency / pain', low: 'Nice-to-have', high: 'Mission-critical', hint: 'How urgent and painful is the problem you solve?' },
  { id: 'frequency', icon: '🔁', name: 'Frequency of use', low: 'Episodic', high: 'Daily / continuous workflow', hint: 'How often does the product appear in a customer’s workflow?' },
  { id: 'budget', icon: '🧾', name: 'Budget ownership', low: 'Fragmented · many stakeholders', high: 'Centralized · clear buyer', hint: 'Is there a single budget owner or distributed stakeholders?' },
  { id: 'virality', icon: '🦠', name: 'Intrinsic virality', low: 'Usage stays private', high: 'Usage creates exposure', hint: 'Do shared links, outputs, or invites naturally reach non-users?' },
  { id: 'gravity', icon: '🧲', name: 'Integration gravity', low: 'Value in minutes', high: 'Heavy plumbing · sticky later', hint: 'How much external plumbing is needed before customers get value?' },
  { id: 'governance', icon: '🛡️', name: 'Governance sensitivity', low: 'Swipe card · under the radar', high: 'Security, IT & procurement', hint: 'Will the purchase summon legal, security, IT, or procurement?' },
]

const examples = [
  { name: 'Clari', motion: 'Sales-led', note: 'Complex, high-ACV revenue platform with deep CRM integration and enterprise governance.', scores: { complexity: 5, atom: 1, technical: 2, power: 5, ltv: 5, maturity: 4, urgency: 5, frequency: 4, budget: 5, virality: 1, gravity: 5, governance: 5 } },
  { name: 'Fathom', motion: 'PLG', note: 'Instant, individual call-note utility where every shared summary creates distribution.', scores: { complexity: 1, atom: 5, technical: 2, power: 2, ltv: 2, maturity: 5, urgency: 3, frequency: 5, budget: 1, virality: 5, gravity: 1, governance: 2 } },
  { name: 'Notion', motion: 'PLG → Sales', note: 'A bottom-up workspace that spreads through teams before consolidating enterprise spend.', scores: { complexity: 2, atom: 5, technical: 2, power: 2, ltv: 2, maturity: 3, urgency: 1, frequency: 5, budget: 1, virality: 4, gravity: 2, governance: 2 } },
  { name: 'Clay', motion: 'Hybrid + Channel', note: 'A technical, integration-heavy product that benefits from sales assist and implementation partners.', scores: { complexity: 4, atom: 2, technical: 5, power: 3, ltv: 4, maturity: 2, urgency: 3, frequency: 4, budget: 2, virality: 2, gravity: 5, governance: 3 } },
]

const motions = {
  plg: { name: 'Product-led growth', accent: '#BEF264', color: '#203404', description: 'Let users experience the aha moment before a human ever enters the picture.', signals: ['atom', 'technical', 'power', 'frequency', 'virality'], tactics: ['Make time-to-value painfully short', 'Design a free-to-team expansion path', 'Instrument activation, not just signups'] },
  sales: { name: 'Sales-led', accent: '#FB923C', color: '#3D1A05', description: 'Win through discovery, consensus-building, and a commercial case strong enough to move a buying group.', signals: ['complexity', 'ltv', 'gravity', 'governance', 'urgency'], tactics: ['Sell to the economic buyer', 'Bring an SE into evaluation early', 'Build a multi-threaded champion map'] },
  hybrid: { name: 'Hybrid: PLG → Sales', accent: '#A78BFA', color: '#231440', description: 'Use a self-serve wedge to find demand, then help the account navigate the enterprise-sized decision.', signals: ['atom', 'technical', 'ltv', 'gravity', 'governance'], tactics: ['Qualify product signals for sales', 'Create team-level conversion moments', 'Make expansion ROI easy to prove'] },
  channel: { name: 'Channel-led', accent: '#67E8F9', color: '#083344', description: 'Let implementation partners, agencies, or resellers absorb complexity and extend your reach.', signals: ['gravity', 'complexity', 'ltv', 'technical'], tactics: ['Recruit partners around a repeatable use case', 'Package implementation with the product', 'Create partner-sourced pipeline incentives'] },
  content: { name: 'Content-led', accent: '#FDE047', color: '#422006', description: 'Educate a market that is researching, learning, or still finding language for the problem.', signals: ['maturity', 'urgency', 'technical'], tactics: ['Own the category vocabulary', 'Publish use-case proof, not generic thought leadership', 'Turn learning into product activation'] },
  community: { name: 'Community-led', accent: '#F9A8D4', color: '#500724', description: 'Build an enthusiast network that teaches, validates, and spreads the product alongside you.', signals: ['technical', 'atom', 'virality', 'frequency'], tactics: ['Give power users a stage', 'Create artifacts members want to share', 'Turn experts into ecosystem partners'] },
}

function encodeAnswers(answers) {
  const value = axes.reduce((total, axis) => total * 5 + ((answers[axis.id] ?? 3) - 1), 0)
  const bytes = String.fromCharCode((value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255)
  return btoa(bytes).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function readSharedAnswers() {
  try {
    const encoded = new URLSearchParams(window.location.search).get('r') || window.location.hash.slice(1)
    if (!encoded) return null
    if (encoded.startsWith('{') || encoded.startsWith('%7B')) return JSON.parse(decodeURIComponent(encoded))
    const binary = atob(encoded.replaceAll('-', '+').replaceAll('_', '/') + '==='.slice((encoded.length + 3) % 4))
    let value = 0
    for (let i = 0; i < binary.length; i += 1) value = value * 256 + binary.charCodeAt(i)
    const answers = {}
    for (let i = axes.length - 1; i >= 0; i -= 1) {
      answers[axes[i].id] = (value % 5) + 1
      value = Math.floor(value / 5)
    }
    return answers
  } catch { return null }
}

function calculate(answers) {
  const a = (id) => answers[id] ?? 3
  const inverse = (id) => 6 - a(id)
  const raw = {
    plg: inverse('complexity') * 1.5 + a('atom') * 1.8 + a('technical') + a('power') + inverse('ltv') * .5 + a('frequency') + a('virality') * 1.7 + inverse('gravity') * 1.3 + inverse('governance') * 1.3,
    sales: a('complexity') * 1.5 + inverse('atom') * 1.4 + inverse('technical') * .6 + inverse('power') + a('ltv') * 1.8 + a('urgency') * 1.4 + a('budget') + a('gravity') * 1.4 + a('governance') * 1.5,
    hybrid: a('atom') * 1.1 + a('technical') * .9 + a('ltv') * 1.3 + a('gravity') * 1.1 + a('governance') * 1.1 + a('frequency') + a('virality') * .6,
    channel: a('complexity') + a('ltv') * 1.2 + a('gravity') * 1.7 + a('technical') * .8 + a('governance') * .5,
    content: inverse('maturity') * 1.8 + inverse('urgency') * 1.2 + a('technical') * .6 + inverse('complexity') * .5,
    community: a('technical') * 1.2 + a('atom') * 1.3 + a('virality') * 1.7 + a('frequency') + inverse('governance') * .5,
  }
  const ranked = Object.entries(raw).sort(([, x], [, y]) => y - x)
  const total = Object.values(raw).reduce((sum, val) => sum + val, 0)
  return ranked.map(([key, value]) => ({ key, score: Math.round((value / total) * 100) }))
}

export default function App() {
  const sharedAnswers = readSharedAnswers()
  const [screen, setScreen] = useState(sharedAnswers ? 'result' : 'intro')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState(sharedAnswers || {})
  const [copied, setCopied] = useState(false)
  const ranking = useMemo(() => calculate(answers), [answers])
  const axis = axes[index]
  const answer = answers[axis?.id] ?? 3
  const update = (value) => setAnswers((current) => ({ ...current, [axis.id]: value }))
  const reset = () => { window.history.replaceState(null, '', window.location.pathname); setAnswers({}); setIndex(0); setScreen('intro') }

  if (screen === 'intro') return <main className="app"><Hero onStart={() => setScreen('quiz')} /></main>
  if (screen === 'result') return <main className="app"><Results ranking={ranking} answers={answers} onReset={reset} copied={copied} onCopy={() => { const link = `${window.location.origin}${window.location.pathname}?r=${encodeAnswers(answers)}`; navigator.clipboard?.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1600) }} /></main>

  return <main className="app quiz-shell">
    <header className="quiz-header"><button className="brand" onClick={() => setScreen('intro')}><span>GTM</span> PHYSICS <i /></button><div className="progress-label">DIAGNOSTIC <b>{String(index + 1).padStart(2, '0')} / {axes.length}</b></div><button className="exit" onClick={() => setScreen('intro')}><X size={17} /> Exit</button></header>
    <div className="progress-track"><span style={{ width: `${((index + 1) / axes.length) * 100}%` }} /></div>
    <section className="question-wrap">
      <div className="question-meta"><span className="axis-icon">{axis.icon}</span></div>
      <h1>{axis.name}</h1><p>{axis.hint}</p>
      <div className="spectrum-card"><div className="spectrum-head"><span>{axis.low}</span><span>{axis.high}</span></div><div className="range-row"><span>01</span><input aria-label={axis.name} type="range" min="1" max="5" step="1" value={answer} onChange={(e) => update(+e.target.value)} style={{ '--fill': `${((answer - 1) / 4) * 100}%` }} /><span>05</span></div><div className="range-steps">{[1,2,3,4,5].map((v) => <button key={v} onClick={() => update(v)} className={answer === v ? 'selected' : ''}>{v === 1 ? 'Low' : v === 5 ? 'High' : ''}</button>)}</div></div>
      <div className="question-footer"><button className="back" onClick={() => index ? setIndex(index - 1) : setScreen('intro')}><ChevronLeft size={18}/> Back</button><button className="next" onClick={() => index === axes.length - 1 ? setScreen('result') : setIndex(index + 1)}>{index === axes.length - 1 ? 'See my GTM motion' : 'Next axis'} <ArrowRight size={18}/></button></div>
    </section>
  </main>
}

function Hero({ onStart }) { return <><nav><button className="brand"><span>GTM</span> PHYSICS <i /></button></nav><section className="hero"><div className="hero-grid" /><div className="orb orb-one"/><div className="orb orb-two"/><div className="hero-copy"><h1>Find your<br/><em>natural motion.</em></h1><p>Every product has a different path to market. Map its commercial physics across 12 forces and discover the GTM motion that fits.</p><button className="start" onClick={onStart}>Run the diagnostic <ArrowRight size={19}/></button><div className="time"><Gauge size={16}/> 3 minutes · 12 decisions · zero fluff</div></div><div className="hero-card"><div className="radar"><span className="radar-ring r1"/><span className="radar-ring r2"/><span className="radar-ring r3"/><span className="radar-cross x"/><span className="radar-cross y"/><div className="radar-dot"/></div><div className="signal-label"><span className="pulse"/> GTM fit emerging</div></div></section><Credits /></> }

function Results({ ranking, answers, onReset, onCopy, copied }) {
  const primary = ranking[0], primaryMotion = motions[primary.key], runner = ranking.slice(1,3)
  const shareCard = useRef(null)
  const [saving, setSaving] = useState(false)
  const saveScreenshot = async () => {
    if (!shareCard.current) return
    setSaving(true)
    const canvas = await html2canvas(shareCard.current, { backgroundColor: '#171915', scale: 2 })
    const link = document.createElement('a')
    link.download = 'my-gtm-physics.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
    setSaving(false)
  }
  return <div className="results"><header className="result-header"><button className="brand"><span>GTM</span> PHYSICS <i /></button><button className="restart" onClick={onReset}><RotateCcw size={16}/> Run again</button></header><section className="result-hero" ref={shareCard}><div><h1>{primaryMotion.name}</h1><p>{primaryMotion.description}</p><div className="fit-score"><b>{primary.score}<small>%</small></b><span>motion<br/>fit score</span></div></div><div className="result-orbit"><div className="orbit-line"/><div className="orbit-core">{primary.score}<small>%</small><span>FIT</span></div><div className="orbit-tag top">{axes.find(a => a.id === primaryMotion.signals[0])?.icon} {axes.find(a => a.id === primaryMotion.signals[0])?.name}</div><div className="orbit-tag right">{axes.find(a => a.id === primaryMotion.signals[1])?.icon} {axes.find(a => a.id === primaryMotion.signals[1])?.name}</div><div className="orbit-tag bottom">{axes.find(a => a.id === primaryMotion.signals[2])?.icon} {axes.find(a => a.id === primaryMotion.signals[2])?.name}</div></div></section><section className="share-actions"><button onClick={saveScreenshot}><Camera size={16}/>{saving ? 'Creating image...' : 'Save result image'}</button><button onClick={onCopy}>{copied ? <><Check size={16}/> Link copied</> : <><Link size={16}/> Copy share link</>}</button></section><section className="result-content"><div className="playbook panel"><div className="panel-title"><Compass size={17}/> Your first moves</div>{primaryMotion.tactics.map((t,i) => <div className="tactic" key={t}><span>{String(i+1).padStart(2,'0')}</span>{t}<ArrowRight size={15}/></div>)}</div><div className="ranking panel"><div className="panel-title"><BarChart3 size={17}/> Your GTM mix</div>{ranking.slice(0,5).map((r,i) => <div className="motion-row" key={r.key}><div><b>{String(i+1).padStart(2,'0')}</b><span>{motions[r.key].name}</span></div><div className="bar"><i style={{width:`${Math.min(r.score * 2.7,100)}%`, background: motions[r.key].accent}}/></div><strong>{r.score}%</strong></div>)}</div></section><section className="secondary"><div><h2>Don’t run one motion.<br/><em>Run the right mix.</em></h2></div><div className="support-cards">{runner.map((r) => <article key={r.key} style={{'--accent': motions[r.key].accent, '--ink': motions[r.key].color}}><b>{motions[r.key].name}</b><p>{motions[r.key].description}</p></article>)}</div></section><section className="response-section"><div className="response-intro"><h2>The forces you<br/><em>reported.</em></h2><p>Use this snapshot to pressure-test your assumptions with customers and compare your product’s shape to familiar products.</p></div><ResponseMap answers={answers}/></section><section className="compare-section"><div className="compare-heading"><h2>Products with<br/><em>similar physics.</em></h2><p>These are directional comparisons based on the product profiles in the GTM Physics framework.</p></div><div className="example-grid">{examples.map((example) => <ExampleCard key={example.name} example={example} answers={answers}/>)}</div></section><section className="signal-strip"><div><CircleHelp size={20}/><span><b>Read the signal, not the score.</b> Your output is a directional starting point, not a substitute for talking to customers.</span></div></section><Credits /></div> }

function Credits() { return <footer className="credits"><span>Made with <b>♥</b> by <a href="https://x.com/regalstreak" target="_blank" rel="noreferrer">Neil · @regalstreak</a></span><span>Based on <a href="https://x.com/kazanjy" target="_blank" rel="noreferrer">Pete Kazanjy’s GTM Physics framework · @kazanjy</a></span></footer> }

function ResponseMap({ answers }) { return <div className="response-map">{axes.map((axis) => { const score = answers[axis.id] ?? 3; return <div className="response-axis" key={axis.id}><span className="response-name"><i>{axis.icon}</i>{axis.name}</span><div className="response-scale"><div className="response-line"/><span style={{ left: `${((score - 1) / 4) * 100}%` }} /></div><b>{score === 1 ? 'LOW' : score === 5 ? 'HIGH' : `${score}/5`}</b></div> })}</div> }

function ExampleCard({ example, answers }) { const distance = axes.reduce((total, axis) => total + Math.abs((answers[axis.id] ?? 3) - example.scores[axis.id]), 0); const similarity = Math.round(100 - (distance / (axes.length * 4)) * 100); const closest = axes.slice().sort((a,b) => Math.abs((answers[a.id] ?? 3) - example.scores[a.id]) - Math.abs((answers[b.id] ?? 3) - example.scores[b.id])).slice(0, 2); return <article className="example-card"><div className="example-card-top"><span>{example.motion}</span><b>{similarity}% <small>similar</small></b></div><h3>{example.name}</h3><p>{example.note}</p><div className="similar-signals">{closest.map(axis => <span key={axis.id}>{axis.icon} {axis.name}</span>)}</div></article> }
