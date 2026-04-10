import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWorkflowTransitionError,
  evaluateWorkflowTransition,
} from '../workflow-transition.js';

describe('workflow transition rules', () => {
  it('allows the approved overlap matrix and denies unsupported combinations', () => {
    const cases: Array<{
      current: string[];
      requested: 'team' | 'ralph' | 'ultrawork' | 'autopilot' | 'autoresearch';
      allowed: boolean;
      resulting: string[];
    }> = [
      { current: [], requested: 'team', allowed: true, resulting: ['team'] },
      { current: ['team'], requested: 'ralph', allowed: true, resulting: ['team', 'ralph'] },
      { current: ['ralph'], requested: 'team', allowed: true, resulting: ['ralph', 'team'] },
      { current: ['team'], requested: 'ultrawork', allowed: true, resulting: ['team', 'ultrawork'] },
      { current: ['ultrawork'], requested: 'team', allowed: true, resulting: ['ultrawork', 'team'] },
      { current: ['ralph'], requested: 'ultrawork', allowed: false, resulting: ['ralph'] },
      { current: ['ultrawork'], requested: 'ralph', allowed: false, resulting: ['ultrawork'] },
      { current: ['autopilot'], requested: 'team', allowed: false, resulting: ['autopilot'] },
      { current: ['team'], requested: 'autopilot', allowed: false, resulting: ['team'] },
      { current: ['autoresearch'], requested: 'ralph', allowed: false, resulting: ['autoresearch'] },
      { current: ['team', 'ralph'], requested: 'ultrawork', allowed: false, resulting: ['team', 'ralph'] },
      { current: ['team', 'ultrawork'], requested: 'ralph', allowed: false, resulting: ['team', 'ultrawork'] },
    ];

    for (const testCase of cases) {
      const decision = evaluateWorkflowTransition(testCase.current, testCase.requested);
      assert.equal(decision.allowed, testCase.allowed, `${testCase.current.join(',')} -> ${testCase.requested}`);
      assert.deepEqual(decision.resultingModes, testCase.resulting, `${testCase.current.join(',')} -> ${testCase.requested}`);
    }
  });

  it('builds actionable denial guidance that names both clearing paths', () => {
    const error = buildWorkflowTransitionError(['team'], 'autopilot', 'start');
    assert.match(error, /Cannot start autopilot: team is already active\./);
    assert.match(error, /Unsupported workflow overlap: team \+ autopilot\./);
    assert.match(error, /Current state is unchanged\./);
    assert.match(error, /`omx state clear --mode <mode>`/);
    assert.match(error, /`omx_state\.\*` MCP tools/);
  });
});
