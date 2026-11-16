import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { config } from '../config/index.js';

const connectionString = config.env === 'test' && config.testDatabaseUrl
  ? config.testDatabaseUrl
  : config.databaseUrl;

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({ adapter });
