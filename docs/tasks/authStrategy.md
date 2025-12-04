# Authentication Strategy POC Plan

This plan outlines the steps to create a Proof of Concept for the authentication strategy defined in `docs/specs/authStrategy.md`.

## [1] Infrastructure & Setup
- [ ] Create root project structure
- [ ] Create `docker-compose.yml` to orchestrate backend and frontend
    - Define `backend` service (Bun)
    - Define `frontend` service (Node/Vite)

## [2] Backend (Bun + Express)
- [ ] Initialize Bun project in `backend/`
- [ ] Install dependencies:
    - `express`
    - `passport`
    - `passport-jwt`
    - `jsonwebtoken`
    - `cookie-parser`
    - `cors`
    - `@types/express`, `@types/passport`, `@types/passport-jwt`, `@types/jsonwebtoken`, `@types/cookie-parser`, `@types/cors`
- [ ] Configure `server.ts`:
    - Setup Express app
    - Configure CORS (allow credentials, specific origin)
    - Configure Cookie Parser
- [ ] Implement Authentication Logic:
    - Define Hardcoded User
    - Create `generateAccessToken` and `generateRefreshToken` functions
    - Configure Passport JWT Strategy (for protecting routes)
- [ ] Implement Routes:
    - `POST /auth/login`: Validate credentials, set `refreshToken` HttpOnly cookie, return `accessToken`
    - `POST /auth/refresh`: Validate `refreshToken` cookie, return new `accessToken`
    - `POST /auth/logout`: Clear `refreshToken` cookie
    - `GET /api/protected`: Example protected route (requires valid `accessToken`)

## [3] Frontend (React + Vite)
- [ ] Initialize Vite project in `frontend/` (React + TypeScript)
- [ ] Install dependencies:
    - `axios`
- [ ] Configure Axios:
    - Create `api` instance with `baseURL`
    - Set `withCredentials: true`
- [ ] Implement Auth Logic (Context/State):
    - Store `accessToken` in memory (State)
    - Implement `refreshAccessToken` function
- [ ] Implement Axios Interceptor:
    - Intercept 401 responses
    - Call `refreshAccessToken`
    - Retry original request
- [ ] Build UI:
    - **Login Button**: Calls `/auth/login`
    - **Get Protected Info Button**: Calls `/api/protected`
    - **Refresh Token Button**: Manually triggers refresh (for testing)
    - **Display Area**: Show `accessToken` (truncated) and Protected Data result

## [4] Verification
- [ ] Run `docker-compose up`
- [ ] Test Login Flow (Check Network tab for Cookie and Response)
- [ ] Test Protected Route (Success with token)
- [ ] Test Refresh Flow (Wait for token expiry or force invalidation, verify silent refresh)
