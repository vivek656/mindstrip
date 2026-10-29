import { NextRequest, NextResponse } from 'next/server';
import { getDb, isMongoConfigured } from '@/lib/mongodb';
import { ComicWorld } from '@/types/comic';

export async function GET() {
  try {
    if (!isMongoConfigured()) {
      return NextResponse.json({ connected: false, worlds: [] });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ connected: false, worlds: [] });
    }

    const worldsCollection = db.collection<ComicWorld>('worlds');
    const worlds = await worldsCollection
      .find({})
      .sort({ createdAt: -1 })
      .project<ComicWorld>({ _id: 0 })
      .toArray();

    return NextResponse.json({ connected: true, worlds });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn('MongoDB GET /api/worlds fallback:', msg);
    return NextResponse.json({ connected: false, worlds: [], error: msg });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { world, worlds } = body;

    if (!isMongoConfigured()) {
      return NextResponse.json({ connected: false, saved: false, message: 'Local mode active' });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ connected: false, saved: false, message: 'Could not connect to MongoDB' });
    }

    const worldsCollection = db.collection<ComicWorld>('worlds');

    if (world && world.id) {
      await worldsCollection.replaceOne({ id: world.id }, world, { upsert: true });
      return NextResponse.json({ connected: true, saved: true, id: world.id });
    }

    if (Array.isArray(worlds)) {
      for (const w of worlds) {
        if (w.id) {
          await worldsCollection.replaceOne({ id: w.id }, w, { upsert: true });
        }
      }
      return NextResponse.json({ connected: true, saved: true, count: worlds.length });
    }

    return NextResponse.json({ error: 'Missing world or worlds data' }, { status: 400 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('MongoDB POST /api/worlds error:', msg);
    return NextResponse.json({ connected: false, saved: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    if (!isMongoConfigured()) {
      return NextResponse.json({ connected: false, deleted: false });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ connected: false, deleted: false });
    }

    await db.collection('worlds').deleteOne({ id });
    return NextResponse.json({ connected: true, deleted: true, id });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
