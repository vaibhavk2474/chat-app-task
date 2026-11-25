# Chat Backend

An API-only chat backend built with Node.js, TypeScript, Express, PostgreSQL, and Firebase Firestore. It currently supports direct chats. PostgreSQL stores users, chats, and membership; Firestore stores messages, read receipts, and last-seen state.

## Setup

Requirements: Node.js with npm, a PostgreSQL database, and a Firebase project with Firestore enabled.

From the `chat-app-backend` directory:

1. Run `npm install`.
2. Copy `.env.example` to `.env` and set the values below.
3. Run `npm run migrate` to create or update the database schema.
4. Run `npm run seed` to add sample users.
5. Run `npm run dev` to start the server on port `3000`.

| Variable                         | Purpose                                               |
| -------------------------------- | ----------------------------------------------------- |
| `PORT`                           | Server port; defaults to `3000`.                      |
| `DATABASE_URL`                   | PostgreSQL connection string.                         |
| `GOOGLE_APPLICATION_CREDENTIALS` | Local path to the Firebase service account JSON file. |
| `FIREBASE_SERVICE_ACCOUNT`       | Firebase service account JSON for deployment.         |

Use one Firebase credential option. Keep credentials out of Git.

## APIs

All endpoints use the `/api/v1` prefix. User and chat IDs are PostgreSQL UUIDs. Message IDs are Firestore document IDs.

### Implemented

**Note:** Added postman-apis.md file from postman export to check all apis with proper method, url, params, query, body and response. please look over to it also.

#### Create or get a direct chat

`POST /api/v1/chat/create`

```json
{
	"userAId": "<user UUID>",
	"userBId": "<user UUID>"
}
```

Returns `{ "chatId": "<chat UUID>" }`. Both users must exist and must be different. Repeating the request for the same pair returns the existing chat.

### Send a message

`POST /api/v1/chat/:chatId/message/send`

```json
{
	"senderId": "<user UUID>",
	"text": "Hello"
}
```

The sender must belong to the chat. Text is trimmed, must not be blank, and is limited to 2,000 characters. Returns the Firestore `messageId`.

### Get messages

`GET /api/v1/chat/:chatId/messages?limit=50&cursor=<messageId>`

`limit` defaults to 50 and can be 1–100. The first request returns the newest page, ordered oldest-to-newest within that page. Use the response’s `nextCursor` to fetch older messages; it is `null` when there are no more. The response contains `messages` and `nextCursor`.

This endpoint currently checks that the chat exists but does not verify that the requester belongs to it.

### Mark a message as read

`POST /api/v1/chat/:chatId/message/:messageId/read`

```json
{
	"userId": "<user UUID>"
}
```

The user must belong to the chat, the message must exist, and users cannot mark their own messages as read. The receipt is stored in Firestore at `chats/{chatId}/messages/{messageId}/receipts/{userId}`.

### Update last seen

`POST /api/v1/chat/:chatId/lastseen`

```json
{
	"userId": "<user UUID>",
	"messageId": "<Firestore message ID>"
}
```

The user must belong to the chat and the message must exist. Firestore stores the user's last-seen message at `chats/{chatId}/members/{userId}`. The marker does not move backward.

### List a user's chats

`GET /api/v1/user/:userId/chats`

Returns the user's chats with chat details and member IDs and names. An existing user with no chats receives an empty list; an unknown user receives HTTP 404.

## Optional message APIs

### Edit a message

`PATCH /api/v1/chat/:chatId/message/:messageId`

```json
{
	"senderId": "<original sender UUID>",
	"text": "Updated text"
}
```

Only the original sender can edit the message. Text follows the same validation rules as sending.

### Delete a message

`DELETE /api/v1/chat/:chatId/message/:messageId`

```json
{
	"senderId": "<original sender UUID>"
}
```

Only the original sender can delete the message. The current implementation removes the message document from Firestore.

## Future work

- Add group chat creation and member management.
- Add authentication and check that a requester belongs to a chat before returning its messages.

Authentication is not implemented yet. User IDs supplied in requests identify the requested user, but do not prove the caller's identity.

## Commands

- `npm run dev` — start the development server.
- `npm run build` — compile TypeScript.
- `npm start` — run the compiled server.
- `npm run migrate` — apply the database schema.
- `npm run seed` — insert sample users.
