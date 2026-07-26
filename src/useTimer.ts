import { useCallback, useEffect, useRef, useState } from 'react';
import { Segment } from './types';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'done';

type Handlers = {
  /** Fires once for each of the final seconds of a segment (3, 2, 1). */
  onCountdown?: (secLeft: number) => void;
  /** Fires when a segment begins (including the very first). */
  onSegmentStart?: (seg: Segment, index: number) => void;
  /** Fires once when the last segment finishes. */
  onComplete?: () => void;
};

const TICK_MS = 100;

/**
 * Drives an ordered list of {@link Segment}s. Timing is anchored to wall-clock
 * boundaries (each segment ends at the previous boundary + its duration) so
 * drift never accumulates across a long workout, and the JS timer being
 * throttled in a background tab self-corrects on the next tick.
 */
export function useTimer(segments: Segment[], handlers: Handlers) {
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(segments[0]?.secs ?? 0);
  const [status, setStatus] = useState<TimerStatus>('idle');

  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  const segsRef = useRef(segments);
  segsRef.current = segments;

  const indexRef = useRef(0);
  const endAtRef = useRef(0); // wall-clock ms at which the current segment ends
  const pausedRemainingRef = useRef(0); // ms left when paused
  const lastShownRef = useRef(-1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopLoop = useCallback(() => {
    if (intervalRef.current != null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const enterSegment = useCallback((i: number, endAt: number) => {
    const seg = segsRef.current[i];
    indexRef.current = i;
    endAtRef.current = endAt;
    lastShownRef.current = seg.secs;
    setIndex(i);
    setRemaining(seg.secs);
    handlersRef.current.onSegmentStart?.(seg, i);
  }, []);

  const tick = useCallback(() => {
    const now = Date.now();
    const remMs = endAtRef.current - now;
    const shown = Math.max(0, Math.ceil(remMs / 1000));

    if (shown !== lastShownRef.current) {
      if (shown >= 1 && shown <= 3) handlersRef.current.onCountdown?.(shown);
      lastShownRef.current = shown;
      setRemaining(shown);
    }

    if (remMs <= 0) {
      const next = indexRef.current + 1;
      if (next >= segsRef.current.length) {
        stopLoop();
        setStatus('done');
        setRemaining(0);
        handlersRef.current.onComplete?.();
        return;
      }
      // Anchor the next segment to the ideal boundary, not `now`.
      const nextEnd = endAtRef.current + segsRef.current[next].secs * 1000;
      enterSegment(next, nextEnd);
    }
  }, [enterSegment, stopLoop]);

  const startLoop = useCallback(() => {
    stopLoop();
    intervalRef.current = setInterval(tick, TICK_MS);
  }, [stopLoop, tick]);

  const start = useCallback(() => {
    stopLoop();
    setStatus('running');
    enterSegment(0, Date.now() + segsRef.current[0].secs * 1000);
    startLoop();
  }, [enterSegment, startLoop, stopLoop]);

  const pause = useCallback(() => {
    if (intervalRef.current == null) return;
    stopLoop();
    pausedRemainingRef.current = Math.max(0, endAtRef.current - Date.now());
    setStatus('paused');
  }, [stopLoop]);

  const resume = useCallback(() => {
    endAtRef.current = Date.now() + pausedRemainingRef.current;
    setStatus('running');
    startLoop();
  }, [startLoop]);

  const reset = useCallback(() => {
    stopLoop();
    indexRef.current = 0;
    lastShownRef.current = -1;
    setStatus('idle');
    setIndex(0);
    setRemaining(segsRef.current[0]?.secs ?? 0);
  }, [stopLoop]);

  // Clean up if the component unmounts mid-run.
  useEffect(() => stopLoop, [stopLoop]);

  return {
    status,
    index,
    remaining,
    segment: segments[index],
    total: segments.length,
    start,
    pause,
    resume,
    reset,
  };
}
