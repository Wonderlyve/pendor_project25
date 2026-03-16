import { ArrowLeft, Users, UserCheck, Activity, TrendingUp, Eye, MessageCircle, Heart, Share2 } from '@/lib/icons';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEffect } from 'react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import AdBannerManager from '@/components/dashboard/AdBannerManager';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats, recentUsers, topPosts, isLoading } = useDashboardStats();

  useEffect(() => {
    if (user && user.email !== 'smart@example.com' && !user.email?.includes('padmin') && user.user_metadata?.display_name !== 'Smart') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || (user.email !== 'smart@example.com' && !user.email?.includes('padmin') && user.user_metadata?.display_name !== 'Smart')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} className="hover:bg-accent">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Activity className="w-6 h-6 text-muted-foreground" />
            <h1 className="text-xl font-bold text-foreground">Tableau de bord administrateur</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={<Users className="w-7 h-7 text-blue-500" />} label="Utilisateurs" value={stats.totalUsers} loading={isLoading} />
          <StatCard icon={<UserCheck className="w-7 h-7 text-green-500" />} label="Actifs (24h)" value={stats.activeToday} loading={isLoading} />
          <StatCard icon={<Eye className="w-7 h-7 text-purple-500" />} label="Posts" value={stats.totalPosts} loading={isLoading} />
          <StatCard icon={<Heart className="w-7 h-7 text-red-500" />} label="Likes" value={stats.totalLikes} loading={isLoading} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={<MessageCircle className="w-6 h-6 text-blue-500" />} label="Commentaires" value={stats.totalComments} loading={isLoading} />
          <StatCard icon={<Share2 className="w-6 h-6 text-green-500" />} label="Partages" value={stats.totalShares} loading={isLoading} />
        </div>

        {/* Ad Banner Management */}
        <AdBannerManager />

        {/* Charts */}
        <DashboardCharts />

        {/* Recent Users */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-foreground mb-3">Utilisateurs récents</h3>
          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Posts</TableHead>
                  <TableHead>Followers</TableHead>
                  <TableHead>Inscription</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.map((u) => (
                  <TableRow key={u.user_id}>
                    <TableCell className="font-medium">{u.display_name || u.username || 'Sans nom'}</TableCell>
                    <TableCell className="text-xs">{u.postCount}</TableCell>
                    <TableCell className="text-xs">{u.followerCount}</TableCell>
                    <TableCell className="text-xs">{new Date(u.created_at).toLocaleDateString('fr-FR')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* Top Posts */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-foreground mb-3">Posts populaires</h3>
          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Auteur</TableHead>
                  <TableHead>Contenu</TableHead>
                  <TableHead>❤️</TableHead>
                  <TableHead>💬</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium text-xs">{post.author}</TableCell>
                    <TableCell className="max-w-[120px] truncate text-xs">{post.content}</TableCell>
                    <TableCell className="text-xs">{post.likes}</TableCell>
                    <TableCell className="text-xs">{post.comments}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, loading }: { icon: React.ReactNode; label: string; value: number; loading: boolean }) => (
  <Card className="p-4">
    <div className="flex items-center space-x-3">
      {icon}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        {loading ? <Skeleton className="h-7 w-16" /> : (
          <p className="text-xl font-bold text-foreground">{value.toLocaleString()}</p>
        )}
      </div>
    </div>
  </Card>
);

export default Dashboard;
