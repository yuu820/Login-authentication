cookieのキャッシュを用いたログインAPIシステムとそれに付随するフロントエンドです。
NODEJSで作られており、外部モジュールとして,express,bcrypt,jsonwebtoken,dotenv,sqlite3を利用しています。
利用する際は
npm install express bcrypt jsonwebtoken dotenv sqlite3
を実行して下さい。
サーバーのバックエンドはserver.jsに書かれており
20-43までがユーザー登録、45-67までがユーザーログイン、69-82までがcookieの確認用のバックエンドです
データベースはsqlite3を利用しておりauth.dbがデータベース、db.jsがデータベース管理用のJavaScriptです。
データベースには内部管理用のID、外部連携用のuuid、ユーザーネーム、パスワード、作成日時が登録されています。
フロントエンドはviewsフォルダ内index.htmlにHTML,CSS,JSまとめて全て書かれています。
8-63までがCSS、67-94までがHTML、97-176までがJSになっています。
107-132までがユーザー登録、134-157までがユーザーログイン、158-174までがcookie確認用のJSです。

