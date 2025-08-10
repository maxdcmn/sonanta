'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Pause, Trash2, Download, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceNoteCardProps {
  id: string;
  duration: number;
  date: string;
  transcription?: string;
  transcript_status?: string;
  title?: string;
  onDelete: () => void;
  onDownload: () => void;
}

export function VoiceNoteCard({
  id,
  duration,
  date,
  transcription,
  transcript_status = 'pending',
  title,
  onDelete,
  onDownload,
}: VoiceNoteCardProps) {
  const [progress, setProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusBadge = () => {
    switch (transcript_status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <Sparkles className="h-3 w-3" />
            Transcribed
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="secondary" className="bg-blue-500 text-white hover:bg-blue-600">
            <Skeleton className="mr-1 h-3 w-3 animate-pulse rounded-full" />
            Processing
          </Badge>
        );
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return (
          <Badge variant="outline" className="border-orange-300 text-orange-600">
            Coming Soon
          </Badge>
        );
    }
  };

  const getTitle = () => {
    if (title) return title;
    if (transcription) return transcription.slice(0, 50) + (transcription.length > 50 ? '...' : '');
    return `Voice Memo ${formatDate(date)}`;
  };

  const handlePlay = () => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.src = `/api/audio/${id}`;
      audioRef.current = audio;

      audio.addEventListener('loadedmetadata', () => {
        audio.play();
        setIsPlaying(true);
        startProgressTracking();
      });

      audio.addEventListener('ended', () => {
        setCurrentTime(0);
        setProgress(0);
        setIsPlaying(false);
        stopProgressTracking();
      });
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      startProgressTracking();
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      stopProgressTracking();
    }
  };

  const startProgressTracking = () => {
    if (progressIntervalRef.current) return;

    progressIntervalRef.current = setInterval(() => {
      if (audioRef.current) {
        const current = audioRef.current.currentTime;
        const duration = audioRef.current.duration;
        setCurrentTime(current);
        setProgress((current / duration) * 100);
      }
    }, 16);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * audioRef.current.duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(percentage * 100);
  };

  const displayText = transcription || '';

  return (
    <Card
      className="bg-background/30 cursor-pointer gap-2 transition-all duration-300"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="truncate text-sm font-medium">{getTitle()}</h3>
            <div className="text-muted-foreground flex items-center gap-3 text-xs">
              <span>{formatDate(date)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <div className="flex h-6 w-6 items-center justify-center">
              {isExpanded ? (
                <ChevronUp className="text-muted-foreground h-4 w-4" />
              ) : (
                <ChevronDown className="text-muted-foreground h-4 w-4" />
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.2,
              ease: 'easeOut',
            }}
            className="overflow-hidden"
          >
            <CardContent>
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div
                  className="relative cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProgressClick(e);
                  }}
                >
                  <Progress value={progress} className="h-1.5 w-full transition-all" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                      className="h-8 w-8 rounded-md"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownload();
                      }}
                      className="h-8 w-8 rounded-md"
                      aria-label="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        isPlaying ? handlePause() : handlePlay();
                      }}
                      className="h-8 w-8 rounded-md"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {formatTime(currentTime)} / {formatDuration(duration)}
                  </div>
                </div>

                {transcript_status === 'completed' && transcription && (
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ScrollArea className="max-h-32">
                      <p className="text-muted-foreground pr-4 text-sm leading-relaxed">
                        {displayText}
                      </p>
                    </ScrollArea>
                  </motion.div>
                )}

                {transcript_status === 'processing' && (
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </motion.div>
                )}

                {transcript_status === 'failed' && (
                  <motion.p
                    className="text-destructive text-sm"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    Transcription failed. Try again later.
                  </motion.p>
                )}

                {transcript_status === 'pending' && (
                  <motion.p
                    className="text-muted-foreground text-sm italic"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    Transcription coming soon...
                  </motion.p>
                )}
              </motion.div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
