import { prisma } from '../../utils/prisma.js';

export async function getHealth(req, res, next) {
  try {
    await prisma.$queryRawUnsafe('SELECT 1');

    res.status(200).json({
      data: {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      },
      meta: {},
    });
  } catch (error) {
    next(error);
  }
}
