import * as eventsService from './events.service.js';

export async function createEvent(req, res, next) {
  try {
    const event = await eventsService.createEvent(req.user.id, req.body);

    res.status(201).json({
      data: event,
      meta: {},
    });
  } catch (error) {
    next(error);
  }
}

export async function getEvents(req, res, next) {
  try {
    const { events, meta } = await eventsService.getEvents(req.user.id, req.query);

    res.status(200).json({
      data: events,
      meta,
    });
  } catch (error) {
    next(error);
  }
}

export async function getEventById(req, res, next) {
  try {
    const event = await eventsService.getEventById(req.user.id, req.params.id);

    res.status(200).json({
      data: event,
      meta: {},
    });
  } catch (error) {
    next(error);
  }
}

export async function updateEvent(req, res, next) {
  try {
    const event = await eventsService.updateEvent(req.user.id, req.params.id, req.body);

    res.status(200).json({
      data: event,
      meta: {},
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteEvent(req, res, next) {
  try {
    await eventsService.deleteEvent(req.user.id, req.params.id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
