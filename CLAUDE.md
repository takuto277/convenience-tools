# convenience-tools

エンジニアの日常業務を効率化するツール群。

## ツール一覧

### morning-digest

毎朝の技術情報キャッチアップツール。Zenn・Qiita・Hacker News から最新記事を収集し、URLをコピーしてAIに読み込ませるところまでをサポートする。

- 起動: `cd morning-digest && npm run dev`
- URL: http://localhost:3000
- データキャッシュ: `morning-digest/data/articles.json`（60分で再取得）

### shell-utils

`~/.zshrc` から source して使うシェル関数集。

- `ch_term_color.sh`: `termcolor` コマンドで、実行したそのTerminal.appのタブ/ウィンドウだけ背景色・文字色・カーソル色を対話選択で変える。プリセットは ios-main/ios-sub/android-main/android-sub/web-main/web-sub の6種（[参考](https://advweb.seesaa.net/article/10308927.html)）
- `functions.sh`: よく使う便利関数・aliasの置き場
