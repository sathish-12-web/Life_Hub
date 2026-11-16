import { prisma } from '../../utils/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function createEvent(ownerId, data) {
  const startAt = new Date(data.startAt);
  const endAt = new Date(data.endAt);

  if (endAt < startAt) {
    throw new AppError('endAt must be greater than or equal to startAt', 400, 'VALIDATION_ERROR');
  }

  const event = await prisma.event.create({
    data: {
      ownerId,
      title: data.title,
      description: data.description || null,
      startAt,
      endAt,
      reminderAt: data.reminderAt ? new Date(data.reminderAt) : null,
      recurrenceRule: data.recurrenceRule || null,
    },
  });

  return event;
}

export async function getEvents(ownerId, { page = 1, limit = 50, from, to, order = 'asc' }) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));

  const where = {
    ownerId,
  };

  if (from || to) {
    where.startAt = {};
    if (from) where.startAt.gte = new Date(from);
    if (to) where.startAt.lte = new Date(to);
  }

  const skip = (pageNum - 1) * limitNum;

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        startAt: order,
      },
    }),
    prisma.event.count({ where }),
  ]);

  return {
    events,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

export async function getEventById(ownerId, eventId) {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      ownerId,
    },
  });

  if (!event) {
    throw new AppError('Event not found', 404, 'NOT_FOUND');
  }

  return event;
}

export async function updateEvent(ownerId, eventId, data) {
  const existing = await prisma.event.findFirst({
    where: {
      id: eventId,
      ownerId,
    },
  });

  if (!existing) {
    throw new AppError('Event not found', 404, 'NOT_FOUND');
  }

  const newStartAt = data.startAt ? new Date(data.startAt) : existing.startAt;
  const newEndAt = data.endAt ? new Date(data.endAt) : existing.endAt;

  if (newEndAt < newStartAt) {
    throw new AppError('endAt must be greater than or equal to startAt', 400, 'VALIDATION_ERROR');
  }

  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.startAt !== undefined) updateData.startAt = newStartAt;
  if (data.endAt !== undefined) updateData.endAt = newEndAt;
  if (data.reminderAt !== undefined) updateData.reminderAt = data.reminderAt ? new Date(data.reminderAt) : null;
  if (data.recurrenceRule !== undefined) updateData.recurrenceRule = data.recurrenceRule;

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: updateData,
  });

  return updated;
}

export async function deleteEvent(ownerId, eventId) {
  const existing = await prisma.event.findFirst({
    where: {
      id: eventId,
      ownerId,
    },
  });

  if (!existing) {
    throw new AppError('Event not found', 404, 'NOT_FOUND');
  }

  await prisma.event.delete({
    where: { id: eventId },
  });

  return true;
}
