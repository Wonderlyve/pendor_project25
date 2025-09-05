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

    const { action = 'update_all' } = await req.json()

    if (action === 'update_all') {
      // Récupérer tous les utilisateurs avec leurs stats
      const { data: users, error: usersError } = await supabaseClient
        .from('profiles')
        .select(`
          user_id,
          username,
          badge,
          created_at
        `)

      if (usersError) {
        console.error('Error fetching users:', usersError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch users' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const badgeUpdates = []

      for (const user of users || []) {
        // Calculer les stats de l'utilisateur
        const [postsResult, likesResult, engagementResult] = await Promise.all([
          // Nombre de posts
          supabaseClient
            .from('posts')
            .select('id, likes, comments, created_at')
            .eq('user_id', user.user_id),
          
          // Nombre de likes reçus
          supabaseClient
            .from('post_likes')
            .select('post_id')
            .in('post_id', 
              supabaseClient
                .from('posts')
                .select('id')
                .eq('user_id', user.user_id)
            ),
          
          // Engagement récent (30 derniers jours)
          supabaseClient
            .from('posts')
            .select('likes, comments, views')
            .eq('user_id', user.user_id)
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        ])

        const userPosts = postsResult.data || []
        const totalLikes = likesResult.data?.length || 0
        const recentPosts = engagementResult.data || []

        // Calculer les métriques
        const totalPosts = userPosts.length
        const avgLikesPerPost = totalPosts > 0 ? totalLikes / totalPosts : 0
        const recentEngagement = recentPosts.reduce((sum, post) => 
          sum + (post.likes || 0) + (post.comments || 0) + Math.floor((post.views || 0) / 10), 0
        )

        // Ancienneté du compte
        const accountAge = Date.now() - new Date(user.created_at).getTime()
        const daysOld = accountAge / (1000 * 60 * 60 * 24)

        // Déterminer le nouveau badge
        let newBadge = null

        // Critères pour "Expert" (badge le plus élevé)
        if (totalPosts >= 50 && 
            avgLikesPerPost >= 15 && 
            recentEngagement >= 200 && 
            daysOld >= 90) {
          newBadge = 'Expert'
        }
        // Critères pour "Pro"
        else if (totalPosts >= 20 && 
                 avgLikesPerPost >= 8 && 
                 recentEngagement >= 80 && 
                 daysOld >= 30) {
          newBadge = 'Pro'
        }
        // Critères pour "En forme" (badge temporaire basé sur l'activité récente)
        else if (recentPosts.length >= 5 && 
                 recentEngagement >= 50) {
          newBadge = 'En forme'
        }
        // Critères pour "Vérifié" (utilisateur actif régulier)
        else if (totalPosts >= 10 && 
                 avgLikesPerPost >= 3 && 
                 daysOld >= 14) {
          newBadge = 'Vérifié'
        }
        // Critères pour "Top Tipster" (basé sur la performance)
        else if (avgLikesPerPost >= 20 && totalPosts >= 5) {
          newBadge = 'Top Tipster'
        }

        // Mettre à jour le badge si nécessaire
        if (newBadge !== user.badge) {
          badgeUpdates.push({
            user_id: user.user_id,
            old_badge: user.badge,
            new_badge: newBadge,
            stats: {
              totalPosts,
              avgLikesPerPost: Math.round(avgLikesPerPost * 100) / 100,
              recentEngagement,
              daysOld: Math.floor(daysOld)
            }
          })

          // Effectuer la mise à jour
          await supabaseClient
            .from('profiles')
            .update({ badge: newBadge })
            .eq('user_id', user.user_id)
        }
      }

      console.log(`Badges mis à jour pour ${badgeUpdates.length} utilisateurs:`, badgeUpdates)

      return new Response(
        JSON.stringify({
          success: true,
          updates: badgeUpdates.length,
          details: badgeUpdates
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Autres actions futures (attribution manuelle, etc.)
    return new Response(
      JSON.stringify({ error: 'Action not supported' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error managing badges:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})