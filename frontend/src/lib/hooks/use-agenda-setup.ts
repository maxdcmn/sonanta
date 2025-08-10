import { useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-provider';
import { createClient } from '@/lib/supabase/client';

export function useAgendaSetup() {
  const { user, isLoggedIn } = useAuth();
  const hasSetupAgenda = useRef(false);

  useEffect(() => {
    if (!isLoggedIn || !user || hasSetupAgenda.current) return;

    const setupAgenda = async () => {
      try {
        console.log('Agenda setup: Starting...');

        const supabase = createClient();

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const { data: existingConversation } = await supabase
          .from('conversations')
          .select('id, metadata, created_at')
          .eq('user_id', user.id)
          .gte('created_at', new Date(Date.now() - 3 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (existingConversation?.metadata?.agenda) {
          hasSetupAgenda.current = true;
          console.log('Agenda setup: Found existing agenda, skipping setup');
          return;
        }

        console.log('Agenda setup: Generating new agenda...');

        const agendaRes = await fetch('/api/agenda', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'agenda' }),
        });

        if (!agendaRes.ok) throw new Error('Failed to generate agenda');

        const { text: agenda } = await agendaRes.json();

        const topicRes = await fetch('/api/agenda', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'topic', agenda }),
        });

        if (!topicRes.ok) throw new Error('Failed to generate topic');

        const { text: topic } = await topicRes.json();

        const { error } = await supabase.from('conversations').insert({
          user_id: user.id,
          title: `Daily Conversation - ${new Date().toLocaleDateString()}`,
          metadata: {
            agenda,
            topic,
            generated_at: new Date().toISOString(),
            type: 'daily_setup',
          },
        });

        if (error) throw error;

        hasSetupAgenda.current = true;
        console.log('Agenda setup complete:', { agenda, topic });
      } catch (error) {
        console.error('Failed to setup agenda:', error);
        hasSetupAgenda.current = true;
      }
    };

    const timer = setTimeout(setupAgenda, 1000);
    return () => clearTimeout(timer);
  }, [isLoggedIn, user]);

  return { hasSetupAgenda: hasSetupAgenda.current };
}
