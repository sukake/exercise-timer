import { PhaseKind } from './types';

export const colors = {
  bg: '#0f172a', // slate-900
  card: '#1e293b', // slate-800
  border: '#334155', // slate-700
  text: '#f1f5f9', // slate-100
  textMuted: '#94a3b8', // slate-400
  primary: '#6366f1', // indigo-500
  primaryText: '#ffffff',
  danger: '#ef4444', // red-500

  getReady: '#f59e0b', // amber-500
  exercise: '#22c55e', // green-500
  rest: '#38bdf8', // sky-400
  done: '#a855f7', // purple-500
};

export const phaseColor: Record<PhaseKind, string> = {
  getReady: colors.getReady,
  exercise: colors.exercise,
  rest: colors.rest,
};

export const phaseLabel: Record<PhaseKind, string> = {
  getReady: 'Get Ready',
  exercise: 'Exercise',
  rest: 'Rest',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 40 };
export const radius = { md: 12, lg: 20, pill: 999 };
