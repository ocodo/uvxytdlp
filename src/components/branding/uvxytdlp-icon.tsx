import { ThemeContext } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";
import { useContext, useEffect, useRef, type FC } from "react";


interface UvxYtdlpIconProps {
  size?: number;
  className?: string;
  fadeDuration?: number;
  totalDuration?: number;
  strokeWidth?: number;
  onDone?: () => void;
  doneDelay?: number;
  colors?: [string, string, string]; // e.g.red, green, blue
}

export const UvxYtdlpIcon: FC<UvxYtdlpIconProps> = ({
  onDone,
  doneDelay = 300,
  size = 100,
  className = "",
  fadeDuration = 1000,
  totalDuration = 1000,
  strokeWidth = 2.5,
  colors = ["#FF0000", "#00FF00", "#0000FF"],
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { theme } = useContext(ThemeContext)

  useEffect(() => {
    const isDark = () => theme == 'dark'
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // HiDPI / Retina support
    const dpr = window.devicePixelRatio || 1;

    const canvasSize = size;
    const half = size / 2;
    const oneThird = (size / 3);
    const twoThirds = oneThird * 2;

    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;
    ctx.scale(dpr, dpr);

    const r = oneThird;
    const adjustedR = r - strokeWidth / 2;
    const backgroundR = r // TODO: saving for larger frame / fringe

    // animation steps
    const steps = [
      { type: "fill", x: half, y: oneThird, color: colors[0] }, // top circle
      { type: "fill", x: oneThird, y: twoThirds, color: colors[1] }, // bottom-left circle
      { type: "fill", x: twoThirds, y: twoThirds, color: colors[2] }, // bottom-right circle
      { type: "stroke", x: half, y: oneThird },
      { type: "stroke", x: oneThird, y: twoThirds },
      { type: "stroke", x: twoThirds, y: twoThirds },
    ];

    const start = performance.now();
    const strokeColor = () => isDark() ? "#000" : '#FFF';

    const draw = (now: number) => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, canvasSize, canvasSize);

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "#000000";

      const bgCircles = [
        { x: half, y: oneThird },
        { x: oneThird, y: twoThirds },
        { x: twoThirds, y: twoThirds },
      ];

      // background as a black tri-circle
      for (const { x, y } of bgCircles) {
        ctx.beginPath();
        ctx.arc(x, y, backgroundR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw frames
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const stepStart = i * (totalDuration / steps.length);
        const t = elapsed - stepStart;

        if (t < 0) continue;

        const opacity = Math.min(t / fadeDuration, 1);
        ctx.globalAlpha = opacity;

        if (step.type === "fill" && step.color) {
          ctx.globalCompositeOperation = "screen";
          ctx.fillStyle = step.color;
          ctx.beginPath();
          ctx.arc(step.x, step.y, r, 0, Math.PI * 2);
          ctx.fill();
        } else if (step.type === "stroke") {
          ctx.globalCompositeOperation = "source-over";
          ctx.strokeStyle = strokeColor();
          ctx.lineWidth = strokeWidth;
          ctx.beginPath();
          ctx.arc(step.x, step.y, adjustedR, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;

      if (elapsed < totalDuration + fadeDuration) {
        requestAnimationFrame(draw);
      }

      if (elapsed >= totalDuration + fadeDuration) {
        if (onDone) setTimeout(onDone, doneDelay);
      };
    }

    requestAnimationFrame(draw);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  return (
    <canvas
      className={cn('', className)}
      ref={canvasRef}
    />
  );
};
