import { NextRequest, NextResponse } from 'next/server';
import { getDb, isMongoConfigured } from '@/lib/mongodb';
import { ComicWorld } from '@/types/comic';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId') || req.headers.get('x-user-id');

    if (!isMongoConfigured()) {
      return NextResponse.json({ connected: false, worlds: [] });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ connected: false, worlds: [] });
    }

    const worldsCollection = db.collection<ComicWorld>('worlds');
    const rawHandle = req.nextUrl.searchParams.get('handle') || (userId?.startsWith('usr_') ? userId.replace('usr_', '') : undefined);
    let query: Record<string, unknown> = {};
    if (userId) {
      const matchCriteria: Record<string, unknown>[] = [{ userId }];
      if (rawHandle) {
        matchCriteria.push(
          { userId: `usr_${rawHandle}` },
          { userHandle: rawHandle },
          { 'creator.handle': rawHandle }
        );
      }
      query = { $or: matchCriteria };
    }

    const worlds = await worldsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .project<ComicWorld>({ _id: 0 })
      .toArray();

    return NextResponse.json({ connected: true, worlds, userId });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn('MongoDB GET /api/worlds fallback:', msg);
    return NextResponse.json({ connected: false, worlds: [], error: msg });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { world, worlds, userId } = body;

    if (!isMongoConfigured()) {
      return NextResponse.json({ connected: false, saved: false, message: 'Local mode active' });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ connected: false, saved: false, message: 'Could not connect to MongoDB' });
    }

    const worldsCollection = db.collection<ComicWorld>('worlds');

    const userHandle = body.handle || (userId?.startsWith('usr_') ? userId.replace('usr_', '') : undefined);

    if (world && world.id) {
      // Prioritize the authenticated userId so pre-login/guest creations are adopted by the creator
      const worldToSave = {
        ...world,
        userId: userId || world.userId,
        userHandle: userHandle || world.userHandle
      };
      await worldsCollection.replaceOne({ id: world.id }, worldToSave, { upsert: true });
      return NextResponse.json({ connected: true, saved: true, id: world.id });
    }

    if (Array.isArray(worlds)) {
      for (const w of worlds) {
        if (w.id) {
          const worldToSave = {
            ...w,
            userId: userId || w.userId,
            userHandle: userHandle || w.userHandle
          };
          await worldsCollection.replaceOne({ id: w.id }, worldToSave, { upsert: true });
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
    const userId = searchParams.get('userId') || req.headers.get('x-user-id');

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

    const query: Record<string, string> = { id };
    if (userId) {
      query.userId = userId;
    }

    await db.collection('worlds').deleteOne(query);
    return NextResponse.json({ connected: true, deleted: true, id });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
