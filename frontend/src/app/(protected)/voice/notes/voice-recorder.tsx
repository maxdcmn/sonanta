'use client';
import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import VoiceReactiveCircles from '@/components/motion/voice-circles';

export type VoiceMemo = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  audio_url: string;
  duration_seconds: number | null;
  file_size_bytes?: number | null;
  transcript?: string | null;
  transcript_status?: 'pending' | 'processing' | 'completed' | 'failed' | null;
  transcript_metadata?: Record<string, unknown> | null;
  title?: string | null;
  summary?: string | null;
  tags?: string[] | null;
  is_favorite?: boolean | null;
  metadata?: Record<string, unknown> | null;
};

interface VoiceRecorderProps {
  onRecordingComplete?: (memo: VoiceMemo) => void;
}

export function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && streamRef.current) {
      mediaRecorderRef.current.stop();
      streamRef.current.getTracks().forEach((track) => track.stop());

      setIsRecording(false);

      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      if (audioBlob.size > 0) {
        uploadRecording(audioBlob);
      }
    }
  };

  const uploadRecording = async (blob: Blob) => {
    setIsSaving(true);
    const supabase = createClient();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileName = `${user.id}/${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from('voice-memos')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from('voice_memos')
        .insert({
          user_id: user.id,
          audio_url: fileName,
          duration_seconds: Math.ceil(blob.size / 16000),
          file_size_bytes: blob.size,
          title: title.trim() || undefined,
          transcript_status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      onRecordingComplete?.(data as VoiceMemo);
      setTitle('');

      fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memoId: (data as VoiceMemo).id, filePath: fileName }),
      }).catch(() => console.warn('Transcription failed to start'));
    } catch (error) {
      console.error('Error uploading recording:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mb-20 flex justify-center">
      <VoiceReactiveCircles
        size={360}
        isRecording={isRecording}
        onToggleRecording={isRecording ? stopRecording : startRecording}
        isSaving={isSaving}
        context="notes"
      />
    </div>
  );
}
