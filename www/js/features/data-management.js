import { defaultState, getFormattedDate } from "../constants.js";
import { clearState } from "../storage.js";
import { getState, setState, saveState } from "../core/app-state.js";
import {
  exportDataBtn,
  importDataBtn,
  importFileInput,
  fullResetBtn,
} from "../core/dom.js";

export function setupDataManagement({ refresh, applySelectedDua }) {
  if (exportDataBtn) {
    exportDataBtn.addEventListener("click", async () => {
      const state = getState();
      const fileName = `istighfar_backup_${getFormattedDate()}.json`;

      const exportPayload = {
        ...state,
        // Legacy field kept accurate for external readers.
        kCompletedCount: Math.floor((Number(state.lifetimeTotal) || 0) / 1000),
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
          if (
            imported &&
            typeof imported === "object" &&
            typeof imported.lifetimeTotal === "number"
          ) {
            setState({
              ...defaultState,
              ...imported,
              selectedDua: imported.selectedDua || "1",
              unlockedBadges: new Set(
                Array.isArray(imported.unlockedBadges)
                  ? imported.unlockedBadges
                  : [],
              ),
              dailyHistory: imported.dailyHistory || {},
            });
            const state = getState();
            state.kCompletedCount = Math.floor(
              (Number(state.lifetimeTotal) || 0) / 1000,
            );
            saveState();

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
