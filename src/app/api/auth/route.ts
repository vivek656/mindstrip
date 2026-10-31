import { NextRequest, NextResponse } from 'next/server';
import { getDb, isMongoConfigured } from '@/lib/mongodb';
import { CreatorProfile } from '@/types/comic';

export async function GET() {
  const hasMetaKey = Boolean(process.env.META_MODEL_API_KEY || process.env.MODEL_API_KEY || process.env.META_API_KEY);
  const hasFireworksKey = Boolean(process.env.FIREWORKS_API_KEY);
  const isMongo = isMongoConfigured();

  return NextResponse.json({
    hasMetaKey,
    hasFireworksKey,
    isMongo,
    defaultProvider: hasMetaKey ? 'meta-api' : (hasFireworksKey ? 'fireworks' : 'meta-api'),
    defaultImageModel: hasMetaKey ? 'muse-image-1.0' : (hasFireworksKey ? 'flux-1-schnell' : 'muse-image-1.0'),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { handle, pin, displayName, avatarEmoji, isGuest } = body;

    // 1. Guest profile flow
    if (isGuest || (!handle && !displayName)) {
      const guestNum = Math.floor(1000 + Math.random() * 9000);
      const guestProfile: CreatorProfile = {
        id: `guest_${Date.now()}_${guestNum}`,
        handle: `guest_${guestNum}`,
        displayName: `Guest Creator #${guestNum}`,
        avatarEmoji: avatarEmoji || '🎨',
        isGuest: true,
        createdAt: new Date().toISOString()
      };
      return NextResponse.json({ success: true, profile: guestProfile });
    }

    // 2. Named creator flow
    const cleanHandle = String(handle || displayName)
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 24);

    if (!cleanHandle) {
      return NextResponse.json({ error: 'Please enter a valid username (letters, numbers, underscores)' }, { status: 400 });
    }

    const cleanDisplayName = displayName?.trim() || cleanHandle;
    const cleanEmoji = avatarEmoji || '⚡';

    // If MongoDB is configured, verify PIN or register in database
    if (isMongoConfigured()) {
      const db = await getDb();
      if (db) {
        const creators = db.collection('creators');
        const existing = await creators.findOne({ handle: cleanHandle });

        if (existing) {
          // Check PIN if creator set one
          if (existing.pin && existing.pin !== pin) {
            return NextResponse.json(
              { error: `Incorrect passkey for @${cleanHandle}. Please check your PIN or enter a different handle.` },
              { status: 401 }
            );
          }

          const profile: CreatorProfile = {
            id: `usr_${cleanHandle}`,
            handle: existing.handle,
            displayName: existing.displayName || cleanDisplayName,
            avatarEmoji: existing.avatarEmoji || cleanEmoji,
            isGuest: false,
            createdAt: existing.createdAt || new Date().toISOString()
          };
          return NextResponse.json({ success: true, profile, isNew: false });
        } else {
          // Create new creator document with deterministic user ID across all devices
          const deterministicId = `usr_${cleanHandle}`;
          const newDoc = {
            id: deterministicId,
            handle: cleanHandle,
            displayName: cleanDisplayName,
            avatarEmoji: cleanEmoji,
            pin: pin || null,
            isGuest: false,
            createdAt: new Date().toISOString()
          };
          await creators.insertOne(newDoc);

          const profile: CreatorProfile = {
            id: deterministicId,
            handle: cleanHandle,
            displayName: cleanDisplayName,
            avatarEmoji: cleanEmoji,
            isGuest: false,
            createdAt: newDoc.createdAt
          };
          return NextResponse.json({ success: true, profile, isNew: true });
        }
      }
    }

    // Local / Offline fallback profile
    const localProfile: CreatorProfile = {
      id: `usr_${cleanHandle}`,
      handle: cleanHandle,
      displayName: cleanDisplayName,
      avatarEmoji: cleanEmoji,
      isGuest: false,
      pin: pin || undefined,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({ success: true, profile: localProfile, isLocal: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Auth route error:', msg);
    return NextResponse.json({ error: `Authentication failed: ${msg}` }, { status: 500 });
  }
}
