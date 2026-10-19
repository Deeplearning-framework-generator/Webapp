import { STATUS_META, normalizeStatus } from '../hooks/useStatus';

const TONE_CLASSES = {
  info:    { bg: 'bg-blue-500/10 text-blue-400',    dot: 'bg-blue-400'    },
  warning: { bg: 'bg-orange-500/10 text-orange-400', dot: 'bg-orange-400' },
  danger:  { bg: 'bg-red-500/10 text-red-400',      dot: 'bg-red-400'     },
  success: { bg: 'bg-green-500/10 text-green-400',  dot: 'bg-green-400'   },
  neutral: { bg: 'bg-surface-soft text-muted',      dot: 'bg-muted'       },
};

const SIZES = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
};

export default function StatusBadge({
  status,
  size = 'md',
  showDot = true,
  className = '',
}) {
  const key = normalizeStatus(status);
  const meta = STATUS_META[key] ?? STATUS_META.idle;
  const tone = TONE_CLASSES[meta.tone] ?? TONE_CLASSES.neutral;

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        SIZES[size] ?? SIZES.md,
        tone.bg,
        className,
      ].join(' ')}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
      )}
      {meta.label}
    </span>
  );
}