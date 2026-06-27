"use client";

import { useState } from "react";

type VacancyEvent = {
  date: string;
  summary: string;
  updated?: string;
  etag?: string;
};

type CheckVacancyResponse = {
  ok: true;
  target: string;
  changed: boolean;
  hash: string;
  events: VacancyEvent[];
};

export default function Home() {
  const [result, setResult] = useState<CheckVacancyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function checkVacancy() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/check-vacancy", {
        method: "GET",
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "API request failed.");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="toolbar">
        <div>
          <h1>空室カレンダー取得</h1>
          <p>Google Calendar APIから2026年8月の情報を取得してDBに保存します。</p>
        </div>
        <button type="button" onClick={checkVacancy} disabled={loading}>
          {loading ? "取得中..." : "APIを実行"}
        </button>
      </section>

      {error ? <p className="error">Error: {error}</p> : null}

      {result ? (
        <section className="result">
          <dl className="summary">
            <div>
              <dt>target</dt>
              <dd>{result.target}</dd>
            </div>
            <div>
              <dt>changed</dt>
              <dd>{String(result.changed)}</dd>
            </div>
            <div>
              <dt>hash</dt>
              <dd>{result.hash}</dd>
            </div>
            <div>
              <dt>events</dt>
              <dd>{result.events.length}</dd>
            </div>
          </dl>

          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>日付</th>
                  <th>概要</th>
                  <th>更新日時</th>
                  <th>etag</th>
                </tr>
              </thead>
              <tbody>
                {result.events.map((event) => (
                  <tr key={`${event.date}-${event.etag ?? event.summary}`}>
                    <td>{event.date}</td>
                    <td>{event.summary}</td>
                    <td>{event.updated ?? ""}</td>
                    <td>{event.etag ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </main>
  );
}
