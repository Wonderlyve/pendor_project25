import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const usePostViews = () => {
  const { user } = useAuth();

  const addView = async (postId: string) => {
    if (!user) return false;

    try {
      // Try to insert a new view record
      const { error } = await supabase
        .from('post_views')
        .insert({
          post_id: postId,
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
      console.error('Error adding view:', error);
      return false;
    } catch (error) {
      console.error('Error in addView:', error);
      return false;
    }
  };

  return { addView };
};