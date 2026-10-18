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

## フレンド機能

- 登録時にユーザー名を決めます(Google で登録した場合は Google の名前が初期値)。
- 登録すると、ユーザーごとに8文字の **フレンドコード**(例: `ABCD-2345`)が発行されます。相手のコードを入力するとフレンド申請が送られ、承認されるとフレンドになります。
- フレンドがこのアプリを開いている間はオンライン表示になります。自分で **Busy** に切り替えることもできます。

### 追加の Firebase 設定

1. **Firestore Database** を作成し、`firestore.rules` の内容を「ルール」タブに貼り付けて公開します。
2. **Realtime Database** を作成し、`database.rules.json` の内容を「ルール」タブに貼り付けて公開します。
3. Realtime Database のURLを `firebase-config.js` の `databaseURL` に入れます。

### ルールを更新したとき

`firestore.rules` / `database.rules.json` を変更したときは、Firebase コンソールのそれぞれの「ルール」タブに、ファイルの全文を貼り付けて「公開」してください(サイトを更新しても、ルールは自動では変わりません)。
友だちのログが Recent log やプロフィールに出ないときは、Firestore のルールが古いままになっています。
