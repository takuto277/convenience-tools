# convenience-tools

エンジニアの日常業務を効率化するツール群。

## ツール一覧

### morning-digest

毎朝の技術情報キャッチアップツール。Zenn・Qiita・Hacker News から最新記事を収集し、URLをコピーしてAIに読み込ませるところまでをサポートする。

- 起動: `cd morning-digest && npm run dev`
- URL: http://localhost:3000
- データキャッシュ: `morning-digest/data/articles.json`（60分で再取得）
