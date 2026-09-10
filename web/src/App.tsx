import { AblationTimeline } from './components/story/AblationTimeline'
import { FoldSpreadViz } from './components/story/FoldSpreadViz'
import { LopoSplitViz } from './components/story/LopoSplitViz'
import { ScalingLadderViz } from './components/story/ScalingLadderViz'
import { StackGrid } from './components/story/StackGrid'
import { StoryBeat } from './components/story/StoryBeat'
import { TwoStageViz } from './components/story/TwoStageViz'
import { WarningGapViz } from './components/story/WarningGapViz'
import { ABLATION_TABLE, DATASET } from './data'

const TOC = [
  { href: '#problem', label: 'The problem' },
  { href: '#solution', label: 'The solution' },
  { href: '#result', label: 'The result' },
  { href: '#decisions', label: 'Design decisions' },
  { href: '#stack', label: 'Tech stack' },
  { href: '#future', label: 'Toward healthcare' },
]

export function App() {
  return (
    <>
      <a className="skip-link" href="#problem">
        Skip to the walkthrough
      </a>

      <div className="masthead">
        <div className="masthead__inner">
          <div className="masthead__mark">
            <b>SentioNet</b> · a walkthrough
          </div>
          <ul className="masthead__nav">
            <li>
              <a href="#problem">problem</a>
            </li>
            <li>
              <a href="#result">result</a>
            </li>
            <li>
              <a href="#decisions">decisions</a>
            </li>
            <li>
              <a href="#future">healthcare</a>
            </li>
          </ul>
        </div>
      </div>

      <main className="page">
        <header className="page-hero">
          <p className="meta">Walkthrough · seizure detection and forecasting on EEG</p>
          <h1>Can a risk score forecast a seizure better than the raw brainwaves it came from?</h1>
          <p className="lead">
            This project reads scalp EEG (the wavy brain-signal recording) from children with
            epilepsy, learns a moment-by-moment <em>seizure risk score</em>, and then tries to
            forecast a seizure by watching that score climb. Forecasting from that score beats
            forecasting from the raw signal. Below I show why, on one timeline, and what would have to
            change before anything like it goes near a clinic.
          </p>
          <p className="intro-detail">
            It is a portfolio project on one public dataset: {DATASET.patients} children,{' '}
            {DATASET.seizures} seizures. It is <strong>not a medical device</strong>, I have not tested
            it on new patients in real time, and the numbers here are illustrative while the models
            finish training. I define each term in plain words the first time it appears.
          </p>
          <nav aria-label="On this page">
            <ul className="toc">
              {TOC.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <StoryBeat
          id="problem"
          kicker="The problem"
          title="A seizure gives almost no warning"
          caption="An illustrative EEG trace. It stays ordinary, then erupts at onset. The quiet stretch before it is where any warning would have to come from."
          visual={<WarningGapViz />}
        >
          <p>
            About 50 million people live with epilepsy, and roughly one in three still have seizures
            that medication cannot fully control. For them the worst part is the unpredictability.
            Never knowing when the next seizure hits is what pushes someone to avoid stairs, swimming,
            driving, or being home alone, and it is behind the rare cases of sudden death in epilepsy.
          </p>
          <p>
            Even a few minutes of warning would change the day: time to sit down, move away from a
            stove, call someone, or reach for medication. So the question is whether the quiet minutes
            before a seizure carry a signal we can read.
          </p>
          <p>
            The obvious idea is to point a model straight at the raw EEG and ask &quot;is a seizure
            coming?&quot;. That runs into two walls. First, the pre-seizure minutes usually look
            unremarkable on the raw trace. Second, the recordings never label a moment as
            &quot;pre-seizure&quot;. They only mark where each seizure starts and stops. If I train a
            model to spot a label that was never recorded, I mostly teach it to cheat.
          </p>
        </StoryBeat>

        <StoryBeat
          id="solution"
          kicker="The solution"
          title="Detect first, then forecast the detector's own score"
          caption="Two stages. Stage one is trained on real labels and outputs a calibrated seizure probability. Stage two forecasts where that probability is heading. The held-out child on the right is never in training."
          visual={
            <>
              <TwoStageViz />
              <LopoSplitViz />
            </>
          }
        >
          <p>
            I split the problem in two. Stage one is a plain <strong>detector</strong>: for every two
            seconds of EEG it outputs a number between 0 and 1, how seizure-like this moment looks. I
            calibrate that number so a 0.7 really means roughly a 70% kind of confidence, not just a
            big-ish score. This stage has real labels: a window either overlaps an annotated seizure
            or it does not.
          </p>
          <p>
            Stage two is the <strong>forecaster</strong>. It never sees a pre-seizure label, because
            none exists. Instead it watches the last few minutes of stage one&apos;s score and
            forecasts the trajectory: is this risk drifting up toward an alarm, or holding flat? The
            forecast is a bet on the score&apos;s future, not a second model pretending the files
            contain something they do not.
          </p>
          <p>
            Every number is measured <strong>leave-one-patient-out</strong>: the model trains on some
            children and is scored only on a child it has never seen. Testing on the same child you
            trained on would leak the answer and flatter the result. Two of the recordings (chb01 and
            chb21) are the same child twice, so they always leave together.
          </p>
        </StoryBeat>

        <StoryBeat
          id="result"
          kicker="The result"
          title="The score is a cleaner thing to forecast than the signal"
          caption="Illustrative, pending training. Same seizure, two forecasters, one time axis. The only change between the rows is what the forecaster reads: raw signal on top, calibrated score on the bottom."
          visual={
            <>
              <AblationTimeline />
              <FoldSpreadViz />
            </>
          }
        >
          <p>
            Both rows are the same seizure in the same held-out child. The top forecaster reads the
            raw EEG: it stays noisy, throws a false alarm, and only crosses the alarm line about a
            minute before onset, too late to help. The bottom forecaster reads the calibrated score:
            it rises once, cleanly, and crosses the line about eleven minutes out, inside the useful
            window.
          </p>
          <p>
            Why would a summary beat the data it was made from? Because the detector has already done
            the hard denoising. It squeezed a jittery 23-channel signal down to one steady line, so
            the forecaster rides a clean trend instead of fighting the noise every step. That is the
            part that carries over, and it is not about brains. The same move works anywhere you
            forecast a rare, high-stakes event from a noisy stream: a patient deteriorating in an ICU,
            a machine heading for failure, a transaction turning fraudulent. Detect the event,
            calibrate the score, then forecast the score. I proved it on EEG.
          </p>
          <p>
            I show the result as a spread, not a single number. The second chart is every held-out
            child on its own: most get real warning, a few get none. On {DATASET.patients} children,
            an average would hide the children the model fails, so I keep them in view.
          </p>
          <table className="choice-table">
            <caption className="sr-only">Raw-fed versus score-fed forecaster on the same LOPO splits</caption>
            <thead>
              <tr>
                <th scope="col">On the same splits</th>
                <th scope="col">Forecast from raw</th>
                <th scope="col">Forecast from score</th>
              </tr>
            </thead>
            <tbody>
              {ABLATION_TABLE.map((r) => (
                <tr key={r.metric}>
                  <td>{r.metric}</td>
                  <td style={{ color: r.better === 'raw' ? 'var(--good)' : 'var(--fg)' }}>{r.raw}</td>
                  <td style={{ color: r.better === 'score' ? 'var(--good)' : 'var(--fg)' }}>{r.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </StoryBeat>

        <StoryBeat
          id="decisions"
          kicker="Design decisions"
          title="The calls I made, in plain words"
          caption="What I first reached for, and what I shipped instead."
          visual={
            <div className="teach-card">
              <h3 className="teach-card__title">What I wanted vs. what I built</h3>
              <table className="choice-table">
                <caption className="sr-only">Design decisions</caption>
                <thead>
                  <tr>
                    <th scope="col">First instinct</th>
                    <th scope="col">What I built</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Train a model to spot &quot;pre-seizure&quot;</td>
                    <td>Detect seizures honestly, then forecast the detector&apos;s score</td>
                  </tr>
                  <tr>
                    <td>Report accuracy</td>
                    <td>Report per-child warning time and false alarms, leave-one-patient-out</td>
                  </tr>
                  <tr>
                    <td>Stack every architecture I could find</td>
                    <td>One small baseline, one real EEG model, and stop</td>
                  </tr>
                  <tr>
                    <td>One big average as the headline</td>
                    <td>The full spread across children, misses included</td>
                  </tr>
                </tbody>
              </table>
            </div>
          }
        >
          <p>
            <strong>I refused to invent a label.</strong> The tempting move is to paint the 30 minutes
            before each seizure as &quot;pre-seizure&quot; and train a classifier on it. But that
            window is a guess, not a recording, and a model will happily learn the guess. Splitting it
            into a detector and a separate forecaster keeps the real task and the guessed one apart, so
            I never train on the guess.
          </p>
          <p>
            <strong>I chose the split that can embarrass me.</strong> Leave-one-patient-out is harder
            than shuffling all the windows together, and it usually produces worse-looking numbers.
            That is the point. A number that survives a child the model never saw is a number I can
            defend.
          </p>
          <p>
            <strong>I kept the model boring.</strong> The 2026 literature is full of five-part
            architectures. I use a small, standard baseline (EEGNet) and one purpose-built EEG model
            (a Conformer). If the Conformer does not beat EEGNet on warning time, I report that. A
            stack of five architectures would only make the result harder to trust and harder to debug.
          </p>
          <p>
            <strong>I put a knob on the alarms.</strong> How jumpy the alarm is should be a dial a
            clinician sets, not a number I bake in. So the threshold that turns a rising score into an
            alarm is tunable, and I report how warning time trades against false alarms as you turn it.
          </p>
        </StoryBeat>

        <section className="story-beat" id="stack">
          <p className="story-kicker">Tech stack</p>
          <h2>What runs under the hood, and why</h2>
          <p className="stack-intro">
            I picked standard tools for this kind of data, so anyone can clone the repo and rerun the
            numbers. Each card is one tool: what it does in plain terms, then how it works.
          </p>
          <StackGrid />
        </section>

        <StoryBeat
          id="future"
          kicker="Toward healthcare"
          title="What it would take to trust this in a clinic, and eventually under Medicare"
          caption="Only the first rung is done. Each rung names what would have to be true to reach the next one."
          visual={<ScalingLadderViz />}
        >
          <p>
            Say the score-beats-raw result holds up. A lot still stands between it and a tool a
            clinician, or a payer like Medicare, could rely on, and most of that is data and evidence
            rather than code.
          </p>
          <p>
            <strong>It needs more children, from more hospitals.</strong> Twenty-two children from one
            center can show a method works; they cannot show it works for everyone. The first real test
            is re-running the same leave-one-patient-out study across a thousand or more patients from
            several hospitals, on datasets like TUH EEG or SeizeIT2, to see whether the gap survives a
            bigger, messier population.
          </p>
          <p>
            <strong>A real false-alarm rate needs continuous recordings.</strong> The CHB-MIT files are
            clipped around seizures, so a &quot;false alarms per day&quot; figure computed here is not a
            real day. Getting that number right needs long ambulatory recordings, ideally from a
            comfortable wearable rather than a hospital cap, so we learn how often the alarm cries wolf
            during an ordinary day.
          </p>
          <p>
            <strong>Then it needs a prospective test, regulation, and reimbursement.</strong> The
            number a clinician wants is forward-looking: freeze the model, run it forward in time on new
            patients, and score alarms as they would fire live, reporting how many seizures it catches
            at a false-alarm budget people can live with. A tool that passes would be regulated software
            (in the US, likely a De Novo or 510(k) pathway), and only after clearance does a Medicare
            coverage and billing-code conversation begin. That is years away, and a different dataset
            away.
          </p>
        </StoryBeat>

        <footer style={{ borderTop: '1px solid var(--line-rule)', paddingTop: 'var(--space-6)', marginTop: 'var(--space-6)', color: 'var(--fg-low)', fontSize: 'var(--fs-sm)' }}>
          <p style={{ maxWidth: 'var(--measure)' }}>
            Data: CHB-MIT Scalp EEG Database v1.0.0 on PhysioNet (Guttag 2010; Shoeb 2009; Shoeb &amp;
            Guttag, ICML 2010), used under ODC-By 1.0. Not a medical device. Research and portfolio
            software only. Numbers on this page are illustrative until the models finish training,
            after which the evaluation run replaces them.
          </p>
        </footer>
      </main>
    </>
  )
}
