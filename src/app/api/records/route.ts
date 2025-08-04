// app/api/records/route.ts
import { PrismaClient } from '@/generated/prisma';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

// POST - Save a new record
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { systolic, diastolic, pulse, notes, person } = body;

    if (!systolic || !diastolic || !person) {
      return new Response(JSON.stringify({ error: 'Missing required fields (systolic, diastolic, or person)' }), { status: 400 });
    }

    const record = await prisma.record.create({
      data: {
        systolic: Number(systolic),
        diastolic: Number(diastolic),
        pulse: pulse ? Number(pulse) : null,
        notes: notes || '',
        recordedAt: new Date(),
        person: Number(person),
      },
    });

    return new Response(JSON.stringify(record), { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500 });
  }
}

// GET - Get records based on 'person' query parameter
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const personId = searchParams.get('personId');

    // Import the Record type from your Prisma client if available
    // Otherwise, you might define a local interface if you need it for stricter type checking,
    // though Prisma's generated types are usually sufficient.
    // For now, let's assume `prisma.record.findMany` returns a type that's compatible
    // with a common `Record` structure or use `any` if a quick fix is needed (less ideal).

    // Corrected line: Explicitly type 'records'
    let records: Awaited<ReturnType<typeof prisma.record.findMany>>; // Infer type from prisma.record.findMany

    if (personId) {
      records = await prisma.record.findMany({
        where: {
          person: Number(personId),
        },
        orderBy: { recordedAt: 'desc' },
      });
    } else {
      records = [];
    }

    return new Response(JSON.stringify(records), { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch records' }), { status: 500 });
  }
}

// DELETE - Delete a specific record by ID
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing ID' }), { status: 400 });
    }

    await prisma.record.delete({ where: { id: Number(id) } });

    return new Response(JSON.stringify({ message: 'Record deleted' }), { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete record' }), { status: 500 });
  }
}