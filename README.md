# Endpoint: POST /api/v1/auth/register
- Description: Registers a new user in the system.
- Method: POST
- Request Body: JSON
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| name | String | Yes | The full name of the user. |
| email | String | Yes | A unique email address for the user. |
| password | String | Yes | The user's password. Must be a "strong" password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol). |
- Success Response (201 Created):
 - Description: Returned when the user is successfully created
 - Body (JSON):
   {
    "_id": "688e71cabe41382ac102e700",
    "name": "Alex",
    "email": "alex000@gmail.com",
    "token": "eyJh...<long_jwt_string>...A5E"
   }
- Error Responses:
  400 Bad Request: Returned if any of the required fields are missing or if the data is invalid (e.g., weak password, user already exists).
     { "message": "User already exist" }

# Endpoint POST /api/v1/auth/login
- Description: login an existing user in the system.
- Method: POST
- Request Body: JSON
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| email | String | Yes | A unique email address for the user. |
| password | String | Yes | The user's password. Must be a "strong" password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol). |
Success Response (200):
 - Description: Returned when the user user's credentials are valid.
  - Body (JSON):
   {
    "_id": "688e71cabe41382ac102e700",
    "name": "Alex",
    "email": "alex000@gmail.com",
    "token": "eyJh...<long_jwt_string>...A5E"
   }
    Error Responses:
  400 Bad Request: Returned if email or password fieldis missing from the request body.
   { "message": "Please provide email and password" }
   401 Unauthorized: (Added) Returned if the credentials are incorrect (wrong email or password).
   { "message": "Invalid email or password" }
     


