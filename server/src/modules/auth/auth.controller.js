import { config } from '../../config/index.js';
import * as authService from './auth.service.js';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.env === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export async function register(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await authService.registerUser(req.body);

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(201).json({
      data: {
        user,
        accessToken,
      },
      meta: {},
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await authService.loginUser(req.body);

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json({
      data: {
        user,
        accessToken,
      },
      meta: {},
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res) {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'lax',
  });

  res.status(200).json({
    data: {
      message: 'Logged out successfully',
    },
    meta: {},
  });
}

export async function refresh(req, res, next) {
  try {
    const token = req.cookies.refreshToken;
    const { user, accessToken, refreshToken } = await authService.refreshSession(token);

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json({
      data: {
        user,
        accessToken,
      },
      meta: {},
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await authService.getUserProfile(req.user.id);

    res.status(200).json({
      data: {
        user,
      },
      meta: {},
    });
  } catch (error) {
    next(error);
  }
}
