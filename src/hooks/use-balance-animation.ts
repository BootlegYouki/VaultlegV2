import { useState, useEffect, useRef } from 'react';

let hasAnimatedBalance = false;

export function useBalanceAnimation(balance: number, startAnimation: boolean) {
  const [animatedBalance, setAnimatedBalance] = useState(hasAnimatedBalance ? balance : 0);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (!hasAnimatedBalance) {
      if (!startAnimation) return;
      hasAnimatedBalance = true;
    } else {
      if (isFirstRenderRef.current) {
        isFirstRenderRef.current = false;
        setAnimatedBalance(balance);
        return;
      }
    }

    let startTime: number | null = null;
    const startValue = animatedBalance;
    const duration = 800; // 800ms count-up duration

    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const currentValue = startValue + (balance - startValue) * easedProgress;

      setAnimatedBalance(currentValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [balance, startAnimation]);

  return animatedBalance;
}
export { hasAnimatedBalance };
