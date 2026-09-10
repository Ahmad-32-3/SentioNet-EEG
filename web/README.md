# ictal-risk forecast — walkthrough

A dark editorial walkthrough of the project: the problem, the two-stage solution
(detect, then forecast the detector's score), the hero ablation visual, the
design decisions, the stack, and an honest path toward healthcare.

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # tsc -b + vite build -> dist/
```

Vite + React 19 + TypeScript + Tailwind v4. No backend, no keys, no network at
runtime. Every number lives in [`src/data.ts`](src/data.ts) and is labeled
**illustrative** until the models in the repo root spec finish training, after
which the leave-one-patient-out evaluation run replaces those constants.

Not a medical device. Research and portfolio software only.
