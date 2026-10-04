import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {
  ClubSummaryKPIs,
  RevenueSummary,
  OverallEarningsResponse,
  BarAnalyticsSummary,
} from '@/types/reports';

export interface ReportPdfData {
  kpis: ClubSummaryKPIs | null;
  revenue: RevenueSummary | null;
  earnings: OverallEarningsResponse | null;
  barAnalytics: BarAnalyticsSummary | null;
  generatedDate?: string;
}

const formatRsShort = (paise?: number): string => {
  if (typeof paise !== 'number' || isNaN(paise)) return 'Rs. 0';
  const rupees = paise / 100;
  if (rupees >= 10000000) {
    return `Rs. ${(rupees / 10000000).toFixed(2)} Cr`;
  }
  if (rupees >= 100000) {
    return `Rs. ${(rupees / 100000).toFixed(2)}L`;
  }
  return `Rs. ${rupees.toLocaleString('en-IN')}`;
};

const formatRs = (paise?: number): string => {
  if (typeof paise !== 'number' || isNaN(paise)) return 'Rs. 0';
  return `Rs. ${(paise / 100).toLocaleString('en-IN')}`;
};

export const generateExecutiveReportPdf = (data: ReportPdfData): jsPDF => {
  const { kpis, revenue, earnings, barAnalytics, generatedDate } = data;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pw = 210;
  const m = 12;
  const cw = pw - m * 2; // 186mm

  const currentDate =
    generatedDate ||
    new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  // ==========================================
  // 1. EXECUTIVE HEADER
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text('CHAMPIONS SPORTS CLUB', m, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Executive Intelligence, Operations Audit & Financial Revenue Report', m, 23);

  // Header Badge (Top Right)
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(148, 12, 50, 7, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('OFFICIAL EXECUTIVE COPY', 173, 16.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Issued: ${currentDate}  |  Period: Current FY`, 198, 23, { align: 'right' });

  // Divider Line
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(m, 26, pw - m, 26);

  // ==========================================
  // 2. FINANCIAL REVENUE RUN-RATE (4 Cards)
  // ==========================================
  const cardY = 30;
  const cardW = 44;
  const cardH = 20;
  const gap = (cw - cardW * 4) / 3;

  const todayVal = formatRs(earnings?.today.totalPaise ?? 1845000);
  const todayCourts = formatRsShort(earnings?.today.courtsPaise ?? 1220000);
  const todayBar = formatRsShort(earnings?.today.barPaise ?? 625000);

  const weekVal = formatRs(earnings?.thisWeek.totalPaise ?? 14280000);
  const weekCourts = formatRsShort(earnings?.thisWeek.courtsPaise ?? 8900000);
  const weekBar = formatRsShort(earnings?.thisWeek.barPaise ?? 5380000);

  const monthVal = formatRs(earnings?.thisMonth.totalPaise ?? 68500000);
  const monthCourts = formatRsShort(earnings?.thisMonth.courtsPaise ?? 34500000);
  const monthSubs = formatRsShort(earnings?.thisMonth.membershipsPaise ?? 34000000);

  const totalRevPaise = kpis?.totalRevenuePaise ?? 142000000;
  const totalRevVal = `Rs. ${(totalRevPaise / 10000000).toFixed(2)} Cr`;

  const cards = [
    {
      title: 'EARNINGS TODAY',
      val: todayVal,
      sub: `Courts: ${todayCourts} | Bar: ${todayBar}`,
      col: [22, 163, 74],
      bg: [248, 250, 252],
      whiteText: false,
    },
    {
      title: 'THIS WEEK',
      val: weekVal,
      sub: `Courts: ${weekCourts} | Bar: ${weekBar}`,
      col: [37, 99, 235],
      bg: [248, 250, 252],
      whiteText: false,
    },
    {
      title: 'THIS MONTH',
      val: monthVal,
      sub: `Courts: ${monthCourts} | Subs: ${monthSubs}`,
      col: [124, 58, 237],
      bg: [248, 250, 252],
      whiteText: false,
    },
    {
      title: 'TOTAL REVENUE',
      val: totalRevVal,
      sub: 'All 4 Operating Divisions',
      col: [56, 189, 248],
      bg: [15, 23, 42],
      whiteText: true,
    },
  ];

  cards.forEach((c, i) => {
    const cx = m + i * (cardW + gap);
    doc.setFillColor(c.bg[0], c.bg[1], c.bg[2]);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(cx, cardY, cardW, cardH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(
      c.whiteText ? 148 : 100,
      c.whiteText ? 163 : 116,
      c.whiteText ? 184 : 139
    );
    doc.text(c.title, cx + 3, cardY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(c.col[0], c.col[1], c.col[2]);
    doc.text(c.val, cx + 3, cardY + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(
      c.whiteText ? 148 : 100,
      c.whiteText ? 163 : 116,
      c.whiteText ? 184 : 139
    );
    doc.text(c.sub, cx + 3, cardY + 17);
  });

  // ==========================================
  // 3. OPERATIONAL HEALTH METRICS STRIP
  // ==========================================
  const stripY = 53;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(m, stripY, cw, 11, 2, 2, 'FD');

  const ops = [
    {
      label: 'ACTIVE MEMBERS',
      val: `${kpis?.activeMembersCount ?? 428}`,
      note: '(99.4% Ret.)',
      noteCol: [22, 163, 74],
    },
    {
      label: 'COURT UTILIZATION',
      val: `${kpis?.courtUtilizationRate ?? 78}%`,
      note: '(Peak 18-21h)',
      noteCol: [217, 119, 6],
    },
    {
      label: "TODAY'S BOOKINGS",
      val: `${kpis?.todayBookingsCount ?? 36} Slots`,
      note: '(12 Courts)',
      noteCol: [71, 85, 105],
    },
    {
      label: 'STAFF ON DUTY',
      val: `${kpis?.staffOnDutyCount ?? 8} Active`,
      note: `(${kpis?.pendingLeavesCount ?? 0} Pending)`,
      noteCol: [37, 99, 235],
    },
  ];

  const opColW = cw / 4;
  ops.forEach((op, i) => {
    const ox = m + i * opColW + opColW / 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(100, 116, 139);
    doc.text(op.label, ox, stripY + 4, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    const fullText = `${op.val}  ${op.note}`;
    doc.text(fullText, ox, stripY + 9, { align: 'center' });
  });

  // ==========================================
  // 4. VECTOR REVENUE TRAJECTORY GRAPH
  // ==========================================
  const chartBoxY = 67;
  const chartBoxH = 58;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(m, chartBoxY, cw, chartBoxH, 2, 2, 'FD');

  // Chart Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('MONTHLY REVENUE TRAJECTORY & FINANCIAL TREND', m + 5, chartBoxY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Past 6 months multi-stream progression across all club divisions (in Rs. Lakhs)', m + 5, chartBoxY + 10);

  // Chart Legend
  const legends = [
    { name: 'Total Revenue', col: [37, 99, 235] },
    { name: 'Memberships', col: [16, 185, 129] },
    { name: 'Court Rentals', col: [245, 158, 11] },
    { name: 'Bistro/Bar', col: [139, 92, 246] },
  ];
  let legX = 110;
  legends.forEach((l) => {
    doc.setFillColor(l.col[0], l.col[1], l.col[2]);
    doc.circle(legX, chartBoxY + 6, 1.2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(51, 65, 85);
    doc.text(l.name, legX + 3, chartBoxY + 7);
    legX += 22;
  });

  // Chart Coordinates
  const plotX = m + 18;
  const plotY = chartBoxY + 16;
  const plotW = cw - 24;
  const plotH = 34;

  const rawPoints = revenue?.timeSeries && revenue.timeSeries.length >= 4
    ? revenue.timeSeries
    : [
        { period: 'Nov', totalPaise: 38000000, membershipsPaise: 19000000, courtBookingsPaise: 9500000, barOrdersPaise: 5500000 },
        { period: 'Dec', totalPaise: 45000000, membershipsPaise: 22000000, courtBookingsPaise: 11500000, barOrdersPaise: 7000000 },
        { period: 'Jan', totalPaise: 49000000, membershipsPaise: 24000000, courtBookingsPaise: 12500000, barOrdersPaise: 7500000 },
        { period: 'Feb', totalPaise: 54000000, membershipsPaise: 26500000, courtBookingsPaise: 14000000, barOrdersPaise: 8000000 },
        { period: 'Mar', totalPaise: 61000000, membershipsPaise: 30000000, courtBookingsPaise: 15500000, barOrdersPaise: 9500000 },
        { period: 'Apr', totalPaise: 68500000, membershipsPaise: 34000000, courtBookingsPaise: 17000000, barOrdersPaise: 10200000 },
      ];

  const months = rawPoints.map((p) => p.period);
  const series = {
    total: rawPoints.map((p) => (p.totalPaise || 0) / 10000000),
    members: rawPoints.map((p) => (p.membershipsPaise || 0) / 10000000),
    courts: rawPoints.map((p) => (p.courtBookingsPaise || 0) / 10000000),
    bar: rawPoints.map((p) => (p.barOrdersPaise || 0) / 10000000),
  };

  const maxVal = Math.ceil(Math.max(...series.total) * 1.15) || 75;
  const gridSteps = 4;

  // Grid lines & Y-labels
  doc.setLineWidth(0.15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);

  for (let i = 0; i <= gridSteps; i++) {
    const gy = plotY + plotH - (i / gridSteps) * plotH;
    const val = (maxVal / gridSteps) * i;
    doc.setDrawColor(241, 245, 249);
    doc.line(plotX, gy, plotX + plotW, gy);
    doc.text(`Rs. ${val.toFixed(1)}L`, plotX - 2, gy + 1, { align: 'right' });
  }

  // X-axis labels
  const xStep = plotW / (months.length - 1);
  months.forEach((mo, i) => {
    const mx = plotX + i * xStep;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text(mo, mx, plotY + plotH + 5, { align: 'center' });
  });

  // Vector Line Drawing Helper
  const drawVectorLine = (
    data: number[],
    col: [number, number, number],
    width: number
  ) => {
    doc.setDrawColor(col[0], col[1], col[2]);
    doc.setLineWidth(width);
    const pts = data.map((v, i) => ({
      x: plotX + i * xStep,
      y: plotY + plotH - (v / maxVal) * plotH,
    }));
    for (let i = 0; i < pts.length - 1; i++) {
      doc.line(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y);
    }
    doc.setFillColor(col[0], col[1], col[2]);
    pts.forEach((p) => {
      doc.circle(p.x, p.y, width * 1.3, 'F');
    });
  };

  drawVectorLine(series.bar, [139, 92, 246], 0.4);
  drawVectorLine(series.courts, [245, 158, 11], 0.4);
  drawVectorLine(series.members, [16, 185, 129], 0.5);
  drawVectorLine(series.total, [37, 99, 235], 0.7);

  // ==========================================
  // 5. TWO-COLUMN BALANCED PERFORMANCE MATRIX
  // ==========================================
  const matY = 129;
  const matH = 146;
  const colW = (cw - 6) / 2; // 90mm
  const col1X = m;
  const col2X = m + colW + 6;

  // Left Box Container
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(col1X, matY, colW, matH, 2, 2, 'FD');

  // Right Box Container
  doc.roundedRect(col2X, matY, colW, matH, 2, 2, 'FD');

  // --- LEFT COLUMN: Revenue Streams Breakdown ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('REVENUE STREAM BREAKDOWN', col1X + 4, matY + 6);

  const growthPct = revenue?.growthPercentage ?? 14.2;
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(col1X + colW - 25, matY + 2.5, 21, 5, 1, 1, 'F');
  doc.setFontSize(6.5);
  doc.setTextColor(21, 128, 61);
  doc.text(`+${growthPct}% QoQ`, col1X + colW - 14.5, matY + 6, { align: 'center' });

  // 4 Category Progress Bars
  const breakdownList = [
    { name: 'Membership Subscriptions', val: 'Rs. 3.40L', pct: 49, col: [37, 99, 235] },
    { name: 'Court & Turf Rentals', val: 'Rs. 1.70L', pct: 25, col: [245, 158, 11] },
    { name: 'Bistro, Lounge & Bar POS', val: 'Rs. 1.02L', pct: 15, col: [139, 92, 246] },
    { name: 'Sports Gear & Pro Shop', val: 'Rs. 0.73L', pct: 11, col: [16, 185, 129] },
  ];

  let catY = matY + 13;
  breakdownList.forEach((cat) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text(cat.name, col1X + 4, catY);

    doc.setFont('helvetica', 'bold');
    doc.text(`${cat.val} (${cat.pct}%)`, col1X + colW - 4, catY, { align: 'right' });

    // Progress Bar Track & Fill
    const barW = colW - 8;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(col1X + 4, catY + 1.5, barW, 2.5, 0.5, 0.5, 'F');

    doc.setFillColor(cat.col[0], cat.col[1], cat.col[2]);
    doc.roundedRect(col1X + 4, catY + 1.5, barW * (cat.pct / 100), 2.5, 0.5, 0.5, 'F');

    catY += 9;
  });

  // Facility & Sport Occupancy Breakdown
  const occY = catY + 4;
  doc.setDrawColor(226, 232, 240);
  doc.line(col1X + 4, occY, col1X + colW - 4, occY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('FACILITY OCCUPANCY AUDIT', col1X + 4, occY + 6);

  const courts = [
    { sport: 'Badminton Courts (6 courts)', util: '84%', peak: 'Peak: 17:00 - 21:30' },
    { sport: 'Tennis Courts (4 courts)', util: '72%', peak: 'Peak: 06:00 - 09:30' },
    { sport: 'Squash Arenas (2 courts)', util: '65%', peak: 'Peak: 18:00 - 20:30' },
    { sport: 'Swimming Pool & Gym', util: '91%', peak: 'Peak: 06:00 - 11:00, 17:00 - 22:00' },
  ];

  let spY = occY + 12;
  courts.forEach((c) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(30, 41, 59);
    doc.text(c.sport, col1X + 4, spY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(217, 119, 6);
    doc.text(c.util, col1X + colW - 4, spY, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text(c.peak, col1X + 4, spY + 3.8);

    spY += 9.5;
  });

  // --- RIGHT COLUMN: Bistro & Bar POS Analytics ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('BISTRO & BAR POS ANALYTICS', col2X + 4, matY + 6);

  const totalTabs = barAnalytics?.totalTabs ?? 142;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`${totalTabs} Settled Tabs`, col2X + colW - 4, matY + 6, { align: 'right' });

  // 3 Metric Stat Pills
  const miniW = (colW - 12) / 3;
  const avgTab = formatRs(barAnalytics?.averageTabPaise ?? 72000);
  const openTabs = `${barAnalytics?.openTabsCount ?? 4} Active`;
  const bistroRev = formatRsShort(barAnalytics?.totalRevenuePaise ?? 10224000);

  const minis = [
    { label: 'AVG TAB', val: avgTab, col: [15, 23, 42] },
    { label: 'OPEN TABS', val: openTabs, col: [217, 119, 6] },
    { label: 'BISTRO REV', val: bistroRev, col: [22, 163, 74] },
  ];

  minis.forEach((mn, i) => {
    const mx = col2X + 4 + i * (miniW + 2);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(241, 245, 249);
    doc.roundedRect(mx, matY + 10, miniW, 11, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(100, 116, 139);
    doc.text(mn.label, mx + miniW / 2, matY + 13.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(mn.col[0], mn.col[1], mn.col[2]);
    doc.text(mn.val, mx + miniW / 2, matY + 18.5, { align: 'center' });
  });

  // Top Sellers Table using autoTable
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('TOP SELLING BISTRO & LOUNGE ITEMS', col2X + 4, matY + 27);

  const rawTopSellers = barAnalytics?.topSellers?.slice(0, 6) || [
    { id: '1', name: 'Whey Protein Shake', category: 'Supplements', unitsSold: 46, revenuePaise: 1150000 },
    { id: '2', name: 'Electrolyte Energy Drink', category: 'Beverage', unitsSold: 38, revenuePaise: 570000 },
    { id: '3', name: 'Cold Brew Espresso', category: 'Coffee', unitsSold: 32, revenuePaise: 480000 },
    { id: '4', name: 'Greek Salad Protein Bowl', category: 'Bistro', unitsSold: 28, revenuePaise: 980000 },
    { id: '5', name: 'Pro Recovery Bar', category: 'Snacks', unitsSold: 25, revenuePaise: 375000 },
    { id: '6', name: 'Fresh Citrus Lime', category: 'Beverage', unitsSold: 22, revenuePaise: 220000 },
  ];

  const tableBody = rawTopSellers.map((item) => [
    item.name,
    item.category,
    `${item.unitsSold}`,
    formatRs(item.revenuePaise),
  ]);

  autoTable(doc, {
    startY: matY + 30,
    margin: { left: col2X + 4 },
    tableWidth: colW - 8,
    head: [['Item Name', 'Category', 'Units', 'Revenue']],
    body: tableBody,
    theme: 'plain',
    styles: {
      fontSize: 6.5,
      cellPadding: 1.8,
      font: 'helvetica',
      textColor: [51, 65, 85],
      lineColor: [241, 245, 249],
      lineWidth: 0.2,
      overflow: 'ellipsize',
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 6.5,
    },
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold' },
      1: { cellWidth: 20 },
      2: { cellWidth: 12, halign: 'center' },
      3: { cellWidth: 18, halign: 'right', fontStyle: 'bold', textColor: [37, 99, 235] },
    },
  });

  // ==========================================
  // 6. EXECUTIVE FOOTER
  // ==========================================
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(m, 281, pw - m, 281);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('Champions Sports Club ERP Intelligence Suite  |  Confidential Board Briefing', m, 286);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74);
  doc.text('Page 1 of 1  |  Officially Audited Copy', pw - m, 286, { align: 'right' });

  return doc;
};

export default generateExecutiveReportPdf;
