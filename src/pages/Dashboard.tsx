import { ArrowLeft, Users, UserCheck, Activity, TrendingUp, Eye, MessageCircle, Heart, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEffect } from 'react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if not Smart user
  useEffect(() => {
    if (user && user.email !== 'smart@example.com' && !user.email?.includes('padmin') && user.user_metadata?.display_name !== 'Smart') {
      navigate('/');
    }
  }, [user, navigate]);

  // Simulated data
  const stats = {
    totalUsers: 1223,
    onlineUsers: 89,
    activeToday: 267,
    totalPosts: 15678,
    totalLikes: 89234,
    totalComments: 12456,
    totalShares: 5432
  };

  const recentUsers = [
    { id: 1, name: 'Antoine M.', email: 'antoine@example.com', status: 'online', joinedAt: '2024-01-15' },
    { id: 2, name: 'Marie L.', email: 'marie@example.com', status: 'offline', joinedAt: '2024-01-14' },
    { id: 3, name: 'Pierre D.', email: 'pierre@example.com', status: 'online', joinedAt: '2024-01-13' },
    { id: 4, name: 'Sophie R.', email: 'sophie@example.com', status: 'offline', joinedAt: '2024-01-12' },
    { id: 5, name: 'Lucas B.', email: 'lucas@example.com', status: 'online', joinedAt: '2024-01-11' }
  ];

  const topPosts = [
    { id: 1, author: 'Antoine M.', content: 'PSG va gagner ce soir !', likes: 234, comments: 45 },
    { id: 2, author: 'Marie L.', content: 'Match serré entre Lyon et Marseille', likes: 189, comments: 67 },
    { id: 3, author: 'Pierre D.', content: 'Mes pronostics pour la Ligue 1', likes: 156, comments: 34 },
    { id: 4, author: 'Sophie R.', content: 'Champions League predictions', likes: 145, comments: 28 },
    { id: 5, author: 'Lucas B.', content: 'Tennis Roland Garros 2024', likes: 123, comments: 19 }
  ];

  if (!user || (user.email !== 'smart@example.com' && !user.email?.includes('padmin') && user.user_metadata?.display_name !== 'Smart')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
              className="hover:bg-accent"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Activity className="w-6 h-6 text-muted-foreground" />
            <h1 className="text-xl font-bold text-foreground">Tableau de bord administrateur</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Utilisateurs totaux</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <UserCheck className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">En ligne maintenant</p>
                <p className="text-2xl font-bold text-foreground">{stats.onlineUsers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Actifs aujourd'hui</p>
                <p className="text-2xl font-bold text-foreground">{stats.activeToday}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <Eye className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Posts totaux</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalPosts.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Engagement Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <Heart className="w-6 h-6 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Likes totaux</p>
                <p className="text-xl font-bold text-foreground">{stats.totalLikes.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-6 h-6 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Commentaires totaux</p>
                <p className="text-xl font-bold text-foreground">{stats.totalComments.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <Share2 className="w-6 h-6 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Partages totaux</p>
                <p className="text-xl font-bold text-foreground">{stats.totalShares.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Users Table */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Utilisateurs récents</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Inscription</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'online' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status === 'online' ? 'En ligne' : 'Hors ligne'}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(user.joinedAt).toLocaleDateString('fr-FR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Top Posts */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Posts populaires</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Auteur</TableHead>
                <TableHead>Contenu</TableHead>
                <TableHead>Likes</TableHead>
                <TableHead>Commentaires</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.author}</TableCell>
                  <TableCell className="max-w-xs truncate">{post.content}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>{post.likes}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <span>{post.comments}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;