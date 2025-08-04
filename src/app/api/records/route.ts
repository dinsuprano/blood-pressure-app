import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// POST - Save a new record
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { systolic, diastolic, pulse, notes } = body;

    if (!systolic || !diastolic) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const record = await prisma.record.create({
      data: {
        systolic: Number(systolic),
        diastolic: Number(diastolic),
        pulse: pulse ? Number(pulse) : null,
        notes: notes || '',
        recordedAt: new Date(),
      },
    });

    return new Response(JSON.stringify(record), { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500 });
  }
}

// GET - Get all records
export async function GET() {
  try {
    const records = await prisma.record.findMany({
      orderBy: { recordedAt: 'desc' },
    });

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
