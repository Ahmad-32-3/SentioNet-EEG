// Every number on this page lives here, in one place, on purpose.
//
// IMPORTANT: these are ILLUSTRATIVE constants, not measured results. The models
// in the CLAUDE.md spec (EEGNet, EEG Conformer) are not trained yet — training
// needs the full 43 GB CHB-MIT corpus and a GPU. The shapes below are chosen to
// match what the published CHB-MIT literature reports (event sensitivity in the
// 0.7–0.95 band, false alarms measured per hour, lead times of minutes), so the
// page teaches the real trade-offs without inventing a performance claim.
//
// When the pipeline is trained, `eval.py` overwrites these from the LOPO run and
// the captions drop the word "illustrative". Until then, every visual says so.

export const ILLUSTRATIVE = true

// The frozen prediction protocol from CLAUDE.md. Changing these means re-running,
// so they are stated once and referenced everywhere.
export const PROTOCOL = {
  sopMin: 30, // Seizure Occurrence Period: the window a valid alarm points at
  sphMin: 2, // Seizure Prediction Horizon: the gap before onset that is "too late"
  refractoryMin: 30,
  windowSec: 2, // raw EEG chopped into 2 s windows at 256 Hz
}

// The dataset, stated plainly and early (council: "22 kids, loud and early").
export const DATASET = {
  patients: 22,
  cases: 23, // chb01 and chb21 are the same child recorded twice
  edfFiles: 664,
  seizures: 198,
  sampleRateHz: 256,
  sizeGb: 42.6,
}

// The hero contrast. One held-out child, one seizure. Same time axis for both
// rows. Time is minutes relative to onset (0 = seizure starts, negative = before).
// The punchline: the score-fed forecast buys real warning; the raw-fed one only
// reacts once the seizure is basically underway.
export type Forecaster = {
  key: 'raw' | 'score'
  label: string
  blurb: string
  // sampled forecast trajectory: [minutesBeforeOnset, riskValue 0..1]
  trace: [number, number][]
  alarmMin: number | null // when the alarm crosses threshold, minutes before onset
  falseAlarmMin: number | null // a spurious cross that a real system would eat
  outcome: string
}

const THRESHOLD = 0.6

// Score-fed: rises smoothly, crosses the line ~11 min out, inside the warning band.
const scoreTrace: [number, number][] = [
  [-30, 0.08], [-27, 0.09], [-24, 0.12], [-21, 0.16], [-18, 0.22],
  [-15, 0.34], [-12.5, 0.52], [-11, 0.63], [-9, 0.71], [-6, 0.8],
  [-3, 0.88], [-1, 0.93], [0, 0.96],
]

// Raw-fed: noisy, flickers up and back down (a false alarm), then only clears the
// line ~1 min before onset — inside the "too late" zone. Detection, not prediction.
const rawTrace: [number, number][] = [
  [-30, 0.18], [-27, 0.41], [-25, 0.64], [-24, 0.47], [-22, 0.3],
  [-19, 0.52], [-17, 0.38], [-14, 0.29], [-11, 0.44], [-8, 0.35],
  [-5, 0.49], [-3, 0.55], [-1.2, 0.66], [0, 0.9],
]

export const FORECASTERS: Forecaster[] = [
  {
    key: 'raw',
    label: 'Forecast from raw EEG windows',
    blurb: 'The predictor reads the raw signal directly.',
    trace: rawTrace,
    alarmMin: -1.2,
    falseAlarmMin: -25,
    outcome: 'One false alarm at 25 min, then the real cross lands 1.2 min out, inside the too-late window. That is detection, not a warning.',
  },
  {
    key: 'score',
    label: "Forecast from the detector's score",
    blurb: 'The predictor reads the calibrated P(seizure) trajectory instead.',
    trace: scoreTrace,
    alarmMin: -11,
    falseAlarmMin: null,
    outcome: 'One clean rise, crossing 11 min before onset, inside the warning band. That is 11 minutes of usable lead time.',
  },
]

export const HERO = { threshold: THRESHOLD, leadMinScore: 11, leadMinRaw: 0 }

// Per-fold spread (council/Contrarian: show the distribution, never a lone mean).
// One point per held-out child. Lead time in minutes; 0 means the alarm never
// beat the too-late window on that child (a miss). The story is in the spread.
export const FOLD_LEAD = {
  score: [11, 8.5, 14, 6, 12, 9.5, 0, 13, 7, 10.5, 4, 0],
  raw: [1.2, 0, 3, 0, 0.5, 2, 0, 4, 0, 1, 0, 0],
}

// Headline table, same LOPO splits, illustrative shapes.
export const ABLATION_TABLE = [
  { metric: 'Median lead time (min)', raw: '~1', score: '~10', better: 'score' },
  { metric: 'Children with any warning', raw: '5 / 12', score: '10 / 12', better: 'score' },
  { metric: 'False alarms', raw: 'higher', score: 'lower', better: 'score' },
  { metric: 'Event sensitivity (detection)', raw: 'same encoder', score: 'same encoder', better: 'tie' },
]

// The two-stage pipeline, for the solution diagram.
export const PIPELINE = [
  { id: 'edf', label: 'Raw EEG', sub: '256 Hz, 10–20 montage' },
  { id: 'win', label: '2 s windows', sub: 'drop dummy channels' },
  { id: 'enc', label: 'Encoder', sub: 'EEGNet / Conformer' },
  { id: 'det', label: 'Detector', sub: 'calibrated P(seizure)' },
  { id: 'buf', label: 'Score buffer', sub: 'last 5–10 min' },
  { id: 'fc', label: 'Forecaster', sub: 'tiny TCN / GRU' },
] as const

// The scaling ladder for the future section. Concrete rungs, honest distance.
export const LADDER = [
  {
    n: 22,
    title: 'Where it is now',
    detail: '22 children, one public dataset (CHB-MIT), recorded in-hospital around known seizures. Enough to test the method, not enough to trust a number.',
    state: 'done',
  },
  {
    n: 1000,
    title: 'More children, more sites',
    detail: 'Retrain and re-run LOPO across 1,000+ patients from several hospitals (for example TUH EEG, SeizeIT2). The question: does the score-beats-raw gap survive a bigger, messier population?',
    state: 'next',
  },
  {
    n: 0,
    title: 'Continuous, at-home data',
    detail: 'CHB-MIT files are clipped around seizures, so a "false alarms per day" figure here is not a real day. Trustworthy false-alarm rates need long ambulatory recordings from wearable or minimal-electrode EEG.',
    state: 'next',
  },
  {
    n: 0,
    title: 'Prospective, online test',
    detail: 'Run the frozen model forward in time on new patients it has never seen, scoring alarms as they would fire live. Report sensitivity at a fixed false-alarm budget. This is the number a clinician would actually ask for.',
    state: 'future',
  },
  {
    n: 0,
    title: 'Regulated software, then reimbursement',
    detail: 'A seizure-warning tool would be Software as a Medical Device (likely a De Novo or 510(k) path in the US). Only after that does a Medicare coverage and coding conversation begin. Years away, and a different dataset away.',
    state: 'future',
  },
]
