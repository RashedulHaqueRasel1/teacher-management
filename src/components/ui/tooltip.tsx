"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type Anchor = { x: number; top: number; bottom: number };
type Active = { content: React.ReactNode; anchor: Anchor };

const GAP = 10;
const EDGE = 8;

/**
 * One floating tooltip shared by many triggers (chart bars, calendar days…).
 *
 *   const tip = useTooltip();
 *   <div {...tip.trigger(<ChartTooltip … />)} />
 *   {tip.node}
 *
 * Shows on hover and keyboard focus, sits above the trigger (flips below
 * near the top of the screen) and stays inside the viewport. Rendered in a
 * portal so scroll / overflow containers never clip it.
 */
export function useTooltip() {
  const [active, setActive] = useState<Active | null>(null);

  const show = useCallback((content: React.ReactNode, el: Element, x?: number) => {
    const r = el.getBoundingClientRect();
    setActive({ content, anchor: { x: x ?? r.left + r.width / 2, top: r.top, bottom: r.bottom } });
  }, []);
  /** Place at an exact point (viewport coordinates), e.g. a chart data point. */
  const showAt = useCallback((content: React.ReactNode, x: number, y: number) => setActive({ content, anchor: { x, top: y, bottom: y } }), []);
  const hide = useCallback(() => setActive(null), []);

  /** Props to spread on a trigger element. */
  const trigger = useCallback(
    (content: React.ReactNode) => ({
      onMouseEnter: (e: React.MouseEvent) => show(content, e.currentTarget),
      onMouseLeave: hide,
      onFocus: (e: React.FocusEvent) => show(content, e.currentTarget),
      onBlur: hide,
    }),
    [show, hide],
  );

  return { trigger, show, showAt, hide, node: active ? <FloatingTooltip key={`${active.anchor.x}:${active.anchor.top}`} {...active} /> : null };
}

function FloatingTooltip({ content, anchor }: Active) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; below: boolean; arrow: number } | null>(null);

  // Measure after render, then place — no flash at the wrong spot.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const below = anchor.top - height - GAP < EDGE;
    const left = Math.min(Math.max(anchor.x - width / 2, EDGE), window.innerWidth - width - EDGE);
    setPos({ left, top: below ? anchor.bottom + GAP : anchor.top - height - GAP, below, arrow: anchor.x - left });
  }, [anchor]);

  return createPortal(
    <div
      ref={ref}
      role="tooltip"
      style={pos ? { left: pos.left, top: pos.top } : { left: -9999, top: -9999 }}
      className={cn(
        "pointer-events-none fixed z-[90] max-w-xs rounded-xl bg-navy-950/95 px-3 py-2.5 text-xs text-slate-200 shadow-popover ring-1 ring-white/10 backdrop-blur-md dark:bg-slate-800/95",
        pos && "animate-tooltip-in",
        pos?.below ? "origin-top" : "origin-bottom",
      )}
    >
      {content}
      {pos && (
        <span
          aria-hidden
          style={{ left: pos.arrow }}
          className={cn(
            "absolute h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-navy-950/95 dark:bg-slate-800/95",
            pos.below ? "-top-1 border-l border-t border-white/10" : "-bottom-1 border-b border-r border-white/10",
          )}
        />
      )}
    </div>,
    document.body,
  );
}

export type TooltipRow = { label: string; value: React.ReactNode; /** Tailwind bg-* class for the swatch. */ color?: string; muted?: boolean };

/** Standard chart tooltip body: a title, optional subtitle and label / value rows. */
export function ChartTooltip({ title, subtitle, rows, footer }: { title: React.ReactNode; subtitle?: React.ReactNode; rows?: TooltipRow[]; footer?: React.ReactNode }) {
  return (
    <div className="min-w-36">
      <p className="text-[13px] font-semibold text-white">{title}</p>
      {subtitle && <p className="mt-0.5 text-[11px] text-slate-400">{subtitle}</p>}
      {rows && rows.length > 0 && (
        <dl className="mt-2 space-y-1">
          {rows.map((r) => (
            <div key={r.label} className={cn("flex items-center gap-2", r.muted && "opacity-60")}>
              {r.color && <span className={cn("h-2 w-2 shrink-0 rounded-full", r.color)} />}
              <dt className="flex-1 text-slate-300">{r.label}</dt>
              <dd className="font-semibold tabular-nums text-white">{r.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {footer && <p className="mt-2 border-t border-white/10 pt-2 text-[11px] text-slate-400">{footer}</p>}
    </div>
  );
}
