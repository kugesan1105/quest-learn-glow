
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ConfettiPieceProps {
  color: string;
  size: number;
  left: number;
  delay: number;
}

const ConfettiPiece = ({ color, size, left, delay }: ConfettiPieceProps) => {
  return (
    <div
      className="absolute top-0 animate-confetti-fall"
      style={{
        left: `${left}%`,
        width: size,
        height: size * 0.4,
        backgroundColor: color,
        animationDelay: `${delay}s`,
        transform: `rotate(${Math.random() * 360}deg)`,
      }}
    ></div>
  );
};

interface ConfettiProps {
  isActive?: boolean;
  duration?: number;
  pieceCount?: number;
  className?: string;
}

export function Confetti({
  isActive = true,
  duration = 3000,
  pieceCount = 30,
  className,
}: ConfettiProps) {
  const [pieces, setPieces] = useState<React.ReactNode[]>([]);
  const [show, setShow] = useState(isActive);

  const colors = ['#9b87f5', '#0EA5E9', '#D6BCFA', '#D3E4FD', '#F9a8D4'];

  useEffect(() => {
    if (!isActive) {
      setShow(false);
      return;
    }

    const newPieces = Array(pieceCount)
      .fill(0)
      .map((_, i) => {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 10 + 5;
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;

        return (
          <ConfettiPiece
            key={i}
            color={color}
            size={size}
            left={left}
            delay={delay}
          />
        );
      });

    setPieces(newPieces);
    setShow(true);

    const timer = setTimeout(() => {
      setShow(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [isActive, duration, pieceCount]);

  if (!show) return null;

  return (
    <div className={cn("fixed inset-0 pointer-events-none z-50", className)}>
      {pieces}
    </div>
  );
}
