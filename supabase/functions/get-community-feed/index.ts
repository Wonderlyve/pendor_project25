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

    const { limit = 20, offset = 0, timeframe = '24h' } = await req.json()

    // Calculer la date de début selon le timeframe
    let startDate = new Date()
    switch (timeframe) {
      case '1h':
        startDate.setHours(startDate.getHours() - 1)
        break
      case '6h':
        startDate.setHours(startDate.getHours() - 6)
        break
      case '24h':
        startDate.setDate(startDate.getDate() - 1)
        break
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      default:
        startDate.setDate(startDate.getDate() - 1)
    }

    // Récupérer les posts avec leurs scores et profils
    const { data: posts, error } = await supabaseClient
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          username,
          display_name,
          avatar_url,
          badge
        ),
        post_scores (
          visibility_score,
          engagement_score,
          updated_at
        ),
        post_boosts (
          boost_count,
          updated_at
        )
      `)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(1000) // Récupérer plus pour pouvoir trier efficacement

    if (error) {
      console.error('Error fetching community posts:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch posts' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculer le score communautaire pour chaque post
    const scoredPosts = posts?.map(post => {
      const baseScore = post.post_scores?.[0]?.visibility_score || 50
      const engagementScore = post.post_scores?.[0]?.engagement_score || 0
      const boostCount = post.post_boosts?.[0]?.boost_count || 0

      // Calculer l'engagement récent (favorise les posts qui ont beaucoup d'interactions)
      const totalEngagement = (post.likes || 0) + (post.comments || 0) * 2 + (post.shares || 0) * 3 + (post.views || 0) * 0.01
      
      // Calculer le ratio engagement/temps (posts qui gagnent rapidement en popularité)
      const postAge = Date.now() - new Date(post.created_at).getTime()
      const hoursOld = Math.max(1, postAge / (1000 * 60 * 60)) // Au moins 1h pour éviter division par 0
      const engagementVelocity = totalEngagement / hoursOld

      // Score communautaire basé sur plusieurs facteurs
      let communityScore = baseScore * 0.4 + // Score de base (qualité, fraîcheur, etc.)
                          engagementScore * 0.3 + // Score d'engagement
                          Math.min(engagementVelocity * 10, 30) + // Vélocité d'engagement (max 30 points)
                          boostCount * 5 // Boosts communautaires

      // Bonus pour les badges d'expertise
      if (post.profiles?.badge === 'Expert') {
        communityScore += 8
      } else if (post.profiles?.badge === 'Pro') {
        communityScore += 5
      }

      // Bonus pour les posts très récents avec beaucoup d'engagement
      if (hoursOld < 2 && totalEngagement > 10) {
        communityScore += 15
      }

      // Bonus pour les posts avec analyse détaillée
      if (post.analysis && post.analysis.length > 200) {
        communityScore += 5
      }

      // Pénalité légère pour les posts très anciens dans le timeframe
      if (timeframe === '24h' && hoursOld > 12) {
        communityScore -= (hoursOld - 12) * 0.5
      }

      return {
        ...post,
        community_score: Math.max(0, Math.min(100, communityScore)),
        engagement_velocity: engagementVelocity,
        total_engagement: totalEngagement
      }
    }) || []

    // Trier par score communautaire et appliquer la pagination
    const sortedPosts = scoredPosts
      .sort((a, b) => {
        // Tri principal par score communautaire
        if (Math.abs(a.community_score - b.community_score) > 5) {
          return b.community_score - a.community_score
        }
        // Tri secondaire par vélocité d'engagement si scores similaires
        return b.engagement_velocity - a.engagement_velocity
      })
      .slice(offset, offset + limit)

    // Transformer les données pour le frontend
    const transformedPosts = sortedPosts.map(post => ({
      id: post.id,
      user_id: post.user_id,
      content: post.content,
      sport: post.sport,
      match_teams: post.match_teams,
      prediction_text: post.prediction_text,
      analysis: post.analysis,
      odds: post.odds,
      confidence: post.confidence,
      image_url: post.image_url,
      video_url: post.video_url,
      likes: post.likes,
      comments: post.comments,
      shares: post.shares,
      views: post.views,
      created_at: post.created_at,
      match_time: post.match_time,
      username: post.profiles?.username,
      display_name: post.profiles?.display_name,
      avatar_url: post.profiles?.avatar_url,
      badge: post.profiles?.badge,
      like_count: post.likes,
      comment_count: post.comments,
      community_score: post.community_score,
      boost_count: post.post_boosts?.[0]?.boost_count || 0
    }))

    console.log(`Feed communautaire généré: ${transformedPosts.length} posts (timeframe: ${timeframe})`)

    return new Response(
      JSON.stringify({
        posts: transformedPosts,
        hasMore: scoredPosts.length > offset + limit,
        totalAvailable: scoredPosts.length,
        timeframe
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error generating community feed:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})