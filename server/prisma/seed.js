import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Prisma } from '@prisma/client';
import { config } from '../src/config/index.js';
import { logger } from '../src/utils/logger.js';

const connectionString = config.databaseUrl;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  logger.info('🌱 Starting database seed with safe demo data...');

  const demoEmail = 'demo@lifehub.local';

  // Clean up any existing demo user data
  await prisma.user.deleteMany({
    where: { email: demoEmail },
  });

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash('Password123!', saltRounds);

  const demoUser = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: demoEmail,
      passwordHash,
      timezone: 'America/New_York',
    },
  });

  logger.info(`👤 Created demo user: ${demoUser.email} (Password: Password123!)`);

  // 1. Seed Sample Tasks
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const inTwoDays = new Date(now);
  inTwoDays.setDate(inTwoDays.getDate() + 2);

  await prisma.task.createMany({
    data: [
      {
        ownerId: demoUser.id,
        title: 'Review Sprint deliverables and user stories',
        description: 'Verify all acceptance criteria, tests, and documentation.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueAt: tomorrow,
        tags: ['work', 'sprint'],
      },
      {
        ownerId: demoUser.id,
        title: 'Prepare quarterly financial report',
        description: 'Aggregate revenue and expenses from bank statements.',
        status: 'TODO',
        priority: 'URGENT',
        dueAt: inTwoDays,
        tags: ['finance'],
      },
      {
        ownerId: demoUser.id,
        title: 'Set up local development workspace & database',
        description: 'Configured PostgreSQL, Prisma migrations, and Express API.',
        status: 'DONE',
        priority: 'MEDIUM',
        tags: ['setup', 'dev'],
      },
      {
        ownerId: demoUser.id,
        title: 'Buy fresh produce & groceries for dinner',
        description: 'Tomatoes, pasta, olive oil, basil.',
        status: 'TODO',
        priority: 'LOW',
        dueAt: tomorrow,
        tags: ['personal', 'shopping'],
      },
    ],
  });
  logger.info('✅ Seeded sample tasks');

  // 2. Seed Sample Events
  const eventStart1 = new Date(tomorrow);
  eventStart1.setHours(10, 0, 0, 0);
  const eventEnd1 = new Date(eventStart1);
  eventEnd1.setHours(11, 0, 0, 0);

  const eventStart2 = new Date(inTwoDays);
  eventStart2.setHours(14, 0, 0, 0);
  const eventEnd2 = new Date(eventStart2);
  eventEnd2.setHours(15, 0, 0, 0);

  await prisma.event.createMany({
    data: [
      {
        ownerId: demoUser.id,
        title: 'Weekly Sprint Planning Meeting',
        description: 'Review roadmap, prioritize backlog items, and assign owners.',
        startAt: eventStart1,
        endAt: eventEnd1,
        recurrenceRule: 'WEEKLY',
      },
      {
        ownerId: demoUser.id,
        title: 'Annual Dental Checkup',
        description: 'Routine checkup and cleaning at downtown clinic.',
        startAt: eventStart2,
        endAt: eventEnd2,
      },
    ],
  });
  logger.info('✅ Seeded sample planner events');

  // 3. Seed Sample Transactions
  const firstOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 10, 0, 0));
  const midMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 10, 14, 30, 0));
  const recentDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 14, 18, 0, 0));

  await prisma.transaction.createMany({
    data: [
      {
        ownerId: demoUser.id,
        type: 'INCOME',
        amount: new Prisma.Decimal('4500.00'),
        currency: 'USD',
        category: 'Salary',
        occurredAt: firstOfMonth,
        note: 'Monthly salary direct deposit',
      },
      {
        ownerId: demoUser.id,
        type: 'INCOME',
        amount: new Prisma.Decimal('850.00'),
        currency: 'USD',
        category: 'Freelance',
        occurredAt: midMonth,
        note: 'Client milestone payout',
      },
      {
        ownerId: demoUser.id,
        type: 'EXPENSE',
        amount: new Prisma.Decimal('1450.00'),
        currency: 'USD',
        category: 'Rent & Housing',
        occurredAt: firstOfMonth,
        note: 'Apartment monthly rent',
      },
      {
        ownerId: demoUser.id,
        type: 'EXPENSE',
        amount: new Prisma.Decimal('165.40'),
        currency: 'USD',
        category: 'Groceries',
        occurredAt: midMonth,
        note: 'Organic supermarket groceries',
      },
      {
        ownerId: demoUser.id,
        type: 'EXPENSE',
        amount: new Prisma.Decimal('48.50'),
        currency: 'USD',
        category: 'Dining',
        occurredAt: recentDay,
        note: 'Dinner with colleagues',
      },
      {
        ownerId: demoUser.id,
        type: 'EXPENSE',
        amount: new Prisma.Decimal('95.00'),
        currency: 'USD',
        category: 'Utilities',
        occurredAt: midMonth,
        note: 'Fiber internet & electricity bill',
      },
    ],
  });
  logger.info('✅ Seeded sample financial transactions');

  // 4. Seed Sample Notes
  await prisma.note.createMany({
    data: [
      {
        ownerId: demoUser.id,
        title: 'System Architecture Principles',
        body: '1. Modular design with clean service layers.\n2. Strict user isolation on all database queries.\n3. Transparent and responsive user experience.',
        tags: ['architecture', 'engineering', 'best-practices'],
      },
      {
        ownerId: demoUser.id,
        title: 'Book Notes: Designing Data-Intensive Applications',
        body: 'Key concepts: reliability, scalability, maintainability. ACID transactions, partition balancing, and consensus algorithms.',
        tags: ['reading', 'books'],
      },
      {
        ownerId: demoUser.id,
        title: 'Weekly Reflection & Productivity Goals',
        body: 'Maintain focused deep work blocks. Review automated test suite before every release.',
        tags: ['personal', 'productivity'],
      },
    ],
  });
  logger.info('✅ Seeded sample notes');

  logger.info('✨ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    logger.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
