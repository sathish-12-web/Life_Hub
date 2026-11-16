import bcrypt from 'bcryptjs';
import { prisma } from '../../utils/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/tokens.js';

function sanitizeUser(user) {
  // eslint-disable-next-line no-unused-vars
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function registerUser({ name, email, password, timezone = 'UTC' }) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new AppError('An account with this email already exists', 409, 'CONFLICT');
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      timezone,
    },
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

export async function refreshSession(refreshToken) {
  if (!refreshToken) {
    throw new AppError('Refresh token required', 401, 'UNAUTHORIZED');
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new AppError('User account not found', 401, 'UNAUTHORIZED');
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    return {
      user: sanitizeUser(user),
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch {
    throw new AppError('Invalid or expired refresh token', 401, 'UNAUTHORIZED');
  }
}

export async function getUserProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  return sanitizeUser(user);
}

export async function updateUserProfile(userId, { name, timezone }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name.trim();
  if (timezone !== undefined) updateData.timezone = timezone.trim();

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return sanitizeUser(updatedUser);
}
