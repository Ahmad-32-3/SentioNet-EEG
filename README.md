# SentioNet

I train on raw scalp EEG from the CHB-MIT epilepsy recordings and try to flag the minutes before a seizure. The test patients are people the model never saw, so it cannot just memorize one brain.

Detection learns a seizureness score on held-out patients. Prediction is a short-horizon forecast of that score, not a second network pretending the files contain preictal labels. This is research software, not a medical device.

## Data

[CHB-MIT Scalp EEG Database v1.0.0](https://physionet.org/content/chbmit/1.0.0/) ([ODC-By 1.0](https://physionet.org/content/chbmit/view-license/1.0.0/)). `chb01` and `chb21` are the same person and are never split across train and test.

Reported numbers are leave-one-patient-out. Hour or file holdout inside one patient is only a debug check.

## Stack

MNE for the recordings. PyTorch EEGNet as the baseline. EEG Conformer as the primary model.

## Run

```bash
npm --prefix web install
npm --prefix web run dev
```

Walkthrough copy lives in `web/`. Numbers there stay illustrative until an evaluation run overwrites them.

## Layout

- `web/` case-study page
- Protocol: SOP 30 min, SPH 2 min, refractory 30 min
