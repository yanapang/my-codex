import {
  teamWriteWorkerInbox as writeWorkerInbox,
  teamSendMessage as sendDirectMessage,
  teamBroadcast as broadcastMessage,
  teamMarkMessageNotified as markMessageNotified,
  teamEnqueueDispatchRequest as enqueueDispatchRequest,
  teamReadDispatchRequest as readDispatchRequest,
  teamTransitionDispatchRequest as transitionDispatchRequest,
  teamMarkDispatchRequestNotified as markDispatchRequestNotified,
  type TeamDispatchRequest,
  type TeamDispatchRequestInput,
} from './team-ops.js';

export interface TeamNotifierTarget {
  workerName: string;
  workerIndex?: number;
  paneId?: string;
}

export type DispatchTransport = 'hook' | 'prompt_stdin' | 'tmux_send_keys' | 'mailbox' | 'none';

export interface DispatchOutcome {
  ok: boolean;
  transport: DispatchTransport;
  reason: string;
  request_id?: string;
  message_id?: string;
  to_worker?: string;
}

export type TeamNotifier = (
  target: TeamNotifierTarget,
  message: string,
  context: { request: TeamDispatchRequest; message_id?: string },
) => DispatchOutcome | Promise<DispatchOutcome>;

function isConfirmedNotification(outcome: DispatchOutcome): boolean {
  if (!outcome.ok) return false;
  if (outcome.transport !== 'hook') return true;
  return outcome.reason !== 'queued_for_hook_dispatch';
}

function isLeaderPaneMissingMailboxPersistedOutcome(
  request: TeamDispatchRequest,
  outcome: DispatchOutcome,
): boolean {
  return request.to_worker === 'leader-fixed'
    && outcome.ok
    && outcome.reason === 'leader_pane_missing_mailbox_persisted';
}

function fallbackTransportForPreference(
  preference: TeamDispatchRequestInput['transport_preference'],
): DispatchTransport {
  if (preference === 'prompt_stdin') return 'prompt_stdin';
  if (preference === 'transport_direct') return 'tmux_send_keys';
  return 'hook';
}

function notifyExceptionReason(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return `notify_exception:${message}`;
}

async function notifyDispatchRequest(params: {
  notify: TeamNotifier;
  target: TeamNotifierTarget;
  message: string;
  request: TeamDispatchRequest;
  transportPreference?: TeamDispatchRequestInput['transport_preference'];
  messageId?: string;
  outcome?: Omit<Partial<DispatchOutcome>, 'ok' | 'transport' | 'reason' | 'request_id'>;
}): Promise<DispatchOutcome> {
  const notifyOutcome = await Promise.resolve(params.notify(
    params.target,
    params.message,
    { request: params.request, message_id: params.messageId },
  )).catch((error) => ({
    ok: false,
    transport: fallbackTransportForPreference(params.transportPreference),
    reason: notifyExceptionReason(error),
  } as DispatchOutcome));

  return {
    ...notifyOutcome,
    request_id: params.request.request_id,
    ...params.outcome,
  };
}

async function markImmediateDispatchFailure(params: {
  teamName: string;
  request: TeamDispatchRequest;
  reason: string;
  messageId?: string;
  cwd: string;
}): Promise<void> {
  const { teamName, request, reason, messageId, cwd } = params;
  if (request.transport_preference === 'hook_preferred_with_fallback') return;

  const current = await readDispatchRequest(teamName, request.request_id, cwd);
  if (!current) return;
  if (current.status === 'failed' || current.status === 'notified' || current.status === 'delivered') return;

  await transitionDispatchRequest(
    teamName,
    request.request_id,
    current.status,
    'failed',
    {
      message_id: messageId ?? current.message_id,
      last_reason: reason,
    },
    cwd,
  ).catch(() => {});
}

async function markLeaderPaneMissingDeferred(params: {
  teamName: string;
  request: TeamDispatchRequest;
  cwd: string;
  messageId?: string;
}): Promise<void> {
  const { teamName, request, cwd, messageId } = params;
  const current = await readDispatchRequest(teamName, request.request_id, cwd);
  if (!current) return;
  if (current.status !== 'pending') return;

  await transitionDispatchRequest(
    teamName,
    request.request_id,
    current.status,
    current.status,
    {
      message_id: messageId ?? current.message_id,
      last_reason: 'leader_pane_missing_deferred',
    },
    cwd,
  ).catch(() => {});
}

async function finalizeDispatchNotification(params: {
  teamName: string;
  request: TeamDispatchRequest;
  outcome: DispatchOutcome;
  cwd: string;
  messageId?: string;
  toWorker?: string;
  deferLeaderPaneMissing?: boolean;
}): Promise<void> {
  const { teamName, request, outcome, cwd, messageId, toWorker, deferLeaderPaneMissing } = params;
  if (deferLeaderPaneMissing && isLeaderPaneMissingMailboxPersistedOutcome(request, outcome)) {
    await markLeaderPaneMissingDeferred({
      teamName,
      request,
      cwd,
      messageId,
    });
    return;
  }

  if (isConfirmedNotification(outcome)) {
    if (messageId && toWorker) {
      await markMessageNotified(teamName, toWorker, messageId, cwd);
    }
    await markDispatchRequestNotified(
      teamName,
      request.request_id,
      {
        ...(messageId ? { message_id: messageId } : {}),
        last_reason: outcome.reason,
      },
      cwd,
    );
    return;
  }

  await markImmediateDispatchFailure({
    teamName,
    request,
    reason: outcome.reason,
    messageId,
    cwd,
  });
}

interface QueueInboxParams {
  teamName: string;
  workerName: string;
  workerIndex: number;
  paneId?: string;
  inbox: string;
  triggerMessage: string;
  cwd: string;
  transportPreference?: TeamDispatchRequestInput['transport_preference'];
  fallbackAllowed?: boolean;
  inboxCorrelationKey?: string;
  notify: TeamNotifier;
}

export async function queueInboxInstruction(params: QueueInboxParams): Promise<DispatchOutcome> {
  await writeWorkerInbox(params.teamName, params.workerName, params.inbox, params.cwd);
  const queued = await enqueueDispatchRequest(
    params.teamName,
    {
      kind: 'inbox',
      to_worker: params.workerName,
      worker_index: params.workerIndex,
      pane_id: params.paneId,
      trigger_message: params.triggerMessage,
      transport_preference: params.transportPreference,
      fallback_allowed: params.fallbackAllowed,
      inbox_correlation_key: params.inboxCorrelationKey,
    },
    params.cwd,
  );

  if (queued.deduped) {
    return {
      ok: false,
      transport: 'none',
      reason: 'duplicate_pending_dispatch_request',
      request_id: queued.request.request_id,
    };
  }

  const outcome = await notifyDispatchRequest({
    notify: params.notify,
    target: { workerName: params.workerName, workerIndex: params.workerIndex, paneId: params.paneId },
    message: params.triggerMessage,
    request: queued.request,
    transportPreference: params.transportPreference,
  });

  await finalizeDispatchNotification({
    teamName: params.teamName,
    request: queued.request,
    outcome,
    cwd: params.cwd,
  });

  return outcome;
}

interface QueueDirectMessageParams {
  teamName: string;
  fromWorker: string;
  toWorker: string;
  toWorkerIndex?: number;
  toPaneId?: string;
  body: string;
  triggerMessage: string;
  cwd: string;
  transportPreference?: TeamDispatchRequestInput['transport_preference'];
  fallbackAllowed?: boolean;
  notify: TeamNotifier;
}

export async function queueDirectMailboxMessage(params: QueueDirectMessageParams): Promise<DispatchOutcome> {
  const message = await sendDirectMessage(params.teamName, params.fromWorker, params.toWorker, params.body, params.cwd);
  const queued = await enqueueDispatchRequest(
    params.teamName,
    {
      kind: 'mailbox',
      to_worker: params.toWorker,
      worker_index: params.toWorkerIndex,
      pane_id: params.toPaneId,
      trigger_message: params.triggerMessage,
      message_id: message.message_id,
      transport_preference: params.transportPreference,
      fallback_allowed: params.fallbackAllowed,
    },
    params.cwd,
  );

  if (queued.deduped) {
    return {
      ok: false,
      transport: 'none',
      reason: 'duplicate_pending_dispatch_request',
      request_id: queued.request.request_id,
      message_id: message.message_id,
    };
  }

  const outcome = await notifyDispatchRequest({
    notify: params.notify,
    target: { workerName: params.toWorker, workerIndex: params.toWorkerIndex, paneId: params.toPaneId },
    message: params.triggerMessage,
    request: queued.request,
    transportPreference: params.transportPreference,
    messageId: message.message_id,
    outcome: { message_id: message.message_id, to_worker: params.toWorker },
  });

  await finalizeDispatchNotification({
    teamName: params.teamName,
    request: queued.request,
    outcome,
    cwd: params.cwd,
    messageId: message.message_id,
    toWorker: params.toWorker,
    deferLeaderPaneMissing: true,
  });
  return outcome;
}

interface QueueBroadcastParams {
  teamName: string;
  fromWorker: string;
  recipients: Array<{ workerName: string; workerIndex: number; paneId?: string }>;
  body: string;
  cwd: string;
  triggerFor: (workerName: string) => string;
  transportPreference?: TeamDispatchRequestInput['transport_preference'];
  fallbackAllowed?: boolean;
  notify: TeamNotifier;
}

export async function queueBroadcastMailboxMessage(params: QueueBroadcastParams): Promise<DispatchOutcome[]> {
  const messages = await broadcastMessage(params.teamName, params.fromWorker, params.body, params.cwd);
  const recipientByName = new Map(params.recipients.map((r) => [r.workerName, r]));
  const outcomes: DispatchOutcome[] = [];

  for (const message of messages) {
    const recipient = recipientByName.get(message.to_worker);
    if (!recipient) continue;

    const queued = await enqueueDispatchRequest(
      params.teamName,
      {
        kind: 'mailbox',
        to_worker: recipient.workerName,
        worker_index: recipient.workerIndex,
        pane_id: recipient.paneId,
        trigger_message: params.triggerFor(recipient.workerName),
        message_id: message.message_id,
        transport_preference: params.transportPreference,
        fallback_allowed: params.fallbackAllowed,
      },
      params.cwd,
    );

    if (queued.deduped) {
      outcomes.push({
        ok: false,
        transport: 'none',
        reason: 'duplicate_pending_dispatch_request',
        request_id: queued.request.request_id,
        message_id: message.message_id,
        to_worker: recipient.workerName,
      });
      continue;
    }

    const triggerMessage = params.triggerFor(recipient.workerName);
    const outcome = await notifyDispatchRequest({
      notify: params.notify,
      target: { workerName: recipient.workerName, workerIndex: recipient.workerIndex, paneId: recipient.paneId },
      message: triggerMessage,
      request: queued.request,
      transportPreference: params.transportPreference,
      messageId: message.message_id,
      outcome: { message_id: message.message_id, to_worker: recipient.workerName },
    });
    outcomes.push(outcome);

    await finalizeDispatchNotification({
      teamName: params.teamName,
      request: queued.request,
      outcome,
      cwd: params.cwd,
      messageId: message.message_id,
      toWorker: recipient.workerName,
    });
  }

  return outcomes;
}

export async function waitForDispatchReceipt(
  teamName: string,
  requestId: string,
  cwd: string,
  options: { timeoutMs: number; pollMs?: number },
): Promise<TeamDispatchRequest | null> {
  const timeoutMs = Math.max(0, Math.floor(options.timeoutMs));
  let currentPollMs = Math.max(25, Math.floor(options.pollMs ?? 50));
  const maxPollMs = 500;
  const backoffFactor = 1.5;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() <= deadline) {
    const request = await readDispatchRequest(teamName, requestId, cwd);
    if (!request) return null;
    if (request.status === 'notified' || request.status === 'delivered' || request.status === 'failed') {
      return request;
    }
    const jitter = Math.random() * currentPollMs * 0.3;
    await new Promise((resolve) => setTimeout(resolve, currentPollMs + jitter));
    currentPollMs = Math.min(currentPollMs * backoffFactor, maxPollMs);
  }

  return await readDispatchRequest(teamName, requestId, cwd);
}
