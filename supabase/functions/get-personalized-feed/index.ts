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

    const { userId, limit = 20, offset = 0 } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Récupérer les préférences utilisateur
    const { data: userPrefs } = await supabaseClient
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Récupérer les sports favoris de l'utilisateur (basé sur ses interactions)
    const { data: userInteractions } = await supabaseClient
      .from('post_likes')
      .select(`
        posts!inner(sport, user_id)
      `)
      .eq('user_id', userId)
      .limit(100)

    const favoriteSports = new Set()
    const favoriteAuthors = new Set()

    if (userInteractions) {
      userInteractions.forEach(interaction => {
        if (interaction.posts?.sport) {
          favoriteSports.add(interaction.posts.sport)
        }
        if (interaction.posts?.user_id) {
          favoriteAuthors.add(interaction.posts.user_id)
        }
      })
    }

    // Récupérer les utilisateurs suivis
    const { data: follows } = await supabaseClient
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId)

    const followedUsers = follows?.map(f => f.following_id) || []

    // Construire la requête personnalisée
    let query = supabaseClient
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
          updated_at
        )
      `)

    // Récupérer tous les posts récents avec leurs scores
    const { data: allPosts, error } = await query
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // 7 derniers jours
      .order('created_at', { ascending: false })
      .limit(500)

    if (error) {
      console.error('Error fetching posts:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch posts' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculer le score personnalisé pour chaque post
    const scoredPosts = allPosts?.map(post => {
      let personalizedScore = post.post_scores?.[0]?.visibility_score || 50

      // Bonus pour les sports favoris
      if (post.sport && favoriteSports.has(post.sport)) {
        personalizedScore += 15
      }

      // Bonus pour les auteurs favoris (basé sur les interactions passées)
      if (favoriteAuthors.has(post.user_id)) {
        personalizedScore += 20
      }

      // Bonus pour les utilisateurs suivis
      if (followedUsers.includes(post.user_id)) {
        personalizedScore += 25
      }

      // Bonus pour les posts avec badges spéciaux
      if (post.profiles?.badge === 'Expert') {
        personalizedScore += 10
      } else if (post.profiles?.badge === 'Pro') {
        personalizedScore += 7
      }

      // Pénalité pour l'âge du post
      const postAge = Date.now() - new Date(post.created_at).getTime()
      const hoursOld = postAge / (1000 * 60 * 60)
      if (hoursOld > 24) {
        personalizedScore -= Math.floor(hoursOld - 24) * 0.5
      }

      // Bonus pour les posts avec beaucoup d'engagement récent
      const engagementScore = (post.likes || 0) + (post.comments || 0) * 2 + (post.shares || 0) * 3
      personalizedScore += Math.min(engagementScore * 0.1, 10)

      return {
        ...post,
        personalized_score: Math.max(0, Math.min(100, personalizedScore))
      }
    }) || []

    // Trier par score personnalisé et appliquer pagination
    const sortedPosts = scoredPosts
      .sort((a, b) => b.personalized_score - a.personalized_score)
      .slice(offset, offset + limit)

    // Transformer les données pour le frontend
    const transformedPosts = sortedPosts.map(post => ({
      ...post,
      username: post.profiles?.username,
      display_name: post.profiles?.display_name,
      avatar_url: post.profiles?.avatar_url,
      badge: post.profiles?.badge,
      like_count: post.likes,
      comment_count: post.comments
    }))

    console.log(`Feed personnalisé généré pour ${userId}: ${transformedPosts.length} posts`)

    return new Response(
      JSON.stringify({
        posts: transformedPosts,
        hasMore: scoredPosts.length > offset + limit,
        totalAvailable: scoredPosts.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error generating personalized feed:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})