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
  const canvasRef = useRef<HTMLCanvasElement>(undefined);

  const { theme } = useContext(ThemeContext)

  useEffect(() => {

    const isDark = () => theme == 'dark'
    const canvas = canvasRef.current;
    if (!canvas) return;

    function getCirclePositions(centerX: number, centerY: number, radius: number) {
      return Array.from({ length: 3 }, (_, i) => {
        const angle = -Math.PI / 2 + i * (2 * Math.PI / 3); // 0°, 120°, 240°
        return {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };
      });
    }

    const strokeColor = () => isDark() ? "#000" : '#FFF';

    function getSteps(positions: { x: number; y: number }[], colors: string[]) {
      return [
        { type: "fill", ...positions[0], color: colors[0] },
        { type: "fill", ...positions[1], color: colors[1] },
        { type: "fill", ...positions[2], color: colors[2] },
        { type: "stroke", ...positions[0], color: strokeColor() },
        { type: "stroke", ...positions[1], color: strokeColor() },
        { type: "stroke", ...positions[2], color: strokeColor() },
      ];
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // HiDPI / Retina support
    const dpr = window.devicePixelRatio || 1;

    const canvasSize = size;
    const half = size / 2;
    const oneThird = (size / 3);
    const radiusFromCenter = (10 / 6) * (size / 10);

    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;
    ctx.scale(dpr, dpr);

    const r = oneThird;
    const adjustedR = r - strokeWidth / 2;
    const backgroundR = r // TODO: saving for larger frame / fringe

    const circlePositions = getCirclePositions(half, half, radiusFromCenter);
    const steps = getSteps(circlePositions, colors);
    const start = performance.now();

    const draw = (now: number) => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, canvasSize, canvasSize);

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "#000000";

      const bgCircles = getCirclePositions(half, half, radiusFromCenter);

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
  }, [theme]);

  return (
    <canvas
      className={cn('', className)}
      ref={canvasRef}
    />
  );
};
