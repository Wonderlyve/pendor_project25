import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const useDashboardCharts = () => {
  return useQuery({
    queryKey: ['dashboard-charts-30d'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const days: { date: string; label: string }[] = [];

      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        days.push({
          date: d.toISOString().split('T')[0],
          label: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        });
      }

      const [profilesRes, postsRes, likesRes, commentsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('created_at')
          .gte('created_at', thirtyDaysAgo.toISOString()),
        supabase
          .from('posts')
          .select('created_at')
          .gte('created_at', thirtyDaysAgo.toISOString()),
        supabase
          .from('post_likes')
          .select('created_at')
          .gte('created_at', thirtyDaysAgo.toISOString()),
        supabase
          .from('comments')
          .select('created_at')
          .gte('created_at', thirtyDaysAgo.toISOString()),
      ]);

      const countByDay = (items: { created_at: string }[] | null) => {
        const map = new Map<string, number>();
        items?.forEach((item) => {
          const day = item.created_at.split('T')[0];
          map.set(day, (map.get(day) || 0) + 1);
        });
        return map;
      };

      const signups = countByDay(profilesRes.data);
      const posts = countByDay(postsRes.data);
      const likes = countByDay(likesRes.data);
      const comments = countByDay(commentsRes.data);

      return days.map((d) => ({
        name: d.label,
        inscriptions: signups.get(d.date) || 0,
        posts: posts.get(d.date) || 0,
        likes: likes.get(d.date) || 0,
        commentaires: comments.get(d.date) || 0,
      }));
    },
    refetchInterval: 60000,
  });
};

export const DashboardCharts = () => {
  const { data, isLoading } = useDashboardCharts();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Inscriptions (30 jours)
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="inscriptions"
              name="Inscriptions"
              stroke="hsl(217, 91%, 60%)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Engagement (30 jours)
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="posts"
              name="Posts"
              stroke="hsl(142, 71%, 45%)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="likes"
              name="Likes"
              stroke="hsl(0, 84%, 60%)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="commentaires"
              name="Commentaires"
              stroke="hsl(262, 83%, 58%)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
