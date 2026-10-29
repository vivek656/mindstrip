'use client';

import React, { useState } from 'react';
import { CreatorProfile, ComicWorld } from '@/types/comic';
import {
  X,
  User,
  Shield,
  Download,
  Upload,
  Lock,
  LogOut,
  Sparkles,
  Database,
  HardDrive,
  Check,
  AlertCircle
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: CreatorProfile | null;
  onLoginProfile: (profile: CreatorProfile) => void;
  isDbConnected: boolean;
  worlds: ComicWorld[];
  onImportWorlds?: (imported: ComicWorld[]) => void;
}

const AVATAR_OPTIONS = ['🎨', '⚡', '🚀', '🧙‍♂️', '👾', '☕', '🌟', '🦄', '🕵️', '🦾'];

export function AuthModal({
  isOpen,
  onClose,
  currentProfile,
  onLoginProfile,
  isDbConnected,
  worlds,
  onImportWorlds,
}: AuthModalProps) {
  const [handle, setHandle] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [pin, setPin] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🎨');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importedNotice, setImportedNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: handle.trim(),
          displayName: displayName.trim() || handle.trim(),
          pin: pin.trim() || undefined,
          avatarEmoji: selectedEmoji,
          isGuest: false,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.profile) {
        onLoginProfile(data.profile);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueAsGuest = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isGuest: true, avatarEmoji: selectedEmoji }),
      });
      const data = await res.json();
      if (data.profile) {
        onLoginProfile(data.profile);
        onClose();
      }
    } catch (err) {
      setErrorMsg('Could not start guest session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      creator: currentProfile,
      worldsCount: worlds.length,
      worlds,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindstrip-backup-${currentProfile?.handle || 'creator'}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const importedWorlds = parsed.worlds || (Array.isArray(parsed) ? parsed : null);
        if (Array.isArray(importedWorlds) && importedWorlds.length > 0 && onImportWorlds) {
          onImportWorlds(importedWorlds);
          setImportedNotice(`Successfully restored ${importedWorlds.length} universes!`);
          setTimeout(() => setImportedNotice(null), 3000);
        } else {
          setErrorMsg('Invalid backup file format');
        }
      } catch {
        setErrorMsg('Failed to read JSON backup file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white border border-black/15 rounded-3xl shadow-2xl overflow-hidden text-zinc-900">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.08] bg-zinc-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold text-sm">
              {currentProfile?.avatarEmoji || '👤'}
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-950">
                Creator Profile & Storage
              </h3>
              <p className="text-[11px] text-zinc-500">
                {currentProfile ? `@${currentProfile.handle}` : 'Sign in or switch creator profiles'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-black/[0.04] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Storage Transparency Banner */}
          <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
            isDbConnected
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/70 border-amber-200 text-amber-900'
          }`}>
            {isDbConnected ? (
              <Database className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <HardDrive className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <span className="font-bold uppercase tracking-wider text-[10px] block">
                {isDbConnected ? '🟢 Cloud Database Active (MongoDB Atlas)' : '💾 Private Browser Storage'}
              </span>
              <p className="text-[11px] leading-relaxed">
                {isDbConnected
                  ? `Your universes are synced to MongoDB Atlas under your creator profile ID. Only you can view and edit your comics.`
                  : `Your comics are saved privately to this browser (${worlds.length} worlds). They survive page refreshes, but to use them on other computers, use the Export Backup button below.`}
              </p>
            </div>
          </div>

          {/* Current Active Profile Card */}
          {currentProfile && (
            <div className="p-4 rounded-2xl bg-zinc-50 border border-black/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currentProfile.avatarEmoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-zinc-900">{currentProfile.displayName}</span>
                    <span className="font-mono text-[10px] text-zinc-400">@{currentProfile.handle}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {currentProfile.isGuest ? 'Guest Session' : 'Registered Creator'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleContinueAsGuest}
                className="px-3 py-1.5 rounded-full border border-black/15 text-zinc-600 hover:text-zinc-900 text-xs font-semibold hover:bg-white transition-all cursor-pointer flex items-center gap-1.5"
                title="Switch to a new guest session"
              >
                <LogOut className="w-3 h-3" />
                <span>Switch Profile</span>
              </button>
            </div>
          )}

          {/* Error & Success Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {importedNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{importedNotice}</span>
            </div>
          )}

          {/* Form: Sign In / Claim Creator Handle */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 pt-1">
            <div>
              <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-2">
                Sign In or Claim Creator Handle
              </span>
              <p className="text-[11px] text-zinc-500 mb-3">
                Entering a handle assigns your comic universes to your personal creator ID.
              </p>
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-[11px] font-mono text-zinc-600 mb-1.5">
                Choose Creator Avatar
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`w-8 h-8 rounded-xl text-sm flex items-center justify-center border transition-all cursor-pointer ${
                      selectedEmoji === emoji
                        ? 'border-zinc-950 bg-zinc-950 text-white shadow-xs scale-105'
                        : 'border-black/10 hover:border-black/30 bg-zinc-50'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-600 mb-1">
                  Creator Handle *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-zinc-400 text-xs">@</span>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="your_handle"
                    required
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-white border border-black/15 text-xs font-mono outline-none focus:border-zinc-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-600 mb-1">
                  Optional Passkey / PIN
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="4-digit PIN"
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-black/15 text-xs font-mono outline-none focus:border-zinc-950"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !handle.trim()}
              className="w-full py-2.5 rounded-full bg-zinc-950 hover:bg-blue-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Authenticating...' : `Enter Studio as @${handle || 'creator'}`}
            </button>
          </form>

          {/* Backup & Data Sovereignty Section */}
          <div className="pt-4 border-t border-black/[0.08] space-y-3">
            <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500">
              Data Backup & Portability (JSON)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExportBackup}
                className="p-3 rounded-2xl border border-black/10 hover:border-black/30 bg-zinc-50 hover:bg-white text-zinc-800 text-left transition-all cursor-pointer flex flex-col justify-between"
              >
                <Download className="w-4 h-4 text-blue-600 mb-1" />
                <div>
                  <span className="font-bold text-xs block">Export Backup</span>
                  <span className="text-[10px] text-zinc-500">Download .json archive</span>
                </div>
              </button>

              <label className="p-3 rounded-2xl border border-black/10 hover:border-black/30 bg-zinc-50 hover:bg-white text-zinc-800 text-left transition-all cursor-pointer flex flex-col justify-between">
                <Upload className="w-4 h-4 text-emerald-600 mb-1" />
                <div>
                  <span className="font-bold text-xs block">Import Backup</span>
                  <span className="text-[10px] text-zinc-500">Restore from .json file</span>
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
