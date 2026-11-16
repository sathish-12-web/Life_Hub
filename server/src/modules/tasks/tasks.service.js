import { prisma } from '../../utils/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function createTask(ownerId, data) {
  const task = await prisma.task.create({
    data: {
      ownerId,
      title: data.title,
      description: data.description || null,
      status: data.status || 'TODO',
      priority: data.priority || 'MEDIUM',
      dueAt: data.dueAt ? new Date(data.dueAt) : null,
      tags: data.tags || [],
    },
  });

  return task;
}

export async function getTasks(ownerId, { page = 1, limit = 20, status, priority, sort = 'createdAt', order = 'desc' }) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));

  const where = {
    ownerId,
  };

  if (status) {
    where.status = status;
  }

  if (priority) {
    where.priority = priority;
  }

  const skip = (pageNum - 1) * limitNum;

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [sort]: order,
      },
    }),
    prisma.task.count({ where }),
  ]);

  return {
    tasks,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

export async function getTaskById(ownerId, taskId) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      ownerId,
    },
  });

  if (!task) {
    throw new AppError('Task not found', 404, 'NOT_FOUND');
  }

  return task;
}

export async function updateTask(ownerId, taskId, data) {
  const existing = await prisma.task.findFirst({
    where: {
      id: taskId,
      ownerId,
    },
  });

  if (!existing) {
    throw new AppError('Task not found', 404, 'NOT_FOUND');
  }

  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.dueAt !== undefined) updateData.dueAt = data.dueAt ? new Date(data.dueAt) : null;
  if (data.tags !== undefined) updateData.tags = data.tags;

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: updateData,
  });

  return updated;
}

export async function deleteTask(ownerId, taskId) {
  const existing = await prisma.task.findFirst({
    where: {
      id: taskId,
      ownerId,
    },
  });

  if (!existing) {
    throw new AppError('Task not found', 404, 'NOT_FOUND');
  }

  await prisma.task.delete({
    where: { id: taskId },
  });

  return true;
}

export async function getTaskStats(ownerId) {
  const [total, todo, inProgress, done, cancelled] = await Promise.all([
    prisma.task.count({ where: { ownerId } }),
    prisma.task.count({ where: { ownerId, status: 'TODO' } }),
    prisma.task.count({ where: { ownerId, status: 'IN_PROGRESS' } }),
    prisma.task.count({ where: { ownerId, status: 'DONE' } }),
    prisma.task.count({ where: { ownerId, status: 'CANCELLED' } }),
  ]);

  const now = new Date();
  const overdue = await prisma.task.count({
    where: {
      ownerId,
      status: { notIn: ['DONE', 'CANCELLED'] },
      dueAt: { lt: now },
    },
  });

  return {
    total,
    todo,
    inProgress,
    done,
    cancelled,
    overdue,
  };
}
