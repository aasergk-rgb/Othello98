# リバーシ（レトロPC風）

`reversi-handoff/design` のデザインに沿った Android アプリ。Vite + React + TypeScript を Capacitor で APK 化している。

- 端末にインストール: `release/reversi-debug.apk`（デバッグ署名）
- 開発: `npm run dev` / テスト: `npm test`
- APK ビルド: `ANDROID_HOME=<SDK> npm run android:apk`（JDK 21、Android SDK 36 が必要）
  - 出力: `android/app/build/outputs/apk/debug/app-debug.apk`

未デザインの画面（対戦成績・あそびかた・メニューのドロップダウン・設定の表示/サウンドタブ）は、同じ部品で簡易に実装している。
