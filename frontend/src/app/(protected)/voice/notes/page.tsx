'use client';

import { useState, useEffect } from 'react';
import { VoiceNoteCard } from '@/app/(protected)/voice/notes/voice-note-card';
import { VoiceRecorder } from '@/app/(protected)/voice/notes/voice-recorder';
import type { VoiceMemo as RecorderVoiceMemo } from '@/app/(protected)/voice/notes/voice-recorder';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FadeUp } from '@/components/motion/fade-up';
import { createClient } from '@/lib/supabase/client';

export default function VoiceNotesPage() {
  const [voiceMemos, setVoiceMemos] = useState<RecorderVoiceMemo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVoiceMemos = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('voice_memos')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setVoiceMemos(data as RecorderVoiceMemo[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVoiceMemos();

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchVoiceMemos();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleRecordingComplete = (memo: RecorderVoiceMemo) => {
    setVoiceMemos((prev) => [memo, ...prev]);
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from('voice_memos').delete().eq('id', id);
    setVoiceMemos((prev) => prev.filter((memo) => memo.id !== id));
  };

  const handleDownload = async (id: string) => {
    const memo = voiceMemos.find((m) => m.id === id);
    if (!memo) return;

    const supabase = createClient();
    const { data } = await supabase.storage.from('voice-memos').download(memo.audio_url);

    if (data) {
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voice-memo-${id}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen pt-50 pb-20">
      <div className="mx-auto max-w-4xl px-6">
        <FadeUp delay={0.1}>
          <div className="flex flex-col items-center space-y-6">
            <div className="mb-4 text-center">
              <h2 className="mb-2 text-2xl font-semibold">Record Voice Notes</h2>
            </div>

            <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
          </div>
        </FadeUp>

        <FadeUp delay={0.2}>
          <div className="space-y-4">
            {loading ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground text-sm">Loading voice notes...</p>
              </div>
            ) : voiceMemos.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground text-sm">Your voice notes will appear here</p>
              </div>
            ) : (
              <ScrollArea className="h-[700px] p-4">
                <div className="space-y-3">
                  {voiceMemos.map((memo) => (
                    <VoiceNoteCard
                      key={memo.id}
                      id={memo.id}
                      duration={Number(memo.duration_seconds) || 0}
                      date={memo.created_at}
                      transcription={memo.transcript || ''}
                      transcript_status={memo.transcript_status || undefined}
                      onDelete={() => handleDelete(memo.id)}
                      onDownload={() => handleDownload(memo.id)}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </FadeUp>
      </div>
    </div>
  );
}
