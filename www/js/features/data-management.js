import { defaultState, getFormattedDate } from "../constants.js";
import { clearState } from "../storage.js";
import { getState, setState, saveState } from "../core/app-state.js";
import { checkDailyReset } from "../core/counter.js";
import {
  exportDataBtn,
  importDataBtn,
  importFileInput,
  fullResetBtn,
} from "../core/dom.js";

// A backup is arbitrary user-supplied JSON, so nothing in it can be trusted
// on shape. `dailyHistory` feeds streak arithmetic and the heatmap, so keep
// only YYYY-MM-DD keys with finite, non-negative counts and discard the rest —
// otherwise a corrupt file poisons persisted state for good.
function sanitizeHistory(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const history = {};
  for (const [date, count] of Object.entries(raw)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const value = Number(count);
    if (!Number.isFinite(value) || value < 0) continue;
    history[date] = Math.floor(value);
  }
  return history;
}

function sanitizeBadges(raw) {
  if (!Array.isArray(raw)) return new Set();
  return new Set(raw.filter((id) => Number.isFinite(Number(id))));
}

function isValidBackup(data) {
  return (
    data !== null &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    typeof data.lifetimeTotal === "number" &&
    Number.isFinite(data.lifetimeTotal)
  );
}

export function setupDataManagement({ refresh, applySelectedDua }) {
  if (exportDataBtn) {
    exportDataBtn.addEventListener("click", async () => {
      const state = getState();
      const fileName = `istighfar_backup_${getFormattedDate()}.json`;

      const exportPayload = {
        ...state,
        unlockedBadges: Array.from(state.unlockedBadges),
      };
      const jsonStr = JSON.stringify(exportPayload, null, 2);

      if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        try {
          const { Filesystem, Share } = window.Capacitor.Plugins;

          const writeFileResult = await Filesystem.writeFile({
            path: fileName,
            data: jsonStr,
            directory: "CACHE",
            encoding: "utf8",
          });

          await Share.share({
            title: "Export Istighfar Backup",
            text: "Backup data file for Istighfar App",
            url: writeFileResult.uri,
            dialogTitle: "Save or Send Backup File",
          });
        } catch (err) {
          alert("Export failed: " + (err.message || JSON.stringify(err)));
        }
      } else {
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const dlAnchor = document.createElement("a");
        dlAnchor.href = url;
        dlAnchor.download = fileName;

        document.body.appendChild(dlAnchor);
        dlAnchor.click();

        setTimeout(() => {
          document.body.removeChild(dlAnchor);
          URL.revokeObjectURL(url);
        }, 100);
      }
    });
  }

  if (importDataBtn) {
    importDataBtn.addEventListener("click", () => {
      importFileInput.value = "";
      importFileInput.click();
    });
  }

  if (importFileInput) {
    importFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (isValidBackup(imported)) {
            setState({
              ...defaultState,
              ...imported,
              selectedDua: imported.selectedDua || "1",
              unlockedBadges: sanitizeBadges(imported.unlockedBadges),
              dailyHistory: sanitizeHistory(imported.dailyHistory),
            });
            saveState();

            // A backup can be days old. Without this the restored counts stay
            // on screen until the next tap, so reset them against today first.
            checkDailyReset();

            applySelectedDua();
            refresh();

            e.target.value = "";
            alert("Data restored successfully!");
          } else {
            alert(
              "Invalid backup file. Make sure you select an Istighfar backup (.json) file.",
            );
          }
        } catch (err) {
          alert("Error reading backup file: " + (err.message || err));
        }
      };
      reader.onerror = () => {
        alert("Could not read the file. Please try again.");
      };
      reader.readAsText(file);
    });
  }

  if (fullResetBtn) {
    fullResetBtn.addEventListener("click", () => {
      const confirmed = window.confirm(
        "Full Data Reset\n\nThis will permanently delete ALL your lifetime totals, streaks, earned badges, and activity history.\n\nAre you sure you want to proceed?",
      );

      if (confirmed) {
        setState({
          ...defaultState,
          unlockedBadges: new Set(),
          dailyHistory: {},
        });
        clearState()
          .then(() => saveState())
          .catch(console.error);
        refresh();
        alert("All data has been reset to zero.");
      }
    });
  }
}
