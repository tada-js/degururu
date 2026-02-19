import { useEffect, useState } from "react";
import type { StatusTone } from "../../app/ui-store";

type StatusBadgeProps = {
  statusLabel: string;
  statusTone: StatusTone;
  statusMetaText?: string | null;
  className?: string;
};

export function StatusBadge({ statusLabel, statusTone, statusMetaText, className = "" }: StatusBadgeProps) {
  const [phaseChanging, setPhaseChanging] = useState(false);

  useEffect(() => {
    setPhaseChanging(true);
    const timer = window.setTimeout(() => setPhaseChanging(false), 220);
    return () => window.clearTimeout(timer);
  }, [statusTone]);

  const metaText = typeof statusMetaText === "string" && statusMetaText.trim() ? statusMetaText : null;
  const badgeClassName = [
    "statusBadge",
    `statusBadge--${statusTone}`,
    phaseChanging ? "is-phase-changing" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={badgeClassName} aria-live="polite">
      <span className={`statusBadge__indicator statusBadge__indicator--${statusTone}`} aria-hidden="true">
        <span className="statusBadge__dot"></span>
        <span className="statusBadge__pauseIcon"></span>
      </span>
      <span className="statusBadge__label">{statusLabel}</span>
      {metaText ? <span className="statusBadge__meta">{metaText}</span> : null}
    </div>
  );
}
