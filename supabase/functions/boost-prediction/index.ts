import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Récupérer l'utilisateur authentifié
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { postId, action = 'boost' } = await req.json()

    if (!postId) {
      return new Response(
        JSON.stringify({ error: 'Post ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifier que le post existe
    const { data: post, error: postError } = await supabaseClient
      .from('posts')
      .select('id, user_id')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return new Response(
        JSON.stringify({ error: 'Post not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifier que l'utilisateur ne booste pas son propre post
    if (post.user_id === user.id) {
      return new Response(
        JSON.stringify({ error: 'Cannot boost your own post' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'boost') {
      // Vérifier si l'utilisateur a déjà boosté ce post
      const { data: existingBoost } = await supabaseClient
        .from('post_boosts')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single()

      if (existingBoost) {
        return new Response(
          JSON.stringify({ error: 'Post already boosted' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Récupérer le profil utilisateur pour vérifier les quotas
      const { data: userProfile } = await supabaseClient
        .from('profiles')
        .select('badge')
        .eq('user_id', user.id)
        .single()

      // Définir les limites de boost selon le badge
      let dailyBoostLimit = 3 // Utilisateur standard
      if (userProfile?.badge === 'Pro') dailyBoostLimit = 10
      else if (userProfile?.badge === 'Expert') dailyBoostLimit = 20

      // Vérifier le nombre de boosts aujourd'hui
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const { data: todayBoosts, error: boostCountError } = await supabaseClient
        .from('post_boosts')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString())

      if (boostCountError) {
        console.error('Error checking boost count:', boostCountError)
        return new Response(
          JSON.stringify({ error: 'Failed to check boost limit' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (todayBoosts && todayBoosts.length >= dailyBoostLimit) {
        return new Response(
          JSON.stringify({ 
            error: 'Daily boost limit reached',
            limit: dailyBoostLimit,
            used: todayBoosts.length
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Ajouter le boost
      const { error: insertError } = await supabaseClient
        .from('post_boosts')
        .insert({
          post_id: postId,
          user_id: user.id,
          boost_type: 'user_boost'
        })

      if (insertError) {
        console.error('Error adding boost:', insertError)
        return new Response(
          JSON.stringify({ error: 'Failed to boost post' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Recalculer le score de visibilité du post
      await supabaseClient.functions.invoke('calculate-visibility-score', {
        body: { postId }
      })

      console.log(`Post ${postId} boosted by user ${user.id}`)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Post boosted successfully',
          remainingBoosts: dailyBoostLimit - (todayBoosts?.length || 0) - 1
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (action === 'unboost') {
      // Supprimer le boost
      const { error: deleteError } = await supabaseClient
        .from('post_boosts')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Error removing boost:', deleteError)
        return new Response(
          JSON.stringify({ error: 'Failed to remove boost' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Recalculer le score de visibilité du post
      await supabaseClient.functions.invoke('calculate-visibility-score', {
        body: { postId }
      })

      console.log(`Boost removed from post ${postId} by user ${user.id}`)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Boost removed successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Use "boost" or "unboost"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Error in boost-prediction function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})