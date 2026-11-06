
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";

type Task = {
  id: number;
  title: string;
  priority: "Low" | "Medium" | "High";
  dueDate: string;
  completed: boolean;
};

function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function loadTasks(): Task[] {
  try {
    return JSON.parse(
      localStorage.getItem("study-os-tasks") || "[]"
    );
  } catch {
    return [];
  }
}

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(getToday);

  // AUTOMATIC TASK SYNC
  useEffect(() => {
    const updateTasks = () => {
      setTasks(loadTasks());
    };

    window.addEventListener(
      "study-os-tasks-updated",
      updateTasks
    );

    window.addEventListener("storage", updateTasks);

    return () => {
      window.removeEventListener(
        "study-os-tasks-updated",
        updateTasks
      );

      window.removeEventListener("storage", updateTasks);
    };
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dateKey = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const selectedTasks = tasks.filter(
    (task) => task.dueDate === selectedDate
  );

  const today = getToday();

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <div>
          <h1>Calendar</h1>
          <p>Plan your days. Stay consistent.</p>
        </div>

        <CalendarDays size={28} />
      </div>

      <div className="calendar-layout">
        <section className="glass calendar-panel">
          <div className="calendar-month">
            <h2>
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>

            <div>
              <button
                onClick={() =>
                  setCurrentDate(new Date(year, month - 1, 1))
                }
                aria-label="Previous month"
              >
                <ChevronLeft />
              </button>

              <button
                onClick={() =>
                  setCurrentDate(new Date(year, month + 1, 1))
                }
                aria-label="Next month"
              >
                <ChevronRight />
              </button>
            </div>
          </div>

          <div className="calendar-grid">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day) => (
                <div className="calendar-weekday" key={day}>
                  {day}
                </div>
              )
            )}

            {Array.from({ length: firstDay }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}

            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1;
              const key = dateKey(day);

              const dayTasks = tasks.filter(
                (task) => task.dueDate === key
              );

              return (
                <button
                  key={day}
                  className={`calendar-day ${
                    selectedDate === key ? "selected" : ""
                  } ${today === key ? "today" : ""}`}
                  onClick={() => setSelectedDate(key)}
                >
                  <span>{day}</span>

                  {dayTasks.length > 0 && (
                    <span className="calendar-dot" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className="glass calendar-events">
          <h2>
            {new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
              "en-US",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
              }
            )}
          </h2>

          <p>{selectedTasks.length} scheduled tasks</p>

          {selectedTasks.length === 0 ? (
            <div className="calendar-empty">
              No tasks scheduled for this day.
            </div>
          ) : (
            selectedTasks.map((task) => (
              <div className="calendar-task" key={task.id}>
                <span
                  className={`priority-dot ${task.priority.toLowerCase()}`}
                />

                <div>
                  <strong>{task.title}</strong>
                  <p>
                    {task.priority} priority ·{" "}
                    {task.completed ? "Completed" : "Pending"}
                  </p>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
