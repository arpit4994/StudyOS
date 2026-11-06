
import { useRef, useState } from "react";
import {
  User,
  Palette,
  Download,
  Upload,
  Trash2,
  Settings as SettingsIcon,
  ShieldCheck,
} from "lucide-react";

const STORAGE_KEYS = [
  "study-os-tasks",
  "study-os-goals",
  "study-os-subjects",
  "study-os-revisions",
  "study-os-focus-sessions",
  "study-os-tests",
  "study-os-notes",
  "study-os-habits",
  "study-os-finance",
  "study-os-projects",
];

type Preferences = {
  displayName: string;
  workspaceName: string;
  studyGoal: string;
};

const SETTINGS_KEY = "study-os-settings";

function loadSettings(): Preferences {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved
      ? { ...{ displayName: "Arpit", workspaceName: "My Workspace", studyGoal: "4" }, ...JSON.parse(saved) }
      : { displayName: "Arpit", workspaceName: "My Workspace", studyGoal: "4" };
  } catch {
    return { displayName: "Arpit", workspaceName: "My Workspace", studyGoal: "4" };
  }
}

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<Preferences>(loadSettings);
  const [message, setMessage] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(preferences));
    setMessage("Settings saved successfully.");
  }

  function exportBackup() {
    const backup: Record<string, unknown> = {};

    [...STORAGE_KEYS, SETTINGS_KEY].forEach((key) => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        try {
          backup[key] = JSON.parse(value);
        } catch {
          backup[key] = value;
        }
      }
    });

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "study-os-backup.json";
    link.click();
    URL.revokeObjectURL(url);

    setMessage("Backup exported successfully.");
  }

  async function importBackup(file: File) {
    try {
      const content = await file.text();
      const backup = JSON.parse(content);

      if (!backup || typeof backup !== "object" || Array.isArray(backup)) {
        throw new Error("Invalid backup format.");
      }

      const allowedKeys = [...STORAGE_KEYS, SETTINGS_KEY];

      allowedKeys.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(backup, key)) {
          localStorage.setItem(key, JSON.stringify(backup[key]));
        }
      });

      setPreferences(loadSettings());
      window.dispatchEvent(new Event("study-os-tasks-updated"));
      window.dispatchEvent(new Event("study-os-goals-updated"));
      window.dispatchEvent(new Event("study-os-subjects-updated"));
      setMessage("Backup imported. Refresh the page to update all modules.");
    } catch {
      setMessage("Import failed. Please select a valid STUDY OS backup.");
    }
  }

  function clearAppData() {
    const confirmed = window.confirm(
      "This will permanently clear your STUDY OS data from this browser. Export a backup first if you want to keep it. Continue?"
    );

    if (!confirmed) return;

    [...STORAGE_KEYS, SETTINGS_KEY].forEach((key) => {
      localStorage.removeItem(key);
    });

    setPreferences({
      displayName: "Arpit",
      workspaceName: "My Workspace",
      studyGoal: "4",
    });

    setMessage("App data cleared. Refresh the page to reload default data.");
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <p className="eyebrow">PERSONALISE YOUR WORKSPACE</p>
          <h1>Settings</h1>
          <p className="welcome-subtitle">
            Manage your profile, preferences and app data.
          </p>
        </div>
      </div>

      <section className="glass settings-panel">
        <div className="panel-heading">
          <div>
            <h3><User size={18} /> Profile & Workspace</h3>
            <p>Customise your workspace details.</p>
          </div>
        </div>

        <div className="settings-form">
          <label>
            Display name
            <input
              value={preferences.displayName}
              onChange={(e) =>
                setPreferences({ ...preferences, displayName: e.target.value })
              }
              placeholder="Your name"
            />
          </label>

          <label>
            Workspace name
            <input
              value={preferences.workspaceName}
              onChange={(e) =>
                setPreferences({ ...preferences, workspaceName: e.target.value })
              }
              placeholder="Workspace name"
            />
          </label>

          <label>
            Daily study goal (hours)
            <input
              type="number"
              min="1"
              max="16"
              value={preferences.studyGoal}
              onChange={(e) =>
                setPreferences({ ...preferences, studyGoal: e.target.value })
              }
            />
          </label>

          <button className="primary-button" onClick={saveSettings}>
            <SettingsIcon size={16} /> Save Preferences
          </button>
        </div>
      </section>

      <section className="glass settings-panel">
        <div className="panel-heading">
          <div>
            <h3><Palette size={18} /> Appearance</h3>
            <p>Your current workspace uses the dark interface.</p>
          </div>
        </div>
        <div className="settings-info-row">
          <div>
            <strong>Dark theme</strong>
            <span>Glassmorphism · Violet accents</span>
          </div>
          <span className="settings-theme-label">Active</span>
        </div>
      </section>

      <section className="glass settings-panel">
        <div className="panel-heading">
          <div>
            <h3><ShieldCheck size={18} /> Data & Backup</h3>
            <p>Keep a copy of your STUDY OS information.</p>
          </div>
        </div>

        <div className="settings-action-row">
          <div>
            <strong>Export backup</strong>
            <span>Download your saved app data as a JSON file.</span>
          </div>
          <button className="secondary-button" onClick={exportBackup}>
            <Download size={16} /> Export
          </button>
        </div>

        <div className="settings-action-row">
          <div>
            <strong>Import backup</strong>
            <span>Restore data from a STUDY OS backup file.</span>
          </div>
          <button
            className="secondary-button"
            onClick={() => fileInput.current?.click()}
          >
            <Upload size={16} /> Import
          </button>
          <input
            ref={fileInput}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importBackup(file);
              e.target.value = "";
            }}
          />
        </div>
      </section>

      <section className="glass settings-panel settings-danger-panel">
        <div className="panel-heading">
          <div>
            <h3><Trash2 size={18} /> Danger Zone</h3>
            <p>Reset your locally saved STUDY OS information.</p>
          </div>
        </div>

        <div className="settings-action-row">
          <div>
            <strong>Clear app data</strong>
            <span>This action cannot be undone without a backup.</span>
          </div>
          <button className="settings-danger-button" onClick={clearAppData}>
            <Trash2 size={16} /> Clear Data
          </button>
        </div>
      </section>

      {message && <p className="settings-message">{message}</p>}
    </div>
  );
}
