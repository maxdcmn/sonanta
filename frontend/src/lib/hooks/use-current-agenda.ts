import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-provider';
import { createClient } from '@/lib/supabase/client';

interface AgendaData {
  agenda: string;
  topic: string;
  generated_at: string;
}

export function useCurrentAgenda() {
  const { user, isLoggedIn } = useAuth();
  const [agenda, setAgenda] = useState<AgendaData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !user) return;

    const fetchAgenda = async () => {
      try {
        setLoading(true);
        const supabase = createClient();

        const { data: conversations } = await supabase
          .from('conversations')
          .select('metadata, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (conversations && conversations.length > 0) {
          const regularConversation = conversations.find(
            (conv) => conv.metadata && conv.metadata.type !== 'daily_setup' && conv.metadata.agenda,
          );

          if (regularConversation?.metadata?.agenda) {
            setAgenda({
              agenda: regularConversation.metadata.agenda,
              topic: regularConversation.metadata.topic,
              generated_at: regularConversation.metadata.generated_at,
            });
          } else {
            const dailySetup = conversations.find(
              (conv) =>
                conv.metadata && conv.metadata.type === 'daily_setup' && conv.metadata.agenda,
            );

            if (dailySetup?.metadata?.agenda) {
              setAgenda({
                agenda: dailySetup.metadata.agenda,
                topic: dailySetup.metadata.topic,
                generated_at: dailySetup.metadata.generated_at,
              });
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch agenda:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgenda();
  }, [isLoggedIn, user]);

  return { agenda, loading };
}
