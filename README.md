# Notyra Official Plugins

Official plugins and registry in one repository. The former Notyra-Theme collection is maintained here as installable theme plugins.

公式プラグインとレジストリを管理するリポジトリです。旧 Notyra-Theme のカスタムテーマは、このリポジトリのテーマプラグインへ統合しました。

| Plugin | Source | Description |
| --- | --- | --- |
| Table of Contents / 目次 | `plugins/notyra-toc` | Live headings, click-to-line navigation, heading depth/H1/line-number settings |
| Amber / アンバー | `plugins/notyra-theme-amber` | Warm amber, light/dark palettes |
| Blue / ブルー | `plugins/notyra-theme-blue` | Ocean blue, light/dark palettes |
| Emerald / エメラルド | `plugins/notyra-theme-emerald` | Green, light/dark palettes |
| Rose / ローズ | `plugins/notyra-theme-rose` | Rose, light/dark palettes |

Gray and Purple remain built into Notyra. Theme IDs use `notyra-<color>` to avoid colliding with previously imported JSON themes. Theme plugins execute no JavaScript and request no permissions.

Gray・Purple は本体内蔵のままです。テーマ ID は既存の JSON インポートと重複しない `notyra-<色名>` を使います。テーマプラグインは JavaScript の実行・権限要求を行いません。

## Install / インストール

Use Settings → Plugins → Registry and select each plugin. After installing a theme, select its color in Settings → Appearance. ToC appears in the main window's side panel.

**設定 → プラグイン → レジストリ**から必要なものを個別にインストールします。テーマはインストール後、**設定 → 外観**で選択します。ToC はメインウィンドウのサイドパネルで使えます。

The host must support collection releases: registry installs and updates select `<plugin-id>.zip` from the latest GitHub Release. Entering only `yuma-shin/notyra-plugins` selects ToC through the legacy `notyra-plugin.zip` alias. Use the registry to choose a theme. Registry installation requires merged registry data and published Release assets.

同じ Release にプラグインごとの `<plugin-id>.zip` を置く配布方式に対応した本体が必要です。リポジトリ名だけを直接指定した場合は、従来名の `notyra-plugin.zip` を使って ToC をインストールします。テーマはレジストリから選んでください。初回 Release の公開前は、開発者モードでローカルの配布物を確認できます。

## Develop / 開発

Use Node 24 and pnpm 12.15.0:

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
pnpm test
pnpm package
```

Load a built `plugins/<plugin-id>` folder in Developer Mode, or extract its ZIP into an empty folder and select that folder. The repository root is a private workspace and cannot be loaded as a plugin.

ビルド後の `plugins/<プラグインID>`、または配布 ZIP を空フォルダへ展開したものを開発者モードで選択します。ルートは workspace 用なので、プラグインとしては読み込めません。

ToC parses ATX/Setext headings, ignores fenced code and quoted headings, and navigates to the original source line. Its API types come from the independent [notyra-plugin-api](https://github.com/yuma-shin/notyra-plugin-api) package at version 3.1.7; runtime imports use the host's virtual modules. Until the first npm publication, the dependency pins that repository's immutable commit tarball. No API source is vendored here. After publication, use exact npm version 3.1.7 in the root and ToC manifests and regenerate the lockfile.

## Release / 配布

`pnpm package` generates `dist/<plugin-id>.zip` for every plugin and a default `dist/notyra-plugin.zip` alias for ToC. Each ZIP has its own root `package.json`; plugins install and update independently.

Push a tag matching the root workspace version, currently `v1.0.0`. GitHub Actions runs typecheck/build/tests, checks registry/package identity and ZIP CRCs, and publishes all ZIPs to one Release. Root version tracks the collection Release; each plugin retains its own manifest version for update comparisons. Include every registered plugin in each Release so update checks can find all IDs.

`pnpm package` は `dist/<プラグインID>.zip` を生成します。各 ZIP はルートにそれぞれの `package.json` を持ち、個別にインストール・停止・更新できます。ルートのバージョンと同じタグ（現在は `v1.0.0`）を push すると、検証後に全 ZIP を1つの Release へ公開します。ルートはコレクションの版、各プラグインの版は更新比較に使います。毎回、レジストリの全プラグインを Release に含めてください。

## Registry contributions

Entries contain string fields `id`, `name`, `description`, `author`, and `repo`; `id` equals the package manifest's name. A repository can publish `<id>.zip` for multiple plugins or the legacy `notyra-plugin.zip` for one plugin. Registry listing does not replace permission consent.

Development guide: https://notyra.snackpan.app/docs/plugins/
