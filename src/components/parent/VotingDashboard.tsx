'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'motion/react';
import { Vote, Calendar, Users, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useSimpleLoading } from '@/lib/hooks/useLoadingState';
import { DataLoadingErrorBoundary } from '@/components/ui/LoadingErrorBoundary';
import { useLanguage } from '@/components/language/LanguageContext';
import { ActionLoader } from '@/components/ui/dashboard-loader';

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

interface VoteOption {
  id: string;
  text: string;
  votes: number;
}

interface Vote {
  id: string;
  title: string;
  description: string;
  options: VoteOption[];
  totalVotes: number;
  endDate: string;
  status: 'active' | 'closed';
  hasVoted: boolean;
  userVote: string | null;
}

interface VotingDashboardProps {
  className?: string;
}

function VotingDashboardComponent({ className = '' }: VotingDashboardProps) {
  const { data: session, status } = useSession();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [voting, setVoting] = useState<string | null>(null);
  const { t } = useLanguage();

  // Use enhanced loading state management
  const { isLoading, error, setLoading, setError } = useSimpleLoading(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated' && session?.user?.email) {
      fetchVotes();
    }
  }, [status, session?.user?.email]);

  const fetchVotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/parent/votes');
      if (response.ok) {
        const data = await response.json();
        setVotes(data.data || []);
      } else {
        setError(t('parent.voting.error.loading', 'parent'));
        toast.error(t('parent.voting.error.loading', 'parent'));
      }
    } catch (error) {
      console.error('Error fetching votes:', error);
      setError(t('parent.voting.error.loading', 'parent'));
      toast.error(t('parent.voting.error.loading', 'parent'));
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteId: string, optionId: string) => {
    try {
      setVoting(voteId);

      const response = await fetch('/api/parent/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voteId, optionId }),
      });

      if (response.ok) {
        toast.success(t('parent.voting.success', 'parent'));
        // Refresh votes to show updated results
        await fetchVotes();
      } else {
        const error = await response.json();
        toast.error(error.error || t('parent.voting.error.loading', 'parent'));
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast.error(t('parent.voting.error.loading', 'parent'));
    } finally {
      setVoting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return t('parent.voting.closed', 'parent');

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} días`;
    if (hours > 0) return `${hours} horas`;
    return 'Menos de 1 hora';
  };

  if (status === 'loading' || isLoading) {
    return (
      <Card
        className={`${className}`}
        role="status"
        aria-live="polite"
        aria-label={t('parent.voting.loading', 'parent')}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5" />
            {t('parent.voting.title', 'parent')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <ActionLoader size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">
            {t('parent.voting.loading', 'parent')}
          </p>
          <span className="sr-only">
            {t('parent.voting.loading', 'parent')}
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Vote className="h-5 w-5" />
          {t('parent.voting.title', 'parent')}
        </CardTitle>
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
            {error}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="space-y-6"
        >
          {votes.length > 0 ? (
            votes.slice(0, 3).map(vote => (
              <Card key={vote.id} className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {vote.title}
                      </CardTitle>
                      <p className="text-gray-600 text-sm mb-3">
                        {vote.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {vote.totalVotes} votos
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(vote.endDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {getTimeRemaining(vote.endDate)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant={
                          vote.status === 'active' ? 'default' : 'secondary'
                        }
                      >
                        {vote.status === 'active'
                          ? t('parent.voting.active', 'parent')
                          : t('parent.voting.closed', 'parent')}
                      </Badge>
                      {vote.hasVoted && (
                        <Badge variant="outline" className="text-green-600">
                          {t('parent.voting.already_voted', 'parent')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {vote.options.map(option => {
                      const percentage =
                        vote.totalVotes > 0
                          ? (option.votes / vote.totalVotes) * 100
                          : 0;
                      const isUserVote = vote.userVote === option.id;

                      return (
                        <div key={option.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span
                              className={`font-medium ${isUserVote ? 'text-blue-600' : ''}`}
                            >
                              {option.text}
                              {isUserVote && ' ✓'}
                            </span>
                            <span className="text-sm text-gray-500">
                              {option.votes}{' '}
                              {t('parent.voting.total_votes', 'parent')} (
                              {percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <Progress
                            value={percentage}
                            className={`h-2 ${isUserVote ? 'bg-blue-100' : ''}`}
                          />
                          {vote.status === 'active' && !vote.hasVoted && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVote(vote.id, option.id)}
                              disabled={voting === vote.id}
                              className="mt-2"
                            >
                              {voting === vote.id ? (
                                <>
                                  <ActionLoader size="sm" className="mr-2" />
                                  {t('parent.voting.voting', 'parent')}
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  {t('parent.voting.vote', 'parent')}
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <Vote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('parent.voting.no_active', 'parent')}
              </h3>
              <p className="text-gray-500">
                {t('parent.voting.no_active_desc', 'parent')}
              </p>
            </div>
          )}

          {votes.length > 3 && (
            <div className="text-center pt-4">
              <Button variant="outline" size="sm">
                {t('parent.voting.view_all', 'parent')} ({votes.length})
              </Button>
            </div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
}

// Export with error boundary wrapper
export default function VotingDashboard(props: VotingDashboardProps) {
  return (
    <DataLoadingErrorBoundary
      onRetry={() => window.location.reload()}
      title="Error al cargar votaciones"
      description="No se pudieron cargar las votaciones del centro de padres."
    >
      <VotingDashboardComponent {...props} />
    </DataLoadingErrorBoundary>
  );
}
