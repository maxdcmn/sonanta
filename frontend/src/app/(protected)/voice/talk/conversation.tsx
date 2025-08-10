'use client';

import { useConversation } from '@elevenlabs/react';
import { useCallback, useState } from 'react';
import VoiceReactiveCircles from '@/components/motion/voice-circles';

export function Conversation() {
  const conversation = useConversation({
    onConnect: () => console.log('Connected'),
    onDisconnect: () => console.log('Disconnected'),
    onMessage: (message) => console.log('Message:', message),
    onError: (error) => console.error('Error:', error),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSignedUrl = async (): Promise<string> => {
    const response = await fetch('/api/signed-url');
    if (!response.ok) {
      throw new Error(`Failed to get signed url: ${response.statusText}`);
    }
    const { signedUrl } = await response.json();
    if (!signedUrl) throw new Error('Missing signed URL');
    return signedUrl;
  };

  const startConversation = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      setIsConnecting(true);
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const signedUrl = await getSignedUrl();
      await conversation.startSession({ signedUrl });
    } catch (err) {
      console.error('Failed to start conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to start conversation');
    } finally {
      setIsLoading(false);
      setIsConnecting(false);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    try {
      setIsLoading(true);
      await conversation.endSession();
    } catch (err) {
      console.error('Failed to stop conversation:', err);
    } finally {
      setIsLoading(false);
    }
  }, [conversation]);

  const isConnected = conversation.status === 'connected';
  const agentSpeaking = isConnected && !!conversation.isSpeaking;

  const handleToggle = useCallback(() => {
    if (isLoading) return;
    if (isConnected) stopConversation();
    else startConversation();
  }, [isConnected, isLoading, startConversation, stopConversation]);

  return (
    <div className="flex flex-col items-center gap-6">
      <VoiceReactiveCircles
        size={360}
        isRecording={isConnected}
        isSaving={isLoading}
        onToggleRecording={handleToggle}
        interactive={true}
        agentSpeaking={agentSpeaking}
        isConnecting={isConnecting}
        context="talk"
      />
    </div>
  );
}
