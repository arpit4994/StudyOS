import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Check,
  ListTodo,
  Clock3,
  CheckCircle2,
} from "lucide-react";

type Task = {
  id: number;
  title: string;
  priority: "Low" | "Medium" | "High";
  dueDate: string;
  completed: boolean;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("study-os-tasks") || "[]"
      );
    } catch {
      return [];
    }
  });

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("Medium");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState("All");

  const isInitialRender = useRef(true);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    localStorage.setItem("study-os-tasks", JSON.stringify(tasks));
    window.dispatchEvent(new Event("study-os-tasks-updated"));
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setTasks((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: title.trim(),
        priority,
        dueDate,
        completed: false,
      },
    ]);

    setTitle("");
    setDueDate("");
    setPriority("Medium");
  };

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const { completed, pending, visibleTasks, completionRate } =
    useMemo(() => {
      const completedCount = tasks.filter((task) => task.completed).length;

      return {
        completed: completedCount,
        pending: tasks.length - completedCount,
        visibleTasks: tasks.filter((task) => {
          if (filter === "Pending") return !task.completed;
          if (filter === "Completed") return task.completed;
          return true;
        }),
        completionRate: tasks.length
          ? Math.round((completedCount / tasks.length) * 100)
          : 0,
      };
    }, [tasks, filter]);

  const stats = [
    { label: "Total Tasks", value: tasks.length, icon: ListTodo },
    { label: "Pending", value: pending, icon: Clock3 },
    { label: "Completed", value: completed, icon: CheckCircle2 },
    { label: "Completion", value: `${completionRate}%`, icon: Check },
  ];

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div>
          <p className="eyebrow">YOUR PRODUCTIVITY CENTRE</p>
          <h1>Task Manager</h1>
          <p className="welcome-subtitle">
            Organize your work. Execute your priorities.
          </p>
        </div>
      </div>

      <div className="stats-grid task-stats">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="glass stat-card" key={stat.label}>
              <div className="stat-top">
                <span>{stat.label}</span>
                <div className="stat-icon">
                  <Icon size={19} />
                </div>
              </div>
              <h2>{stat.value}</h2>
              <p>Your task overview</p>
            </div>
          );
        })}
      </div>

      <section className="glass task-form-panel">
        <h3>Create a new task</h3>

        <form onSubmit={addTask} className="task-form">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you need to accomplish?"
            required
          />

          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as Task["priority"])
            }
          >
            <option value="Low">Low priority</option>
            <option value="Medium">Medium priority</option>
            <option value="High">High priority</option>
          </select>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <button type="submit" className="primary-button">
            <Plus size={17} /> Add task
          </button>
        </form>
      </section>

      <section className="glass task-list-panel">
        <div className="panel-heading">
          <div>
            <h3>Your Tasks</h3>
            <p>Manage your daily responsibilities</p>
          </div>

          <div className="task-filters">
            {["All", "Pending", "Completed"].map((item) => (
              <button
                key={item}
                className={filter === item ? "filter-active" : ""}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="task-list">
          {visibleTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <ListTodo size={25} />
              </div>
              <h4>No tasks found</h4>
              <p>Create a task to get started.</p>
            </div>
          ) : (
            visibleTasks.map((task) => (
              <div className="task-row" key={task.id}>
                <button
                  className={`task-check ${task.completed ? "checked" : ""}`}
                  onClick={() => toggleTask(task.id)}
                  aria-label="Toggle task completion"
                >
                  {task.completed && <Check size={15} />}
                </button>

                <div className="task-details">
                  <strong className={task.completed ? "task-done" : ""}>
                    {task.title}
                  </strong>
                  <span>{task.dueDate || "No due date"}</span>
                </div>

                <span
                  className={`priority priority-${task.priority.toLowerCase()}`}
                >
                  {task.priority}
                </span>

                <button
                  className="delete-task"
                  onClick={() => deleteTask(task.id)}
                  aria-label="Delete task"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}