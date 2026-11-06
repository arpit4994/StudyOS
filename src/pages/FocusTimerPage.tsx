
import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";

type Mode = "focus" | "short" | "long";

const durations: Record<Mode, number> = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

const labels: Record<Mode, string> = {
  focus: "Focus Session",
  short: "Short Break",
  long: "Long Break",
};

export default function FocusTimerPage() {
  const [mode, setMode] = useState<Mode>("focus");
  const [seconds, setSeconds] = useState(durations.focus);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(
    Number(localStorage.getItem("study-os-focus-sessions") || 0)
  );

  useEffect(() => {
    if (!running) return;

    const timer = window.setInterval(() => {
      setSeconds((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);
          setRunning(false);

          if (mode === "focus") {
            const next = sessions + 1;
            setSessions(next);
            localStorage.setItem("study-os-focus-sessions", String(next));
            window.dispatchEvent(new Event("study-os-focus-updated"));

            const nextMode: Mode = next % 4 === 0 ? "long" : "short";
            setMode(nextMode);
            return durations[nextMode];
          }

          setMode("focus");
          return durations.focus;
        }

        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running, mode, sessions]);

  const selectMode = (nextMode: Mode) => {
    setRunning(false);
    setMode(nextMode);
    setSeconds(durations[nextMode]);
  };

  const reset = () => {
    setRunning(false);
    setSeconds(durations[mode]);
  };

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const progress = ((durations[mode] - seconds) / durations[mode]) * 100;

  return (
    <div className="focus-page">
      <div className="focus-heading">
        <div>
          <h1>Focus Timer</h1>
          <p>Work with intention. Take breaks. Repeat.</p>
        </div>
      </div>

      <div className="focus-main-card">
        <div className="focus-mode-tabs">
          <button
            className={mode === "focus" ? "selected" : ""}
            onClick={() => selectMode("focus")}
          >
            <Brain size={16} /> Focus
          </button>

          <button
            className={mode === "short" ? "selected" : ""}
            onClick={() => selectMode("short")}
          >
            <Coffee size={16} /> Short Break
          </button>

          <button
            className={mode === "long" ? "selected" : ""}
            onClick={() => selectMode("long")}
          >
            <Coffee size={16} /> Long Break
          </button>
        </div>

        <div className="focus-timer-circle">
          <svg viewBox="0 0 240 240">
            <circle className="timer-track" cx="120" cy="120" r="105" />
            <circle
              className="timer-progress"
              cx="120"
              cy="120"
              r="105"
              style={{
                strokeDasharray: 660,
                strokeDashoffset: 660 - (progress / 100) * 660,
              }}
            />
          </svg>

          <div className="focus-timer-content">
            <span>{labels[mode]}</span>
            <strong>
              {String(minutes).padStart(2, "0")}:
              {String(remainingSeconds).padStart(2, "0")}
            </strong>
            <small>{running ? "Stay focused" : "Ready when you are"}</small>
          </div>
        </div>

        <div className="focus-controls">
          <button
            className="focus-start-btn"
            onClick={() => setRunning(!running)}
          >
            {running ? <Pause size={19} /> : <Play size={19} />}
            {running ? "Pause" : "Start Focus"}
          </button>

          <button className="focus-reset-btn" onClick={reset}>
            <RotateCcw size={18} />
          </button>
        </div>

        <div className="focus-session-count">
          <span>Completed focus sessions</span>
          <strong>{sessions}</strong>
        </div>
      </div>

      <div className="focus-tip">
        <Brain size={20} />
        <div>
          <strong>Focus rule</strong>
          <p>Keep distractions away and work on one task at a time.</p>
        </div>
      </div>
    </div>
  );
}
