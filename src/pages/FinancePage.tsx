
import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  IndianRupee,
} from "lucide-react";

type Transaction = {
  id: number;
  title: string;
  amount: number;
  type: "Income" | "Expense";
  category: string;
  date: string;
};

const STORAGE_KEY = "study-os-finance";

const categories = [
  "Food",
  "Transport",
  "Education",
  "Shopping",
  "Entertainment",
  "Other",
];

function getToday() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function loadTransactions(): Transaction[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"Income" | "Expense">("Expense");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(getToday());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const monthlyTransactions = useMemo(() => {
    const month = getToday().slice(0, 7);
    return transactions.filter((item) => item.date.startsWith(month));
  }, [transactions]);

  const income = monthlyTransactions
    .filter((item) => item.type === "Income")
    .reduce((sum, item) => sum + item.amount, 0);

  const expenses = monthlyTransactions
    .filter((item) => item.type === "Expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = income - expenses;

  function addTransaction(e: React.FormEvent) {
    e.preventDefault();

    const parsedAmount = Number(amount);

    if (!title.trim() || !parsedAmount || parsedAmount <= 0 || !date) {
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now(),
      title: title.trim(),
      amount: parsedAmount,
      type,
      category: type === "Income" ? "Income" : category,
      date,
    };

    setTransactions((previous) => [newTransaction, ...previous]);
    setTitle("");
    setAmount("");
  }

  function deleteTransaction(id: number) {
    setTransactions((previous) =>
      previous.filter((item) => item.id !== id)
    );
  }

  return (
    <div className="finance-page">
      <div className="finance-header">
        <div>
          <p className="eyebrow">PERSONAL MONEY MANAGER</p>
          <h1>Finance</h1>
          <p className="welcome-subtitle">
            Keep track of your money and spending.
          </p>
        </div>
      </div>

      <section className="finance-stats">
        <article className="glass finance-stat">
          <div className="finance-stat-icon"><Wallet /></div>
          <p>Monthly Balance</p>
          <h2>₹{balance.toLocaleString("en-IN")}</h2>
        </article>

        <article className="glass finance-stat">
          <div className="finance-stat-icon"><TrendingUp /></div>
          <p>Monthly Income</p>
          <h2>₹{income.toLocaleString("en-IN")}</h2>
        </article>

        <article className="glass finance-stat">
          <div className="finance-stat-icon"><TrendingDown /></div>
          <p>Monthly Expenses</p>
          <h2>₹{expenses.toLocaleString("en-IN")}</h2>
        </article>
      </section>

      <section className="glass finance-panel">
        <div className="panel-heading">
          <div>
            <h3>Add Transaction</h3>
            <p>Record your income or expenses.</p>
          </div>
          <IndianRupee size={20} />
        </div>

        <form className="finance-form" onSubmit={addTransaction}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Transaction name"
            required
          />

          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (₹)"
            required
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value as "Income" | "Expense")}
          >
            <option value="Expense">Expense</option>
            <option value="Income">Income</option>
          </select>

          {type === "Expense" && (
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          )}

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <button type="submit" className="primary-button">
            <Plus size={17} /> Add Transaction
          </button>
        </form>
      </section>

      <section className="glass finance-panel">
        <div className="panel-heading">
          <div>
            <h3>Transaction History</h3>
            <p>{monthlyTransactions.length} transactions this month</p>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Wallet size={25} /></div>
            <h4>No transactions yet</h4>
            <p>Add your first transaction to get started.</p>
          </div>
        ) : (
          <div className="finance-transaction-list">
            {transactions.map((item) => (
              <div className="finance-transaction" key={item.id}>
                <div className="finance-transaction-icon">
                  {item.type === "Income" ? (
                    <TrendingUp size={19} />
                  ) : (
                    <TrendingDown size={19} />
                  )}
                </div>

                <div className="finance-transaction-info">
                  <strong>{item.title}</strong>
                  <span>{item.category} · {item.date}</span>
                </div>

                <strong className={item.type === "Income" ? "finance-income" : "finance-expense"}>
                  {item.type === "Income" ? "+" : "-"}₹{item.amount.toLocaleString("en-IN")}
                </strong>

                <button
                  className="finance-delete"
                  onClick={() => deleteTransaction(item.id)}
                  aria-label="Delete transaction"
                  type="button"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
