/**
 * Calendar Server Actions - Enhanced with Unified Service
 * Type-safe server actions for calendar operations
 */

'use server';

import { getServerSession } from '@/lib/server-auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import {
  calendarService,
  createCalendarEvent as createUnifiedEvent,
  updateCalendarEvent as updateUnifiedEvent,
  deleteCalendarEvent as deleteUnifiedEvent,
  exportCalendarEvents,
} from '../calendar/calendar-service';
import {
  CalendarEventInput,
  CalendarQuery,
  CalendarExportFormat,
  RecurrenceRule,
} from '../calendar/types';

// Enhanced Schemas with better validation
const calendarEventSchema = z
  .object({
    title: z
      .string()
      .min(1, 'El título es requerido')
      .max(200, 'Título demasiado largo'),
    description: z.string().optional(),
    startDate: z.date(),
    endDate: z.date(),
    category: z.enum([
      'ACADEMIC',
      'HOLIDAY',
      'SPECIAL',
      'PARENT',
      'ADMINISTRATIVE',
      'MEETING',
      'EXAM',
      'VACATION',
      'EVENT',
      'DEADLINE',
      'OTHER',
    ]),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
    isRecurring: z.boolean().default(false),
    isAllDay: z.boolean().default(false),
    color: z.string().optional(),
    location: z.string().optional(),
    attendeeIds: z.array(z.string()).optional(),
    attachments: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          url: z.string(),
          type: z.string(),
          size: z.number(),
        })
      )
      .optional(),
    recurrence: z
      .object({
        frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
        interval: z.number().min(1).default(1),
        endDate: z.date().optional(),
        count: z.number().optional(),
        byWeekDay: z
          .array(z.enum(['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']))
          .optional(),
        byMonthDay: z.array(z.number().min(1).max(31)).optional(),
        byMonth: z.array(z.number().min(1).max(12)).optional(),
      })
      .optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  })
  .refine(data => data.endDate >= data.startDate, {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['endDate'],
  });

const bulkCalendarEventsSchema = z.object({
  events: z.array(calendarEventSchema),
});

const calendarEventTemplateSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  category: z.enum([
    'ACADEMIC',
    'HOLIDAY',
    'SPECIAL',
    'PARENT',
    'ADMINISTRATIVE',
    'EXAM',
    'MEETING',
  ]),
  level: z.enum(['NT1', 'NT2', 'both']).default('both'),
  color: z.string().optional(),
  duration: z.number().min(1).default(60),
  isAllDay: z.boolean().default(false),
  recurrence: z.string().optional(),
});

// Helper function to check admin permissions
async function checkAdminPermission() {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error('No autorizado');
  }
  if (session.user.role !== 'ADMIN') {
    throw new Error('Permiso denegado: Se requieren permisos de administrador');
  }
  return session.user;
}

// Create calendar event - Enhanced with unified service
export async function createCalendarEvent(
  data: z.infer<typeof calendarEventSchema>
) {
  try {
    const user = await checkAdminPermission();
    const validated = calendarEventSchema.parse(data);

    // Transform to unified format
    const unifiedData: CalendarEventInput = {
      title: validated.title,
      description: validated.description,
      startDate: validated.startDate,
      endDate: validated.endDate,
      category: validated.category,
      priority: validated.priority,
      isAllDay: validated.isAllDay,
      location: validated.location,
      attendeeIds: validated.attendeeIds,
      attachments: validated.attachments,
      recurrence: validated.recurrence
        ? ({
            pattern:
              validated.recurrence.frequency === 'DAILY'
                ? 'DAILY'
                : validated.recurrence.frequency === 'WEEKLY'
                  ? 'WEEKLY'
                  : validated.recurrence.frequency === 'MONTHLY'
                    ? 'MONTHLY'
                    : validated.recurrence.frequency === 'YEARLY'
                      ? 'YEARLY'
                      : 'NONE',
            interval: validated.recurrence.interval,
            endDate: validated.recurrence.endDate,
            occurrences: validated.recurrence.count,
            daysOfWeek: validated.recurrence.byWeekDay?.join(','),
            monthOfYear: validated.recurrence.byMonth?.[0],
            exceptions: '',
          } as RecurrenceRule)
        : undefined,
      metadata: {
        ...validated.metadata,
        color: validated.color,
        isRecurring: validated.isRecurring,
        createdBy: user.id,
      },
    };

    const event = await createUnifiedEvent(unifiedData);

    revalidatePath('/');
    revalidatePath('/calendario-escolar');
    revalidatePath('/profesor/calendario-escolar');
    revalidatePath('/admin/calendario-escolar');
    revalidatePath('/parent/calendario-escolar');

    return { success: true, data: event };
  } catch (error) {
    console.error('Error creating calendar event:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Error de validación: ${error.issues.map((e: any) => e.message).join(', ')}`,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// Update calendar event - Enhanced with unified service
export async function updateCalendarEvent(
  id: string,
  data: Partial<z.infer<typeof calendarEventSchema>>
) {
  try {
    const user = await checkAdminPermission();
    const validated = calendarEventSchema.partial().parse(data);

    // Transform to unified format
    const unifiedData: Partial<CalendarEventInput> = {
      ...(validated.title && { title: validated.title }),
      ...(validated.description && { description: validated.description }),
      ...(validated.startDate && { startDate: validated.startDate }),
      ...(validated.endDate && { endDate: validated.endDate }),
      ...(validated.category && { category: validated.category }),
      ...(validated.priority && { priority: validated.priority }),
      ...(validated.isAllDay !== undefined && { isAllDay: validated.isAllDay }),
      ...(validated.location && { location: validated.location }),
      ...(validated.attendeeIds && { attendeeIds: validated.attendeeIds }),
      ...(validated.attachments && { attachments: validated.attachments }),
      ...(validated.recurrence && {
        recurrence: {
          pattern:
            validated.recurrence.frequency === 'DAILY'
              ? 'DAILY'
              : validated.recurrence.frequency === 'WEEKLY'
                ? 'WEEKLY'
                : validated.recurrence.frequency === 'MONTHLY'
                  ? 'MONTHLY'
                  : validated.recurrence.frequency === 'YEARLY'
                    ? 'YEARLY'
                    : 'NONE',
          interval: validated.recurrence.interval,
          endDate: validated.recurrence.endDate,
          occurrences: validated.recurrence.count,
          daysOfWeek: validated.recurrence.byWeekDay?.join(','),
          monthOfYear: validated.recurrence.byMonth?.[0],
          exceptions: '',
        } as RecurrenceRule,
      }),
      ...(validated.metadata && { metadata: validated.metadata }),
      metadata: {
        ...validated.metadata,
        ...(validated.color && { color: validated.color }),
        ...(validated.isRecurring !== undefined && {
          isRecurring: validated.isRecurring,
        }),
        updatedBy: user.id,
      },
    };

    const event = await updateUnifiedEvent(id, unifiedData);

    revalidatePath('/');
    revalidatePath('/calendario-escolar');
    revalidatePath('/profesor/calendario-escolar');
    revalidatePath('/admin/calendario-escolar');
    revalidatePath('/parent/calendario-escolar');

    return { success: true, data: event };
  } catch (error) {
    console.error('Error updating calendar event:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Error de validación: ${error.issues.map((e: any) => e.message).join(', ')}`,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// Delete calendar event - Enhanced with unified service
export async function deleteCalendarEvent(id: string) {
  try {
    await checkAdminPermission();

    await deleteUnifiedEvent(id);

    revalidatePath('/');
    revalidatePath('/calendario-escolar');
    revalidatePath('/profesor/calendario-escolar');
    revalidatePath('/admin/calendario-escolar');
    revalidatePath('/parent/calendario-escolar');

    return { success: true };
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// Bulk create calendar events
export async function bulkCreateCalendarEvents(
  data: z.infer<typeof bulkCalendarEventsSchema>
) {
  try {
    const user = await checkAdminPermission();
    const validated = bulkCalendarEventsSchema.parse(data);

    const events = await prisma.$transaction(
      validated.events.map(event =>
        prisma.calendarEvent.create({
          data: {
            title: event.title,
            description: event.description,
            startDate: event.startDate,
            endDate: event.endDate,
            category: event.category,
            isRecurring: event.isRecurring,
            isAllDay: event.isAllDay,
            color: event.color,
            location: event.location,
            createdBy: user.id,
            updatedBy: user.id,
          },
        })
      )
    );

    revalidatePath('/');
    revalidatePath('/calendario-escolar');
    revalidatePath('/profesor/calendario-escolar');
    revalidatePath('/admin/calendario-escolar');

    return { success: true, data: events };
  } catch (error) {
    console.error('Error bulk creating calendar events:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// Secure CSV import with proper parsing and validation
export async function importCalendarEventsFromCSV(csvData: string) {
  try {
    const user = await checkAdminPermission();

    // Sanitize input to prevent injection attacks
    const sanitizedData = csvData.replace(/[<>]/g, '').trim();
    if (!sanitizedData) {
      return { success: false, error: 'Datos CSV vacíos' };
    }

    // Secure CSV parsing with proper validation
    const lines = sanitizedData.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return {
        success: false,
        error: 'CSV debe tener al menos una fila de datos',
      };
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const events: CalendarEventInput[] = [];
    const errors: string[] = [];

    // Validate headers
    const requiredHeaders = ['title', 'startDate', 'endDate', 'category'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      return {
        success: false,
        error: `Faltan columnas requeridas: ${missingHeaders.join(', ')}`,
      };
    }

    for (let i = 1; i < lines.length; i++) {
      try {
        // Secure parsing with proper escaping
        const values = lines[i]
          .split(',')
          .map(v => v.trim().replace(/^"|"$/g, ''));

        if (values.length !== headers.length) {
          errors.push(`Fila ${i + 1}: Número incorrecto de columnas`);
          continue;
        }

        const eventData: Record<string, string> = {};
        headers.forEach((header, index) => {
          eventData[header] = values[index] || '';
        });

        // Validate and transform data
        const event: CalendarEventInput = {
          title: eventData.title,
          description: eventData.description || undefined,
          startDate: new Date(eventData.startDate),
          endDate: new Date(eventData.endDate),
          category: eventData.category as any,
          priority: (eventData.priority as any) || 'MEDIUM',
          isAllDay: ['true', 'verdadero', 'sí', 'si', '1'].includes(
            eventData.isAllDay?.toLowerCase() || ''
          ),
          isRecurring: false,
          location: eventData.location || undefined,
          metadata: {
            importedBy: user.id,
            importedAt: new Date().toISOString(),
            sourceRow: i + 1,
          },
        };

        // Validate dates
        if (isNaN(event.startDate.getTime())) {
          errors.push(`Fila ${i + 1}: Fecha de inicio inválida`);
          continue;
        }
        if (isNaN(event.endDate.getTime())) {
          errors.push(`Fila ${i + 1}: Fecha de fin inválida`);
          continue;
        }
        if (event.endDate < event.startDate) {
          errors.push(
            `Fila ${i + 1}: Fecha de fin debe ser posterior a fecha de inicio`
          );
          continue;
        }

        // Validate using schema
        const validated = calendarEventSchema.parse(event);
        events.push(validated as CalendarEventInput);
      } catch (error) {
        const errorMsg =
          error instanceof z.ZodError
            ? error.issues.map((e: any) => e.message).join(', ')
            : 'Error de formato';
        errors.push(`Fila ${i + 1}: ${errorMsg}`);
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: `Errores en la importación: ${errors.join('; ')}`,
      };
    }

    if (events.length === 0) {
      return {
        success: false,
        error: 'No se pudieron importar eventos válidos',
      };
    }

    // Create events using unified service
    const createdEvents = await Promise.all(
      events.map(event => createUnifiedEvent(event))
    );

    revalidatePath('/');
    revalidatePath('/calendario-escolar');
    revalidatePath('/profesor/calendario-escolar');
    revalidatePath('/admin/calendario-escolar');
    revalidatePath('/parent/calendario-escolar');

    return {
      success: true,
      data: createdEvents,
      message: `Se importaron ${createdEvents.length} eventos exitosamente`,
    };
  } catch (error) {
    console.error('Error importing calendar events from CSV:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// Get calendar events - Enhanced with unified service
export async function getCalendarEvents(query: CalendarQuery = {}) {
  try {
    const events = await calendarService.getEvents(query);
    return { success: true, data: events };
  } catch (error) {
    console.error('Error getting calendar events:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// Export calendar events to CSV
export async function exportCalendarEventsToCSV(query: CalendarQuery = {}) {
  try {
    const user = await checkAdminPermission();
    const events = await calendarService.getEvents(query);

    const csvContent = [
      [
        'title',
        'description',
        'startDate',
        'endDate',
        'category',
        'priority',
        'isAllDay',
        'location',
      ],
      ...events.map(event => [
        event.title,
        event.description || '',
        event.startDate.toISOString(),
        event.endDate.toISOString(),
        event.category,
        event.priority,
        event.isAllDay ? 'true' : 'false',
        event.location || '',
      ]),
    ]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return { success: true, data: csvContent };
  } catch (error) {
    console.error('Error exporting calendar events to CSV:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// Mass update calendar events
export async function massUpdateCalendarEvents(
  eventIds: string[],
  updates: Partial<z.infer<typeof calendarEventSchema>>
) {
  try {
    const user = await checkAdminPermission();
    const validated = calendarEventSchema.partial().parse(updates);

    const results = await Promise.all(
      eventIds.map(id => updateCalendarEvent(id, validated))
    );

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.length - successCount;

    return {
      success: true,
      data: { updated: successCount, errors: errorCount },
      message: `Se actualizaron ${successCount} eventos${errorCount > 0 ? `, ${errorCount} errores` : ''}`,
    };
  } catch (error) {
    console.error('Error mass updating calendar events:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// Mass delete calendar events
export async function massDeleteCalendarEvents(eventIds: string[]) {
  try {
    await checkAdminPermission();

    const results = await Promise.all(
      eventIds.map(id => deleteCalendarEvent(id))
    );

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.length - successCount;

    return {
      success: true,
      data: { deleted: successCount, errors: errorCount },
      message: `Se eliminaron ${successCount} eventos${errorCount > 0 ? `, ${errorCount} errores` : ''}`,
    };
  } catch (error) {
    console.error('Error mass deleting calendar events:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// Export calendar events in different formats
export async function exportCalendarEventsInFormat(
  format: CalendarExportFormat,
  query: CalendarQuery = {}
) {
  try {
    const user = await checkAdminPermission();
    const events = await calendarService.getEvents(query);

    switch (format) {
      case 'CSV':
        return exportCalendarEventsToCSV(query);
      case 'JSON':
        return { success: true, data: events };
      case 'ICAL':
        const icsContent = await exportCalendarEvents(query, 'ICAL');
        return { success: true, data: icsContent };
      default:
        return { success: false, error: 'Formato no soportado' };
    }
  } catch (error) {
    console.error('Error exporting calendar events in format:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
