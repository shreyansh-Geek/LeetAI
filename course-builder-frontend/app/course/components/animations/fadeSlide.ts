export const fadeSlide = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: "easeOut", // ✔ FIXED
    },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: {
      duration: 0.2,
      ease: "easeIn", // ✔ FIXED
    },
  },
} as const;
