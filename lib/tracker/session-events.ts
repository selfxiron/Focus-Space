export const SESSION_LOGGED_EVENT = "focus-space:session-logged";

export function notifySessionLogged() {
  window.dispatchEvent(new CustomEvent(SESSION_LOGGED_EVENT));
}
