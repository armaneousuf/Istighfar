import {
  calculatePrayerTimes,
  formatPrayerTime,
  saveLocation,
  getSavedLocation,
  clearSavedLocation,
} from "../services/prayer.js";
import {
  prayerList,
  prayerStatus,
  prayerLocation,
  locationPermBtn,
  nextPrayerName,
  nextPrayerTime,
  nextPrayerCountdown,
} from "../core/dom.js";

let nextPrayerDate = null;
let nextPrayerTimer = null;

function formatCountdown(date) {
  const remainingMs = Math.max(0, date - new Date());
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `in ${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `in ${minutes}m ${seconds}s`;
  return totalSeconds > 0 ? `in ${seconds}s` : "now";
}

function updateNextPrayerCountdown() {
  if (!nextPrayerCountdown || !nextPrayerDate) return;
  nextPrayerCountdown.textContent = `${formatCountdown(nextPrayerDate)} · ${
    nextPrayerDate.toDateString() === new Date().toDateString()
      ? "today"
      : "tomorrow"
  }`;
}

function renderPrayerTimes(latitude, longitude) {
  const times = calculatePrayerTimes(latitude, longitude);
  const entries = [
    ["Fajr", times.fajr],
    ["Sunrise", times.sunrise],
    ["Dhuhr", times.dhuhr],
    ["Asr", times.asr],
    ["Maghrib", times.maghrib],
    ["Isha", times.isha],
    ["Sunset", times.sunset],
  ];
  const now = new Date();
  let next = entries.find(
    ([name, time]) => !["Sunrise", "Sunset"].includes(name) && time > now,
  );
  if (!next) {
    const tomorrow = calculatePrayerTimes(
      latitude,
      longitude,
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
    );
    next = ["Fajr", tomorrow.fajr];
  }
  nextPrayerDate = next[1];

  if (nextPrayerName) nextPrayerName.textContent = next[0];
  if (nextPrayerTime) nextPrayerTime.textContent = formatPrayerTime(next[1]);
  updateNextPrayerCountdown();
  if (nextPrayerTimer) clearInterval(nextPrayerTimer);
  nextPrayerTimer = setInterval(updateNextPrayerCountdown, 1000);

  prayerList.innerHTML = entries
    .map(([name, time]) => {
      const isMarker = name === "Sunrise" || name === "Sunset";
      const isNext = name === next[0] && time.getTime() === next[1].getTime();
      return `<div class="pr-row${isMarker ? " marker" : ""}${
        isNext ? " next" : ""
      }"><span class="pr-name">${name}</span><span class="pr-time">${formatPrayerTime(
        time,
      )}</span></div>`;
    })
    .join("");
  prayerStatus.textContent =
    "Karachi method · Hanafi Asr · calculated on device";
  prayerLocation.textContent = `${latitude.toFixed(2)}, ${longitude.toFixed(
    2,
  )}`;
  locationPermBtn.querySelector("span").textContent =
    "Refresh current location";
}

export function loadPrayerTimes() {
  const saved = getSavedLocation();
  if (saved) {
    renderPrayerTimes(saved.latitude, saved.longitude);
    return;
  }

  if (!navigator.geolocation) {
    prayerStatus.textContent = "Location is unavailable on this device.";
    return;
  }

  prayerStatus.textContent = "Finding your location…";
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      saveLocation(coords.latitude, coords.longitude);
      renderPrayerTimes(coords.latitude, coords.longitude);
    },
    () => {
      prayerStatus.textContent =
        "Allow location to calculate local prayer times.";
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 30 * 60 * 1000 },
  );
}

export function setupPrayerLocationButton() {
  if (!locationPermBtn) return;
  locationPermBtn.addEventListener("click", () => {
    clearSavedLocation();
    loadPrayerTimes();
  });
}
