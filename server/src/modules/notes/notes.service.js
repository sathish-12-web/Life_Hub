import { prisma } from '../../utils/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function createNote(ownerId, data) {
  const note = await prisma.note.create({
    data: {
      ownerId,
      title: data.title,
      body: data.body ?? '',
      tags: data.tags ?? [],
    },
  });

  return note;
}

export async function getNotes(
  ownerId,
  { page = 1, limit = 20, q, tag, archived = 'false', sort = 'updatedAt', order = 'desc' }
) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));

  const where = {
    ownerId,
  };

  if (archived === 'false') {
    where.archivedAt = null;
  } else if (archived === 'true') {
    where.archivedAt = { not: null };
  }

  if (tag) {
    where.tags = { has: tag };
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { body: { contains: q, mode: 'insensitive' } },
    ];
  }

  const skip = (pageNum - 1) * limitNum;

  const [notes, total] = await Promise.all([
    prisma.note.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [sort]: order,
      },
    }),
    prisma.note.count({ where }),
  ]);

  return {
    notes,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

export async function getNoteById(ownerId, noteId) {
  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      ownerId,
    },
  });

  if (!note) {
    throw new AppError('Note not found', 404, 'NOT_FOUND');
  }

  return note;
}

export async function updateNote(ownerId, noteId, data) {
  const existing = await prisma.note.findFirst({
    where: {
      id: noteId,
      ownerId,
    },
  });

  if (!existing) {
    throw new AppError('Note not found', 404, 'NOT_FOUND');
  }

  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.body !== undefined) updateData.body = data.body;
  if (data.tags !== undefined) updateData.tags = data.tags;

  if (data.isArchived !== undefined) {
    updateData.archivedAt = data.isArchived ? new Date() : null;
  } else if (data.archivedAt !== undefined) {
    updateData.archivedAt = data.archivedAt ? new Date(data.archivedAt) : null;
  }

  const updated = await prisma.note.update({
    where: { id: noteId },
    data: updateData,
  });

  return updated;
}

export async function deleteNote(ownerId, noteId) {
  const existing = await prisma.note.findFirst({
    where: {
      id: noteId,
      ownerId,
    },
  });

  if (!existing) {
    throw new AppError('Note not found', 404, 'NOT_FOUND');
  }

  await prisma.note.delete({
    where: { id: noteId },
  });

  return true;
}
