import express from 'express';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Secrets (In a real app, these must be in .env)
const ACCESS_TOKEN_SECRET = 'access_secret_123';
const REFRESH_TOKEN_SECRET = 'refresh_secret_456';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Hardcoded User
const MOCK_USER = {
  id: 1,
  username: 'user',
  password: 'password' // In real app, hash this!
};

// Token Generators
const generateAccessToken = (user: any) => {
  return jwt.sign({ id: user.id, username: user.username }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (user: any) => {
  return jwt.sign({ id: user.id, username: user.username }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

// Passport Strategy
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: ACCESS_TOKEN_SECRET,
};

passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
  if (jwt_payload.id === MOCK_USER.id) {
    return done(null, MOCK_USER);
  } else {
    return done(null, false);
  }
}));

// Routes

// Login
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (username === MOCK_USER.username && password === MOCK_USER.password) {
    const accessToken = generateAccessToken(MOCK_USER);
    const refreshToken = generateRefreshToken(MOCK_USER);

    // Set HttpOnly Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // Set to true in production (HTTPS)
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ accessToken });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Refresh
app.post('/auth/refresh', (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token not found' });
  }

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Invalid refresh token' });

    // In a real app, check if user still exists or if token is revoked

    const newAccessToken = generateAccessToken({ id: user.id, username: user.username });
    res.json({ accessToken: newAccessToken });
  });
});

// Logout
app.post('/auth/logout', (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: false,
    sameSite: 'strict'
  });
  res.json({ message: 'Logged out' });
});

// Protected Route
app.get('/api/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ message: 'This is protected data!', user: req.user });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
