# Naosima Yado Vacancy Monitor

Next.js App Routerで、neconoshima.jpに埋め込まれているGoogleカレンダーから空室情報を取得し、Neon PostgreSQLに保存するローカル確認用アプリです。

## Setup

```bash
npm install
cp .env.example .env
```

`.env` に以下を設定してください。

```env
GOOGLE_CALENDAR_ID=
GOOGLE_API_KEY=
TARGET_MONTH=
DATABASE_URL=
```

## Database

Prisma Clientを生成し、Neon PostgreSQLにschemaを反映します。

```bash
npm run prisma:generate
npm run prisma:push
```

## Development

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開き、「APIを実行」ボタンを押すと `GET /api/check-vacancy` を呼び出します。

curlで直接確認する場合:

```bash
curl http://localhost:3000/api/check-vacancy
```

## API

`GET /api/check-vacancy`

処理内容:

- `TARGET_MONTH` をもとに対象期間を生成します。
- Google Calendar APIから対象月のイベントを取得します。
- `items` から `start.date` が対象月で始まるイベントだけを抽出します。
- `{ date, summary, updated, etag }` に正規化して日付順に並べます。
- 正規化配列のJSONからSHA-256ハッシュを作成します。
- `MonitorState` に `target`, `hash`, `payload`, `checkedAt` を保存します。

レスポンス例:

```json
{
  "ok": true,
  "target": "neconoshima-2026-08",
  "changed": true,
  "hash": "xxxx",
  "events": [
    {
      "date": "2026-08-02",
      "summary": "－",
      "updated": "2026-06-14T10:24:03.487Z",
      "etag": "\"3562865286975326\""
    }
  ]
}
```

## Not Included

- Discord通知
- Discord Webhook
- Vercel Cron
- Vercelデプロイ
- Playwright / Puppeteer
