
import { useEffect, useState } from "react";
import {
  Plus,
  ClipboardList,
  CalendarDays,
  Trophy,
  Trash2,
  X,
} from "lucide-react";

type Test = {
  id: number;
  title: string;
  subject: string;
  date: string;
  totalMarks: number;
  scoredMarks: number | null;
};

const STORAGE_KEY = "study-os-tests";

function loadTests(): Test[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>(loadTests);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("All");

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [totalMarks, setTotalMarks] = useState("100");
  const [scoredMarks, setScoredMarks] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
  }, [tests]);

  const today = new Date().toISOString().slice(0, 10);

  const completed = tests.filter((test) => test.scoredMarks !== null);
  const upcoming = tests.filter((test) => test.scoredMarks === null);

  const average = completed.length
    ? Math.round(
        completed.reduce(
          (sum, test) =>
            sum + ((test.scoredMarks ?? 0) / test.totalMarks) * 100,
          0
        ) / completed.length
      )
    : 0;

  const filteredTests = tests.filter((test) => {
    if (filter === "Upcoming") return test.scoredMarks === null;
    if (filter === "Completed") return test.scoredMarks !== null;
    return true;
  });

  function addTest(e: React.FormEvent) {
    e.preventDefault();

    const total = Number(totalMarks);
    const score = scoredMarks.trim() === "" ? null : Number(scoredMarks);

    if (
      !title.trim() ||
      !subject.trim() ||
      !date ||
      !Number.isFinite(total) ||
      total <= 0 ||
      (score !== null &&
        (!Number.isFinite(score) || score < 0 || score > total))
    ) {
      return;
    }

    setTests((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: title.trim(),
        subject: subject.trim(),
        date,
        totalMarks: total,
        scoredMarks: score,
      },
    ]);

    setTitle("");
    setSubject("");
    setDate("");
    setTotalMarks("100");
    setScoredMarks("");
    setShowForm(false);
  }

  function updateScore(id: number, value: string) {
    const score = Number(value);

    if (value.trim() === "" || !Number.isFinite(score)) return;

    setTests((prev) =>
      prev.map((test) =>
        test.id === id && score >= 0 && score <= test.totalMarks
          ? { ...test, scoredMarks: score }
          : test
      )
    );
  }

  function deleteTest(id: number) {
    setTests((prev) => prev.filter((test) => test.id !== id));
  }

  return (
    <div className="tests-page">
      <div className="tests-header">
        <div>
          <p className="eyebrow">ACADEMIC PERFORMANCE</p>
          <h1>Tests & Exams</h1>
          <p className="welcome-subtitle">
            Schedule tests, record marks and track your progress.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          <Plus size={17} /> Add Test
        </button>
      </div>

      <section className="tests-stats">
        <div className="glass stat-card">
          <div className="stat-top">
            <span>Total Tests</span>
            <ClipboardList size={19} />
          </div>
          <h2>{tests.length}</h2>
          <p>All scheduled tests</p>
        </div>

        <div className="glass stat-card">
          <div className="stat-top">
            <span>Upcoming</span>
            <CalendarDays size={19} />
          </div>
          <h2>{upcoming.length}</h2>
          <p>Awaiting results</p>
        </div>

        <div className="glass stat-card">
          <div className="stat-top">
            <span>Completed</span>
            <Trophy size={19} />
          </div>
          <h2>{completed.length}</h2>
          <p>Tests with recorded marks</p>
        </div>

        <div className="glass stat-card">
          <div className="stat-top">
            <span>Average Score</span>
            <Trophy size={19} />
          </div>
          <h2>{average}%</h2>
          <p>Across completed tests</p>
        </div>
      </section>

      <section className="glass panel tests-panel">
        <div className="tests-toolbar">
          <div>
            <h3>Your Tests</h3>
            <p>Manage your examination schedule</p>
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="tests-filter"
          >
            <option>All</option>
            <option>Upcoming</option>
            <option>Completed</option>
          </select>
        </div>

        {filteredTests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <ClipboardList size={25} />
            </div>
            <h4>No tests found</h4>
            <p>Add your first test to start tracking performance.</p>
            <button
              className="secondary-button"
              onClick={() => setShowForm(true)}
            >
              <Plus size={16} /> Add a test
            </button>
          </div>
        ) : (
          <div className="tests-list">
            {filteredTests
              .slice()
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((test) => (
                <article className="test-item" key={test.id}>
                  <div className="test-main">
                    <strong>{test.title}</strong>
                    <span>{test.subject}</span>
                  </div>

                  <div className="test-date">
                    <CalendarDays size={15} />
                    {test.date}
                  </div>

                  <div className="test-result">
                    {test.scoredMarks === null ? (
                      <span className="test-status">
                        {test.date < today ? "Awaiting result" : "Upcoming"}
                      </span>
                    ) : (
                      <strong>
                        {test.scoredMarks}/{test.totalMarks}
                        <small>
                          {" "}
                          ({Math.round(
                            (test.scoredMarks / test.totalMarks) * 100
                          )}%)
                        </small>
                      </strong>
                    )}
                  </div>

                  <div className="test-actions">
                    {test.scoredMarks === null && (
                      <input
                        type="number"
                        min="0"
                        max={test.totalMarks}
                        placeholder="Score"
                        aria-label={`Enter score for ${test.title}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            updateScore(
                              test.id,
                              (e.target as HTMLInputElement).value
                            );
                          }
                        }}
                      />
                    )}

                    <button
                      className="test-delete"
                      onClick={() => deleteTest(test.id)}
                      aria-label={`Delete ${test.title}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
          </div>
        )}
      </section>

      {showForm && (
        <div className="test-modal-backdrop">
          <form className="glass test-modal" onSubmit={addTest}>
            <div className="test-modal-heading">
              <div>
                <h3>Add a Test</h3>
                <p>Enter your test details.</p>
              </div>
              <button
                type="button"
                className="test-delete"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                <X size={19} />
              </button>
            </div>

            <label>
              Test Name
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Accountancy Chapter Test"
              />
            </label>

            <label>
              Subject
              <input
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Accountancy"
              />
            </label>

            <label>
              Test Date
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>

            <label>
              Total Marks
              <input
                required
                type="number"
                min="1"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
              />
            </label>

            <label>
              Scored Marks (optional)
              <input
                type="number"
                min="0"
                max={totalMarks}
                value={scoredMarks}
                onChange={(e) => setScoredMarks(e.target.value)}
                placeholder="Leave blank if not attempted"
              />
            </label>

            <button className="primary-button" type="submit">
              Save Test
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
