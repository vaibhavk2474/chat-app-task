# Chat Backend API

Base URL: `{{base_url}}` (Postman variable; the collection default is a placeholder, so set it to your server)

All request bodies are JSON, so send the header `Content-Type: application/json`.

> **Note on responses:** the exported collection has no saved example responses. Only the expected status codes from the Postman tests are listed. Paste real response bodies into the `Response` blocks once you have them.

## Endpoints at a glance

| #   | Name                | Method   | URL                                       |
| --- | ------------------- | -------- | ----------------------------------------- |
| 1   | Create or Get Chat  | `POST`   | `/chat/create`                            |
| 2   | Send Chat Message   | `POST`   | `/chat/{chatId}/message/send`             |
| 3   | Get Chat Messages   | `GET`    | `/chat/{chatId}/messages`                 |
| 4   | Mark Message Read   | `POST`   | `/chat/{chatId}/message/{messageId}/read` |
| 5   | Update Last Seen    | `POST`   | `/chat/{chatId}/lastseen`                 |
| 6   | Get List User Chats | `GET`    | `/user/{userId}/chats`                    |
| 7   | Edit Chat Message   | `PATCH`  | `/chat/{chatId}/message/{messageId}`      |
| 8   | Delete Chat Message | `DELETE` | `/chat/{chatId}/message/{messageId}`      |
| 9   | Create User         | `POST`   | `/user`                                   |
| 10  | Get User            | `GET`    | `/user/{userId}`                          |

---

## Chats

### 1. Create or Get Chat

Creates a chat between two users, or returns the existing one.

- **Method:** `POST`
- **URL:** `{{base_url}}/chat/create`
- **Params:** none
  **Body**

```json
{
	"userAId": "e68cb2e3-a9a2-419e-887e-b16e8d3d8142",
	"userBId": "d0e1553d-1b93-408a-9080-152956f12912"
}
```

**Response:** `200 OK` or `201 Created`

---

### 2. Send Chat Message

- **Method:** `POST`
- **URL:** `{{base_url}}/chat/{{chatId}}/message/send`
  **Path params**

| Param    | Description    |
| -------- | -------------- |
| `chatId` | ID of the chat |

**Body**

```json
{
	"senderId": "e68cb2e3-a9a2-419e-887e-b16e8d3d8142",
	"text": "Interview link is sent on email. please check."
}
```

**Response:** `200 OK` or `201 Created`

---

### 3. Get Chat Messages

Returns messages of a chat, with cursor-based pagination.

- **Method:** `GET`
- **URL:** `{{base_url}}/chat/{{chatId}}/messages?limit=50`
  **Path params**

| Param    | Description    |
| -------- | -------------- |
| `chatId` | ID of the chat |

**Query params**

| Param    | Required                    | Default in collection | Description                         |
| -------- | --------------------------- | --------------------- | ----------------------------------- |
| `limit`  | No                          | `50`                  | Number of messages to return        |
| `cursor` | No (disabled in collection) | `null`                | Pagination cursor for the next page |

**Body:** none

**Response:** `200 OK`

---

### 4. Mark Message Read

- **Method:** `POST`
- **URL:** `{{base_url}}/chat/{{chatId}}/message/{{messageId}}/read`
  **Path params**

| Param       | Description                       |
| ----------- | --------------------------------- |
| `chatId`    | ID of the chat                    |
| `messageId` | ID of the message to mark as read |

**Body**

```json
{
	"userId": "e68cb2e3-a9a2-419e-887e-b16e8d3d8142"
}
```

**Response:** no test defined in the collection

---

### 5. Update Last Seen

Stores the last message a user has seen in a chat.

- **Method:** `POST`
- **URL:** `{{base_url}}/chat/{{chatId}}/lastseen`
  **Path params**

| Param    | Description    |
| -------- | -------------- |
| `chatId` | ID of the chat |

**Body**

```json
{
	"userId": "d0e1553d-1b93-408a-9080-152956f12912",
	"messageId": "yg8lof8XL6nF7DK6onMt"
}
```

**Response:** no test defined in the collection

---

### 6. Get List User Chats

Lists all chats of a user.

- **Method:** `GET`
- **URL:** `{{base_url}}/user/{{userId}}/chats`
  **Path params**

| Param    | Description    |
| -------- | -------------- |
| `userId` | ID of the user |

**Body:** none

**Response:** no test defined in the collection

---

### 7. Edit Chat Message

- **Method:** `PATCH`
- **URL:** `{{base_url}}/chat/:chatId/message/:messageId`
  **Path params**

| Param       | Example value                          |
| ----------- | -------------------------------------- |
| `chatId`    | `8fd08656-19f3-4c09-b7ad-b57960dd8b90` |
| `messageId` | `21r7t0055UZj9jI3OQ4W`                 |

**Body**

```json
{
	"senderId": "e68cb2e3-a9a2-419e-887e-b16e8d3d8142",
	"text": "Yes Vaibahv"
}
```

**Response:** no test defined in the collection

---

### 8. Delete Chat Message

- **Method:** `DELETE`
- **URL:** `{{base_url}}/chat/:chatId/message/:messageId`
  **Path params**

| Param       | Example value                          |
| ----------- | -------------------------------------- |
| `chatId`    | `8fd08656-19f3-4c09-b7ad-b57960dd8b90` |
| `messageId` | `E65yG8otLxUfoslRX445`                 |

**Body**

```json
{
	"senderId": "d0e1553d-1b93-408a-9080-152956f12912"
}
```

**Response:** no test defined in the collection

---

## Users

### 9. Create User

- **Method:** `POST`
- **URL:** `{{base_url}}/user`
- **Params:** none
  **Body**

```json
{
	"name": "Ayushi Deshmukh"
}
```

**Response:** no test defined in the collection

---

### 10. Get User

- **Method:** `GET`
- **URL:** `{{base_url}}/user/:userId`
  **Path params**

| Param    | Example value                          |
| -------- | -------------------------------------- |
| `userId` | `e68cb2e3-a9a2-419e-887e-b16e8d3d8142` |

**Body:** none

**Response:** no test defined in the collection

---
