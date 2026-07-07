/* Categorical avatar palette — must stay in sync with the landing page's copy
   in src/app/pages/Home.jsx (see DESIGN_SYSTEM.md §2.4). */
export const AVATAR_PALETTE = [
  'from-blue-500 to-blue-600',
  'from-violet-500 to-violet-600',
  'from-teal-500 to-teal-600',
  'from-amber-500 to-amber-600',
  'from-rose-500 to-rose-600',
  'from-indigo-500 to-indigo-600',
  'from-emerald-500 to-emerald-600',
  'from-cyan-500 to-cyan-600',
];

/** @param {{ shortName?: string, name: string }} company */
export function avatarLabel(company) {
  const source = company.shortName ?? company.name;
  return source.length <= 2 ? source : source.slice(0, 2);
}

/** Deterministic gradient for contexts without a list index (e.g. detail header). */
export function avatarGradient(seed) {
  let h = 0;
  for (const ch of String(seed ?? '')) h = (h + ch.charCodeAt(0)) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[h];
}
