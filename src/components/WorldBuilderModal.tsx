'use client';

import React, { useState } from 'react';
import { ComicWorld, ComicCharacter, ArtStyle } from '@/types/comic';
import { X, Plus, Sparkles, Trash2, ArrowRight } from 'lucide-react';

interface WorldBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWorld: (newWorld: ComicWorld) => void;
}

export function WorldBuilderModal({ isOpen, onClose, onCreateWorld }: WorldBuilderModalProps) {
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [genre, setGenre] = useState('Tech Comedy & Startups');
  const [artStyle, setArtStyle] = useState<ArtStyle>('minimalist');
  const [characters, setCharacters] = useState<ComicCharacter[]>([
    {
      id: 'c-1',
      name: 'Alex',
      role: 'protagonist',
      description: 'The weary problem solver',
      avatarEmoji: '☕',
      traits: ['Relatable', 'Overthinking']
    },
    {
      id: 'c-2',
      name: 'The Chaos Gremlin',
      role: 'antagonist',
      description: 'The personified voice of doubt',
      avatarEmoji: '👾',
      traits: ['Exaggerates stakes']
    }
  ]);

  const [newCharName, setNewCharName] = useState('');
  const [newCharRole, setNewCharRole] = useState<ComicCharacter['role']>('sidekick');
  const [newCharEmoji, setNewCharEmoji] = useState('🤖');

  if (!isOpen) return null;

  const handleAddCharacter = () => {
    if (!newCharName.trim()) return;
    setCharacters((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        name: newCharName.trim(),
        role: newCharRole,
        description: 'Cast member',
        avatarEmoji: newCharEmoji,
        traits: ['Custom character']
      }
    ]);
    setNewCharName('');
  };

  const handleRemoveCharacter = (id: string) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newWorld: ComicWorld = {
      id: `world-${Date.now()}`,
      title: title.trim(),
      tagline: tagline.trim() || 'A new comic universe in the making',
      genre,
      artStyle,
      characters,
      episodes: [],
      createdAt: new Date().toISOString()
    };

    onCreateWorld(newWorld);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white border border-black/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.08]">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-zinc-900" />
            <h3 className="font-bold text-base text-zinc-900">
              Create Your Comic Universe
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-black/[0.04]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* World Title & Tagline */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                World Name *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The 2 AM Dev Lab, Substack Chronicles, Clinic Life..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-sm font-medium outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                Premise / Logline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="What is the recurring central dynamic or setting?"
                className="w-full px-3.5 py-2 rounded-xl border border-black/10 text-xs text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          </div>

          {/* Art Style & Genre */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                Visual Art Style
              </label>
              <select
                value={artStyle}
                onChange={(e) => setArtStyle(e.target.value as ArtStyle)}
                className="w-full px-3 py-2 rounded-xl border border-black/10 text-xs font-medium outline-none bg-white"
              >
                <option value="minimalist">Minimalist Line Art</option>
                <option value="webcomic">Modern Webcomic</option>
                <option value="newspaper">Vintage Newspaper</option>
                <option value="manga">Manga Screentone</option>
                <option value="noir">Cinematic Graphic Novel</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                Genre
              </label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. Tech Satire, Slice of Life"
                className="w-full px-3 py-2 rounded-xl border border-black/10 text-xs font-medium outline-none"
              />
            </div>
          </div>

          {/* Character Roster */}
          <div className="space-y-2 pt-2 border-t border-black/[0.08]">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Recurring Characters ({characters.length})
            </label>

            <div className="space-y-2">
              {characters.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-black/[0.08] bg-zinc-50/70 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{c.avatarEmoji}</span>
                    <div>
                      <div className="font-semibold text-zinc-900">{c.name}</div>
                      <div className="text-[10px] text-zinc-500 capitalize">{c.role} • {c.description}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveCharacter(c.id)}
                    className="p-1 text-zinc-400 hover:text-rose-600"
                    title="Remove character"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Add Character Row */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newCharEmoji}
                onChange={(e) => setNewCharEmoji(e.target.value)}
                className="w-10 text-center py-1.5 rounded-lg border border-black/10 text-sm outline-none"
                title="Character Avatar Emoji"
              />
              <input
                type="text"
                value={newCharName}
                onChange={(e) => setNewCharName(e.target.value)}
                placeholder="New character name..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-black/10 text-xs outline-none"
              />
              <select
                value={newCharRole}
                onChange={(e) => setNewCharRole(e.target.value as ComicCharacter['role'])}
                className="px-2 py-1.5 rounded-lg border border-black/10 text-xs outline-none bg-white capitalize"
              >
                <option value="protagonist">Protagonist</option>
                <option value="sidekick">Sidekick</option>
                <option value="antagonist">Antagonist</option>
                <option value="supporting">Supporting</option>
              </select>
              <button
                type="button"
                onClick={handleAddCharacter}
                className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-black/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-medium text-zinc-500 hover:text-zinc-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <span>Build Universe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
