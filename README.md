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
DISCORD_WEBHOOK_URL=
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
- 既知の `2026-08-02` は比較対象から除外し、`2026-08-03` 以降の追加だけを監視します。
- 監視対象配列のJSONからSHA-256ハッシュを作成します。
- `MonitorState` に `target`, `hash`, `payload`, `checkedAt` を保存します。
- レスポンスにはGoogle Calendar APIの生に近い `raw` も含めます。

レスポンス例:

```json
{
  "ok": true,
  "target": "neconoshima-2026-08-from-03",
  "comparisonStartDate": "2026-08-03",
  "changed": true,
  "hash": "xxxx",
  "events": [],
  "ignoredEvents": [
    {
      "date": "2026-08-02",
      "summary": "－",
      "updated": "2026-06-14T10:24:03.487Z",
      "etag": "\"3562865286975326\""
    }
  ],
  "raw": {
    "status": 200,
    "itemCount": 1,
    "items": [
      {
        "date": "2026-08-02",
        "summary": "－"
      }
    ]
  }
}
```

## Discord Test

`POST /api/test-discord`

`DISCORD_WEBHOOK_URL` に設定したWebhookへテスト通知を送ります。フロントの「Discordテスト通知」ボタンから呼び出せます。

## Vercel Cron

`GET /api/cron/check-vacancy`

Vercel Cronから10分おきに呼び出されます。`2026-08-03` 以降の監視対象イベントに変更があり、かつイベントが1件以上ある場合だけDiscordへメンション通知します。

## Not Included

- Vercelデプロイ
- Playwright / Puppeteer
