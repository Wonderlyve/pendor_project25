import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useDebriefingViews = () => {
  const { user } = useAuth();

  const addView = useCallback(async (debriefingId: string) => {
    if (!user) return false;

    try {
      // Try to insert a new view record
      const { error } = await supabase
        .from('debriefing_views')
        .insert({
          debriefing_id: debriefingId,
          user_id: user.id
        });

      // If successful (no error), it means this is the first view from this user
      if (!error) {
        return true;
      }
      
      // If error is due to unique constraint (user already viewed), return false
      if (error.code === '23505') {
        return false;
      }

      // For other errors, log and return false
      console.error('Error adding debriefing view:', error);
      return false;
    } catch (error) {
      console.error('Error in addDebriefingView:', error);
      return false;
    }
  }, [user]);

  return { addView };
};