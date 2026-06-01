---
name: rulesync
targets: [claudecode, agentsskills]
description: プロジェクトのプロンプト・ルールを更新するためのツール。ユーザーの指示を誤って実行したり、ユーザーの傾向やプロジェクトの習慣を把握できていないことに気づいた場合、または自分自身のプロンプトを改善したい場合に使用する。.rulesync/ ディレクトリ配下のルールファイルを編集し、各AIツール（Claude、Copilot、Agents）に同期する。
---

# Rulesync プロンプト管理

このスキルは、プロジェクトのAIアシスタント向けプロンプト・ルールを管理・更新するためのガイドを提供します。

## いつこのスキルを使うか

以下の状況でこのスキルを使用する：

1. **誤った実行を防ぐ**: ユーザーの指示を誤って解釈・実行してしまった場合、再発防止のためにルールを追加・更新
2. **習慣・傾向の記録**: ユーザーの好みやプロジェクト固有の習慣を発見した場合、それをルールとして記録
3. **プロンプト改善**: 自分自身の応答を改善するためにルールを追加・修正したい場合
4. **新しいパターンの追加**: 繰り返し発生するワークフローやベストプラクティスを文書化

## ディレクトリ構成

```
.rulesync/
├── rules/
│   └── overview.md        # プロジェクト概要・基本情報
├── commands/
│   └── morning-digest-insights.md  # 記事知見抽出コマンド
└── skills/
    └── rulesync/          # このスキル（自己管理用）
        └── SKILL.md
```

## ルール更新ワークフロー

### Step 1: 適切なファイルを選択

| ルールの種類 | 対象ファイル |
|------------|------------|
| プロジェクト全般の情報・制約 | `rules/overview.md` |
| AIコマンド定義 | `commands/*.md` |
| スキル定義 | `skills/*/SKILL.md` |

### Step 2: ルールファイルを編集

`.rulesync/` 配下の該当ファイルを編集する。

**重要**: 生成された `.claude/` や `.github/` 配下のファイルは直接編集しない。必ずソースである `.rulesync/` を編集する。

### Step 3: 同期コマンドを実行

```bash
npx rulesync generate
```

このコマンドにより、`.rulesync/` の内容が以下に同期される：
- `.github/copilot-instructions.md` (Copilot 用)
- `.github/prompts/` (Copilot 用コマンド)
- `.claude/rules/` (Claude Code 用ルール)
- `.claude/commands/` (Claude Code 用コマンド)
- `.claude/skills/` (Claude Code 用スキル)
- `.agents/skills/` (Agents 用スキル)
