# DIU Question Bank API v1 Documentation

**Base URL:** `http://localhost:8000/api/v1`

**API Version:** 1.0

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Error Responses](#error-responses)
- [Endpoints](#endpoints)
  - [Options](#options)
  - [Authentication](#authentication-endpoints)
  - [Questions](#questions)
  - [Submissions](#submissions)
  - [Courses](#courses)
  - [Semesters](#semesters)

---

## Overview

The DIU Question Bank API provides programmatic access to manage question papers, submissions, and user accounts. The API follows RESTful conventions and returns JSON responses.

### Request Headers

| Header          | Value                         | Required |
| --------------- | ----------------------------- | -------- |
| `Accept`        | `application/json`            | Yes      |
| `Content-Type`  | `application/json`            | Yes*     |
| `Authorization` | `Bearer {token}`              | For protected routes |

*For file uploads, use `multipart/form-data`

---

## Authentication

The API uses Laravel Sanctum for token-based authentication. Protected endpoints require a valid bearer token in the `Authorization` header.

```
Authorization: Bearer {your_token}
```

### Obtaining a Token

Tokens are obtained through the [Login](#post-authlogin) or [Register](#post-authregister) endpoints.

### Verified Routes

Some endpoints require email verification. These are marked with `🔒 Verified` in the documentation.

---

## Rate Limiting

Rate limits are applied to prevent abuse. The following limits apply:

| Endpoint Group       | Limit           |
| -------------------- | --------------- |
| Login                | 5 requests/min  |
| Course/Semester creation | 10 requests/min |
| Submission CRUD      | 10 requests/min |
| Voting               | 30 requests/min |
| Email verification   | 6 requests/min  |

When rate limited, the API returns a `429 Too Many Requests` response.

---

## Error Responses

### Validation Error (422)

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "Error message for field"
    ]
  }
}
```

### Unauthorized (401)

```json
{
  "message": "Unauthenticated."
}
```

### Forbidden (403)

```json
{
  "message": "Forbidden action message."
}
```

### Not Found (404)

```json
{
  "message": "Not Found."
}
```

### Rate Limited (429)

```json
{
  "message": "Too Many Attempts."
}
```

---

## Endpoints

---

## Options

### GET /options

Get all form options for dropdowns/selects (departments, courses, semesters, exam types) in a single request.

**Response (200 OK):**

```json
{
  "data": {
    "departments": [
      {
        "id": 1,
        "name": "Computer Science and Engineering",
        "short_name": "CSE"
      },
      {
        "id": 2,
        "name": "Electrical and Electronic Engineering",
        "short_name": "EEE"
      }
    ],
    "courses": [
      {
        "id": 1,
        "department_id": 1,
        "name": "Algorithm Design"
      },
      {
        "id": 2,
        "department_id": 1,
        "name": "Data Structures"
      },
      {
        "id": 3,
        "department_id": 2,
        "name": "Circuit Analysis"
      }
    ],
    "semesters": [
      {
        "id": 5,
        "name": "Spring 26"
      },
      {
        "id": 4,
        "name": "Fall 25"
      },
      {
        "id": 3,
        "name": "Summer 25"
      }
    ],
    "exam_types": [
      {
        "id": 1,
        "name": "Final"
      },
      {
        "id": 2,
        "name": "Midterm"
      }
    ]
  }
}
```

**Notes:**
- **Cached for 1 hour** - Response is cached for performance; cache is invalidated when new courses or semesters are created
- Departments are sorted alphabetically by name
- Courses are sorted alphabetically by name and include `department_id` for filtering
- Semesters are sorted by newest first
- Exam types are sorted alphabetically by name

---

## Authentication Endpoints

### POST /auth/register

Register a new user account.

**Request Body:**

| Field                   | Type   | Required | Description                                    |
| ----------------------- | ------ | -------- | ---------------------------------------------- |
| `name`                  | string | Yes      | User's full name (max 255 chars)               |
| `username`              | string | Yes      | Unique username (3-30 chars, alphanumeric, dash, underscore) |
| `email`                 | string | Yes      | Valid email address (unique)                   |
| `password`              | string | Yes      | Password (must meet security requirements)     |
| `password_confirmation` | string | Yes      | Password confirmation                          |

**Example Request:**

```json
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!"
}
```

**Response (201 Created):**

```json
{
  "data": {
    "id": 1,
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "student_id": null,
    "email_verified_at": null,
    "avatar_url": null,
    "created_at": "2026-01-28T10:00:00.000000Z"
  },
  "token": "1|abc123def456..."
}
```

---

### POST /auth/login

Authenticate a user and obtain an access token.

**Rate Limit:** 5 requests per minute

**Request Body:**

| Field      | Type   | Required | Description     |
| ---------- | ------ | -------- | --------------- |
| `email`    | string | Yes      | Email address   |
| `password` | string | Yes      | User password   |

**Example Request:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**

```json
{
  "data": {
    "id": 1,
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "student_id": "123-45-678",
    "email_verified_at": "2026-01-28T10:05:00.000000Z",
    "avatar_url": "http://localhost:8000/storage/avatars/1.jpg",
    "created_at": "2026-01-28T10:00:00.000000Z"
  },
  "token": "2|xyz789..."
}
```

**Error Response (401 Unauthorized):**

```json
{
  "message": "Invalid credentials.",
  "errors": {
    "email": ["The provided credentials are incorrect."]
  }
}
```

---

### POST /auth/logout

🔐 **Requires Authentication**

Revoke the current access token.

**Response (204 No Content):**

No response body.

---

### GET /auth/user

🔐 **Requires Authentication**

Get the authenticated user's profile.

**Response (200 OK):**

```json
{
  "data": {
    "id": 1,
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "student_id": "123-45-678",
    "email_verified_at": "2026-01-28T10:05:00.000000Z",
    "avatar_url": "http://localhost:8000/storage/avatars/1.jpg",
    "created_at": "2026-01-28T10:00:00.000000Z"
  }
}
```

---

### PATCH /auth/user

🔐 **Requires Authentication**

Update the authenticated user's profile.

**Request Body:**

| Field       | Type   | Required | Description                                    |
| ----------- | ------ | -------- | ---------------------------------------------- |
| `name`      | string | No       | User's full name (max 255 chars)               |
| `username`  | string | No       | Unique username (3-30 chars)                   |
| `student_id`| string | No       | Student ID (nullable, unique)                  |

**Example Request:**

```json
{
  "name": "John Updated",
  "student_id": "123-45-678"
}
```

**Response (200 OK):**

```json
{
  "data": {
    "id": 1,
    "name": "John Updated",
    "username": "johndoe",
    "email": "john@example.com",
    "student_id": "123-45-678",
    "email_verified_at": "2026-01-28T10:05:00.000000Z",
    "avatar_url": "http://localhost:8000/storage/avatars/1.jpg",
    "created_at": "2026-01-28T10:00:00.000000Z"
  }
}
```

---

### POST /auth/user/avatar

🔐 **Requires Authentication**

Upload or update the authenticated user's avatar.

**Content-Type:** `multipart/form-data`

**Request Body:**

| Field    | Type | Required | Description                              |
| -------- | ---- | -------- | ---------------------------------------- |
| `avatar` | file | Yes      | Image file (jpeg, png, gif, webp; max 2MB) |

**Response (200 OK):**

```json
{
  "data": {
    "id": 1,
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "student_id": "123-45-678",
    "email_verified_at": "2026-01-28T10:05:00.000000Z",
    "avatar_url": "http://localhost:8000/storage/avatars/1-new.jpg",
    "created_at": "2026-01-28T10:00:00.000000Z"
  }
}
```

---

### POST /auth/email/verification-notification

🔐 **Requires Authentication**

Resend email verification notification.

**Rate Limit:** 6 requests per minute

**Response (204 No Content):**

No response body (email sent).

**Response (200 OK):** *(if already verified)*

Returns the user resource.

---

### GET /auth/email/verify/{id}/{hash}

Verify a user's email address via signed URL.

**URL Parameters:**

| Parameter | Type   | Description                  |
| --------- | ------ | ---------------------------- |
| `id`      | integer| User ID                      |
| `hash`    | string | Verification hash            |

**Note:** This endpoint requires a valid signed URL (sent via email).

**Response (200 OK):**

```json
{
  "data": {
    "id": 1,
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "student_id": null,
    "email_verified_at": "2026-01-28T10:05:00.000000Z",
    "avatar_url": null,
    "created_at": "2026-01-28T10:00:00.000000Z"
  }
}
```

**Error Response (403 Forbidden):**

```json
{
  "message": "Invalid verification link.",
  "errors": {
    "hash": ["The verification link is invalid or has expired."]
  }
}
```

---

## Questions

### GET /questions

List published questions with optional filters.

**Query Parameters:**

| Parameter       | Type    | Required | Description                    |
| --------------- | ------- | -------- | ------------------------------ |
| `department_id` | integer | No       | Filter by department ID        |
| `course_id`     | integer | No       | Filter by course ID            |
| `semester_id`   | integer | No       | Filter by semester ID          |
| `exam_type_id`  | integer | No       | Filter by exam type ID         |
| `per_page`      | integer | No       | Items per page (1-100, default: 15) |
| `page`          | integer | No       | Page number                    |

**Example Request:**

```
GET /api/v1/questions?department_id=1&per_page=10
```

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": 1,
      "department": {
        "id": 1,
        "name": "Computer Science and Engineering",
        "short_name": "CSE"
      },
      "course": {
        "id": 5,
        "name": "Data Structures"
      },
      "semester": {
        "id": 3,
        "name": "Fall 24"
      },
      "exam_type": {
        "id": 1,
        "name": "Midterm"
      },
      "views": 150,
      "created_at": "2026-01-15T08:30:00.000000Z"
    }
  ],
  "links": {
    "first": "http://localhost:8000/api/v1/questions?page=1",
    "last": "http://localhost:8000/api/v1/questions?page=5",
    "prev": null,
    "next": "http://localhost:8000/api/v1/questions?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 5,
    "path": "http://localhost:8000/api/v1/questions",
    "per_page": 15,
    "to": 15,
    "total": 72
  }
}
```

---

### GET /questions/{id}

Get a specific published question with its submissions.

**URL Parameters:**

| Parameter | Type    | Description |
| --------- | ------- | ----------- |
| `id`      | integer | Question ID |

**Response (200 OK):**

```json
{
  "data": {
    "id": 1,
    "title": "CSE - Data Structures - Fall 24 - Midterm",
    "department": {
      "id": 1,
      "name": "Computer Science and Engineering",
      "short_name": "CSE"
    },
    "course": {
      "id": 5,
      "name": "Data Structures"
    },
    "semester": {
      "id": 3,
      "name": "Fall 24"
    },
    "exam_type": {
      "id": 1,
      "name": "Midterm"
    },
    "created_at": "2026-01-15T08:30:00.000000Z",
    "submissions": [
      {
        "id": 10,
        "user": {
          "name": "Jane Smith",
          "username": "janesmith"
        },
        "pdf_url": "http://localhost:8000/storage/submissions/10.pdf",
        "upvote_count": 25,
        "downvote_count": 2
      },
      {
        "id": 8,
        "user": {
          "name": "Bob Wilson",
          "username": "bobwilson"
        },
        "pdf_url": "http://localhost:8000/storage/submissions/8.pdf",
        "upvote_count": 18,
        "downvote_count": 1
      }
    ]
  }
}
```

**Error Response (404 Not Found):**

Returned if the question doesn't exist or is not published.

---

## Submissions

### GET /submissions

🔐 **Requires Authentication** | 🔒 **Verified**

List the authenticated user's submissions.

**Query Parameters:**

| Parameter  | Type    | Required | Description                         |
| ---------- | ------- | -------- | ----------------------------------- |
| `per_page` | integer | No       | Items per page (max 100, default: 15) |
| `page`     | integer | No       | Page number                         |

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": 10,
      "question": {
        "id": 1,
        "department": {
          "id": 1,
          "name": "Computer Science and Engineering",
          "short_name": "CSE"
        },
        "course": {
          "id": 5,
          "name": "Data Structures"
        },
        "semester": {
          "id": 3,
          "name": "Fall 24"
        },
        "exam_type": {
          "id": 1,
          "name": "Midterm"
        },
        "views": 150,
        "created_at": "2026-01-15T08:30:00.000000Z"
      },
      "views": 150,
      "pdf_url": "http://localhost:8000/storage/submissions/10.pdf",
      "upvote_count": 25,
      "downvote_count": 2,
      "created_at": "2026-01-15T09:00:00.000000Z",
      "updated_at": "2026-01-20T14:30:00.000000Z"
    }
  ],
  "links": { ... },
  "meta": { ... }
}
```

---

### POST /submissions

🔐 **Requires Authentication** | 🔒 **Verified**

Create a new submission with a PDF file.

**Rate Limit:** 10 requests per minute

**Content-Type:** `multipart/form-data`

**Request Body:**

| Field           | Type    | Required | Description                          |
| --------------- | ------- | -------- | ------------------------------------ |
| `department_id` | integer | Yes      | Department ID (must exist)           |
| `course_id`     | integer | Yes      | Course ID (must belong to department)|
| `semester_id`   | integer | Yes      | Semester ID (must exist)             |
| `exam_type_id`  | integer | Yes      | Exam type ID (must exist)            |
| `pdf`           | file    | Yes      | PDF file (max 10MB)                  |

**Response (201 Created):**

```json
{
  "data": {
    "id": 15,
    "question": {
      "id": 5,
      "department": {
        "id": 1,
        "name": "Computer Science and Engineering",
        "short_name": "CSE"
      },
      "course": {
        "id": 5,
        "name": "Data Structures"
      },
      "semester": {
        "id": 3,
        "name": "Fall 24"
      },
      "exam_type": {
        "id": 1,
        "name": "Midterm"
      },
      "views": 0,
      "created_at": "2026-01-28T10:00:00.000000Z"
    },
    "views": 0,
    "pdf_url": "http://localhost:8000/storage/submissions/15.pdf",
    "upvote_count": 0,
    "downvote_count": 0,
    "created_at": "2026-01-28T10:00:00.000000Z",
    "updated_at": "2026-01-28T10:00:00.000000Z"
  }
}
```

---

### PATCH /submissions/{id}

🔐 **Requires Authentication** | 🔒 **Verified**

Update an existing submission (owner only).

**Rate Limit:** 10 requests per minute

**URL Parameters:**

| Parameter | Type    | Description   |
| --------- | ------- | ------------- |
| `id`      | integer | Submission ID |

**Content-Type:** `multipart/form-data`

**Request Body:** *(at least one field required)*

| Field           | Type    | Required | Description                          |
| --------------- | ------- | -------- | ------------------------------------ |
| `department_id` | integer | No       | New department ID                    |
| `course_id`     | integer | No       | New course ID                        |
| `semester_id`   | integer | No       | New semester ID                      |
| `exam_type_id`  | integer | No       | New exam type ID                     |
| `pdf`           | file    | No       | New PDF file (max 10MB)              |

**Note:** Changing question-related fields (department, course, semester, exam type) will clear all existing votes on the submission.

**Response (200 OK):**

Returns the updated submission resource.

**Error Response (403 Forbidden):**

Returned if the user doesn't own the submission.

---

### DELETE /submissions/{id}

🔐 **Requires Authentication** | 🔒 **Verified**

Delete a submission (owner only).

**Rate Limit:** 10 requests per minute

**URL Parameters:**

| Parameter | Type    | Description   |
| --------- | ------- | ------------- |
| `id`      | integer | Submission ID |

**Response (204 No Content):**

No response body.

**Error Response (403 Forbidden):**

Returned if the user doesn't own the submission.

---

## Submission Votes

### GET /submissions/{id}/vote

🔐 **Requires Authentication** | 🔒 **Verified**

Get the authenticated user's vote on a submission.

**URL Parameters:**

| Parameter | Type    | Description   |
| --------- | ------- | ------------- |
| `id`      | integer | Submission ID |

**Response (200 OK):**

```json
{
  "data": {
    "vote": 1
  }
}
```

**Vote Values:**

| Value | Meaning    |
| ----- | ---------- |
| `1`   | Upvoted    |
| `-1`  | Downvoted  |
| `null`| No vote    |

---

### POST /submissions/{id}/upvote

🔐 **Requires Authentication** | 🔒 **Verified**

Upvote a submission.

**Rate Limit:** 30 requests per minute

**URL Parameters:**

| Parameter | Type    | Description   |
| --------- | ------- | ------------- |
| `id`      | integer | Submission ID |

**Response (200 OK):**

```json
{
  "data": {
    "vote": 1,
    "upvote_count": 26,
    "downvote_count": 2
  }
}
```

**Error Response (403 Forbidden):**

```json
{
  "message": "You cannot vote on your own submission."
}
```

---

### POST /submissions/{id}/downvote

🔐 **Requires Authentication** | 🔒 **Verified**

Downvote a submission.

**Rate Limit:** 30 requests per minute

**URL Parameters:**

| Parameter | Type    | Description   |
| --------- | ------- | ------------- |
| `id`      | integer | Submission ID |

**Response (200 OK):**

```json
{
  "data": {
    "vote": -1,
    "upvote_count": 25,
    "downvote_count": 3
  }
}
```

**Error Response (403 Forbidden):**

```json
{
  "message": "You cannot vote on your own submission."
}
```

---

### DELETE /submissions/{id}/vote

🔐 **Requires Authentication** | 🔒 **Verified**

Remove your vote from a submission.

**Rate Limit:** 30 requests per minute

**URL Parameters:**

| Parameter | Type    | Description   |
| --------- | ------- | ------------- |
| `id`      | integer | Submission ID |

**Response (204 No Content):**

No response body.

---

## Courses

### POST /courses

🔐 **Requires Authentication** | 🔒 **Verified**

Create a new course for a department.

**Rate Limit:** 10 requests per minute

**Request Body:**

| Field           | Type    | Required | Description                              |
| --------------- | ------- | -------- | ---------------------------------------- |
| `department_id` | integer | Yes      | Department ID (must exist)               |
| `name`          | string  | Yes      | Course name (max 255 chars, unique per department) |

**Example Request:**

```json
{
  "department_id": 1,
  "name": "Algorithm Design"
}
```

**Response (201 Created):**

```json
{
  "data": {
    "id": 15,
    "department_id": 1,
    "name": "Algorithm Design",
    "created_at": "2026-01-28T10:00:00.000000Z",
    "updated_at": "2026-01-28T10:00:00.000000Z"
  }
}
```

---

## Semesters

### POST /semesters

🔐 **Requires Authentication** | 🔒 **Verified**

Create a new semester.

**Rate Limit:** 10 requests per minute

**Request Body:**

| Field  | Type   | Required | Description                                     |
| ------ | ------ | -------- | ----------------------------------------------- |
| `name` | string | Yes      | Semester name (format: `{Season} {YY}`, unique) |

**Valid Formats:**

- `Fall 24`, `Spring 25`, `Summer 25`, `Short 24`

**Example Request:**

```json
{
  "name": "Spring 26"
}
```

**Response (201 Created):**

```json
{
  "data": {
    "id": 8,
    "name": "Spring 26",
    "created_at": "2026-01-28T10:00:00.000000Z",
    "updated_at": "2026-01-28T10:00:00.000000Z"
  }
}
```

**Validation Error (422):**

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "name": ["The name format is invalid. Use format: Season YY (e.g., Fall 24, Spring 25)"]
  }
}
```

---

## Changelog

### v1.0.0 (2026-01-28)

- Initial API release
- Authentication endpoints (register, login, logout, profile management)
- Email verification flow
- Questions listing and detail endpoints
- Submissions CRUD operations
- Voting system for submissions
- Course and semester creation endpoints
