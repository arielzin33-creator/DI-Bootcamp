# JWT Auth Demo (Node.js + Express)

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` and replace `JWT_SECRET` and `JWT_REFRESH_SECRET` with real random values, e.g.:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Run

```bash
npm start
```

Server runs on `http://localhost:3000` by default.

## Endpoints

| Method | Path            | Auth required | Description                                    |
|--------|-----------------|----------------|------------------------------------------------|
| POST   | /auth/register  | No             | Create a user; returns access token, sets refresh cookie |
| POST   | /auth/login     | No             | Log in; returns access token, sets refresh cookie |
| POST   | /auth/refresh   | Refresh cookie | Issue a new access token                        |
| POST   | /auth/logout    | Refresh cookie | Revoke refresh token, clear cookie              |
| GET    | /auth/check     | Access token   | Confirm the access token is valid               |
| GET    | /profile        | Access token   | View your own profile                           |
| PATCH  | /profile        | Access token   | Update your own username                        |

Send the access token as `Authorization: Bearer <token>`. The refresh token travels automatically as an `httpOnly` cookie once set (use a cookie-aware HTTP client, e.g. `curl -c/-b` or Postman).

## Example (curl)

```bash
# Register
curl -c cookies.txt -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice_01","password":"Password123"}'

# Use the returned accessToken
curl http://localhost:3000/profile \
  -H "Authorization: Bearer <accessToken>"

# Refresh (uses the cookie saved above)
curl -b cookies.txt -X POST http://localhost:3000/auth/refresh

# Logout
curl -b cookies.txt -X POST http://localhost:3000/auth/logout
```

## Notes

- User data and revoked-token tracking are in-memory (`data/users.js`, `data/refreshTokenStore.js`) and reset on restart. Swap these modules for real database/cache calls before using this beyond local testing.
- Password rules and username rules live in `middleware/validateCredentials.js`; adjust to your actual policy.
- Rate limiting (`express-rate-limit`) is applied to `/auth/login` and `/auth/refresh` in `app.js`.
