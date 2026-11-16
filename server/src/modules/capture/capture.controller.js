import * as captureService from './capture.service.js';

export async function previewCapture(req, res, next) {
  try {
    const preview = captureService.parseCaptureRule(req.body.text);

    res.status(200).json({
      data: preview,
      meta: {},
    });
  } catch (error) {
    next(error);
  }
}

export async function confirmCapture(req, res, next) {
  try {
    const createdItem = await captureService.confirmCapture(
      req.user.id,
      req.body.type,
      req.body.data
    );

    res.status(201).json({
      data: createdItem,
      meta: {
        type: req.body.type,
      },
    });
  } catch (error) {
    next(error);
  }
}
