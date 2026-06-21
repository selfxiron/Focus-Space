/** Shared easing — smooth deceleration */
export const easeOut = [0.22, 1, 0.36, 1] as const;

export const springSnappy = {
  type: "spring" as const,
  stiffness: 420,
  damping: 32,
  mass: 0.8,
};

export const viewportOnce = {
  once: true,
  amount: 0.12,
  margin: "0px 0px -48px 0px" as const,
};
