// The tech stack as cards, not a bullet list. Each tool gets a plain-language
// line (what it does, for anyone) and a technical line (how, for engineers).

type Tool = {
  name: string
  tag: string
  plain: string
  tech: string
}

const TOOLS: Tool[] = [
  {
    name: 'MNE + numpy',
    tag: 'read',
    plain: 'Opens the raw EEG files and lines up the electrodes the same way every time.',
    tech: 'Parses the EDF recordings and applies the 10-20 montage. It fingerprints each channel set, so the one recording that swaps montage partway through (chb12) is skipped instead of silently glued together.',
  },
  {
    name: 'braindecode + PyTorch',
    tag: 'train',
    plain: 'The workbench the models are built and trained in.',
    tech: 'braindecode wraps standard EEG architectures over PyTorch, so a model is a short config rather than a network written from scratch. Training runs on GPU.',
  },
  {
    name: 'EEGNet',
    tag: 'baseline',
    plain: 'The small, well-known model the fancier one has to beat.',
    tech: 'A compact convolutional net for raw EEG that every reviewer recognizes. It sets the reference number on every leave-one-patient-out fold.',
  },
  {
    name: 'EEG Conformer',
    tag: 'primary',
    plain: 'The main model. It reads the shape of the brainwave, then how those shapes change over time.',
    tech: 'A convolutional front end for local waveform morphology feeding a short transformer for temporal context. Enough architecture to be interesting without turning into a five-part model zoo.',
  },
  {
    name: 'Temperature scaling + alarm knob',
    tag: 'calibrate',
    plain: "Turns the model's raw confidence into an honest probability, then adds one dial for how twitchy the alarm is.",
    tech: 'A single learned temperature fits the held-out validation scores so a 0.7 means roughly 70%. On top sits one tunable threshold that trades warning time against false alarms.',
  },
  {
    name: 'TCN / GRU forecaster',
    tag: 'forecast',
    plain: "A tiny model that watches the risk score's recent history and predicts where it is heading.",
    tech: 'A one-layer GRU or small temporal convolution over the last 5 to 10 minutes of the calibrated score. It stays small on purpose, because the heavy lifting already happened in the detector.',
  },
  {
    name: 'timescoring',
    tag: 'score',
    plain: 'Decides whether an alarm actually counts, by checking it lands on a real seizure.',
    tech: 'Event-level overlap scoring (the SzCORE convention), so a number that spikes far from any seizure never counts as a hit. This is what keeps the headline numbers honest.',
  },
]

export function StackGrid() {
  return (
    <ul className="stack-grid">
      {TOOLS.map((t) => (
        <li key={t.name} className="stack-tool">
          <div className="stack-tool__head">
            <span className="stack-tool__name">{t.name}</span>
            <span className="stack-tool__tag">{t.tag}</span>
          </div>
          <p className="stack-tool__plain">{t.plain}</p>
          <p className="stack-tool__tech">{t.tech}</p>
        </li>
      ))}
    </ul>
  )
}
