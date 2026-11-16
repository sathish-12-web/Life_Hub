import * as tasksService from './tasks.service.js';

export async function createTask(req, res, next) {
  try {
    const task = await tasksService.createTask(req.user.id, req.body);

    res.status(201).json({
      data: task,
      meta: {},
    });
  } catch (error) {
    next(error);
  }
}

export async function getTasks(req, res, next) {
  try {
    const { tasks, meta } = await tasksService.getTasks(req.user.id, req.query);

    res.status(200).json({
      data: tasks,
      meta,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTaskById(req, res, next) {
  try {
    const task = await tasksService.getTaskById(req.user.id, req.params.id);

    res.status(200).json({
      data: task,
      meta: {},
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTask(req, res, next) {
  try {
    const task = await tasksService.updateTask(req.user.id, req.params.id, req.body);

    res.status(200).json({
      data: task,
      meta: {},
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(req, res, next) {
  try {
    await tasksService.deleteTask(req.user.id, req.params.id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function getTaskStats(req, res, next) {
  try {
    const stats = await tasksService.getTaskStats(req.user.id);

    res.status(200).json({
      data: stats,
      meta: {},
    });
  } catch (error) {
    next(error);
  }
}
