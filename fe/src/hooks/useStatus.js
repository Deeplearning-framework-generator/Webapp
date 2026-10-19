// src/constants/statuses.js


export const STATUS = {
  TRAINING: 'training',
  WAITING: 'waiting',
  FAILED: 'failed',
  SUCCEEDED: 'succeeded',
  QUEUED: 'queued',
  IDLE: 'idle', // "Not run yet"
};

export const STATUS_META = {
  [STATUS.TRAINING]: {
    label: 'Training',
    tone: 'info',       // blue
    dot: 'info',
  },
  [STATUS.WAITING]: {
    label: 'Waiting for Colab',
    tone: 'warning',    // orange
    dot: 'warning',
  },
  [STATUS.QUEUED]: {
    label: 'Queued',
    tone: 'warning',
    dot: 'warning',
  },
  [STATUS.FAILED]: {
    label: 'Failed',
    tone: 'danger',     // red
    dot: 'danger',
  },
  [STATUS.SUCCEEDED]: {
    label: 'Succeeded',
    tone: 'success',    // green
    dot: 'success',
  },
  [STATUS.IDLE]: {
    label: 'Not run yet',
    tone: 'neutral',    // grey
    dot: 'neutral',
  },
};

export const STATUS_FROM_LABEL = Object.fromEntries(
  Object.entries(STATUS_META).map(([k, v]) => [v.label, k])
);

export function normalizeStatus(status) {
  if (!status) return STATUS.IDLE;
  if (STATUS_META[status]) return status;           
  return STATUS_FROM_LABEL[status] ?? STATUS.IDLE;
}