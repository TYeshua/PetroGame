import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';

export interface TargetCursorProps {
  targetSelector?: string;
  magneticSelector?: string;
  magneticRadius?: number;
  magneticStrength?: number;
  spinDuration?: number;
  hideDefaultCursor?: boolean;
  hoverDuration?: number;
  parallaxOn?: boolean;
}

/* ─── Mobile: touch ripple ──────────────────────────────────────────────── */
const MobileTouchRipple: React.FC<{ targetSelector: string }> = ({ targetSelector }) => {
  useEffect(() => {
    const handleTouch = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      if (!touch) return;
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (!el || !el.closest(targetSelector)) return;

      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: fixed;
        left: ${touch.clientX}px;
        top: ${touch.clientY}px;
        width: 0; height: 0;
        border: 2px solid rgba(220, 20, 60, 0.9);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 9999;
        opacity: 1;
      `;
      document.body.appendChild(ripple);

      gsap.to(ripple, {
        width: 80,
        height: 80,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => ripple.remove(),
      });
    };

    window.addEventListener('touchstart', handleTouch, { passive: true });
    return () => window.removeEventListener('touchstart', handleTouch);
  }, [targetSelector]);

  return null;
};

/* ─── Desktop: target cursor with magnetic attraction ────────────────────── */
const TargetCursor: React.FC<TargetCursorProps> = ({
  targetSelector = '.cursor-target',
  magneticSelector = '.cursor-magnetic',
  magneticRadius = 120,
  magneticStrength = 0.45,
  spinDuration = 2,
  hideDefaultCursor = true,
  hoverDuration = 0.2,
  parallaxOn = true,
}) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cornersRef = useRef<NodeListOf<HTMLDivElement> | null>(null);
  const spinTl = useRef<gsap.core.Timeline | null>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const isActiveRef = useRef(false);
  const targetCornerPositionsRef = useRef<{ x: number; y: number }[] | null>(null);
  const tickerFnRef = useRef<(() => void) | null>(null);
  const activeStrengthRef = useRef({ current: 0 });

  // Raw mouse position (before magnetic offset)
  const rawMouseRef = useRef({ x: 0, y: 0 });
  // Whether the cursor is currently being magnetically pulled
  const isMagneticRef = useRef(false);

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    const ua = navigator.userAgent || navigator.vendor || (window as unknown as { opera: string }).opera;
    return (hasTouchScreen && isSmallScreen) || /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
  }, []);

  const constants = useMemo(() => ({ borderWidth: 3, cornerSize: 12 }), []);

  const moveCursor = useCallback((x: number, y: number, instant = false) => {
    if (!cursorRef.current) return;
    gsap.to(cursorRef.current, {
      x,
      y,
      duration: instant ? 0 : 0.12,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  }, []);

  useEffect(() => {
    if (isMobile || !cursorRef.current) return;

    /* ── Hide native cursor globally ── */
    if (hideDefaultCursor) {
      document.documentElement.classList.add('custom-cursor-active');
    }

    const cursor = cursorRef.current;
    cornersRef.current = cursor.querySelectorAll<HTMLDivElement>('.target-cursor-corner');

    let activeTarget: Element | null = null;
    let currentLeaveHandler: (() => void) | null = null;
    let resumeTimeout: ReturnType<typeof setTimeout> | null = null;

    const cleanupTarget = (target: Element) => {
      if (currentLeaveHandler) target.removeEventListener('mouseleave', currentLeaveHandler);
      currentLeaveHandler = null;
    };

    gsap.set(cursor, {
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    const createSpinTimeline = () => {
      spinTl.current?.kill();
      spinTl.current = gsap
        .timeline({ repeat: -1 })
        .to(cursor, { rotation: '+=360', duration: spinDuration, ease: 'none' });
    };
    createSpinTimeline();

    /* ── Corner parallax ticker ── */
    const tickerFn = () => {
      if (!targetCornerPositionsRef.current || !cursorRef.current || !cornersRef.current) return;
      const strength = activeStrengthRef.current.current;
      if (strength === 0) return;
      const cursorX = gsap.getProperty(cursorRef.current, 'x') as number;
      const cursorY = gsap.getProperty(cursorRef.current, 'y') as number;
      Array.from(cornersRef.current).forEach((corner, i) => {
        const currentX = gsap.getProperty(corner, 'x') as number;
        const currentY = gsap.getProperty(corner, 'y') as number;
        const targetX = targetCornerPositionsRef.current![i].x - cursorX;
        const targetY = targetCornerPositionsRef.current![i].y - cursorY;
        const finalX = currentX + (targetX - currentX) * strength;
        const finalY = currentY + (targetY - currentY) * strength;
        const duration = strength >= 0.99 ? (parallaxOn ? 0.2 : 0) : 0.05;
        gsap.to(corner, {
          x: finalX,
          y: finalY,
          duration,
          ease: duration === 0 ? 'none' : 'power1.out',
          overwrite: 'auto',
        });
      });
    };
    tickerFnRef.current = tickerFn;

    /* ── Magnetic attraction ── */
    const getMagneticTargets = () =>
      Array.from(document.querySelectorAll<HTMLElement>(magneticSelector));

    const applyMagnetic = (rawX: number, rawY: number) => {
      const targets = getMagneticTargets();
      let attracted = false;

      for (const el of targets) {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = rawX - cx;
        const dy = rawY - cy;
        const dist = Math.hypot(dx, dy);

        if (dist < magneticRadius) {
          attracted = true;
          // Smooth falloff: stronger near center
          const falloff = 1 - dist / magneticRadius;
          const pullX = cx + dx * (1 - magneticStrength * falloff);
          const pullY = cy + dy * (1 - magneticStrength * falloff);

          moveCursor(pullX, pullY);

          // Subtle element displacement toward cursor
          gsap.to(el, {
            x: -dx * 0.12 * falloff,
            y: -dy * 0.12 * falloff,
            duration: 0.35,
            ease: 'power2.out',
            overwrite: 'auto',
          });

          isMagneticRef.current = true;
          break;
        } else {
          // Reset element position when out of range
          if ((el as HTMLElement & { _wasMagnetic?: boolean })._wasMagnetic) {
            gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
            (el as HTMLElement & { _wasMagnetic?: boolean })._wasMagnetic = false;
          }
        }

        // Mark element as being tracked
        (el as HTMLElement & { _wasMagnetic?: boolean })._wasMagnetic = dist < magneticRadius;
      }

      if (!attracted) {
        if (isMagneticRef.current) {
          // Release: let cursor fly back to real mouse position
          moveCursor(rawX, rawY);
          isMagneticRef.current = false;
        } else {
          moveCursor(rawX, rawY);
        }
      }
    };

    /* ── Mouse move ── */
    const moveHandler = (e: MouseEvent) => {
      rawMouseRef.current = { x: e.clientX, y: e.clientY };
      applyMagnetic(e.clientX, e.clientY);
    };
    window.addEventListener('mousemove', moveHandler);

    /* ── Scroll recalc ── */
    const scrollHandler = () => {
      if (!activeTarget || !cursorRef.current) return;
      const mouseX = gsap.getProperty(cursorRef.current, 'x') as number;
      const mouseY = gsap.getProperty(cursorRef.current, 'y') as number;
      const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
      const isStillOverTarget =
        elementUnderMouse &&
        (elementUnderMouse === activeTarget ||
          elementUnderMouse.closest(targetSelector) === activeTarget);
      if (!isStillOverTarget) currentLeaveHandler?.();
    };
    window.addEventListener('scroll', scrollHandler, { passive: true });

    /* ── Click feedback ── */
    const mouseDownHandler = () => {
      gsap.to(dotRef.current, { scale: 0.7, duration: 0.15 });
      gsap.to(cursor, { scale: 0.88, duration: 0.15, overwrite: 'auto' });
    };
    const mouseUpHandler = () => {
      gsap.to(dotRef.current, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
      gsap.to(cursor, { scale: 1, duration: 0.3, ease: 'back.out(2)', overwrite: 'auto' });
    };
    window.addEventListener('mousedown', mouseDownHandler);
    window.addEventListener('mouseup', mouseUpHandler);

    /* ── Target hover (corners snap) ── */
    const enterHandler = (e: MouseEvent) => {
      const directTarget = e.target as Element;
      let target: Element | null = null;
      let current: Element | null = directTarget;
      while (current && current !== document.body) {
        if (current.matches(targetSelector)) { target = current; break; }
        current = current.parentElement;
      }
      if (!target || !cursorRef.current || !cornersRef.current) return;
      if (activeTarget === target) return;
      if (activeTarget) cleanupTarget(activeTarget);
      if (resumeTimeout) { clearTimeout(resumeTimeout); resumeTimeout = null; }

      activeTarget = target;
      const corners = Array.from(cornersRef.current);
      corners.forEach(c => gsap.killTweensOf(c));
      gsap.killTweensOf(cursor, 'rotation');
      spinTl.current?.pause();
      gsap.set(cursor, { rotation: 0 });

      const rect = target.getBoundingClientRect();
      const { borderWidth, cornerSize } = constants;
      const cursorX = gsap.getProperty(cursor, 'x') as number;
      const cursorY = gsap.getProperty(cursor, 'y') as number;

      targetCornerPositionsRef.current = [
        { x: rect.left - borderWidth, y: rect.top - borderWidth },
        { x: rect.right + borderWidth - cornerSize, y: rect.top - borderWidth },
        { x: rect.right + borderWidth - cornerSize, y: rect.bottom + borderWidth - cornerSize },
        { x: rect.left - borderWidth, y: rect.bottom + borderWidth - cornerSize },
      ];

      isActiveRef.current = true;
      gsap.ticker.add(tickerFnRef.current!);
      gsap.to(activeStrengthRef.current, { current: 1, duration: hoverDuration, ease: 'power2.out' });

      corners.forEach((corner, i) => {
        gsap.to(corner, {
          x: targetCornerPositionsRef.current![i].x - cursorX,
          y: targetCornerPositionsRef.current![i].y - cursorY,
          duration: 0.2,
          ease: 'power2.out',
        });
      });

      const leaveHandler = () => {
        gsap.ticker.remove(tickerFnRef.current!);
        isActiveRef.current = false;
        targetCornerPositionsRef.current = null;
        gsap.set(activeStrengthRef.current, { current: 0, overwrite: true });
        activeTarget = null;

        if (cornersRef.current) {
          const cs = Array.from(cornersRef.current);
          gsap.killTweensOf(cs);
          const { cornerSize } = constants;
          const positions = [
            { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: cornerSize * 0.5 },
            { x: -cornerSize * 1.5, y: cornerSize * 0.5 },
          ];
          const tl = gsap.timeline();
          cs.forEach((c, idx) =>
            tl.to(c, { x: positions[idx].x, y: positions[idx].y, duration: 0.3, ease: 'power3.out' }, 0)
          );
        }

        resumeTimeout = setTimeout(() => {
          if (!activeTarget && cursor && spinTl.current) {
            const currentRotation = gsap.getProperty(cursor, 'rotation') as number;
            const normalizedRotation = currentRotation % 360;
            spinTl.current.kill();
            spinTl.current = gsap
              .timeline({ repeat: -1 })
              .to(cursor, { rotation: '+=360', duration: spinDuration, ease: 'none' });
            gsap.to(cursor, {
              rotation: normalizedRotation + 360,
              duration: spinDuration * (1 - normalizedRotation / 360),
              ease: 'none',
              onComplete: () => spinTl.current?.restart(),
            });
          }
          resumeTimeout = null;
        }, 50);

        cleanupTarget(target!);
      };
      currentLeaveHandler = leaveHandler;
      target.addEventListener('mouseleave', leaveHandler);
    };

    window.addEventListener('mouseover', enterHandler as EventListener);

    return () => {
      if (tickerFnRef.current) gsap.ticker.remove(tickerFnRef.current);
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseover', enterHandler as EventListener);
      window.removeEventListener('scroll', scrollHandler);
      window.removeEventListener('mousedown', mouseDownHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
      if (activeTarget) cleanupTarget(activeTarget);
      spinTl.current?.kill();
      document.documentElement.classList.remove('custom-cursor-active');
      isActiveRef.current = false;
      targetCornerPositionsRef.current = null;
      activeStrengthRef.current.current = 0;
      // Reset any magnetic elements
      getMagneticTargets().forEach(el => gsap.set(el, { x: 0, y: 0, clearProps: 'transform' }));
    };
  }, [targetSelector, magneticSelector, magneticRadius, magneticStrength, spinDuration, moveCursor, constants, hideDefaultCursor, isMobile, hoverDuration, parallaxOn]);

  useEffect(() => {
    if (isMobile || !cursorRef.current || !spinTl.current) return;
    if (spinTl.current.isActive()) {
      spinTl.current.kill();
      spinTl.current = gsap
        .timeline({ repeat: -1 })
        .to(cursorRef.current, { rotation: '+=360', duration: spinDuration, ease: 'none' });
    }
  }, [spinDuration, isMobile]);

  if (isMobile) {
    return <MobileTouchRipple targetSelector={targetSelector} />;
  }

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-0 h-0 pointer-events-none z-[9999]"
      style={{ willChange: 'transform' }}
    >
      {/* Center dot */}
      <div
        ref={dotRef}
        className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{ willChange: 'transform', backgroundColor: '#DC143C' }}
      />
      {/* Corner TL */}
      <div
        className="target-cursor-corner absolute top-1/2 left-1/2 w-3 h-3 -translate-x-[150%] -translate-y-[150%] border-r-0 border-b-0"
        style={{ willChange: 'transform', borderWidth: '3px', borderStyle: 'solid', borderColor: '#DC143C' }}
      />
      {/* Corner TR */}
      <div
        className="target-cursor-corner absolute top-1/2 left-1/2 w-3 h-3 translate-x-1/2 -translate-y-[150%] border-l-0 border-b-0"
        style={{ willChange: 'transform', borderWidth: '3px', borderStyle: 'solid', borderColor: '#DC143C' }}
      />
      {/* Corner BR */}
      <div
        className="target-cursor-corner absolute top-1/2 left-1/2 w-3 h-3 translate-x-1/2 translate-y-1/2 border-l-0 border-t-0"
        style={{ willChange: 'transform', borderWidth: '3px', borderStyle: 'solid', borderColor: '#DC143C' }}
      />
      {/* Corner BL */}
      <div
        className="target-cursor-corner absolute top-1/2 left-1/2 w-3 h-3 -translate-x-[150%] translate-y-1/2 border-r-0 border-t-0"
        style={{ willChange: 'transform', borderWidth: '3px', borderStyle: 'solid', borderColor: '#DC143C' }}
      />
    </div>
  );
};

export default TargetCursor;
