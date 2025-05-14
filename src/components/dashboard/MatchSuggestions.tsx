'use client';

import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Avatar,
  Button,
  Skeleton,
  Tooltip,
  Icon,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiAward, FiThumbsUp, FiTag, FiRefreshCw, FiUsers, FiDollarSign } from 'react-icons/fi';
import { useReferenceMatches } from '@/hooks/useReferenceMatches';
import { formatCurrency } from '@/utils/format';
import { MatchCard } from './MatchCard';

export function MatchSuggestions({ requestId }: { requestId: string }) {
  const {
    matches,
    memberStats,
    loading,
    refreshing,
    error,
    refresh,
    requestReference,
  } = useReferenceMatches(requestId);

  if (loading) {
    return (
      <VStack spacing={4} w="full">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height="200px" w="full" borderRadius="lg" />
        ))}
      </VStack>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        {error.message}
      </Alert>
    );
  }

  if (matches.length === 0) {
    return (
      <Box textAlign="center" py={6}>
        <Text color="gray.500">
          Nenhum match encontrado para esta solicitação.
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} w="full">
      <HStack w="full" justify="flex-end">
        <Button
          leftIcon={<Icon as={FiRefreshCw} />}
          size="sm"
          onClick={refresh}
          isLoading={refreshing}
        >
          Atualizar Matches
        </Button>
      </HStack>

      {matches.map((match) => (
        <MatchCard
          key={match.member_id}
          match={match}
          stats={memberStats[match.member_id]}
          onRequestReference={() => requestReference(match)}
        />
      ))}
    </VStack>
  );
} 