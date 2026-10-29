'use client';

import React, { useState, useEffect } from 'react';
import { ZenLanding } from '@/components/ZenLanding';
import { ZenComicReader } from '@/components/ZenComicReader';
import { UniverseBuilderStudio } from '@/components/UniverseBuilderStudio';
import { SettingsModal } from '@/components/SettingsModal';
import { ComicWorld, ComicStrip } from '@/types/comic';
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingArtwork, setIsGeneratingArtwork] = useState<boolean>(false);
  const [artworkError, setArtworkError] = useState<string | null>(null);
  const [apiConfig, setApiConfig] = useState<ApiConfig>(DEFAULT_CONFIG);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);

  const syncWorldToDb = (world: ComicWorld) => {
    fetch('/api/worlds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ world })
    }).catch((e) => console.warn('Cloud DB sync notice:', e));
  };

  // Safely hydrate from localStorage on client mount, then sync with MongoDB Atlas
  useEffect(() => {
    try {
      const savedWorlds = localStorage.getItem('mindstrip_worlds');
      if (savedWorlds) {
        const parsed = JSON.parse(savedWorlds);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const upgraded = upgradeWorlds(parsed);
          setWorlds(upgraded);
          try {
            localStorage.setItem('mindstrip_worlds', JSON.stringify(upgraded));
          } catch {
            // ignore
          }
        }
      }

      // Check MongoDB Atlas synchronization
      fetch('/api/worlds')
        .then((res) => res.json())
        .then((data) => {
          if (data.connected) {
            setIsDbConnected(true);
            if (Array.isArray(data.worlds) && data.worlds.length > 0) {
              const upgraded = upgradeWorlds(data.worlds);
              setWorlds(upgraded);
              try {
                localStorage.setItem('mindstrip_worlds', JSON.stringify(upgraded));
              } catch {
                // ignore
              }
            } else {
              // First time MongoDB connected: push local/initial worlds to Atlas
              const current = savedWorlds ? JSON.parse(savedWorlds) : INITIAL_WORLDS;
              fetch('/api/worlds', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ worlds: current })
              }).catch(() => {});
            }
          }
        })
        .catch(() => {});

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
  }, []);

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
      activeWorld.episodes[activeWorld.episodes.length - 1]
    : null;

  const handleSelectWorld = (world: ComicWorld) => {
    setActiveWorldId(world.id);
    const latestEp = world.episodes[world.episodes.length - 1];
    if (latestEp) {
      setActiveEpisodeId(latestEp.id);
    }
  };

  const handleCreateNewWorld = async (newWorld: ComicWorld) => {
    setIsLoading(true);
    try {
      // New world: context is just the bible (no episodes exist yet).
      const storyContext = buildStoryContext(newWorld, newWorld.tagline);
      const generated = await generateMindStrip(
        newWorld.tagline,
        newWorld.artStyle,
        'candid',
        apiConfig,
        newWorld.characters,
        newWorld.title,
        newWorld.genre,
        storyContext
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
    } catch (e) {
      console.error('World creation episode generation failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateNextEpisode = async (
    storyPremise: string,
    layoutPreference: 'auto' | '1-panel' | '2-panel' | '3-panel' | '4-panel' = 'auto'
  ) => {
    if (!activeWorld) return;
    setIsLoading(true);
    try {
      // Full chain assembly: bible + recaps + pointer-resolved episodes.
      const storyContext = buildStoryContext(activeWorld, storyPremise);
      const generated = await generateMindStrip(
        storyPremise,
        activeWorld.artStyle,
        'candid',
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
        title: `Episode #${nextNum}: ${generated.title}`,
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

  const handleGenerateArtwork = async () => {
    if (!activeWorld || !activeEpisode) return;
    setIsGeneratingArtwork(true);
    setArtworkError(null);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: activeEpisode.rawBrainDump || activeEpisode.title,
          artStyle: activeWorld.artStyle,
          characters: activeWorld.characters,
          worldTitle: activeWorld.title,
          episodeTitle: activeEpisode.title,
          provider: apiConfig?.provider,
          apiKey: apiConfig?.apiKey,
          baseUrl: apiConfig?.baseUrl,
          imageModel: activeEpisode.imageModel || activeWorld.imageModel,
          layoutStyle: activeEpisode.layoutStyle || '4-panel'
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
          generationNotice: `Synthesized with Meta Muse Image 1.0 (${activeWorld.artStyle})`
        };
        const updatedEpisodes = activeWorld.episodes.map((ep) =>
          ep.id === activeEpisode.id ? updatedEpisode : ep
        );
        const updatedWorld = { ...activeWorld, episodes: updatedEpisodes };
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
  };

  return (
    <>
      {isBuilderOpen ? (
        /* Full-Screen Immersive Universe & Character Studio */
        <UniverseBuilderStudio
          onBack={() => setIsBuilderOpen(false)}
          onCreateWorld={(newWorld) => {
            handleCreateNewWorld(newWorld);
            setIsBuilderOpen(false);
          }}
        />
      ) : activeWorld && activeEpisode ? (
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
    </>
  );
}
