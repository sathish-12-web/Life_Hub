import * as notesService from './notes.service.js';

export async function createNote(req, res, next) {
  try {
    const note = await notesService.createNote(req.user.id, req.body);

    res.status(201).json({
      data: note,
      meta: {},
    });
  } catch (error) {
    next(error);
  }
}

export async function getNotes(req, res, next) {
  try {
    const { notes, meta } = await notesService.getNotes(req.user.id, req.query);

    res.status(200).json({
      data: notes,
      meta,
    });
  } catch (error) {
    next(error);
  }
}

export async function getNoteById(req, res, next) {
  try {
    const note = await notesService.getNoteById(req.user.id, req.params.id);

    res.status(200).json({
      data: note,
      meta: {},
    });
  } catch (error) {
    next(error);
  }
}

export async function updateNote(req, res, next) {
  try {
    const note = await notesService.updateNote(req.user.id, req.params.id, req.body);

    res.status(200).json({
      data: note,
      meta: {},
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteNote(req, res, next) {
  try {
    await notesService.deleteNote(req.user.id, req.params.id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
