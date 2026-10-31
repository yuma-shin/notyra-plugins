# Notyra Plugins

Official plugin registry and the Table of Contents plugin for Notyra 3.1.7 or later.

## Use / 使い方

In **Settings → Plugins**, acknowledge the third-party notice and install **Table of Contents / 目次** from the registry. You can also enter `yuma-shin/notyra-plugins`. Open the side panel from the main window's title bar and select Table of Contents. Headings update as the active note changes; click one to scroll to its source line. The note window also loads the plugin, but currently only the main window displays the side panel.

**設定 → プラグイン** で注意事項を確認し、レジストリから **Table of Contents / 目次** をインストールしてください。`yuma-shin/notyra-plugins` の直接指定も使えます。メインウィンドウのタイトルバーでサイドパネルを開き、目次を選択します。ノート切り替え・編集で一覧が更新され、見出しのクリックで該当行へ移動します。

No permissions are requested: the plugin uses the active-note event and editor navigation. Set the maximum heading level, include H1 or show line numbers from the installed plugin's settings. Fenced code and blockquote headings are excluded; ATX and Setext headings and duplicate titles are supported.

権限の要求はありません。アクティブノート通知とエディタの行移動 API を使います。設定で深さ・H1 の有無・行番号を変更できます。コードブロックや引用内の見出しは除外します。

## Develop and release

Use Node 24 and pnpm 12.15.0. Run `pnpm install`, `pnpm typecheck`, `pnpm build`, `pnpm test`, then `pnpm package`. Load this folder in Notyra's Developer Mode after building. The API types are vendored from Notyra 3.1.7 so npm publication is not required for development.

`pnpm package` creates `notyra-plugin.zip` with `package.json` at its root. Push a version tag matching `package.json`, for example `v1.0.0`, to run the release workflow. The workflow validates the package before publishing the exact asset name required by Notyra. A tag alone is insufficient if the workflow has not succeeded.

## Registry contributions

Open a pull request editing `registry.json`. Every entry must contain string fields `id`, `name`, `description`, `author`, and `repo`; `id` must equal the package manifest's name. Each repository must publish its own latest Release with an asset called `notyra-plugin.zip`. Registry listing does not replace permission consent or imply that arbitrary code is sandboxed.

Development guide: https://notyra.snackpan.app/docs/plugins/
