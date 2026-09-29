import { getFormattedDate } from "../constants.js";
import { getState } from "../core/app-state.js";
import { getRecentDays, getMonthTotal } from "../core/dates.js";
import {
  weeklyChartCanvas,
  chartTotalLabel,
  heatmapGrid,
  heatmapMonths,
  insightDate,
  insightTodayProgress,
  insightTodayRemaining,
  insightTodayPercent,
  insightTodayBar,
  insightWeekTotal,
  insightWeekChange,
  insightMonthTotal,
  insightMonthChange,
  insightBestDay,
  insightAvgTaps,
  insightRhythmLabel,
  streakWeekRow,
} from "../core/dom.js";

let weeklyChartInstance = null;

function setChange(el, current, previous) {
  if (!el) return;
  const diff = current - previous;
  el.dataset.trend = diff > 0 ? "up" : diff < 0 ? "down" : "flat";
  el.textContent =
    diff === 0
      ? "No change"
      : `${diff > 0 ? "+" : "−"}${Math.abs(diff).toLocaleString()}`;
}

function accentRgba(alpha) {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--accent-color")
    .trim();
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(raw);
  const [r, g, b] = m
    ? m.slice(1).map((x) => parseInt(x, 16))
    : [167, 139, 250];
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function renderWeeklyChart() {
  const state = getState();
  if (!weeklyChartCanvas || !state) return;
  const ctx = weeklyChartCanvas.getContext("2d");

  const days = [];
  const counts = [];
  let weeklySum = 0;

  getRecentDays(state.dailyHistory, 7).forEach(({ date: d, count }) => {
    weeklySum += count;
    days.push(d.toLocaleDateString("en-US", { weekday: "short" }));
    counts.push(count);
  });

  if (chartTotalLabel)
    chartTotalLabel.textContent = `${weeklySum.toLocaleString()} in 7 days`;

  const barColors = counts.map((_, i) =>
    i === counts.length - 1 ? accentRgba(1) : accentRgba(0.4),
  );

  if (weeklyChartInstance) {
    weeklyChartInstance.data.labels = days;
    weeklyChartInstance.data.datasets[0].data = counts;
    weeklyChartInstance.data.datasets[0].backgroundColor = barColors;
    weeklyChartInstance.update();
  } else {
    if (typeof Chart === "undefined") return;

    weeklyChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: days,
        datasets: [
          {
            data: counts,
            backgroundColor: barColors,
            hoverBackgroundColor: accentRgba(1),
            borderRadius: 5,
            borderSkipped: false,
            barThickness: "flex",
            maxBarThickness: 28,
            minBarLength: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#0f0d17",
            borderColor: "rgba(255, 255, 255, 0.1)",
            borderWidth: 1,
            titleColor: "#a9b0bf",
            bodyColor: "#f1f5f9",
            titleFont: { family: "Inter", size: 11, weight: "500" },
            bodyFont: { family: "Inter", size: 12, weight: "600" },
            padding: 8,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: (c) => `${c.raw.toLocaleString()} Istighfar`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false, drawBorder: false },
            ticks: {
              color: "#7f8797",
              font: { size: 11, family: "Inter" },
            },
            border: { display: false },
          },
          y: { display: false, min: 0 },
        },
        animation: { duration: 400 },
      },
    });
  }
}

export function renderInsightSummary() {
  const state = getState();
  if (!state) return;

  const today = state.todayTotal || 0;
  const target = state.target || 1000;
  const rawPercentage = target > 0 ? (today / target) * 100 : 0;
  const percentage = Math.min(100, rawPercentage);
  const displayPercentage = Math.floor(rawPercentage);
  const remaining = Math.max(0, target - today);
  const week = getRecentDays(state.dailyHistory, 7);
  const weeklyTotal = week.reduce((sum, day) => sum + day.count, 0);
  const previousWeeklyTotal = getRecentDays(state.dailyHistory, 7, 7).reduce(
    (sum, day) => sum + day.count,
    0,
  );
  const monthTotal = getMonthTotal(state.dailyHistory);
  const previousMonthTotal = getMonthTotal(state.dailyHistory, -1);
  const historyValues = Object.values(state.dailyHistory)
    .map(Number)
    .filter((v) => v > 0);
  const bestDay = historyValues.length > 0 ? Math.max(...historyValues) : 0;
  const avgTaps =
    historyValues.length > 0
      ? Math.round(
          historyValues.reduce((a, b) => a + b, 0) / historyValues.length,
        )
      : 0;

  if (insightDate) {
    insightDate.textContent = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
  if (insightTodayProgress)
    insightTodayProgress.textContent = today.toLocaleString();
  if (insightTodayRemaining) {
    insightTodayRemaining.textContent =
      percentage >= 100
        ? `Goal reached · ${target.toLocaleString()}`
        : `${remaining.toLocaleString()} remaining of ${target.toLocaleString()}`;
  }
  if (insightTodayPercent) {
    insightTodayPercent.textContent = `${displayPercentage}%`;
  }
  if (insightTodayBar) insightTodayBar.style.width = `${percentage}%`;
  if (insightWeekTotal)
    insightWeekTotal.textContent = weeklyTotal.toLocaleString();
  setChange(insightWeekChange, weeklyTotal, previousWeeklyTotal);
  if (insightMonthTotal)
    insightMonthTotal.textContent = monthTotal.toLocaleString();
  setChange(insightMonthChange, monthTotal, previousMonthTotal);
  if (insightBestDay) insightBestDay.textContent = bestDay.toLocaleString();
  if (insightAvgTaps) insightAvgTaps.textContent = avgTaps.toLocaleString();
  if (insightRhythmLabel)
    insightRhythmLabel.textContent = `${historyValues.length} active days`;
}

export function renderHeatmap() {
  const state = getState();
  if (!heatmapGrid || !heatmapMonths || !state) return;
  heatmapGrid.innerHTML = "";
  heatmapMonths.innerHTML = "";

  const totalWeeks = 26;
  const totalDays = totalWeeks * 7;
  const today = new Date();

  const dayOfWeek = today.getDay();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + (6 - dayOfWeek));

  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - totalDays + 1);

  let currentMonth = -1;
  const monthCols = [];

  for (let week = 0; week < totalWeeks; week++) {
    const weekStartDate = new Date(startDate);
    weekStartDate.setDate(startDate.getDate() + week * 7);
    const month = weekStartDate.getMonth();

    if (month !== currentMonth) {
      currentMonth = month;
      const monthName = weekStartDate.toLocaleDateString("en-US", {
        month: "short",
      });
      monthCols.push({ name: monthName, weekIndex: week });
    }
  }

  monthCols.forEach((m) => {
    const span = document.createElement("span");
    span.textContent = m.name;
    span.style.gridColumnStart = `${m.weekIndex + 1}`;
    heatmapMonths.appendChild(span);
  });

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const iso = getFormattedDate(d);
    const count = state.dailyHistory[iso] || 0;

    let level = 0;
    if (count > 2000) level = 4;
    else if (count > 800) level = 3;
    else if (count > 300) level = 2;
    else if (count > 0) level = 1;

    const cell = document.createElement("div");
    cell.className = `hm-cell hm-level-${level}`;

    const formattedDateStr = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    cell.setAttribute(
      "data-tooltip",
      `${formattedDateStr}: ${count.toLocaleString()} Istighfar`,
    );

    heatmapGrid.appendChild(cell);
  }
}

export function renderStreakWeek() {
  const state = getState();
  if (!streakWeekRow || !state) return;
  streakWeekRow.innerHTML = "";
  const week = getRecentDays(state.dailyHistory, 7);
  const todayStr = getFormattedDate();

  week.forEach(({ date: d, count }) => {
    const isToday = getFormattedDate(d) === todayStr;
    const dayLetter = d.toLocaleDateString("en-US", { weekday: "narrow" });

    const dot = document.createElement("div");
    let colorClass = "bg-white/[0.05] text-slate-500";
    if (count > 0) {
      colorClass = "theme-accent-bg text-slate-950 font-bold";
    }
    if (isToday) {
      dot.style.outline = "1px solid var(--accent-color)";
    }

    dot.className = `streak-dot ${colorClass}`;
    dot.textContent = dayLetter;
    dot.setAttribute(
      "data-tooltip",
      `${d.toLocaleDateString("en-US", {
        weekday: "short",
      })}: ${count.toLocaleString()}`,
    );
    streakWeekRow.appendChild(dot);
  });
}
