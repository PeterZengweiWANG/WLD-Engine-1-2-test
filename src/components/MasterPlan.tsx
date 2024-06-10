import { useRef, useEffect } from "react";

export default function MasterPlan() {
  const zoomRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: WheelEvent) => {
    if (zoomRef.current) {
      e.preventDefault();
      const currentScale = parseFloat(zoomRef.current.style.transform.replace('scale(', '').replace(')', '')) || 1;
      zoomRef.current.style.transform = `scale(${Math.max(1, Math.min(4, currentScale + (e.deltaY > 0 ? -0.1 : 0.1)))})`;
    }
  };

  useEffect(() => {
    if (zoomRef.current) {
      zoomRef.current.style.transform = 'scale(1)';
    }
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center">
      <div className="absolute inset-0" ref={zoomRef}>
        <img
          src="/masterplan/0608masterplan.jpg"
          alt="MasterPlan"
          className="object-cover w-full h-full"
        />
      </div>
    </div>
  );
}