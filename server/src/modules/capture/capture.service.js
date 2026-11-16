import * as tasksService from '../tasks/tasks.service.js';
import * as eventsService from '../events/events.service.js';
import * as transactionsService from '../transactions/transactions.service.js';
import * as notesService from '../notes/notes.service.js';
import { AppError } from '../../middleware/errorHandler.js';

export function parseCaptureRule(text) {
  const trimmed = text.trim();

  // Extract hashtags (e.g. #personal, #work)
  const tagMatches = trimmed.match(/#([a-zA-Z0-9_-]+)/g);
  const tags = tagMatches ? tagMatches.map((t) => t.substring(1)) : [];
  const cleanText = trimmed.replace(/#([a-zA-Z0-9_-]+)/g, '').trim();

  // 1. Transaction Detection ($120, spent, salary, received, paid)
  const moneyMatch =
    cleanText.match(/\$([0-9]+(\.[0-9]{1,2})?)/) ||
    cleanText.match(/\b([0-9]+(\.[0-9]{1,2})?)\s*(dollars|usd|bucks)\b/i);

  const txKeywords = /\b(spent|paid|bought|received|earned|salary|expense|deposit|refund)\b/i;

  if (moneyMatch || txKeywords.test(cleanText)) {
    const rawAmount = moneyMatch ? parseFloat(moneyMatch[1]) : 0;
    const isIncome = /\b(received|earned|salary|income|deposit|refund)\b/i.test(cleanText);

    // Guess category from words
    let category = 'General';
    if (/\b(groceries|food|supermarket)\b/i.test(cleanText)) category = 'Groceries';
    else if (/\b(dinner|lunch|breakfast|restaurant|cafe|coffee)\b/i.test(cleanText)) category = 'Dining';
    else if (/\b(rent|apartment|mortgage)\b/i.test(cleanText)) category = 'Rent & Housing';
    else if (/\b(uber|gas|fuel|bus|train|flight|transport)\b/i.test(cleanText)) category = 'Transportation';
    else if (/\b(salary|paycheck)\b/i.test(cleanText)) category = 'Salary';
    else if (/\b(movie|game|entertainment)\b/i.test(cleanText)) category = 'Entertainment';

    return {
      detectedType: 'TRANSACTION',
      confidence: 0.85,
      raw: trimmed,
      data: {
        type: isIncome ? 'INCOME' : 'EXPENSE',
        amount: rawAmount > 0 ? rawAmount : 10.0,
        currency: 'USD',
        category,
        occurredAt: new Date().toISOString(),
        note: cleanText,
      },
    };
  }

  // 2. Event Detection (meeting, appointment, schedule, at 2pm, tomorrow at...)
  const eventKeywords = /\b(meeting|appointment|call with|interview|webinar|flight|lunch with|dinner with|schedule)\b/i;
  const timeMarker = /\b(at|from)\s+(\d{1,2}(:\d{2})?\s*(am|pm))\b/i;

  if (eventKeywords.test(cleanText) || timeMarker.test(cleanText)) {
    const startAt = new Date();
    if (/\btomorrow\b/i.test(cleanText)) {
      startAt.setDate(startAt.getDate() + 1);
    }
    startAt.setHours(10, 0, 0, 0); // default to 10:00 AM

    const endAt = new Date(startAt);
    endAt.setHours(startAt.getHours() + 1);

    return {
      detectedType: 'EVENT',
      confidence: 0.8,
      raw: trimmed,
      data: {
        title: cleanText,
        description: null,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        reminderAt: null,
        recurrenceRule: null,
      },
    };
  }

  // 3. Task Detection (todo, finish, buy, call, due, tomorrow, urgent)
  const taskKeywords = /\b(todo|finish|complete|buy|call|write|submit|clean|fix|prepare|send|due|remind me)\b/i;

  if (taskKeywords.test(cleanText) || /\b(tomorrow|by friday|today)\b/i.test(cleanText)) {
    let priority = 'MEDIUM';
    if (
      /\b(urgent|asap|critical)\b/i.test(trimmed) ||
      tags.some((t) => /urgent|asap|critical/i.test(t))
    ) {
      priority = 'URGENT';
    } else if (/\b(high)\b/i.test(trimmed) || tags.some((t) => /high/i.test(t))) {
      priority = 'HIGH';
    } else if (/\b(low)\b/i.test(trimmed) || tags.some((t) => /low/i.test(t))) {
      priority = 'LOW';
    }

    let dueAt = null;
    if (/\btomorrow\b/i.test(cleanText)) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(18, 0, 0, 0);
      dueAt = d.toISOString();
    } else if (/\btoday\b/i.test(cleanText)) {
      const d = new Date();
      d.setHours(21, 0, 0, 0);
      dueAt = d.toISOString();
    }

    return {
      detectedType: 'TASK',
      confidence: 0.75,
      raw: trimmed,
      data: {
        title: cleanText,
        description: null,
        priority,
        dueAt,
        tags,
      },
    };
  }

  // 4. Default Fallback -> NOTE
  const firstLine = cleanText.split('\n')[0].trim();
  const title = firstLine.length > 60 ? `${firstLine.substring(0, 57)}...` : firstLine;

  return {
    detectedType: 'NOTE',
    confidence: 0.6,
    raw: trimmed,
    data: {
      title: title || 'Quick Note',
      body: cleanText,
      tags,
    },
  };
}

export async function confirmCapture(ownerId, type, data) {
  switch (type) {
    case 'TASK':
      return await tasksService.createTask(ownerId, {
        title: data.title || 'Captured Task',
        description: data.description || null,
        priority: data.priority || 'MEDIUM',
        dueAt: data.dueAt || null,
        tags: data.tags || [],
      });

    case 'EVENT':
      return await eventsService.createEvent(ownerId, {
        title: data.title || 'Captured Event',
        description: data.description || null,
        startAt: data.startAt || new Date().toISOString(),
        endAt: data.endAt || new Date(Date.now() + 3600000).toISOString(),
        reminderAt: data.reminderAt || null,
        recurrenceRule: data.recurrenceRule || null,
      });

    case 'TRANSACTION':
      return await transactionsService.createTransaction(ownerId, {
        type: data.type || 'EXPENSE',
        amount: data.amount || 1.0,
        currency: data.currency || 'USD',
        category: data.category || 'General',
        occurredAt: data.occurredAt || new Date().toISOString(),
        note: data.note || null,
      });

    case 'NOTE':
      return await notesService.createNote(ownerId, {
        title: data.title || 'Captured Note',
        body: data.body || '',
        tags: data.tags || [],
      });

    default:
      throw new AppError(`Unknown capture type: ${type}`, 400, 'VALIDATION_ERROR');
  }
}
