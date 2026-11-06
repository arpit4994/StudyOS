
import { useMemo } from "react";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Target,
  BookOpen,
  Repeat2,
} from "lucide-react";

type Task = {
  id: number;
  completed: boolean;
};

type Subject = {
  id: number;
  name: string;
  chapters: { id: number; completed: boolean }[];
};

type Revision = {
  id: number;
  stages: { completed: boolean }[];
};

type FocusSession = {
  date: string;
  duration: number;
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) as T : fallback;
  } catch {
    return fallback;
  }
}

function getToday() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function AnalyticsPage() {
  const tasks = useMemo(
    () => readStorage<Task[]>("study-os-tasks", []),
    []
  );

  const subjects = useMemo(
    () => readStorage<Subject[]>("study-os-subjects", []),
    []
  );

  const revisions = useMemo(
    () => readStorage<Revision[]>("study-os-revisions", []),
    []
  );

  const sessions = useMemo(
    () => readStorage<FocusSession[]>("study-os-focus-sessions", []),
    []
  );

  const completedTasks = tasks.filter((task) => task.completed).length;
  const taskRate = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  const totalChapters = subjects.reduce(
    (sum, subject) => sum + (subject.chapters?.length || 0),
    0
  );

  const completedChapters = subjects.reduce(
    (sum, subject) =>
      sum + (subject.chapters?.filter((chapter) => chapter.completed).length || 0),
    0
  );

  const chapterRate = totalChapters
    ? Math.round((completedChapters / totalChapters) * 100)
    : 0;

  const totalStages = revisions.reduce(
    (sum, revision) => sum + (revision.stages?.length || 0),
    0
  );

  const completedStages = revisions.reduce(
    (sum, revision) =>
      sum + (revision.stages?.filter((stage) => stage.completed).length || 0),
    0
  );

  const revisionRate = totalStages
    ? Math.round((completedStages / totalStages) * 100)
    : 0;

  const today = getToday();

  const todaySessions = sessions.filter(
    (session) => session.date === today
  );

  const todayMinutes = todaySessions.reduce(
    (sum, session) => sum + (Number(session.duration) || 0),
    0
  );

  const subjectProgress = subjects.map((subject) => {
    const chapters = subject.chapters || [];
    const completed = chapters.filter((chapter) => chapter.completed).length;

    return {
      name: subject.name,
      total: chapters.length,
      completed,
      progress: chapters.length
        ? Math.round((completed / chapters.length) * 100)
        : 0,
    };
  });

  const stats = [
    {
      label: "Tasks Completed",
      value: `${completedTasks}/${tasks.length}`,
      detail: `${taskRate}% completion rate`,
      icon: CheckCircle2,
    },
    {
      label: "Chapters Completed",
      value: `${completedChapters}/${totalChapters}`,
      detail: `${chapterRate}% syllabus progress`,
      icon: BookOpen,
    },
    {
      label: "Today's Focus",
      value: `${Math.floor(todayMinutes / 60)}h ${todayMinutes % 60}m`,
      detail: `${todaySessions.length} focus sessions`,
      icon: Clock3,
    },
    {
      label: "Revision Progress",
      value: `${completedStages}/${totalStages}`,
      detail: `${revisionRate}% stages completed`,
      icon: Repeat2,
    },
  ];

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <p className="eyebrow">YOUR PERFORMANCE OVERVIEW</p>
          <h1>Analytics</h1>
          <p className="welcome-subtitle">
            Understand your progress and identify what needs attention.
          </p>
        </div>
      </div>

      <section className="analytics-stats">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article className="glass analytics-stat" key={stat.label}>
              <div className="analytics-stat-icon">
                <Icon size={20} />
              </div>
              <p>{stat.label}</p>
              <h2>{stat.value}</h2>
              <span>{stat.detail}</span>
            </article>
          );
        })}
      </section>

      <section className="glass analytics-panel">
        <div className="panel-heading">
          <div>
            <h3>Subject-wise Progress</h3>
            <p>Track your chapter completion across subjects.</p>
          </div>
          <Target size={20} />
        </div>

        {subjectProgress.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><BookOpen size={25} /></div>
            <h4>No subject data yet</h4>
            <p>Add subjects and chapters to see your progress.</p>
          </div>
        ) : (
          <div className="analytics-subject-list">
            {subjectProgress.map((subject) => (
              <div className="analytics-subject" key={subject.name}>
                <div className="analytics-subject-heading">
                  <strong>{subject.name}</strong>
                  <span>
                    {subject.completed}/{subject.total} chapters · {subject.progress}%
                  </span>
                </div>
                <div className="analytics-progress-track">
                  <div style={{ width: `${subject.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="glass analytics-panel">
        <div className="panel-heading">
          <div>
            <h3>Overall Performance</h3>
            <p>Your current progress across key areas.</p>
          </div>
          <BarChart3 size={20} />
        </div>

        <div className="analytics-overview-list">
          <div>
            <span>Task completion</span>
            <strong>{taskRate}%</strong>
          </div>
          <div>
            <span>Syllabus completion</span>
            <strong>{chapterRate}%</strong>
          </div>
          <div>
            <span>Revision completion</span>
            <strong>{revisionRate}%</strong>
          </div>
        </div>
      </section>
    </div>
  );
}
