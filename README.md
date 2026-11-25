# Chat Backend

An API-only chat backend built with Node.js, TypeScript, Express, PostgreSQL, and Firebase Firestore. It currently supports direct chats and is structured to support group chats. PostgreSQL stores users, chats, and chat membership. Firestore stores messages, read receipts, and per-user last-seen state.

## Current implementation

- `POST /api/v1/chat/create` creates or returns the direct chat for two existing users.
- `GET /api/v1/user/:userId/chats` lists a user's chats and member details.
- `POST /api/v1/chat/:chatId/message/send` stores a message for a chat member and returns its Firestore message ID.
- `GET /api/v1/chat/:chatId/messages` returns paginated messages from a chat, newest page first and chronological within each page.
- `POST /api/v1/chat/:chatId/message/:messageId/read` records a chat member's read receipt in Firestore.
- `POST /api/v1/chat/:chatId/lastseen` updates a member's last-seen message for the chat.
- PostgreSQL schema, migration, and sample-user seed scripts are present.
- Firebase Admin stores message, read-receipt, and last-seen data.

The remaining required endpoints are listed below as planned behavior, not implemented functionality.

## Requirements

- Node.js with npm
- A PostgreSQL database
- A Firebase project with Firestore enabled and a service account for Firebase Admin

## Local setup

1. Open a terminal in `chat-app-backend`.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env` and provide the values described below.
4. Put the Firebase service account JSON file in the backend folder, or configure the service account JSON through `FIREBASE_SERVICE_ACCOUNT`.
5. Create the database schema with `npm run migrate`.
6. Add sample users with `npm run seed`.
7. Start the development server with `npm run dev`.

The server defaults to port `3000`. Check `GET http://localhost:3000/api/v1/health` for the health response.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port; defaults to `3000`. |
| `DATABASE_URL` | PostgreSQL connection string. |
| `GOOGLE_APPLICATION_CREDENTIALS` | Local path to the Firebase service account JSON file. |
| `FIREBASE_SERVICE_ACCOUNT` | Optional service-account JSON string, suitable for deployment configuration. |

Use either Firebase credential option. Keep secrets in `.env` or your hosting provider's secret manager; do not commit credentials.

## API

All current routes use the `/api/v1` prefix. IDs for users and chats are PostgreSQL UUIDs.

### Implemented

#### Create or get a direct chat

`POST /api/v1/chat/create`

Request:

```json
{
  "userAId": "<user UUID>",
  "userBId": "<user UUID>"
}
```

Response: `{ "chatId": "<chat UUID>" }`. The two IDs must be different and both users must exist.

#### List a user's chats

`GET /api/v1/user/:userId/chats`

Response has the shape `{ "userId": "<user UUID>", "userChats": [...] }`. Each chat includes its ID, type, creation time, and all member objects containing IDs and names. An existing user with no chats receives an empty list; an unknown user receives HTTP 404. Pagination is deferred.

#### Send a message

`POST /api/v1/chat/:chatId/message/send`

Request:

```json
{
  "senderId": "<user UUID>",
  "text": "Hello"
}
```

The sender must be a member of the chat. Text is trimmed, must contain at least one non-whitespace character, and can be at most 2,000 characters after trimming. A successful request returns HTTP 201 with `{ "messageId": "<Firestore document ID>" }`. The message document stores `senderId`, `text`, and a Firestore server timestamp in `createdAt`.

#### Get messages

`GET /api/v1/chat/:chatId/messages?limit=50&cursor=<messageId>`

`limit` is optional, defaults to 50, and must be between 1 and 100. Omit `cursor` to fetch the newest page. To fetch older messages, pass the `nextCursor` returned by the previous page. The response is `{ "messages": [...], "nextCursor": "<messageId>" }`; `nextCursor` is `null` when there are no more older messages. Messages within each page are returned oldest to newest. This endpoint does not yet verify the requester is a chat member; requester identity/authentication is planned for a future change.

#### Mark a message as read

`POST /api/v1/chat/:chatId/message/:messageId/read`

Request body: `{ "userId": "<user UUID>" }`. The user must be a chat member, the message must exist, and users cannot mark their own messages as read. The API creates one receipt at `chats/{chatId}/messages/{messageId}/receipts/{userId}` with a Firestore server timestamp. Repeating the request keeps the original read time. Success returns `{ "messageId": "...", "userId": "...", "read": true }`.

#### Update last seen

`POST /api/v1/chat/:chatId/lastseen`

Request body: `{ "userId": "<user UUID>", "messageId": "<Firestore message ID>" }`. The user must be a chat member and the message must exist in that chat. The Firestore document at `chats/{chatId}/members/{userId}` stores `lastSeenMessageId`, `lastSeenMessageCreatedAt`, and `updatedAt`. The marker only moves forward; an older or duplicate update succeeds without changing the stored marker. Success returns `{ "userId": "...", "lastSeenMessageId": "...", "updated": true }` (`updated` is false when the existing marker is already newer).

### Planned (not implemented)

The task's optional group management and message edit/delete features are not implemented.

## Other commands

- `npm run build` compiles TypeScript into `dist`.
- `npm start` runs the compiled server.
- `npm run migrate` applies `src/db/schema.sql`.
- `npm run seed` inserts sample users. Running it repeatedly inserts more users.

## Error behavior

Request validation errors return HTTP 400. Application errors use their configured status code. Unknown routes return HTTP 404; unexpected errors return HTTP 500.
