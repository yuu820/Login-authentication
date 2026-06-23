### Login Authentication System
## Project
This is a login API system and its accompanying frontend. 

It is designed for user authentication across external services,

utilizing cookies to enable seamless integration.

It also includes an admin panel for user management.
## How to Use (For Users)
Users set a username and password on the registration screen and 

use them to log in.

Newly registered users are placed in a pending approval state.

Once approved by an administrator via the admin panel, 

the user account becomes active and usable.

Users can click the "Check Authentication Status" button to verify 

if the cookie is working properly, as well as to check their unique UUID.
## Reason for Development
In a monolithic system where the login function is tightly coupled with a single service, 

expanding to new services requires redesigning the authentication system. 

It also forces existing users to re-register for every new service,

which impairs the user experience.
## Technologies Used
Framework: Node.js

External Modules: express, bcrypt, jsonwebtoken, dotenv, better-sqlite3, cors, ejs

External API: reCAPTCHA is integrated to perform bot checks.

To get started, please run the following command:

npm install express bcrypt jsonwebtoken dotenv better-sqlite3 cors ejs
## Backend
The server-side backend is implemented in server.js.

The breakdown of the code is as follows:

Lines 19–26: XSS attack mitigation

Lines 27–34: Password strength validation

Lines 35–52: Admin privilege checks

Lines 87–123: User registration

Lines 125–167: User login

Lines 169–182: Cookie verification

Lines 187–192: Fetching user info for the admin panel

Lines 194–207: Updating user status

Lines 209–219: User deletion
## Database
SQLite3 is used for data persistence.

auth.db is the database file, and db.js handles database management via JavaScript.

The database stores the following fields:

Internal management ID

UUID for external integration

Username

Password

User status

Creation timestamp (created_at)
## Frontend
The frontend is completely contained within the views folder inside index.html 

and admin.html, which combine HTML, CSS, and JavaScript.

index.html

Lines 10–65: CSS

Lines 68–98: HTML

Lines 101–197: JavaScript

-Lines 111–142: User registration logic

-Lines 144–176: User login logic
  
-Lines 177–195: Cookie verification logic

admin.html

Lines 7–79: CSS

Lines 83–99: HTML

Lines 101–183: JavaScript

-Lines 103–120: Access control verification

-Lines 121–142: User info display logic

-Lines 143–163: Update user status logic

-Lines 164–182: User deletion logic
## Admin Panel
In the admin panel, administrators can view the list of currently registered users, 

approve new user registrations, modify user statuses, and delete accounts.

Admin privileges are strictly required; unauthorized users attempting 

to access this page will be automatically redirected to the login screen.
## User Statuses
Users can have one of three statuses:

active: The account is approved and fully operational.

pending: The account is newly registered and awaiting administrator approval.

suspended: The account has been frozen by an administrator.
## Important Notes
You must modify the contents of the .env file before running the application.

The JWT_SECRET environment variable in .env is critical for application security.

The ADMIN_PASSWORD environment variable sets the password for logging 

into the admin panel. The corresponding admin username is predefined as admin.

RECAPTCHA_KEY, GCP_PROJECT_ID, and GCP_API_KEY are required for 

reCAPTCHA authentication. Please obtain them from Google Cloud 

if you plan to use reCAPTCHA.

When using reCAPTCHA, do not forget to enter the appropriate source URL 

in the <script> tag within index.html.

If you do not wish to use reCAPTCHA, disable the ROBOT_CHECK section 

in server.js and remove the corresponding reCAPTCHA code blocks from index.html.
## Environment Variables
JWT_SECRET

ADMIN_PASSWORD

RECAPTCHA_KEY

GCP_PROJECT_ID

GCP_API_KEY
## File Structure
login-authentication/  
│  
├── views/  
│   ├── index.html  
│   └── admin.html  
│  
├── .env  
├── auth.db  
├── db.js  
├── package-lock.json  
├── package.json  
├── server.js  
└── readme.md  
### ログイン認証システム
## プロジェクト
ログインAPIシステムとそれに付随するフロントエンドです。

外部サービスへのユーザー認証に利用することを想定して作られており、

cookieを用いて外部サービスへのユーザー認証に利用できるようにしています。

管理画面を備え、ユーザーの管理が行えます。
## ユーザーの利用方法
ユーザーは新規会員登録画面でユーザーネームとパスワードを決め、それを用いてログインを行います。

新規会員登録したユーザーは管理者の承認待ち状態となり、

管理者が管理画面で承認することで、ユーザーのアカウントが利用可能になります。

ユーザーは「認証状態を確認」のボタンを押すことでcookieが正常に動作しているか確認できると共に、

ユーザーのUUIDを確認することができます。
## 開発理由
サービスと一体化したログインシステムでは、サービスが増えた際にログインシステムを再設計したり、

既存のユーザーが新しいサービスを利用する際に再度登録しなおしたりする必要があり大変です。

よってログインシステムを完全に別にしてcookieを用いた仕様にすることで、

開発コストと利便性を両方向上させることができると考え作成しました。
## 使用技術
フレームワーク:NODEJS

外部モジュール:express,bcrypt,jsonwebtoken,dotenv,better-sqlite3,cors,ejsを利用しています。

外部APIとしてreCAPTCHAを導入しており、ロボットチェックを行っています。

利用する際は

npm install express bcrypt jsonwebtoken dotenv better-sqlite3 cors ejs

を実行して下さい。

またreCAPTCHAを利用する際はreCAPTCHAのKEYとPROJECT_ID、API_KEYの３つが必要となります。
## バックエンド
サーバーのバックエンドはserver.jsに書かれており、

19-26がXSS攻撃対策、27-34がパスワード強度チェック、35-52が管理者権限チェック、

87-123までがユーザー登録、125-167までがユーザーログイン、169-182までがcookieの確認、

187-192が管理画面のユーザー情報取得、194-207がユーザーステータスの変更、209-219がユーザー削除

のバックエンドです。
## データベース
データベースはsqlite3を利用しておりauth.dbがデータベース、db.jsがデータベース管理用のJavaScriptです。

データベースには内部管理用のID、外部連携用のuuid、ユーザーネーム、パスワード、

ユーザーステータス、作成日時が登録されています。
## フロントエンド
フロントエンドはviewsフォルダ内index.htmlとadmin.htmlにHTML,CSS,JSまとめて全て書かれています。

index.htmlは、10-65までがCSS、68-98までがHTML、101-197までがJSになっています。

111-142までがユーザー登録、144-176までがユーザーログイン、177-195までがcookie確認用のJSです。

admin.htmlは、7-79まではCSS、83-99までがHTML、101-183までがJSになっています。

103-120までがアクセス権確認、121-142までがユーザー情報表示、143-163までがユーザーステータスの変更、

164-182までがユーザー削除のJSです。
## 管理者画面
管理者画面では現在登録されているユーザーの一覧を確認し、新規会員登録ユーザーの承認、ユーザーのステータスの変更

ユーザーの削除の操作を行うことができます。

アクセスには管理者権限が必要でないものがアクセスを試みると、ログイン画面へリダイレクトされます。
## ユーザーステータス
ユーザにはactive,pending,suspendedの３つのステータスがありpendingは新規会員登録ユーザーの承認待ち、

suspendedは管理者によってユーザーが凍結された状態に付与されるステータスです。
## 重要事項
.envの中身を必ず変更して下さい。

.envの環境変数のJWT_SECRETはセキュリティー上の重要変数です。

.envの環境変数のADMIN_PASSWORDは管理画面へのログインパスワードです。

管理画面のユーザーネームはadminです。

.envのRECAPTCHA_KEY,GCP_PROJECT_ID,GCP_API_KEYはreCAPTCHAの認証に必要なキーです。

reCAPTCHAを利用する際は取得して下さい。

またreCAPTCHAの利用する際はindex.htmlの<script>のURL部分を忘れずに入力ください。

利用しない場合はserver.jsのROBOT_CHECKの部分を無効化し、index.htmlのreCAPTCHA該当部分を、

削除してご利用ください。
## 環境変数
JWT_SECRET
ADMIN_PASSWORD
RECAPTCHA_KEY
GCP_PROJECT_ID
GCP_API_KEY
## ファイル構成
login-authentication/  
│  
├── views/  
│   ├── index.html  
│   └── admin.html  
│  
├── .env  
├── auth.db  
├── db.js  
├── package-lock.json  
├── package.json  
├── server.js  
└── readme.md  
