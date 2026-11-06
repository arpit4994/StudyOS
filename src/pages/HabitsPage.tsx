
import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Flame,
  CheckCircle2,
  Target,
} from "lucide-react";

type Habit = {
  id: number;
  name: string;
  completedDates: string[];
};

const STORAGE_KEY = "study-os-habits";

function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadHabits(): Habit[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>(loadHabits);
  const [newHabit, setNewHabit] = useState("");

  const today = getToday();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits]);

  const completedToday = habits.filter((habit) =>
    habit.completedDates.includes(today)
  ).length;

  const progress = habits.length
    ? Math.round((completedToday / habits.length) * 100)
    : 0;

  function addHabit(e: React.FormEvent) {
    e.preventDefault();

    if (!newHabit.trim()) return;

    setHabits((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: newHabit.trim(),
        completedDates: [],
      },
    ]);

    setNewHabit("");
  }

  function toggleHabit(id: number) {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== id) return habit;

        const completed = habit.completedDates.includes(today);

        return {
          ...habit,
          completedDates: completed
            ? habit.completedDates.filter((date) => date !== today)
            : [...habit.completedDates, today],
        };
      })
    );
  }

  function deleteHabit(id: number) {
    setHabits((prev) => prev.filter((habit) => habit.id !== id));
  }

  function getStreak(habit: Habit) {
    const dates = new Set(habit.completedDates);
    const cursor = new Date(`${today}T12:00:00`);

    if (!dates.has(today)) {
      cursor.setDate(cursor.getDate() - 1);
    }

    let streak = 0;

    while (dates.has(
      `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`
    )) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }

  return (
    <div className="habits-page">
      <div className="habits-header">
        <div>
          <p className="eyebrow">BUILD CONSISTENCY</p>
          <h1>Habits & Routine</h1>
          <p className="welcome-subtitle">
            Small daily actions create lasting progress.
          </p>
        </div>
      </div>

      <section className="habits-stats">
        <article className="glass stat-card">
          <div className="stat-top">
            <span>Total Habits</span>
            <Target size={19} />
          </div>
          <h2>{habits.length}</h2>
          <p>Your daily commitments</p>
        </article>

        <article className="glass stat-card">
          <div className="stat-top">
            <span>Completed Today</span>
            <CheckCircle2 size={19} />
          </div>
          <h2>{completedToday}/{habits.length}</h2>
          <p>Habits completed</p>
        </article>

        <article className="glass stat-card">
          <div className="stat-top">
            <span>Daily Progress</span>
            <Flame size={19} />
          </div>
          <h2>{progress}%</h2>
          <p>Today's completion rate</p>
        </article>
      </section>

      <section className="glass panel habits-panel">
        <div className="habits-panel-heading">
          <div>
            <h3>Daily Habits</h3>
            <p>Track your consistency every day.</p>
          </div>
        </div>

        <form className="habit-add-form" onSubmit={addHabit}>
          <input
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            placeholder="Add a new habit..."
            maxLength={70}
          />
          <button className="primary-button" type="submit">
            <Plus size={17} /> Add Habit
          </button>
        </form>

        {habits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Target size={25} />
            </div>
            <h4>No habits added yet</h4>
            <p>Start with one small habit you want to build.</p>
          </div>
        ) : (
          <div className="habits-list">
            {habits.map((habit) => {
              const completed = habit.completedDates.includes(today);
              const streak = getStreak(habit);

              return (
                <article className="habit-row" key={habit.id}>
                  <button
                    className={`habit-check ${completed ? "completed" : ""}`}
                    onClick={() => toggleHabit(habit.id)}
                    aria-label={`Mark ${habit.name} ${completed ? "incomplete" : "complete"}`}
                  >
                    {completed && <CheckCircle2 size={19} />}
                  </button>

                  <div className="habit-info">
                    <strong className={completed ? "habit-done" : ""}>
                      {habit.name}
                    </strong>
                    <span>
                      <Flame size={14} /> {streak} day streak
                    </span>
                  </div>

                  <span className={`habit-status ${completed ? "done" : ""}`}>
                    {completed ? "Completed" : "Pending"}
                  </span>

                  <button
                    className="habit-delete"
                    onClick={() => deleteHabit(habit.id)}
                    aria-label={`Delete ${habit.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
