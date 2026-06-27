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
  comparisonStartDate: string;
  changed: boolean;
  hash: string;
  events: VacancyEvent[];
  ignoredEvents: VacancyEvent[];
  raw: {
    status: number;
    itemCount: number;
    items: Array<{
      date?: string;
      dateTime?: string;
      summary?: string;
      updated?: string;
      etag?: string;
    }>;
  };
};

export default function Home() {
  const [result, setResult] = useState<CheckVacancyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [discordStatus, setDiscordStatus] = useState<string | null>(null);
  const [discordLoading, setDiscordLoading] = useState(false);

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

  async function sendDiscordTest() {
    setDiscordLoading(true);
    setDiscordStatus(null);

    try {
      const response = await fetch("/api/test-discord", {
        method: "POST",
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Discord test request failed.");
      }

      setDiscordStatus("送信リクエスト成功");
    } catch (err) {
      setDiscordStatus(
        err instanceof Error ? `Error: ${err.message}` : "Error: Unknown error.",
      );
    } finally {
      setDiscordLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="toolbar">
        <div>
          <h1>空室カレンダー取得</h1>
          <p>Google Calendar APIから2026年8月の情報を取得してDBに保存します。</p>
        </div>
        <div className="actions">
          <button type="button" onClick={checkVacancy} disabled={loading}>
            {loading ? "取得中..." : "APIを実行"}
          </button>
          <button
            type="button"
            className="secondaryButton"
            onClick={sendDiscordTest}
            disabled={discordLoading}
          >
            {discordLoading ? "送信中..." : "Discordテスト通知"}
          </button>
        </div>
      </section>

      {error ? <p className="error">Error: {error}</p> : null}
      {discordStatus ? <p className="status">{discordStatus}</p> : null}

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
            <div>
              <dt>from</dt>
              <dd>{result.comparisonStartDate}</dd>
            </div>
          </dl>

          <section className="panel">
            <h2>監視対象イベント</h2>
            <p>
              {result.comparisonStartDate}
              以降の追加だけを比較・保存します。
            </p>
            <EventTable
              events={result.events}
              emptyText="監視対象の追加はありません。"
            />
          </section>

          <section className="panel">
            <h2>比較から除外したイベント</h2>
            <p>8/2までの既知イベントは変更検知の対象外です。</p>
            <EventTable
              events={result.ignoredEvents}
              emptyText="除外対象イベントはありません。"
            />
          </section>

          <section className="panel">
            <h2>Google API raw</h2>
            <pre>{JSON.stringify(result.raw, null, 2)}</pre>
          </section>
        </section>
      ) : null}
    </main>
  );
}

function EventTable({
  events,
  emptyText,
}: {
  events: VacancyEvent[];
  emptyText: string;
}) {
  if (events.length === 0) {
    return <p className="empty">{emptyText}</p>;
  }

  return (
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
          {events.map((event) => (
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
  );
}
