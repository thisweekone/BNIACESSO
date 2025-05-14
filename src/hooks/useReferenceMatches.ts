import { useState, useEffect, useCallback } from 'react';
import { MatchSuggestion, MemberStats } from '@/types/references';
import { ReferenceService } from '@/services/referenceService';
import { useToast } from '@chakra-ui/react';

interface UseReferenceMatchesReturn {
  matches: MatchSuggestion[];
  memberStats: Record<string, MemberStats>;
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  requestReference: (match: MatchSuggestion) => Promise<void>;
}

export function useReferenceMatches(requestId: string): UseReferenceMatchesReturn {
  const [matches, setMatches] = useState<MatchSuggestion[]>([]);
  const [memberStats, setMemberStats] = useState<Record<string, MemberStats>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const toast = useToast();
  const referenceService = new ReferenceService();

  const fetchData = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setError(null);
      if (!forceRefresh) setLoading(true);
      if (forceRefresh) setRefreshing(true);

      const matchesData = await referenceService.getMatches(requestId, forceRefresh);
      setMatches(matchesData);

      if (matchesData.length > 0) {
        const memberIds = matchesData.map(m => m.member_id);
        const statsData = await referenceService.getMemberStats(memberIds);
        setMemberStats(statsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      toast({
        title: 'Erro ao buscar matches',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [requestId, toast]);

  const refresh = useCallback(() => fetchData(true), [fetchData]);

  const requestReference = useCallback(async (match: MatchSuggestion) => {
    try {
      await referenceService.createReferenceRequest(requestId, match.member_id);
      toast({
        title: 'Solicitação enviada',
        description: `Uma solicitação foi enviada para ${match.member_name}`,
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: 'Erro ao enviar solicitação',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [requestId, toast]);

  useEffect(() => {
    if (requestId) {
      fetchData();
    }
  }, [requestId, fetchData]);

  return {
    matches,
    memberStats,
    loading,
    refreshing,
    error,
    refresh,
    requestReference,
  };
} 