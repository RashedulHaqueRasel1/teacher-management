"use client";

import { useState } from "react";

import { ChartTooltip, useTooltip } from "@/components/ui/tooltip";
import { toSmoothPath, type Point } from "@/lib/chart";
import { cn } from "@/lib/utils";

type SparklineProps = {
  data: number[];
  /** Stroke colour (any CSS colour). */
  color: string;
  /** Unique id for the gradient definition. */
  id: string;
  className?: string;
  /** One label per point (e.g. month names). When set, hovering shows a tooltip. */
  labels?: string[];
  /** Appended to tooltip values, e.g. "%". (A string, so server components can pass it.) */
  unit?: string;
  /** Decimal places in the tooltip. */
  decimals?: number;
  /** Tooltip row label, e.g. "Attendance". */
  seriesLabel?: string;
};

const W = 100;
const H = 36;

export function Sparkline({ data, color, id, className, labels, unit = "", decimals = 0, seriesLabel = "Value" }: SparklineProps) {
  const format = (v: number) => `${v.toFixed(decimals)}${unit}`;
  const tip = useTooltip();
  const [hover, setHover] = useState<number | null>(null);
  const min = Math.min(...data);
  const range = Math.max(...data) - min || 1;
  const points: Point[] = data.map((v, i) => [(i / (data.length - 1)) * W, H - 3 - ((v - min) / range) * (H - 6)]);
  const line = toSmoothPath(points);
  const interactive = Boolean(labels);

  function track(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const i = Math.round(((e.clientX - rect.left) / rect.width) * (data.length - 1));
    const index = Math.min(data.length - 1, Math.max(0, i));
    const [px, py] = points[index]!;
    const prev = data[index - 1];
    const change = prev === undefined ? null : data[index]! - prev;
    setHover(index);
    tip.showAt(
      <ChartTooltip
        title={labels![index]}
        rows={[
          { label: seriesLabel, value: format(data[index]!) },
          ...(change === null ? [] : [{ label: "vs previous", value: `${change >= 0 ? "▲" : "▼"} ${format(Math.abs(change))}` }]),
        ]}
      />,
      rect.left + (px / W) * rect.width,
      rect.top + (py / H) * rect.height - 4,
    );
  }

  function leave() {
    setHover(null);
    tip.hide();
  }

  const svg = (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={interactive ? "h-full w-full" : className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.22} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={`${line} L${W},${H} L0,${H} Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );

  if (!interactive) return svg;

  const point = hover === null ? null : points[hover]!;
  return (
    <div onMouseMove={track} onMouseLeave={leave} className={cn("relative cursor-crosshair", className)}>
      {svg}
      {point && (
        <>
          {/* Guide line + dot as HTML so they stay crisp on the stretched SVG. */}
          <span aria-hidden className="pointer-events-none absolute inset-y-0 w-px bg-white/25" style={{ left: `${(point[0] / W) * 100}%` }} />
          <span
            aria-hidden
            className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white/80"
            style={{ left: `${(point[0] / W) * 100}%`, top: `${(point[1] / H) * 100}%`, background: color, boxShadow: `0 0 12px ${color}` }}
          />
        </>
      )}
      {tip.node}
    </div>
  );
}
