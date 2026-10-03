import React, { useState } from 'react';
import { FaWaveSquare } from 'react-icons/fa6';
import { newtonsCradle } from 'ldrs';

// Register the custom element once
newtonsCradle.register();

export const SystemPulseCard: React.FC = () => {
  const [cradleSpeed, setCradleSpeed] = useState<string>('1.4');
  const [cradleSize, setCradleSize] = useState<string>('78');
  const [cradleColor, setCradleColor] = useState<string>('#6366f1');

  return (
    <div className="card bg-gradient-to-br from-base-200/80 via-base-200/50 to-primary/5 border border-primary/20 shadow-sm p-5 sm:p-6 rounded-2xl overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 flex-1 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="badge badge-primary badge-outline gap-1.5 py-3 px-3 text-xs font-semibold">
              <FaWaveSquare className="size-3 text-primary animate-pulse" />
              Live Telemetry
            </span>
            <span className="badge badge-success badge-sm gap-1.5 font-medium py-2 px-2.5">
              <span className="size-2 rounded-full bg-success animate-ping" />
              Newton's Cradle Active
            </span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              System Pulse & Activity Monitor
            </h2>
            <p className="text-xs sm:text-sm text-base-content/70 mt-1 max-w-xl">
              Demonstrating real-time synchronized event loops, Odoo ERP socket heartbeats, and court sensor signals with Newton's Cradle from <span className="font-mono text-primary font-semibold">ldrs</span>.
            </p>
          </div>

          {/* Controls for size & speed */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1 text-xs">
            <div className="flex items-center gap-1.5 bg-base-300/50 px-2.5 py-1.5 rounded-lg border border-base-300">
              <span className="text-base-content/60 font-medium">Speed:</span>
              {(['0.9', '1.4', '2.0'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setCradleSpeed(s)}
                  className={`btn btn-xs ${cradleSpeed === s ? 'btn-primary' : 'btn-ghost'}`}
                >
                  {s === '0.9' ? 'Fast' : s === '1.4' ? 'Normal' : 'Slow'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 bg-base-300/50 px-2.5 py-1.5 rounded-lg border border-base-300">
              <span className="text-base-content/60 font-medium">Size:</span>
              {(['60', '78', '95'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setCradleSize(sz)}
                  className={`btn btn-xs ${cradleSize === sz ? 'btn-primary' : 'btn-ghost'}`}
                >
                  {sz === '60' ? 'S' : sz === '78' ? 'M' : 'L'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Newton's Cradle Animation Canvas */}
        <div className="flex flex-col items-center justify-center p-6 bg-base-100/80 backdrop-blur-md rounded-2xl border border-base-300/80 shadow-inner w-full md:w-auto min-w-[260px]">
          <div className="h-28 flex items-center justify-center px-4">
            <l-newtons-cradle
              size={cradleSize}
              speed={cradleSpeed}
              color={cradleColor}
            />
          </div>

          <div className="flex flex-col items-center gap-2 mt-2 w-full pt-3 border-t border-base-200">
            <span className="text-[11px] font-mono tracking-wider uppercase text-base-content/50">
              Color Palette
            </span>
            <div className="flex items-center gap-2">
              {[
                { name: 'Indigo', color: '#6366f1' },
                { name: 'Emerald', color: '#10b981' },
                { name: 'Amber', color: '#f59e0b' },
                { name: 'Rose', color: '#f43f5e' },
                { name: 'Cyan', color: '#06b6d4' },
              ].map((item) => (
                <button
                  key={item.color}
                  type="button"
                  onClick={() => setCradleColor(item.color)}
                  title={item.name}
                  className={`size-5 rounded-full border-2 transition-transform hover:scale-115 ${
                    cradleColor === item.color
                      ? 'border-base-content scale-115 shadow-sm'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: item.color }}
                  aria-label={`Select ${item.name} color`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
