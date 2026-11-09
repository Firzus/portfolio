/** Shortest drop, in pixels, so it stays easy to grab on a very long page. */
const MIN_THUMB = 48;

export interface ScrollMetrics {
  /** Height of the window. */
  view: number;
  /** Height of the whole page. */
  page: number;
  /** Height of the track the drop moves in. */
  room: number;
  /** Current scroll position of the page. */
  scroll: number;
}

/** Size and position of the scrollbar's drop in its track, in pixels. */
export function thumbLayout({ view, page, room, scroll }: ScrollMetrics) {
  const scrollable = page > view + 1;
  const size = Math.min(room, Math.max(MIN_THUMB, (view / page) * room));
  const progress = scrollable ? Math.min(1, Math.max(0, scroll / (page - view))) : 0;
  return { size, offset: progress * (room - size), scrollable };
}
