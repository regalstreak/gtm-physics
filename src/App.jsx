import { useMemo, useState } from 'react'
import {
  ArrowRight, BarChart3, Check, ChevronLeft, CircleHelp, Compass,
  Copy, Gauge, RotateCcw, Sparkles, Target, X
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

const motions = {
  plg: { name: 'Product-led growth', eyebrow: 'Self-serve first', accent: '#BEF264', color: '#203404', description: 'Let users experience the aha moment before a human ever enters the picture.', signals: ['atom', 'technical', 'power', 'frequency', 'virality'], tactics: ['Make time-to-value painfully short', 'Design a free-to-team expansion path', 'Instrument activation, not just signups'] },
  sales: { name: 'Sales-led', eyebrow: 'Human-led conviction', accent: '#FB923C', color: '#3D1A05', description: 'Win through discovery, consensus-building, and a commercial case strong enough to move a buying group.', signals: ['complexity', 'ltv', 'gravity', 'governance', 'urgency'], tactics: ['Sell to the economic buyer', 'Bring an SE into evaluation early', 'Build a multi-threaded champion map'] },
  hybrid: { name: 'Hybrid: PLG → Sales', eyebrow: 'Land, prove, expand', accent: '#A78BFA', color: '#231440', description: 'Use a self-serve wedge to find demand, then help the account navigate the enterprise-sized decision.', signals: ['atom', 'technical', 'ltv', 'gravity', 'governance'], tactics: ['Qualify product signals for sales', 'Create team-level conversion moments', 'Make expansion ROI easy to prove'] },
  channel: { name: 'Channel-led', eyebrow: 'Partners as force multipliers', accent: '#67E8F9', color: '#083344', description: 'Let implementation partners, agencies, or resellers absorb complexity and extend your reach.', signals: ['gravity', 'complexity', 'ltv', 'technical'], tactics: ['Recruit partners around a repeatable use case', 'Package implementation with the product', 'Create partner-sourced pipeline incentives'] },
  content: { name: 'Content-led', eyebrow: 'Teach before you sell', accent: '#FDE047', color: '#422006', description: 'Educate a market that is researching, learning, or still finding language for the problem.', signals: ['maturity', 'urgency', 'technical'], tactics: ['Own the category vocabulary', 'Publish use-case proof, not generic thought leadership', 'Turn learning into product activation'] },
  community: { name: 'Community-led', eyebrow: 'Belonging as distribution', accent: '#F9A8D4', color: '#500724', description: 'Build an enthusiast network that teaches, validates, and spreads the product alongside you.', signals: ['technical', 'atom', 'virality', 'frequency'], tactics: ['Give power users a stage', 'Create artifacts members want to share', 'Turn experts into ecosystem partners'] },
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
  const [screen, setScreen] = useState('intro')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [copied, setCopied] = useState(false)
  const ranking = useMemo(() => calculate(answers), [answers])
  const axis = axes[index]
  const answer = answers[axis?.id] ?? 3
  const update = (value) => setAnswers((current) => ({ ...current, [axis.id]: value }))
  const reset = () => { setAnswers({}); setIndex(0); setScreen('intro') }

  if (screen === 'intro') return <main className="app"><Hero onStart={() => setScreen('quiz')} /></main>
  if (screen === 'result') return <main className="app"><Results ranking={ranking} answers={answers} onReset={reset} copied={copied} onCopy={() => { navigator.clipboard?.writeText(`My GTM Physics result: ${motions[ranking[0].key].name}. Top supporting motions: ${motions[ranking[1].key].name} and ${motions[ranking[2].key].name}.`); setCopied(true); setTimeout(() => setCopied(false), 1600) }} /></main>

  return <main className="app quiz-shell">
    <header className="quiz-header"><button className="brand" onClick={() => setScreen('intro')}><span>GTM</span> PHYSICS <i /></button><div className="progress-label">DIAGNOSTIC <b>{String(index + 1).padStart(2, '0')} / {axes.length}</b></div><button className="exit" onClick={() => setScreen('intro')}><X size={17} /> Exit</button></header>
    <div className="progress-track"><span style={{ width: `${((index + 1) / axes.length) * 100}%` }} /></div>
    <section className="question-wrap">
      <div className="question-meta"><span className="axis-number">AXIS {String(index + 1).padStart(2, '0')}</span><span className="axis-icon">{axis.icon}</span></div>
      <h1>{axis.name}</h1><p>{axis.hint}</p>
      <div className="spectrum-card"><div className="spectrum-head"><span>{axis.low}</span><span>{axis.high}</span></div><div className="range-row"><span>01</span><input aria-label={axis.name} type="range" min="1" max="5" step="1" value={answer} onChange={(e) => update(+e.target.value)} style={{ '--fill': `${((answer - 1) / 4) * 100}%` }} /><span>05</span></div><div className="range-steps">{[1,2,3,4,5].map((v) => <button key={v} onClick={() => update(v)} className={answer === v ? 'selected' : ''}>{v === 1 ? 'Low' : v === 5 ? 'High' : ''}</button>)}</div></div>
      <div className="question-footer"><button className="back" onClick={() => index ? setIndex(index - 1) : setScreen('intro')}><ChevronLeft size={18}/> Back</button><button className="next" onClick={() => index === axes.length - 1 ? setScreen('result') : setIndex(index + 1)}>{index === axes.length - 1 ? 'See my GTM motion' : 'Next axis'} <ArrowRight size={18}/></button></div>
    </section>
  </main>
}

function Hero({ onStart }) { return <><nav><button className="brand"><span>GTM</span> PHYSICS <i /></button><div className="nav-note">A 12-axis diagnostic</div></nav><section className="hero"><div className="hero-grid" /><div className="orb orb-one"/><div className="orb orb-two"/><div className="hero-copy"><div className="kicker"><Sparkles size={15}/> How your product wants to be sold</div><h1>Find your<br/><em>natural motion.</em></h1><p>Every product has a different path to market. Map its commercial physics across 12 forces—and discover the GTM motion that fits.</p><button className="start" onClick={onStart}>Run the diagnostic <ArrowRight size={19}/></button><div className="time"><Gauge size={16}/> 3 minutes · 12 decisions · zero fluff</div></div><div className="hero-card"><div className="card-top"><span>LIVE SIGNAL</span><b>01.00</b></div><div className="radar"><span className="radar-ring r1"/><span className="radar-ring r2"/><span className="radar-ring r3"/><span className="radar-cross x"/><span className="radar-cross y"/><div className="radar-dot"/></div><div className="signal-label"><span className="pulse"/> GTM fit emerging</div></div></section><footer><span>Inspired by the GTM Physics framework</span><span>SCROLL TO BEGIN <ArrowRight size={14}/></span></footer></> }

function Results({ ranking, onReset, onCopy, copied }) { const primary = ranking[0], primaryMotion = motions[primary.key], runner = ranking.slice(1,3); return <div className="results"><header className="result-header"><button className="brand"><span>GTM</span> PHYSICS <i /></button><button className="restart" onClick={onReset}><RotateCcw size={16}/> Run again</button></header><section className="result-hero"><div><div className="kicker"><Target size={15}/> Your strongest GTM force</div><h1>{primaryMotion.name}</h1><p>{primaryMotion.description}</p><div className="fit-score"><b>{primary.score}<small>%</small></b><span>motion<br/>fit score</span></div></div><div className="result-orbit"><div className="orbit-line"/><div className="orbit-core">{primary.score}<small>%</small><span>FIT</span></div><div className="orbit-tag top">{axes.find(a => a.id === primaryMotion.signals[0])?.icon} {axes.find(a => a.id === primaryMotion.signals[0])?.name}</div><div className="orbit-tag right">{axes.find(a => a.id === primaryMotion.signals[1])?.icon} {axes.find(a => a.id === primaryMotion.signals[1])?.name}</div><div className="orbit-tag bottom">{axes.find(a => a.id === primaryMotion.signals[2])?.icon} {axes.find(a => a.id === primaryMotion.signals[2])?.name}</div></div></section><section className="result-content"><div className="playbook panel"><div className="panel-title"><Compass size={17}/> Your first moves</div>{primaryMotion.tactics.map((t,i) => <div className="tactic" key={t}><span>{String(i+1).padStart(2,'0')}</span>{t}<ArrowRight size={15}/></div>)}</div><div className="ranking panel"><div className="panel-title"><BarChart3 size={17}/> Your GTM mix</div>{ranking.slice(0,5).map((r,i) => <div className="motion-row" key={r.key}><div><b>{String(i+1).padStart(2,'0')}</b><span>{motions[r.key].name}</span></div><div className="bar"><i style={{width:`${Math.min(r.score * 2.7,100)}%`, background: motions[r.key].accent}}/></div><strong>{r.score}%</strong></div>)}</div></section><section className="secondary"><div><span className="eyebrow">SUPPORTING MOTIONS</span><h2>Don’t run one motion.<br/><em>Run the right mix.</em></h2></div><div className="support-cards">{runner.map((r) => <article key={r.key} style={{'--accent': motions[r.key].accent, '--ink': motions[r.key].color}}><span>{motions[r.key].eyebrow}</span><b>{motions[r.key].name}</b><p>{motions[r.key].description}</p></article>)}</div></section><section className="signal-strip"><div><CircleHelp size={20}/><span><b>Read the signal, not the score.</b> Your output is a directional starting point—not a substitute for talking to customers.</span></div><button onClick={onCopy}>{copied ? <><Check size={16}/> Copied</> : <><Copy size={16}/> Copy result</>}</button></section></div> }
