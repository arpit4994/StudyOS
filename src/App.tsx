import { useEffect, useState, lazy, Suspense } from "react";

const TasksPage = lazy(() => import("./pages/TasksPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const GoalsPage = lazy(() => import("./pages/GoalsPage"));
const SubjectsPage = lazy(() => import("./pages/SubjectsPage"));
const RevisionPage = lazy(() => import("./pages/RevisionPage"));
const FocusTimerPage = lazy(() => import("./pages/FocusTimerPage"));
const TestsPage = lazy(() => import("./pages/TestsPage"));
const NotesPage = lazy(() => import("./pages/NotesPage"));
const HabitsPage = lazy(() => import("./pages/HabitsPage"));
const FinancePage = lazy(() => import("./pages/FinancePage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

import "./index.css";

import {
  LayoutDashboard,
  CalendarDays,
  Target,
  ListTodo,
  BookOpen,
  Repeat2,
  Timer,
  ClipboardList,
  NotebookPen,
  HeartPulse,
  Wallet,
  FolderKanban,
  ChartNoAxesCombined,
  Settings,
  Search,
  Bell,
  Plus,
  ArrowUpRight,
  Clock3,
  CheckCircle2,
  Flame,
  Menu,
  ChevronDown,
  X,
  AlertCircle,
} from "lucide-react";

// TYPES
type Task = {
  id: number;
  title: string;
  priority: "Low" | "Medium" | "High";
  dueDate: string;
  completed: boolean;
};

type Milestone = {
  id: number;
  title: string;
  completed: boolean;
};

type Goal = {
  id: number;
  title: string;
  description: string;
  category: string;
  targetDate: string;
  milestones: Milestone[];
};

// NAVIGATION
const navigation = [
  {
    title: "WORKSPACE",
    items: [
      { name: "Dashboard", icon: LayoutDashboard },
      { name: "Calendar", icon: CalendarDays },
      { name: "Goals & Roadmap", icon: Target },
      { name: "Tasks", icon: ListTodo },
    ],
  },
  {
    title: "ACADEMICS",
    items: [
      { name: "Subjects & Chapters", icon: BookOpen },
      { name: "Revision Centre", icon: Repeat2 },
      { name: "Focus Timer", icon: Timer },
      { name: "Tests & Exams", icon: ClipboardList },
      { name: "Notes", icon: NotebookPen },
    ],
  },
  {
    title: "PERSONAL",
    items: [
      { name: "Habits & Routine", icon: HeartPulse },
      { name: "Finance", icon: Wallet },
      { name: "Projects", icon: FolderKanban },
      { name: "Analytics", icon: ChartNoAxesCombined },
    ],
  },
];

// DEFAULT GOALS
const defaultGoals: Goal[] = [
  {
    id: 1,
    title: "Class 12 CBSE",
    description: "Achieve academic excellence in Class 12.",
    category: "Academics",
    targetDate: "2027-03-31",
    milestones: [
      { id: 11, title: "Complete syllabus", completed: false },
      { id: 12, title: "Complete first revision", completed: false },
      { id: 13, title: "Complete sample papers", completed: false },
    ],
  },
  {
    id: 2,
    title: "CUET UG 2027",
    description: "Prepare for the CUET entrance examination.",
    category: "Entrance Exam",
    targetDate: "2027-05-31",
    milestones: [
      { id: 21, title: "Complete domain subjects", completed: false },
      { id: 22, title: "Complete mock tests", completed: false },
      { id: 23, title: "Revise important topics", completed: false },
    ],
  },
  {
    id: 3,
    title: "SRCC Admission",
    description: "Work towards admission to SRCC.",
    category: "Long-term",
    targetDate: "2027-08-31",
    milestones: [
      { id: 31, title: "Prepare application", completed: false },
      { id: 32, title: "Meet admission requirements", completed: false },
    ],
  },
];

// LOCAL DATE
function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// LOAD TASKS
function loadTasks(): Task[] {
  try {
    const saved = JSON.parse(
      localStorage.getItem("study-os-tasks") || "[]"
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

// LOAD GOALS
function loadGoals(): Goal[] {
  try {
    const saved = localStorage.getItem("study-os-goals");

    if (!saved) return defaultGoals;

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : defaultGoals;
  } catch {
    return defaultGoals;
  }
}

type HabitRecord = {
  id: number;
  name: string;
  completedDates: string[];
};

type AppSettings = {
  displayName?: string;
  workspaceName?: string;
  studyGoal?: number;
};

function readArray<T>(key: string): T[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function readSettings(): AppSettings {
  try {
    return JSON.parse(localStorage.getItem("study-os-settings") || "{}");
  } catch {
    return {};
  }
}

function getCurrentStreak(dates: string[] = []) {
  const completed = new Set(dates);
  const cursor = new Date();
  let streak = 0;

  while (true) {
    const key = `${cursor.getFullYear()}-${String(
      cursor.getMonth() + 1
    ).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;

    if (!completed.has(key)) break;

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getSessionMinutes(session: Record<string, unknown>): number {
  for (const value of [
    session.durationMinutes,
    session.minutes,
    session.duration,
    session.elapsedMinutes,
  ]) {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      return value > 240 ? value / 60 : value;
    }
  }

  return 0;
}

function App() {
  const [active, setActive] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [goals, setGoals] = useState<Goal[]>(loadGoals);
  const [habits, setHabits] = useState<HabitRecord[]>(() =>
    readArray<HabitRecord>("study-os-habits")
  );
  const [focusSessions, setFocusSessions] = useState<
    Record<string, unknown>[]
  >(() => readArray<Record<string, unknown>>("study-os-focus-sessions"));
  const [settings, setSettings] = useState<AppSettings>(readSettings);

  useEffect(() => {
    const refreshDashboardData = () => {
      setHabits(readArray<HabitRecord>("study-os-habits"));
      setFocusSessions(
        readArray<Record<string, unknown>>("study-os-focus-sessions")
      );
      setSettings(readSettings());
    };

    const events = [
      "study-os-habits-updated",
      "study-os-focus-updated",
      "study-os-settings-updated",
      "storage",
    ];

    events.forEach((name) =>
      window.addEventListener(name, refreshDashboardData)
    );

    return () =>
      events.forEach((name) =>
        window.removeEventListener(name, refreshDashboardData)
      );
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setSearchOpen(true);
        document.querySelector<HTMLInputElement>(".search-box input")?.focus();
      }

      if (event.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  // SYNC TASKS
  useEffect(() => {
    const updateTasks = () => {
      setTasks(loadTasks());
    };

    window.addEventListener("study-os-tasks-updated", updateTasks);
    window.addEventListener("storage", updateTasks);

    return () => {
      window.removeEventListener("study-os-tasks-updated", updateTasks);
      window.removeEventListener("storage", updateTasks);
    };
  }, []);

  // SYNC GOALS
  useEffect(() => {
    const updateGoals = () => {
      setGoals(loadGoals());
    };

    window.addEventListener("study-os-goals-updated", updateGoals);
    window.addEventListener("storage", updateGoals);

    return () => {
      window.removeEventListener("study-os-goals-updated", updateGoals);
      window.removeEventListener("storage", updateGoals);
    };
  }, []);

  // TASK ANALYTICS
  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = tasks.length - completedTasks;

  const completionRate = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  // PRIORITY SORTING
  const priorityOrder = {
    High: 0,
    Medium: 1,
    Low: 2,
  };

  const priorityTasks = tasks
    .filter((task) => !task.completed)
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // TODAY'S TASKS
  const today = getToday();

  const todaysTasks = tasks
    .filter((task) => task.dueDate?.slice(0, 10) === today)
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // GOAL PROGRESS
  const getGoalProgress = (goal: Goal) => {
    if (goal.milestones.length === 0) return 0;

    const completed = goal.milestones.filter(
      (milestone) => milestone.completed
    ).length;

    return Math.round((completed / goal.milestones.length) * 100);
  };

  // LIVE DASHBOARD STATISTICS
  const todaySessions = focusSessions.filter((session) => {
    const sessionDate = String(
      session.date ?? session.completedAt ?? session.createdAt ?? ""
    ).slice(0, 10);

    return sessionDate === today;
  });

  const studyMinutes = todaySessions.reduce(
    (total, session) => total + getSessionMinutes(session),
    0
  );

  const studyHoursLabel = `${Math.floor(studyMinutes / 60)}h ${String(
    Math.round(studyMinutes % 60)
  ).padStart(2, "0")}m`;

  const currentStreak = habits.reduce(
    (best, habit) =>
      Math.max(best, getCurrentStreak(habit.completedDates)),
    0
  );

  const displayName = settings.displayName?.trim() || "Arpit";
  const workspaceName = settings.workspaceName?.trim() || "My Workspace";

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 17
        ? "Good afternoon"
        : "Good evening";

  const searchSources = [
    {
      key: "study-os-tasks",
      label: "Tasks",
      page: "Tasks",
      fields: ["title", "priority", "dueDate"],
    },
    {
      key: "study-os-goals",
      label: "Goals",
      page: "Goals & Roadmap",
      fields: ["title", "description", "category"],
    },
    {
      key: "study-os-subjects",
      label: "Subjects",
      page: "Subjects & Chapters",
      fields: ["name", "title", "subject", "chapter", "chapterName"],
    },
    {
      key: "study-os-revisions",
      label: "Revisions",
      page: "Revision Centre",
      fields: ["title", "name", "subject", "chapter", "chapterName"],
    },
    {
      key: "study-os-notes",
      label: "Notes",
      page: "Notes",
      fields: ["title", "content", "category"],
    },
    {
      key: "study-os-tests",
      label: "Tests",
      page: "Tests & Exams",
      fields: ["title", "subject", "date"],
    },
    {
      key: "study-os-projects",
      label: "Projects",
      page: "Projects",
      fields: ["name", "title", "description"],
    },
  ];

  const searchResults =
    searchQuery.trim().length < 2
      ? []
      : searchSources
          .flatMap((source) => {
            const records = readArray<Record<string, unknown>>(source.key);

            return records
              .filter((record) =>
                source.fields.some((field) =>
                  String(record[field] ?? "")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                )
              )
              .slice(0, 5)
              .map((record, index) => ({
                id: String(record.id ?? `${source.key}-${index}`),
                title: String(
                  record.title ??
                    record.name ??
                    record.chapterName ??
                    record.chapter ??
                    "Untitled"
                ),
                category: source.label,
                page: source.page,
              }));
          })
          .slice(0, 8);

  const overdueTasks = tasks.filter(
    (task) =>
      !task.completed &&
      task.dueDate &&
      task.dueDate.slice(0, 10) < today
  );

  const notificationItems = [
    ...overdueTasks.map((task) => ({
      id: `task-${task.id}`,
      title: task.title,
      detail: `Overdue · ${task.dueDate}`,
      page: "Tasks",
      urgent: true,
    })),
    ...todaysTasks
      .filter((task) => !task.completed)
      .map((task) => ({
        id: `today-${task.id}`,
        title: task.title,
        detail: "Due today",
        page: "Tasks",
        urgent: false,
      })),
  ].slice(0, 8);

  const stats = [
    {
      label: "Study Hours",
      value: studyHoursLabel,
      detail: "Today's recorded focus time",
      icon: Clock3,
    },
    {
      label: "Tasks Completed",
      value: `${completedTasks} / ${tasks.length}`,
      detail: `${pendingTasks} tasks pending`,
      icon: CheckCircle2,
    },
    {
      label: "Current Streak",
      value: `${currentStreak} days`,
      detail: "Best active habit streak",
      icon: Flame,
    },
    {
      label: "Task Completion",
      value: `${completionRate}%`,
      detail: "Your task progress",
      icon: Target,
    },
  ];

  return (
    <div className="app-shell">
      {/* SIDEBAR */}
      <aside
        className={`sidebar glass ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="brand">
          <div className="brand-icon">S</div>
          <div>
            <h2>STUDY OS</h2>
            <span>PERSONAL COMMAND CENTRE</span>
          </div>
        </div>

        <div className="workspace-switch">
          <div className="workspace-avatar">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="workspace-info">
            <strong>{workspaceName}</strong>
            <span>Personal account</span>
          </div>
          <ChevronDown size={16} />
        </div>

        <nav className="navigation">
          {navigation.map((group) => (
            <div className="nav-group" key={group.title}>
              <p className="nav-heading">{group.title}</p>

              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.name}
                    className={`nav-item ${
                      active === item.name ? "active" : ""
                    }`}
                    onClick={() => {
                      setActive(item.name);
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon size={18} strokeWidth={1.8} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button
            className={`nav-item ${
              active === "Settings" ? "active" : ""
            }`}
            onClick={() => {
              setActive("Settings");
              setSidebarOpen(false);
            }}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>

          <div className="profile-card">
            <div className="profile-avatar">A</div>
            <div>
              <strong>{displayName}</strong>
              <span>STUDY OS member</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE BACKDROP */}
      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* TOPBAR */}
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle navigation"
          >
            <Menu size={20} />
          </button>

          <div className="breadcrumb">
            Workspace <span>/</span>
            <strong>{active}</strong>
          </div>

          <div className="topbar-actions">
            <div className="search-box" style={{ position: "relative" }}>
              <Search size={17} />
              <input
                placeholder="Search tasks, notes, goals..."
                value={searchQuery}
                onFocus={() => setSearchOpen(true)}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setSearchOpen(true);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setSearchOpen(false);
                }}
              />

              {searchQuery && (
                <button
                  className="icon-button"
                  aria-label="Clear search"
                  onClick={() => setSearchQuery("")}
                >
                  <X size={14} />
                </button>
              )}

              <kbd>Ctrl K</kbd>

              {searchOpen && searchQuery.trim().length >= 2 && (
                <div
                  className="glass"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    right: 0,
                    width: "min(360px, 85vw)",
                    zIndex: 100,
                    padding: 10,
                    borderRadius: 14,
                    boxShadow: "0 16px 40px rgba(0,0,0,.35)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "4px 6px 9px",
                    }}
                  >
                    <strong style={{ fontSize: 12 }}>SEARCH RESULTS</strong>
                    <button
                      className="text-button"
                      onClick={() => setSearchOpen(false)}
                    >
                      Close
                    </button>
                  </div>

                  {searchResults.length ? (
                    searchResults.map((result) => (
                      <button
                        key={`${result.category}-${result.id}`}
                        className="priority-task-row"
                        style={{
                          width: "100%",
                          textAlign: "left",
                          border: 0,
                          background: "transparent",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setActive(result.page);
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                      >
                        <span className="priority-task-info">
                          <strong>{result.title}</strong>
                          <span>{result.category}</span>
                        </span>
                        <ArrowUpRight size={15} />
                      </button>
                    ))
                  ) : (
                    <p style={{ padding: "8px", fontSize: 13, opacity: 0.7 }}>
                      No matching items found.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <button
                className="icon-button notification-button"
                aria-label="Notifications"
                onClick={() => {
                  setNotificationsOpen((open) => !open);
                  setSearchOpen(false);
                }}
              >
                <Bell size={19} />
                {notificationItems.length > 0 && <i />}
              </button>

              {notificationsOpen && (
                <div
                  className="glass"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 12px)",
                    right: 0,
                    width: "min(340px, 85vw)",
                    zIndex: 100,
                    padding: 14,
                    borderRadius: 14,
                    boxShadow: "0 16px 40px rgba(0,0,0,.35)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <strong>Notifications</strong>
                    <button
                      className="text-button"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      Close
                    </button>
                  </div>

                  {notificationItems.length ? (
                    notificationItems.map((item) => (
                      <button
                        key={item.id}
                        className="priority-task-row"
                        style={{
                          width: "100%",
                          textAlign: "left",
                          border: 0,
                          background: "transparent",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setActive(item.page);
                          setNotificationsOpen(false);
                        }}
                      >
                        <span className="priority-task-info">
                          <strong>{item.title}</strong>
                          <span>{item.detail}</span>
                        </span>
                        {item.urgent ? (
                          <AlertCircle size={17} color="#f87171" />
                        ) : (
                          <Clock3 size={16} />
                        )}
                      </button>
                    ))
                  ) : (
                    <p style={{ fontSize: 13, opacity: 0.7 }}>
                      You're all caught up. No due or overdue tasks.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="top-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* PAGE ROUTING */}
        <Suspense
          fallback={
            <div className="page-content">
              <p>Loading module...</p>
            </div>
          }
        >
          {active === "Tasks" ? (
            <div className="page-content">
              <TasksPage />
            </div>
          ) : active === "Calendar" ? (
            <div className="page-content">
              <CalendarPage />
            </div>
          ) : active === "Goals & Roadmap" ? (
            <div className="page-content">
              <GoalsPage />
            </div>
          ) : active === "Subjects & Chapters" ? (
            <div className="page-content">
              <SubjectsPage />
            </div>
          ) : active === "Revision Centre" ? (
            <div className="page-content">
              <RevisionPage />
            </div>
          ) : active === "Focus Timer" ? (
            <div className="page-content">
              <FocusTimerPage />
            </div>
          ) : active === "Tests & Exams" ? (
            <div className="page-content">
              <TestsPage />
            </div>
          ) : active === "Notes" ? (
            <div className="page-content">
              <NotesPage />
            </div>
          ) : active === "Habits & Routine" ? (
            <div className="page-content">
              <HabitsPage />
            </div>
          ) : active === "Finance" ? (
            <div className="page-content">
              <FinancePage />
            </div>
          ) : active === "Projects" ? (
            <div className="page-content">
              <ProjectsPage />
            </div>
          ) : active === "Analytics" ? (
            <div className="page-content">
              <AnalyticsPage />
            </div>
          ) : active === "Settings" ? (
            <div className="page-content">
              <SettingsPage />
            </div>
          ) : active === "Dashboard" ? (
            <div className="page-content">
              {/* WELCOME */}
              <section className="welcome-section">
                <div>
                  <p className="eyebrow">YOUR PERSONAL COMMAND CENTRE</p>

                  <h1>
                    {greeting}, {displayName} <span>✦</span>
                  </h1>

                  <p className="welcome-subtitle">
                    Every small step counts. Let's make today productive.
                  </p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => setActive("Tasks")}
                >
                  <Plus size={18} />
                  Add a task
                </button>
              </section>

              {/* STATISTICS */}
              <section className="stats-grid">
                {stats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <article
                      className="glass stat-card"
                      key={stat.label}
                    >
                      <div className="stat-top">
                        <span>{stat.label}</span>
                        <div className="stat-icon">
                          <Icon size={19} />
                        </div>
                      </div>

                      <h2>{stat.value}</h2>
                      <p>{stat.detail}</p>
                    </article>
                  );
                })}
              </section>

              {/* DASHBOARD WIDGETS */}
              <section className="dashboard-grid">
                {/* TODAY'S SCHEDULE */}
                <article className="glass panel schedule-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Today's Schedule</h3>
                      <p>
                        {todaysTasks.length} tasks scheduled for today
                      </p>
                    </div>

                    <button
                      className="text-button"
                      onClick={() => setActive("Calendar")}
                    >
                      View calendar <ArrowUpRight size={15} />
                    </button>
                  </div>

                  {todaysTasks.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <CalendarDays size={25} />
                      </div>

                      <h4>No tasks scheduled today</h4>
                      <p>
                        Add a task with today's due date to see it here.
                      </p>

                      <button
                        className="secondary-button"
                        onClick={() => setActive("Tasks")}
                      >
                        <Plus size={16} />
                        Add a task
                      </button>
                    </div>
                  ) : (
                    <div className="priority-task-list">
                      {todaysTasks.map((task) => (
                        <div
                          className="priority-task-row"
                          key={task.id}
                        >
                          <div className="priority-task-info">
                            <strong
                              style={{
                                textDecoration: task.completed
                                  ? "line-through"
                                  : "none",
                                opacity: task.completed ? 0.55 : 1,
                              }}
                            >
                              {task.title}
                            </strong>

                            <span>
                              {task.completed ? "Completed" : "Pending"}
                            </span>
                          </div>

                          <span
                            className={`priority priority-${task.priority.toLowerCase()}`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </article>

                {/* ACADEMIC GOALS */}
                <article className="glass panel goals-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Academic Goals</h3>
                      <p>Keep your bigger picture in sight</p>
                    </div>

                    <Target size={19} className="muted-icon" />
                  </div>

                  {goals.length === 0 ? (
                    <div className="empty-state compact-empty">
                      <h4>No goals yet</h4>

                      <button
                        className="secondary-button"
                        onClick={() => setActive("Goals & Roadmap")}
                      >
                        Create a goal
                      </button>
                    </div>
                  ) : (
                    goals.slice(0, 3).map((goal) => {
                      const progress = getGoalProgress(goal);

                      return (
                        <div className="goal-item" key={goal.id}>
                          <div className="goal-heading">
                            <div>
                              <strong>{goal.title}</strong>
                              <span>{goal.category}</span>
                            </div>

                            <span className="goal-percent">
                              {progress}%
                            </span>
                          </div>

                          <div className="progress-track">
                            <div
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}

                  <button
                    className="text-button goals-link"
                    onClick={() => setActive("Goals & Roadmap")}
                  >
                    Manage goals <ArrowUpRight size={15} />
                  </button>
                </article>

                {/* PRIORITY TASKS */}
                <article className="glass panel tasks-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Priority Tasks</h3>
                      <p>What needs your attention</p>
                    </div>

                    <button
                      className="text-button"
                      onClick={() => setActive("Tasks")}
                    >
                      View all <ArrowUpRight size={15} />
                    </button>
                  </div>

                  <div className="priority-task-list">
                    {priorityTasks.length === 0 ? (
                      <div className="empty-state compact-empty">
                        <div className="empty-icon">
                          <ListTodo size={24} />
                        </div>

                        <h4>Nothing on your list</h4>
                        <p>Add your first task to get started.</p>

                        <button
                          className="secondary-button"
                          onClick={() => setActive("Tasks")}
                        >
                          <Plus size={16} />
                          Add task
                        </button>
                      </div>
                    ) : (
                      priorityTasks.slice(0, 4).map((task) => (
                        <div
                          className="priority-task-row"
                          key={task.id}
                        >
                          <div className="priority-task-info">
                            <strong>{task.title}</strong>
                            <span>{task.dueDate || "No due date"}</span>
                          </div>

                          <span
                            className={`priority priority-${task.priority.toLowerCase()}`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </article>

                {/* RECENT ACTIVITY */}
                <article className="glass panel activity-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Recent Activity</h3>
                      <p>Your latest progress</p>
                    </div>

                    <ChartNoAxesCombined
                      size={19}
                      className="muted-icon"
                    />
                  </div>

                  {completedTasks > 0 ? (
                    <div className="priority-task-list">
                      {tasks
                        .filter((task) => task.completed)
                        .slice(-4)
                        .reverse()
                        .map((task) => (
                          <div
                            className="priority-task-row"
                            key={task.id}
                          >
                            <div className="priority-task-info">
                              <strong>{task.title}</strong>
                              <span>Task completed</span>
                            </div>
                            <CheckCircle2 size={18} />
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="empty-state compact-empty">
                      <div className="empty-icon">
                        <Clock3 size={24} />
                      </div>
                      <h4>Your journey starts here</h4>
                      <p>
                        Complete a task to see your progress here.
                      </p>
                    </div>
                  )}
                </article>
              </section>

              {/* FOOTER */}
              <footer className="dashboard-footer">
                <span>STUDY OS · BUILDING YOUR FUTURE</span>
                <span>Designed for focus. Built for progress.</span>
              </footer>
            </div>
          ) : (
            <div className="page-content">
              <section className="welcome-section">
                <div>
                  <p className="eyebrow">STUDY OS WORKSPACE</p>

                  <h1>{active}</h1>

                  <p className="welcome-subtitle">
                    This module is coming soon.
                  </p>
                </div>
              </section>

              <section className="glass panel">
                <div className="empty-state">
                  <div className="empty-icon">
                    <LayoutDashboard size={25} />
                  </div>

                  <h4>{active} is under development</h4>
                  <p>
                    We'll build this module in an upcoming development phase.
                  </p>

                  <button
                    className="secondary-button"
                    onClick={() => setActive("Dashboard")}
                  >
                    Back to Dashboard
                  </button>
                </div>
              </section>
            </div>
          )}
        </Suspense>
      </main>
    </div>
  );
}

export default App;