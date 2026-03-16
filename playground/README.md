# Autoresearch Research Showcase

This folder collects **small, reproducible research-style demos** used to showcase `omx autoresearch` on harder optimization problems.

Design goals:
- deterministic or seed-controlled evaluations
- small code footprint
- no large datasets checked into git
- no heavyweight runtime artifacts committed
- evaluator-driven keep/discard loops that are easy to inspect under `.omx/logs/autoresearch/`

## Showcase demos

### 1. OMX self-optimization
- Mission: `missions/in-action-cat-shellout-demo/`
- Evaluator: `scripts/eval-in-action-cat-shellout-demo.js`
- What it demonstrates: a tiny self-hosted code optimization loop where autoresearch removes an unnecessary shell-out from OMX itself.

### 2. Kaggle-style tabular ML optimization
- Demo code: `playground/ml_kaggle_demo/`
- Mission: `missions/ml-kaggle-model-optimization/`
- Evaluator: `scripts/eval-ml-kaggle-model-optimization.py`
- What it demonstrates: model-family / hyperparameter search on a deterministic tabular classification benchmark with a score-improvement keep policy.

### 3. Noisy high-dimensional Bayes-opt demo
- Demo code: `playground/bayesopt_highdim_demo/`
- Mission: `missions/noisy-bayesopt-highdim/`
- Evaluator: `scripts/eval-noisy-bayesopt-highdim.py`
- What it demonstrates: a harder black-box optimization task with noise, limited evaluation budget, and curse-of-dimensionality pressure. The successful autoresearch run switched from random search to a subspace-aware fixed-kernel GP with denoised incumbent selection.

### 4. Latent subspace discovery demo
- Demo code: `playground/bayesopt_latent_discovery_demo/`
- Mission: `missions/noisy-latent-subspace-discovery/`
- Evaluator: `scripts/eval-noisy-latent-subspace-discovery.py`
- What it demonstrates: a follow-on harder variant where useful structure is mixed through latent directions rather than directly exposed as obvious coordinates.

## How to run a showcase

Example:

```bash
omx autoresearch missions/noisy-bayesopt-highdim
```

Then inspect:

```bash
RUN_ID=$(find .omx/logs/autoresearch -maxdepth 1 -mindepth 1 -type d -printf '%f\n' | sort | tail -n 1)
cat .omx/logs/autoresearch/$RUN_ID/manifest.json
cat .omx/logs/autoresearch/$RUN_ID/candidate.json
cat .omx/logs/autoresearch/$RUN_ID/iteration-ledger.json
```

You can also run evaluators directly without the supervisor:

```bash
node scripts/eval-in-action-cat-shellout-demo.js
python3 scripts/eval-ml-kaggle-model-optimization.py
python3 scripts/eval-noisy-bayesopt-highdim.py
python3 scripts/eval-noisy-latent-subspace-discovery.py
```

## Repository hygiene

These showcases are meant to stay lightweight.

Please avoid committing:
- downloaded datasets
- large model artifacts
- benchmark output dumps
- generated caches like `__pycache__/`
- runtime autoresearch logs under `.omx/logs/`

Keep research state in code, configs, missions, and evaluator scripts; keep bulky runtime outputs local.
