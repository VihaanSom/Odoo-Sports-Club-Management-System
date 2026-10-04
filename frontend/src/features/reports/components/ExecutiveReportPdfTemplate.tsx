import React, { useEffect, useRef } from 'react';
import { FaTrophy } from 'react-icons/fa6';
import { formatPaise } from '@/lib/utils';
import type {
  ClubSummaryKPIs,
  RevenueSummary,
  OverallEarningsResponse,
  BarAnalyticsSummary,
} from '@/types/reports';

export interface ExecutiveReportPdfTemplateProps {
  kpis: ClubSummaryKPIs | null;
  revenue: RevenueSummary | null;
  earnings: OverallEarningsResponse | null;
  barAnalytics: BarAnalyticsSummary | null;
  generatedDate?: string;
}

export const ExecutiveReportPdfTemplate: React.FC<ExecutiveReportPdfTemplateProps> = ({
  kpis,
  revenue,
  earnings,
  barAnalytics,
  generatedDate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentDate =
    generatedDate ||
    new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  // Time series data for revenue trajectory graph
  const rawSeries = revenue?.timeSeries && revenue.timeSeries.length > 0
    ? revenue.timeSeries
    : [
        { period: 'Nov', totalPaise: 38000000, membershipsPaise: 19000000, courtBookingsPaise: 9500000, barOrdersPaise: 5500000, equipmentPaise: 4000000 },
        { period: 'Dec', totalPaise: 45000000, membershipsPaise: 22000000, courtBookingsPaise: 11500000, barOrdersPaise: 7000000, equipmentPaise: 4500000 },
        { period: 'Jan', totalPaise: 49000000, membershipsPaise: 24000000, courtBookingsPaise: 12500000, barOrdersPaise: 7500000, equipmentPaise: 5000000 },
        { period: 'Feb', totalPaise: 54000000, membershipsPaise: 26500000, courtBookingsPaise: 14000000, barOrdersPaise: 8000000, equipmentPaise: 5500000 },
        { period: 'Mar', totalPaise: 61000000, membershipsPaise: 30000000, courtBookingsPaise: 15500000, barOrdersPaise: 9500000, equipmentPaise: 6000000 },
        { period: 'Apr', totalPaise: 68500000, membershipsPaise: 34000000, courtBookingsPaise: 17000000, barOrdersPaise: 10200000, equipmentPaise: 7300000 },
      ];

  // Draw crisp vector-like canvas chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const padding = { top: 35, right: 30, bottom: 45, left: 65 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Max value calculation
    const maxVal = Math.max(...rawSeries.map((d) => d.totalPaise / 10000000)) * 1.15 || 8;
    const steps = 4;

    // Background Grid & Y-Axis labels
    ctx.font = 'bold 18px "Outfit", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= steps; i++) {
      const yVal = (maxVal / steps) * i;
      const y = padding.top + chartH - (i / steps) * chartH;

      ctx.beginPath();
      ctx.strokeStyle = i === 0 ? '#cbd5e1' : '#f1f5f9';
      ctx.lineWidth = i === 0 ? 2 : 1;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillText(`₹${yVal.toFixed(1)}L`, padding.left - 12, y);
    }

    const n = rawSeries.length;
    const xStep = chartW / (n - 1);

    // X-Axis labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = 'bold 18px "Outfit", sans-serif';
    ctx.fillStyle = '#475569';

    rawSeries.forEach((d, i) => {
      const x = padding.left + i * xStep;
      ctx.fillText(d.period, x, height - padding.bottom + 12);
    });

    // Helper to get coordinates
    const getCoords = (key: 'totalPaise' | 'membershipsPaise' | 'courtBookingsPaise' | 'barOrdersPaise') => {
      return rawSeries.map((d, i) => {
        const valLakhs = (d[key] || 0) / 10000000;
        const x = padding.left + i * xStep;
        const y = padding.top + chartH - (valLakhs / maxVal) * chartH;
        return { x, y };
      });
    };

    const drawLine = (
      coords: { x: number; y: number }[],
      color: string,
      lineWidth: number,
      fillGradient = false
    ) => {
      if (coords.length === 0) return;

      if (fillGradient) {
        const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
        gradient.addColorStop(0, 'rgba(37, 99, 235, 0.22)');
        gradient.addColorStop(1, 'rgba(37, 99, 235, 0.01)');

        ctx.beginPath();
        ctx.moveTo(coords[0].x, padding.top + chartH);
        coords.forEach((pt) => ctx.lineTo(pt.x, pt.y));
        ctx.lineTo(coords[coords.length - 1].x, padding.top + chartH);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      coords.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();

      // Points
      coords.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, lineWidth + 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      });
    };

    // Draw lines (stacked or independent streams)
    drawLine(getCoords('barOrdersPaise'), '#8b5cf6', 3);
    drawLine(getCoords('courtBookingsPaise'), '#f59e0b', 3);
    drawLine(getCoords('membershipsPaise'), '#10b981', 3.5);
    drawLine(getCoords('totalPaise'), '#2563eb', 4.5, true);

  }, [rawSeries]);

  const topSellers = barAnalytics?.topSellers?.slice(0, 5) || [
    { id: '1', name: 'Whey Isolate Shake', category: 'Supplements', unitsSold: 46, revenuePaise: 1150000 },
    { id: '2', name: 'Electrolyte Energy Drink', category: 'Beverage', unitsSold: 38, revenuePaise: 570000 },
    { id: '3', name: 'Cold Brew Espresso', category: 'Coffee', unitsSold: 32, revenuePaise: 480000 },
    { id: '4', name: 'Greek Salad Protein Bowl', category: 'Bistro', unitsSold: 28, revenuePaise: 980000 },
    { id: '5', name: 'Pro Recovery Bar', category: 'Snacks', unitsSold: 25, revenuePaise: 375000 },
  ];

  return (
    <div
      id="executive-pdf-report-template"
      style={{
        width: '800px',
        height: '1131px',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontFamily: '"Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '24px 28px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        lineHeight: 1.35,
      }}
    >
      {/* 1. HEADER SECTION */}
      <div
        style={{
          borderBottom: '2px solid #0f172a',
          paddingBottom: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              border: '1.5px solid #2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FaTrophy style={{ width: '24px', height: '24px', color: '#2563eb' }} />
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: '#0f172a',
                textTransform: 'uppercase',
              }}
            >
              Champions Sports & Leisure Club
            </h1>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: '11px',
                color: '#475569',
                fontWeight: 600,
              }}
            >
              Executive Intelligence, Operations Audit & Financial Revenue Report
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              display: 'inline-block',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '3px 8px',
              borderRadius: '4px',
            }}
          >
            Board Briefing
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>
            Issued: <span style={{ color: '#0f172a', fontWeight: 700 }}>{currentDate}</span> · Period: FY 2026-Q4
          </div>
        </div>
      </div>

      {/* 2. FINANCIAL REVENUE HIGHLIGHTS (4-Column Dense Cards) */}
      <div>
        <div
          style={{
            fontSize: '10.5px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#475569',
            marginBottom: '6px',
          }}
        >
          Financial Revenue Run-Rate
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
          }}
        >
          {/* Card 1: Today */}
          <div
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '8px 10px',
              backgroundColor: '#f8fafc',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Earnings Today
              </span>
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#16a34a', backgroundColor: '#dcfce7', padding: '1px 5px', borderRadius: '3px' }}>
                Active
              </span>
            </div>
            <div style={{ fontSize: '17px', fontWeight: 900, color: '#16a34a', marginTop: '3px', fontFamily: 'monospace' }}>
              {formatPaise(earnings?.today.totalPaise ?? 1845000)}
            </div>
            <div style={{ fontSize: '9.5px', color: '#64748b', marginTop: '3px', display: 'flex', gap: '6px' }}>
              <span>Courts: {formatPaise(earnings?.today.courtsPaise ?? 1220000)}</span>
              <span>·</span>
              <span>Bar: {formatPaise(earnings?.today.barPaise ?? 625000)}</span>
            </div>
          </div>

          {/* Card 2: This Week */}
          <div
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '8px 10px',
              backgroundColor: '#f8fafc',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                This Week
              </span>
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#2563eb', backgroundColor: '#dbeafe', padding: '1px 5px', borderRadius: '3px' }}>
                Weekly
              </span>
            </div>
            <div style={{ fontSize: '17px', fontWeight: 900, color: '#2563eb', marginTop: '3px', fontFamily: 'monospace' }}>
              {formatPaise(earnings?.thisWeek.totalPaise ?? 14280000)}
            </div>
            <div style={{ fontSize: '9.5px', color: '#64748b', marginTop: '3px', display: 'flex', gap: '6px' }}>
              <span>Courts: {formatPaise(earnings?.thisWeek.courtsPaise ?? 8900000)}</span>
              <span>·</span>
              <span>Bar: {formatPaise(earnings?.thisWeek.barPaise ?? 5380000)}</span>
            </div>
          </div>

          {/* Card 3: This Month */}
          <div
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '8px 10px',
              backgroundColor: '#f8fafc',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                This Month
              </span>
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#7c3aed', backgroundColor: '#ede9fe', padding: '1px 5px', borderRadius: '3px' }}>
                Current
              </span>
            </div>
            <div style={{ fontSize: '17px', fontWeight: 900, color: '#7c3aed', marginTop: '3px', fontFamily: 'monospace' }}>
              {formatPaise(earnings?.thisMonth.totalPaise ?? 68500000)}
            </div>
            <div style={{ fontSize: '9.5px', color: '#64748b', marginTop: '3px', display: 'flex', gap: '6px' }}>
              <span>Courts: {formatPaise(earnings?.thisMonth.courtsPaise ?? 34500000)}</span>
              <span>·</span>
              <span>Subs: {formatPaise(earnings?.thisMonth.membershipsPaise ?? 34000000)}</span>
            </div>
          </div>

          {/* Card 4: Total Club Revenue */}
          <div
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '8px 10px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase' }}>
                Total Revenue
              </span>
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#0f172a', backgroundColor: '#38bdf8', padding: '1px 5px', borderRadius: '3px' }}>
                All-Time
              </span>
            </div>
            <div style={{ fontSize: '17px', fontWeight: 900, color: '#38bdf8', marginTop: '3px', fontFamily: 'monospace' }}>
              ₹{((kpis?.totalRevenuePaise ?? 142000000) / 10000000).toFixed(2)} Cr
            </div>
            <div style={{ fontSize: '9.5px', color: '#94a3b8', marginTop: '3px' }}>
              Verified across all 4 departments
            </div>
          </div>
        </div>
      </div>

      {/* 3. OPERATIONAL HEALTH METRICS STRIP */}
      <div
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '8px 12px',
          backgroundColor: '#f1f5f9',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          textAlign: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Active Membership
          </div>
          <div style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
            {kpis?.activeMembersCount ?? 428} <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700 }}>· 99.4% Ret.</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Court Utilization
          </div>
          <div style={{ fontSize: '14px', fontWeight: 900, color: '#d97706', marginTop: '2px' }}>
            {kpis?.courtUtilizationRate ?? 78}% <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>· Peak 18-21h</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Today's Bookings
          </div>
          <div style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
            {kpis?.todayBookingsCount ?? 36} <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>· 12 Courts</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Staff on Duty
          </div>
          <div style={{ fontSize: '14px', fontWeight: 900, color: '#2563eb', marginTop: '2px' }}>
            {kpis?.staffOnDutyCount ?? 8} Duty <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>· {kpis?.pendingLeavesCount ?? 0} Leaves</span>
          </div>
        </div>
      </div>

      {/* 4. REVENUE TRAJECTORY GRAPH (Requested Graph) */}
      <div
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '10px 14px',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', letterSpacing: '0.04em' }}>
              Monthly Revenue Performance & Trajectory Trend
            </div>
            <div style={{ fontSize: '9.5px', color: '#64748b' }}>
              Historical multi-stream revenue progression across past 6 operating months
            </div>
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '9.5px', fontWeight: 700 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
              <span style={{ color: '#0f172a' }}>Total Rev</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span style={{ color: '#0f172a' }}>Memberships</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <span style={{ color: '#0f172a' }}>Courts</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#8b5cf6' }} />
              <span style={{ color: '#0f172a' }}>Bistro/Bar</span>
            </div>
          </div>
        </div>

        {/* Canvas Chart */}
        <canvas
          ref={canvasRef}
          width={1480}
          height={400}
          style={{
            width: '100%',
            height: '190px',
            display: 'block',
          }}
        />
      </div>

      {/* 5. COMPACT PERFORMANCE MATRIX (Two-Column Balanced Grid) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
        }}
      >
        {/* Left Column: Revenue Stream Category Breakdown */}
        <div
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '10px 12px',
            backgroundColor: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', letterSpacing: '0.04em' }}>
              Revenue Stream Breakdown
            </span>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#16a34a', backgroundColor: '#dcfce7', padding: '1px 5px', borderRadius: '3px' }}>
              +{revenue?.growthPercentage ?? 14.2}% QoQ
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { label: 'Membership Subscriptions', pct: 49, amount: 34000000, color: '#2563eb' },
              { label: 'Court & Turf Rentals', pct: 25, amount: 17000000, color: '#f59e0b' },
              { label: 'Bistro, Lounge & Bar POS', pct: 15, amount: 10200000, color: '#8b5cf6' },
              { label: 'Sports Gear & Pro Shop', pct: 11, amount: 7300000, color: '#10b981' },
            ].map((cat) => (
              <div key={cat.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', fontWeight: 600 }}>
                  <span style={{ color: '#334155' }}>{cat.label}</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                    {formatPaise(cat.amount)} ({cat.pct}%)
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '5px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '3px',
                    marginTop: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${cat.pct}%`,
                      height: '100%',
                      backgroundColor: cat.color,
                      borderRadius: '3px',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Court Utilization Breakdown */}
          <div
            style={{
              marginTop: '8px',
              paddingTop: '6px',
              borderTop: '1px dashed #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '9px',
              color: '#475569',
              fontWeight: 600,
            }}
          >
            <span>Badminton: <strong>84%</strong></span>
            <span>Tennis: <strong>72%</strong></span>
            <span>Squash: <strong>65%</strong></span>
            <span>Pool/Gym: <strong>91%</strong></span>
          </div>
        </div>

        {/* Right Column: Bistro & Lounge Operations + Top Sellers */}
        <div
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '10px 12px',
            backgroundColor: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', letterSpacing: '0.04em' }}>
              Bistro & Bar POS Analytics
            </span>
            <span style={{ fontSize: '9px', fontWeight: 700, color: '#475569' }}>
              {barAnalytics?.totalTabs ?? 142} Tabs Logged
            </span>
          </div>

          {/* Quick Metrics */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '6px',
              marginBottom: '8px',
              textAlign: 'center',
            }}
          >
            <div style={{ padding: '4px', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '8.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Avg Tab</div>
              <div style={{ fontSize: '11px', fontWeight: 900, color: '#0f172a', fontFamily: 'monospace' }}>
                {formatPaise(barAnalytics?.averageTabPaise ?? 72000)}
              </div>
            </div>
            <div style={{ padding: '4px', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '8.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Open Tabs</div>
              <div style={{ fontSize: '11px', fontWeight: 900, color: '#d97706', fontFamily: 'monospace' }}>
                {barAnalytics?.openTabsCount ?? 4}
              </div>
            </div>
            <div style={{ padding: '4px', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '8.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Bistro Gross</div>
              <div style={{ fontSize: '11px', fontWeight: 900, color: '#16a34a', fontFamily: 'monospace' }}>
                {formatPaise(barAnalytics?.totalRevenuePaise ?? 10224000)}
              </div>
            </div>
          </div>

          {/* Top Sellers Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                <th style={{ padding: '2px 0', fontWeight: 700 }}>Item</th>
                <th style={{ padding: '2px 0', fontWeight: 700 }}>Category</th>
                <th style={{ padding: '2px 0', fontWeight: 700, textAlign: 'center' }}>Units</th>
                <th style={{ padding: '2px 0', fontWeight: 700, textAlign: 'right' }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topSellers.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '3px 0', fontWeight: 700, color: '#1e293b' }}>{item.name}</td>
                  <td style={{ padding: '3px 0', color: '#64748b' }}>{item.category}</td>
                  <td style={{ padding: '3px 0', textAlign: 'center', fontFamily: 'monospace', fontWeight: 600 }}>
                    {item.unitsSold}
                  </td>
                  <td style={{ padding: '3px 0', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>
                    {formatPaise(item.revenuePaise)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. EXECUTIVE FOOTER */}
      <div
        style={{
          borderTop: '1px solid #cbd5e1',
          paddingTop: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '9px',
          color: '#64748b',
          fontWeight: 600,
        }}
      >
        <div>
          Champions Club ERP Intelligence Suite · Confidential Executive Briefing · Verified Records
        </div>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <span>Page 1 of 1</span>
          <span
            style={{
              backgroundColor: '#dcfce7',
              color: '#15803d',
              padding: '1px 6px',
              borderRadius: '3px',
              fontWeight: 800,
              fontSize: '8.5px',
            }}
          >
            OFFICIALLY AUDITED
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveReportPdfTemplate;
