# Webapp

静的サイト(GitHub Pages)+ Firebase Authentication で動くウェブアプリです。

- `index.html` ログイン / 新規登録(メール・Google)
- `home.html` ホーム(ログイン済みのみ表示)
- `firebase-config.js` Firebase の設定(下記の手順で入力)

## Firebase の設定

1. [Firebase コンソール](https://console.firebase.google.com/)でプロジェクトを作成します。
2. **Build → Authentication → Sign-in method** で **メール/パスワード** と **Google** を有効にします。
3. **Authentication → Settings → 承認済みドメイン** に `<ユーザー名>.github.io` を追加します。
4. **プロジェクトの設定 → マイアプリ → ウェブ(`</>`)** でアプリを登録し、表示された `firebaseConfig` の値を `firebase-config.js` に貼り付けます。
5. `main` に push します(CSS/JS を変えたら `index.html` / `home.html` の `?v=` の数字を上げます)。
