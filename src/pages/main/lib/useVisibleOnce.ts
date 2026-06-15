import { useEffect, useRef, useState } from "react";

export const useVisibleOnce = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      return;
    }

    const target = targetRef.current;
    if (!target) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      const timer = setTimeout(() => setIsVisible(true), 0);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px" },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [isVisible]);

  return { targetRef, isVisible };
};
