/**
 * Media query for the stacked (canvas above the editor) layout. The CSS in
 * src/styles/main.css must use the exact same string (pinned by tests/page.test.js).
 */
export const STACKED_QUERY = "(max-width: 599px), (orientation: portrait)";

export const CANVAS_MIN_WIDTH = 800;
export const CANVAS_MIN_HEIGHT = 600;

/**
 * Logical canvas size. Stacked: at least 800x600 so the container scrolls.
 * Side by side: the container size, with the fallback when it measures 0.
 */
export function canvasSize({ stacked, clientWidth, clientHeight }) {
  return stacked
    ? {
        width: Math.max(clientWidth, CANVAS_MIN_WIDTH),
        height: Math.max(clientHeight, CANVAS_MIN_HEIGHT),
      }
    : {
        width: clientWidth || CANVAS_MIN_WIDTH,
        height: clientHeight || CANVAS_MIN_HEIGHT,
      };
}
