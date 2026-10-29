'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ZenLanding } from '@/components/ZenLanding';
import { ZenComicReader } from '@/components/ZenComicReader';
import { UniverseBuilderStudio } from '@/components/UniverseBuilderStudio';
import { SettingsModal } from '@/components/SettingsModal';
import { AuthModal } from '@/components/AuthModal';
import { ComicWorld, ComicStrip, SpeechBubble, ArtStyle, PerspectiveLens, CreatorProfile } from '@/types/comic';
import { GranularArtworkOptions } from '@/components/ComicPageSpread';
import { INITIAL_WORLDS } from '@/lib/worlds';
import { generateMindStrip, ApiConfig } from '@/lib/meta-models';
import { generateComicStripMock } from '@/lib/comic-generator';
import { buildStoryContext, writeRecap } from '@/lib/story-context';

const DEFAULT_CONFIG: ApiConfig = {
  mode: 'free',
  provider: 'simulation',
  modelName: 'muse-spark-1.3',
};

/**
 * Auto-upgrade saved worlds and purge any stale Pollinations AI URLs.
 * Pure: reads nothing, writes nothing.
 */
function upgradeWorlds(parsedWorlds: ComicWorld[]): ComicWorld[] {
  return parsedWorlds.map((w) => ({
    ...w,
    episodes: w.episodes.map((ep) => {
      // Purge any stale Pollinations AI URLs from cache completely
      const cleanPageImage =
        ep.pageImageUrl && !ep.pageImageUrl.includes('pollinations.ai')
          ? ep.pageImageUrl
          : undefined;

      const cleanPanels = ep.panels.map((p) => ({
        ...p,
        imageUrl:
          p.imageUrl && !p.imageUrl.includes('pollinations.ai')
            ? p.imageUrl
            : undefined,
      }));

      return {
        ...ep,
        pageImageUrl: cleanPageImage,
        panels: cleanPanels,
      };
    }),
  }));
}

export default function Home() {
  const [worlds, setWorlds] = useState<ComicWorld[]>(INITIAL_WORLDS);
  const [activeWorldId, setActiveWorldId] = useState<string | null>(null);
  const [activeEpisodeId, setActiveEpisodeId] = useState<string | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingArtwork, setIsGeneratingArtwork] = useState<boolean>(false);
  const [artworkError, setArtworkError] = useState<string | null>(null);
  const [apiConfig, setApiConfig] = useState<ApiConfig>(DEFAULT_CONFIG);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);

  // Helper to persist worlds locally (both user-scoped and global primary)
  const saveWorldsLocally = (updatedWorlds: ComicWorld[], profile?: CreatorProfile | null) => {
    const prof = profile !== undefined ? profile : creatorProfile;
    try {
      if (prof?.id) {
        localStorage.setItem(`mindstrip_worlds_${prof.id}`, JSON.stringify(updatedWorlds));
      }
      localStorage.setItem('mindstrip_worlds', JSON.stringify(updatedWorlds));
    } catch {
      // ignore
    }
  };

  // Sync a single universe to MongoDB Atlas tagged with creator profile
  const syncWorldToDb = (world: ComicWorld, profileOverride?: CreatorProfile | null) => {
    const prof = profileOverride !== undefined ? profileOverride : creatorProfile;
    const userId = prof?.id;
    const worldToSync = { ...world, userId: world.userId || userId };
    fetch('/api/worlds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ world: worldToSync, userId })
    }).catch((e) => console.warn('Cloud DB sync notice:', e));
  };

  // Load and isolate worlds belonging to a specific creator profile
  const loadWorldsForProfile = useCallback(async (profile: CreatorProfile) => {
    const userId = profile.id;
    try {
      // 1. Try user-scoped localStorage first
      const userKey = `mindstrip_worlds_${userId}`;
      const localData = localStorage.getItem(userKey) || localStorage.getItem('mindstrip_worlds');
      if (localData) {
        const parsed = JSON.parse(localData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const upgraded = upgradeWorlds(parsed);
          setWorlds(upgraded);
        }
      }

      // 2. Fetch from MongoDB Atlas scoped by userId
      const res = await fetch(`/api/worlds?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (data.connected) {
        setIsDbConnected(true);
        if (Array.isArray(data.worlds) && data.worlds.length > 0) {
          const upgraded = upgradeWorlds(data.worlds);
          setWorlds(upgraded);
          saveWorldsLocally(upgraded, profile);
        } else {
          // If first time this user connects and no worlds in DB, seed with initial or local
          const currentLocal = localData ? JSON.parse(localData) : INITIAL_WORLDS;
          const seeded = currentLocal.map((w: ComicWorld) => ({ ...w, userId }));
          fetch('/api/worlds', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ worlds: seeded, userId })
          }).catch(() => {});
        }
      } else {
        setIsDbConnected(false);
      }
    } catch (e) {
      console.warn('Failed to load worlds for profile:', e);
    }
  }, []);

  // Handle switching creator profile
  const handleLoginProfile = (newProfile: CreatorProfile) => {
    setCreatorProfile(newProfile);
    try {
      localStorage.setItem('mindstrip_creator', JSON.stringify(newProfile));
    } catch {
      // ignore
    }
    loadWorldsForProfile(newProfile);
  };

  // Handle importing a JSON backup of worlds
  const handleImportWorlds = (imported: ComicWorld[]) => {
    const upgraded = upgradeWorlds(imported).map((w) => ({
      ...w,
      userId: creatorProfile?.id
    }));
    setWorlds(upgraded);
    saveWorldsLocally(upgraded, creatorProfile);
    if (creatorProfile?.id) {
      fetch('/api/worlds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worlds: upgraded, userId: creatorProfile.id })
      }).catch(() => {});
    }
  };

  // Safely hydrate creator profile and settings on client mount
  useEffect(() => {
    try {
      let activeProfile: CreatorProfile | null = null;
      const savedCreator = localStorage.getItem('mindstrip_creator');
      if (savedCreator) {
        try {
          activeProfile = JSON.parse(savedCreator);
        } catch {
          // ignore
        }
      }

      if (!activeProfile) {
        const guestNum = Math.floor(1000 + Math.random() * 9000);
        activeProfile = {
          id: `guest_${Date.now()}_${guestNum}`,
          handle: `guest_${guestNum}`,
          displayName: `Guest Creator #${guestNum}`,
          avatarEmoji: '🎨',
          isGuest: true,
          createdAt: new Date().toISOString()
        };
        try {
          localStorage.setItem('mindstrip_creator', JSON.stringify(activeProfile));
        } catch {
          // ignore
        }
      }

      setCreatorProfile(activeProfile);
      loadWorldsForProfile(activeProfile);

      const savedConfig = localStorage.getItem('mindstrip_api_config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        const isOfficialMeta = parsed.provider === 'meta-api' || parsed.baseUrl?.includes('api.meta.ai');
        const normalizedModel = isOfficialMeta && (!parsed.modelName || parsed.modelName === 'llama-3.3-70b-instruct')
          ? 'muse-spark-1.3'
          : (parsed.modelName || 'muse-spark-1.3');

        setApiConfig({
          mode: parsed.mode || 'free',
          provider: parsed.provider || 'simulation',
          apiKey: parsed.apiKey,
          baseUrl: parsed.baseUrl,
          modelName: normalizedModel,
        });
      }
    } catch (e) {
      console.warn('Failed to load local storage state:', e);
    }
  }, [loadWorldsForProfile]);

  const handleToggleMode = () => {
    if (apiConfig.mode === 'free') {
      const updated: ApiConfig = {
        ...apiConfig,
        mode: 'meta',
        provider: apiConfig.provider === 'simulation' ? 'meta-api' : apiConfig.provider,
      };
      setApiConfig(updated);
      try {
        localStorage.setItem('mindstrip_api_config', JSON.stringify(updated));
      } catch {
        // ignore
      }
      if (!updated.apiKey && updated.provider !== 'ollama') {
        setIsSettingsOpen(true);
      }
    } else {
      const updated: ApiConfig = {
        ...apiConfig,
        mode: 'free',
        provider: 'simulation',
      };
      setApiConfig(updated);
      try {
        localStorage.setItem('mindstrip_api_config', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  };

  const activeWorld = worlds.find((w) => w.id === activeWorldId) || null;
  const activeEpisode = activeWorld
    ? activeWorld.episodes.find((ep) => ep.id === activeEpisodeId) ||
      (activeWorld.episodes.length > 0 ? activeWorld.episodes[activeWorld.episodes.length - 1] : null)
    : null;

  const handleSelectWorld = (world: ComicWorld) => {
    setActiveWorldId(world.id);
    const latestEp = world.episodes[world.episodes.length - 1];
    if (latestEp) {
      setActiveEpisodeId(latestEp.id);
    } else {
      setActiveEpisodeId(null);
    }
  };

  const handleCreateNewWorld = async (
    newWorld: ComicWorld,
    startWithEpisode: boolean = true,
    initialPremise?: string
  ) => {
    // Stamp user id if logged in
    const worldToSave: ComicWorld = {
      ...newWorld,
      userId: creatorProfile?.id,
    };

    if (!startWithEpisode) {
      // Creator chose "Review World Bible First": save world with 0 episodes and open directly in Reader
      const updated = [worldToSave, ...worlds];
      setWorlds(updated);
      setActiveWorldId(worldToSave.id);
      setActiveEpisodeId(null);
      setIsBuilderOpen(false);
      syncWorldToDb(worldToSave);
      saveWorldsLocally(updated, creatorProfile);
      return;
    }

    setIsLoading(true);
    setIsBuilderOpen(false);
    try {
      const premise = initialPremise?.trim() || worldToSave.tagline;
      const storyContext = buildStoryContext(worldToSave, premise);
      const generated = await generateMindStrip(
        premise,
        worldToSave.artStyle,
        'candid',
        apiConfig,
        worldToSave.characters,
        worldToSave.title,
        worldToSave.genre,
        storyContext
      );

      const firstEpisode: ComicStrip = {
        ...generated,
        ...writeRecap(generated),
        episodeNumber: 1,
        title: `${worldToSave.title}: Origin`,
      };

      const worldWithEpisode: ComicWorld = {
        ...worldToSave,
        episodes: [firstEpisode],
      };

      const updated = [worldWithEpisode, ...worlds];
      setWorlds(updated);
      setActiveWorldId(worldWithEpisode.id);
      setActiveEpisodeId(firstEpisode.id);
      syncWorldToDb(worldWithEpisode);
      saveWorldsLocally(updated, creatorProfile);
    } catch (e) {
      console.error('World creation episode generation failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateNextEpisode = async (
    storyPremise: string,
    layoutPreference: 'auto' | '1-panel' | '2-panel' | '3-panel' | '4-panel' = 'auto',
    lens: PerspectiveLens = 'candid'
  ) => {
    if (!activeWorld) return;
    setIsLoading(true);
    try {
      // Full chain assembly: bible + recaps + pointer-resolved episodes.
      const storyContext = buildStoryContext(activeWorld, storyPremise);
      const generated = await generateMindStrip(
        storyPremise,
        activeWorld.artStyle,
        lens,
        apiConfig,
        activeWorld.characters,
        activeWorld.title,
        activeWorld.genre,
        storyContext,
        layoutPreference
      );

      const nextNum = activeWorld.episodes.length + 1;
      const newEpisode: ComicStrip = {
        ...generated,
        ...writeRecap(generated),
        episodeNumber: nextNum,
        title: nextNum === 1 ? `${activeWorld.title}: Origin` : `Episode #${nextNum}: ${generated.title}`,
      };

      const updatedWorld: ComicWorld = {
        ...activeWorld,
        episodes: [...activeWorld.episodes, newEpisode],
      };

      const updatedWorlds = worlds.map((w) => (w.id === activeWorld.id ? updatedWorld : w));
      setWorlds(updatedWorlds);
      setActiveEpisodeId(newEpisode.id);
      syncWorldToDb(updatedWorld);

      try {
        localStorage.setItem('mindstrip_worlds', JSON.stringify(updatedWorlds));
      } catch {
        // ignore
      }
    } catch (e) {
      console.error('Episode generation failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePanelPrompt = (panelNumber: number, newPrompt: string) => {
    if (!activeWorld || !activeEpisode) return;
    const updatedPanels = activeEpisode.panels.map((p) => {
      if (p.panelNumber === panelNumber) {
        return { ...p, imagePrompt: newPrompt };
      }
      return p;
    });

    const updatedEpisode = { ...activeEpisode, panels: updatedPanels };
    const updatedEpisodes = activeWorld.episodes.map((ep) =>
      ep.id === activeEpisode.id ? updatedEpisode : ep
    );
    const updatedWorld = { ...activeWorld, episodes: updatedEpisodes };
    const updatedWorlds = worlds.map((w) => (w.id === activeWorld.id ? updatedWorld : w));
    setWorlds(updatedWorlds);

    try {
      localStorage.setItem('mindstrip_worlds', JSON.stringify(updatedWorlds));
    } catch {
      // ignore
    }
  };

  const handleRegenerateCurrentEpisode = async () => {
    if (!activeWorld || !activeEpisode) return;
    setIsLoading(true);
    try {
      const regenContext = buildStoryContext(
        activeWorld,
        activeEpisode.rawBrainDump || activeWorld.tagline
      );
      const generated = await generateMindStrip(
        activeEpisode.rawBrainDump || activeWorld.tagline,
        activeWorld.artStyle,
        'candid',
        apiConfig,
        activeWorld.characters,
        activeWorld.title,
        activeWorld.genre,
        regenContext
      );

      const updatedEpisode: ComicStrip = {
        ...generated,
        ...writeRecap(generated),
        id: activeEpisode.id,
        episodeNumber: activeEpisode.episodeNumber || 1,
        title: activeEpisode.title || `${activeWorld.title}: Episode #${activeEpisode.episodeNumber || 1}`,
      };

      const updatedEpisodes = activeWorld.episodes.map((ep) =>
        ep.id === activeEpisode.id ? updatedEpisode : ep
      );
      const updatedWorld = { ...activeWorld, episodes: updatedEpisodes };
      const updatedWorlds = worlds.map((w) => (w.id === activeWorld.id ? updatedWorld : w));
      setWorlds(updatedWorlds);

      try {
        localStorage.setItem('mindstrip_worlds', JSON.stringify(updatedWorlds));
      } catch {
        // ignore
      }
    } catch (e) {
      console.error('Episode regeneration failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateArtwork = async (options?: GranularArtworkOptions) => {
    if (!activeWorld || !activeEpisode) return;
    setIsGeneratingArtwork(true);
    setArtworkError(null);
    try {
      const targetLayoutStyle = options?.layoutStyle || activeEpisode.layoutStyle || '4-panel';
      const targetArtStyle = options?.artStyle || activeWorld.artStyle || 'webcomic';
      const targetImageModel = options?.imageModel || activeEpisode.imageModel || activeWorld.imageModel;
      const targetProvider = options?.provider || apiConfig?.provider;

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: activeEpisode.rawBrainDump || activeEpisode.title,
          customPrompt: options?.customPrompt,
          artStyle: targetArtStyle,
          characters: activeWorld.characters,
          worldTitle: activeWorld.title,
          episodeTitle: activeEpisode.title,
          provider: targetProvider,
          apiKey: apiConfig?.apiKey,
          baseUrl: apiConfig?.baseUrl,
          imageModel: targetImageModel,
          layoutStyle: targetLayoutStyle,
          aspectRatio: options?.aspectRatio
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      if (data.pageImageUrl) {
        const updatedEpisode: ComicStrip = {
          ...activeEpisode,
          pageImageUrl: data.pageImageUrl,
          layoutStyle: targetLayoutStyle,
          imageModel: targetImageModel,
          generationNotice: `Synthesized with ${data.provider || 'Meta Muse Image 1.0'} (${targetArtStyle}, ${targetLayoutStyle})`
        };
        const updatedEpisodes = activeWorld.episodes.map((ep) =>
          ep.id === activeEpisode.id ? updatedEpisode : ep
        );
        const updatedWorld = {
          ...activeWorld,
          artStyle: targetArtStyle,
          episodes: updatedEpisodes
        };
        const updatedWorlds = worlds.map((w) => (w.id === activeWorld.id ? updatedWorld : w));
        setWorlds(updatedWorlds);
        syncWorldToDb(updatedWorld);
        try {
          localStorage.setItem('mindstrip_worlds', JSON.stringify(updatedWorlds));
        } catch {
          // ignore
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Artwork synthesis error:', msg);
      setArtworkError(msg);
    } finally {
      setIsGeneratingArtwork(false);
    }
  };

  const [isAutoBuilding, setIsAutoBuilding] = useState<boolean>(false);

  const handleAutoBuildWorld = async (sparkPrompt: string) => {
    setIsAutoBuilding(true);
    setIsLoading(true);
    try {
      const res = await fetch('/api/build-world', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: sparkPrompt,
          provider: apiConfig?.provider,
          apiKey: apiConfig?.apiKey,
          baseUrl: apiConfig?.baseUrl
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to auto-architect universe');
      }

      if (data.world) {
        const newWorld: ComicWorld = data.world;
        const storyContext = buildStoryContext(newWorld, newWorld.tagline);
        const generated = await generateMindStrip(
          newWorld.tagline,
          newWorld.artStyle,
          'candid',
          apiConfig,
          newWorld.characters,
          newWorld.title,
          newWorld.genre,
          storyContext,
          'auto'
        );

        const firstEpisode: ComicStrip = {
          ...generated,
          ...writeRecap(generated),
          episodeNumber: 1,
          title: `${newWorld.title}: Origin`,
        };

        const worldWithEpisode: ComicWorld = {
          ...newWorld,
          episodes: [firstEpisode],
        };

        const updated = [worldWithEpisode, ...worlds];
        setWorlds(updated);
        setActiveWorldId(worldWithEpisode.id);
        setActiveEpisodeId(firstEpisode.id);
        syncWorldToDb(worldWithEpisode);

        try {
          localStorage.setItem('mindstrip_worlds', JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error('Auto-build world error:', err);
    } finally {
      setIsAutoBuilding(false);
      setIsLoading(false);
    }
  };

  const handleUpdateWorld = (updatedWorld: ComicWorld) => {
    const updatedWorlds = worlds.map((w) => (w.id === updatedWorld.id ? updatedWorld : w));
    setWorlds(updatedWorlds);
    syncWorldToDb(updatedWorld);
    try {
      localStorage.setItem('mindstrip_worlds', JSON.stringify(updatedWorlds));
    } catch {
      // ignore
    }
  };

  const handleQuickGenerateFromLanding = async (prompt: string) => {
    setIsLoading(true);
    try {
      const generated = await generateMindStrip(
        prompt,
        'minimalist',
        'candid',
        apiConfig
      );

      const newWorldId = `world-${Date.now()}`;
      const firstEpisode: ComicStrip = {
        ...generated,
        ...writeRecap(generated),
        episodeNumber: 1,
        title: `Episode #1: ${generated.title}`,
      };

      const newWorld: ComicWorld = {
        id: newWorldId,
        title: generated.title || 'Quick Comic Strip',
        tagline: prompt,
        genre: 'Modern Slice-of-Life',
        artStyle: 'minimalist',
        characters: [
          {
            id: 'char-protagonist',
            name: 'Protagonist',
            role: 'protagonist',
            gender: 'unspecified',
            appearance: 'Everyday attire with expressive features',
            description: 'The protagonist of this strip',
            avatarEmoji: '✨',
            traits: ['Resourceful', 'Adaptable'],
          },
        ],
        episodes: [firstEpisode],
        createdAt: new Date().toISOString(),
      };

      const updated = [newWorld, ...worlds];
      setWorlds(updated);
      setActiveWorldId(newWorld.id);
      setActiveEpisodeId(firstEpisode.id);

      try {
        localStorage.setItem('mindstrip_worlds', JSON.stringify(updated));
      } catch {
        // ignore
      }
    } catch (e) {
      console.error('Quick generation failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDialogue = (panelNumber: number, bubbleId: string, newText: string) => {
    if (!activeWorld || !activeEpisode) return;
    const updatedPanels = activeEpisode.panels.map((p) => {
      if (p.panelNumber === panelNumber) {
        const updatedBubbles = p.bubbles.map((b) =>
          b.id === bubbleId ? { ...b, text: newText } : b
        );
        return { ...p, bubbles: updatedBubbles };
      }
      return p;
    });

    const updatedEpisode = { ...activeEpisode, panels: updatedPanels };
    const updatedEpisodes = activeWorld.episodes.map((ep) =>
      ep.id === activeEpisode.id ? updatedEpisode : ep
    );
    const updatedWorld = { ...activeWorld, episodes: updatedEpisodes };
    const updatedWorlds = worlds.map((w) => (w.id === activeWorld.id ? updatedWorld : w));
    setWorlds(updatedWorlds);
    syncWorldToDb(updatedWorld);
  };

  const handleAddDialogue = (
    panelNumber: number,
    speaker: string,
    text: string,
    type: SpeechBubble['type'] = 'speech'
  ) => {
    if (!activeWorld || !activeEpisode) return;
    const newBubble: SpeechBubble = {
      id: `bubble-${Date.now()}`,
      speaker,
      text,
      type,
      position: 'top-left'
    };

    const updatedPanels = activeEpisode.panels.map((p) => {
      if (p.panelNumber === panelNumber) {
        return { ...p, bubbles: [...(p.bubbles || []), newBubble] };
      }
      return p;
    });

    const updatedEpisode = { ...activeEpisode, panels: updatedPanels };
    const updatedEpisodes = activeWorld.episodes.map((ep) =>
      ep.id === activeEpisode.id ? updatedEpisode : ep
    );
    const updatedWorld = { ...activeWorld, episodes: updatedEpisodes };
    const updatedWorlds = worlds.map((w) => (w.id === activeWorld.id ? updatedWorld : w));
    setWorlds(updatedWorlds);
    syncWorldToDb(updatedWorld);
  };

  const handleDeleteDialogue = (panelNumber: number, bubbleId: string) => {
    if (!activeWorld || !activeEpisode) return;
    const updatedPanels = activeEpisode.panels.map((p) => {
      if (p.panelNumber === panelNumber) {
        return { ...p, bubbles: p.bubbles.filter((b) => b.id !== bubbleId) };
      }
      return p;
    });

    const updatedEpisode = { ...activeEpisode, panels: updatedPanels };
    const updatedEpisodes = activeWorld.episodes.map((ep) =>
      ep.id === activeEpisode.id ? updatedEpisode : ep
    );
    const updatedWorld = { ...activeWorld, episodes: updatedEpisodes };
    const updatedWorlds = worlds.map((w) => (w.id === activeWorld.id ? updatedWorld : w));
    setWorlds(updatedWorlds);
    syncWorldToDb(updatedWorld);
  };

  const handleUpdatePanelScene = (panelNumber: number, newDescription: string, newSoundEffect?: string) => {
    if (!activeWorld || !activeEpisode) return;
    const updatedPanels = activeEpisode.panels.map((p) => {
      if (p.panelNumber === panelNumber) {
        return {
          ...p,
          sceneDescription: newDescription,
          ...(newSoundEffect !== undefined ? { soundEffect: newSoundEffect } : {})
        };
      }
      return p;
    });

    const updatedEpisode = { ...activeEpisode, panels: updatedPanels };
    const updatedEpisodes = activeWorld.episodes.map((ep) =>
      ep.id === activeEpisode.id ? updatedEpisode : ep
    );
    const updatedWorld = { ...activeWorld, episodes: updatedEpisodes };
    const updatedWorlds = worlds.map((w) => (w.id === activeWorld.id ? updatedWorld : w));
    setWorlds(updatedWorlds);
    syncWorldToDb(updatedWorld);
  };

  return (
    <>
      {isBuilderOpen ? (
        /* Full-Screen Immersive Universe & Character Studio */
        <UniverseBuilderStudio
          onBack={() => setIsBuilderOpen(false)}
          onCreateWorld={(newWorld, startWithEpisode, initialPremise) => {
            handleCreateNewWorld(newWorld, startWithEpisode, initialPremise);
          }}
        />
      ) : activeWorld ? (
        /* Zen Full-Screen Comic Reader with Persistent Studio Sidebar */
        <ZenComicReader
          world={activeWorld}
          episode={activeEpisode}
          onBackToWorlds={() => {
            setActiveWorldId(null);
            setActiveEpisodeId(null);
          }}
          onGenerateNextEpisode={handleGenerateNextEpisode}
          isLoading={isLoading}
          onUpdateDialogue={handleUpdateDialogue}
          onAddDialogue={handleAddDialogue}
          onDeleteDialogue={handleDeleteDialogue}
          onUpdatePanelScene={handleUpdatePanelScene}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onSelectEpisode={(ep) => setActiveEpisodeId(ep.id)}
          onUpdatePanelPrompt={handleUpdatePanelPrompt}
          onRegenerateEpisode={handleRegenerateCurrentEpisode}
          onGenerateArtwork={handleGenerateArtwork}
          isGeneratingArtwork={isGeneratingArtwork}
          artworkError={artworkError}
          onUpdateWorld={handleUpdateWorld}
          apiConfig={apiConfig}
          onToggleMode={handleToggleMode}
          currentProfile={creatorProfile}
          isDbConnected={isDbConnected}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      ) : (
        /* Widescreen Desktop Editorial Landing Screen */
        <ZenLanding
          worlds={worlds}
          onSelectWorld={handleSelectWorld}
          onStartNewWorld={() => setIsBuilderOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onQuickGenerate={handleQuickGenerateFromLanding}
          onAutoBuildWorld={handleAutoBuildWorld}
          isAutoBuilding={isAutoBuilding}
          apiConfig={apiConfig}
          onToggleMode={handleToggleMode}
          currentProfile={creatorProfile}
          isDbConnected={isDbConnected}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      )}

      {/* API Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={apiConfig}
        onSaveConfig={(cfg) => {
          setApiConfig(cfg);
          try {
            localStorage.setItem('mindstrip_api_config', JSON.stringify(cfg));
          } catch {
            // ignore
          }
        }}
      />

      {/* Creator Profile, Auth & Storage Backup Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentProfile={creatorProfile}
        onLoginProfile={handleLoginProfile}
        isDbConnected={isDbConnected}
        worlds={worlds}
        onImportWorlds={handleImportWorlds}
      />
    </>
  );
}
