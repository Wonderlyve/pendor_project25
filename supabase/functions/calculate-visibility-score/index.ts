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

    const { postId } = await req.json()

    if (!postId) {
      return new Response(
        JSON.stringify({ error: 'Post ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Récupérer les données du post
    const { data: post, error: postError } = await supabaseClient
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          badge,
          created_at as profile_created_at
        )
      `)
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return new Response(
        JSON.stringify({ error: 'Post not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 1. Calcul du score de qualité du contenu (0-100)
    let contentQualityScore = 0
    
    // Analyse détaillée présente
    if (post.analysis && post.analysis.length > 100) contentQualityScore += 25
    else if (post.analysis && post.analysis.length > 50) contentQualityScore += 15
    
    // Statistiques/justification (recherche de mots-clés)
    const analysisText = (post.analysis || '').toLowerCase()
    const statsKeywords = ['stat', 'pourcentage', '%', 'moyenne', 'forme', 'blessé', 'suspension', 'historique']
    const foundStats = statsKeywords.filter(keyword => analysisText.includes(keyword))
    contentQualityScore += Math.min(foundStats.length * 5, 25)
    
    // Cote justifiée (odds > 1.5 considéré comme analysé)
    if (post.odds && post.odds > 1.5) contentQualityScore += 15
    if (post.odds && post.odds > 2.0) contentQualityScore += 10
    
    // Confiance élevée
    if (post.confidence >= 80) contentQualityScore += 15
    else if (post.confidence >= 60) contentQualityScore += 10
    
    // Media présent
    if (post.image_url) contentQualityScore += 5
    if (post.video_url) contentQualityScore += 10

    // 2. Calcul du score d'engagement (0-100)
    const totalEngagement = (post.likes || 0) + (post.comments || 0) + (post.shares || 0) + Math.floor((post.views || 0) / 10)
    let engagementScore = Math.min(totalEngagement * 2, 100)

    // 3. Calcul du score de fiabilité de l'auteur (0-100)
    let authorReliabilityScore = 50 // Score de base
    
    // Badge influence
    if (post.profiles?.badge === 'Expert') authorReliabilityScore += 30
    else if (post.profiles?.badge === 'Pro') authorReliabilityScore += 20
    else if (post.profiles?.badge === 'Vérifié') authorReliabilityScore += 10
    
    // Ancienneté du compte
    if (post.profiles?.profile_created_at) {
      const accountAge = Date.now() - new Date(post.profiles.profile_created_at).getTime()
      const daysOld = accountAge / (1000 * 60 * 60 * 24)
      if (daysOld > 365) authorReliabilityScore += 15
      else if (daysOld > 180) authorReliabilityScore += 10
      else if (daysOld > 30) authorReliabilityScore += 5
    }

    // Récupérer historique des posts de l'auteur pour calculer win rate
    const { data: authorPosts } = await supabaseClient
      .from('posts')
      .select('*')
      .eq('user_id', post.user_id)
      .not('id', 'eq', postId)
      .limit(50)
    
    if (authorPosts && authorPosts.length > 0) {
      const totalLikes = authorPosts.reduce((sum, p) => sum + (p.likes || 0), 0)
      const avgLikes = totalLikes / authorPosts.length
      if (avgLikes > 10) authorReliabilityScore += 10
      else if (avgLikes > 5) authorReliabilityScore += 5
    }

    authorReliabilityScore = Math.min(authorReliabilityScore, 100)

    // 4. Calcul du score de fraîcheur (0-100)
    let freshnessScore = 100
    
    if (post.match_time) {
      const matchTime = new Date(post.match_time).getTime()
      const now = Date.now()
      const timeUntilMatch = matchTime - now
      const hoursUntilMatch = timeUntilMatch / (1000 * 60 * 60)
      
      if (hoursUntilMatch < 0) {
        // Match passé
        freshnessScore = Math.max(0, 20 + hoursUntilMatch * 2) // Décroît rapidement après le match
      } else if (hoursUntilMatch <= 2) {
        // Match dans les 2h - score maximal
        freshnessScore = 100
      } else if (hoursUntilMatch <= 24) {
        // Match dans les 24h - score élevé
        freshnessScore = 90 - Math.floor(hoursUntilMatch - 2) * 2
      } else if (hoursUntilMatch <= 48) {
        // Match dans les 48h - score moyen
        freshnessScore = 50 - Math.floor(hoursUntilMatch - 24)
      } else {
        // Match lointain
        freshnessScore = Math.max(10, 50 - Math.floor(hoursUntilMatch - 48) * 0.5)
      }
    } else {
      // Pas de match_time, utiliser created_at
      const postAge = Date.now() - new Date(post.created_at).getTime()
      const hoursOld = postAge / (1000 * 60 * 60)
      
      if (hoursOld <= 1) freshnessScore = 100
      else if (hoursOld <= 6) freshnessScore = 90 - Math.floor(hoursOld - 1) * 5
      else if (hoursOld <= 24) freshnessScore = 65 - Math.floor(hoursOld - 6) * 2
      else freshnessScore = Math.max(20, 65 - Math.floor(hoursOld - 24) * 1.5)
    }

    // 5. Calcul des pénalités de signalement (0-50)
    const { data: reports } = await supabaseClient
      .from('post_reports')
      .select('*')
      .eq('post_id', postId)
    
    let reportPenalty = 0
    if (reports) {
      reportPenalty = Math.min(reports.length * 10, 50)
    }

    // Calcul du score final de visibilité
    const visibilityScore = Math.max(0, Math.min(100,
      0.3 * contentQualityScore +
      0.25 * engagementScore +
      0.2 * authorReliabilityScore +
      0.15 * freshnessScore -
      0.1 * reportPenalty
    ))

    // Mise à jour du score dans la base
    await supabaseClient
      .from('post_scores')
      .upsert({
        post_id: postId,
        visibility_score: visibilityScore,
        content_quality_score: contentQualityScore,
        engagement_score: engagementScore,
        author_reliability_score: authorReliabilityScore,
        freshness_score: freshnessScore,
        report_penalty: reportPenalty,
        updated_at: new Date().toISOString()
      })

    console.log(`Score calculé pour le post ${postId}:`, {
      visibilityScore,
      contentQualityScore,
      engagementScore,
      authorReliabilityScore,
      freshnessScore,
      reportPenalty
    })

    return new Response(
      JSON.stringify({
        visibilityScore,
        breakdown: {
          contentQualityScore,
          engagementScore,
          authorReliabilityScore,
          freshnessScore,
          reportPenalty
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error calculating visibility score:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})