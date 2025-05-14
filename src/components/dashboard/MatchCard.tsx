'use client';

import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Avatar,
  Button,
  Tooltip,
  Icon,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react';
import { FiAward, FiThumbsUp, FiTag, FiUsers, FiDollarSign } from 'react-icons/fi';
import { MatchSuggestion, MemberStats } from '@/types/references';
import { formatCurrency } from '@/utils/format';

interface MatchCardProps {
  match: MatchSuggestion;
  stats: MemberStats;
  onRequestReference: () => void;
}

export function MatchCard({ match, stats, onRequestReference }: MatchCardProps) {
  return (
    <Box
      p={6}
      borderWidth="1px"
      borderRadius="lg"
      w="full"
      _hover={{ shadow: 'lg' }}
      position="relative"
      transition="all 0.2s"
    >
      {match.cached && (
        <Tooltip label="Resultado do cache">
          <Badge position="absolute" top={2} right={2} colorScheme="gray">
            Cached
          </Badge>
        </Tooltip>
      )}

      <VStack spacing={4} align="stretch">
        <HStack spacing={4}>
          <Avatar name={match.member_name} size="lg" />
          <Box flex={1}>
            <HStack justify="space-between" align="start">
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold" fontSize="lg">{match.member_name}</Text>
                <Text color="gray.500">{match.member_email}</Text>
              </VStack>
              <VStack align="end" spacing={1}>
                <Badge 
                  colorScheme={match.match_score > 0.7 ? "green" : match.match_score > 0.4 ? "yellow" : "red"} 
                  fontSize="md" 
                  px={3} 
                  py={1}
                >
                  {(match.match_score * 100).toFixed(0)}% match
                </Badge>
                <HStack spacing={1}>
                  <Icon as={FiAward} color="yellow.500" />
                  <Text fontSize="sm" color="gray.500">
                    Score histórico: {(match.history_score * 100).toFixed(0)}%
                  </Text>
                </HStack>
              </VStack>
            </HStack>
          </Box>
        </HStack>

        <Divider />

        <SimpleGrid columns={4} spacing={4}>
          <Stat size="sm">
            <StatLabel>
              <HStack spacing={1}>
                <Icon as={FiUsers} />
                <Text>Referências Dadas</Text>
              </HStack>
            </StatLabel>
            <StatNumber>{stats?.references_given || 0}</StatNumber>
          </Stat>
          <Stat size="sm">
            <StatLabel>
              <HStack spacing={1}>
                <Icon as={FiUsers} />
                <Text>Referências Recebidas</Text>
              </HStack>
            </StatLabel>
            <StatNumber>{stats?.references_received || 0}</StatNumber>
          </Stat>
          <Stat size="sm">
            <StatLabel>
              <HStack spacing={1}>
                <Icon as={FiAward} />
                <Text>Taxa de Sucesso</Text>
              </HStack>
            </StatLabel>
            <StatNumber>
              {((stats?.success_rate || 0) * 100).toFixed(0)}%
            </StatNumber>
          </Stat>
          <Stat size="sm">
            <StatLabel>
              <HStack spacing={1}>
                <Icon as={FiDollarSign} />
                <Text>Valor Médio</Text>
              </HStack>
            </StatLabel>
            <StatNumber>
              {formatCurrency(stats?.avg_value || 0)}
            </StatNumber>
          </Stat>
        </SimpleGrid>

        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            <Icon as={FiTag} /> Tags em comum ({match.matching_tags.length}):
          </Text>
          <HStack wrap="wrap" spacing={2}>
            {match.matching_tags.map((tag) => (
              <Badge 
                key={tag} 
                colorScheme="blue" 
                variant="subtle"
                _hover={{ bg: 'blue.100' }}
                cursor="pointer"
              >
                {tag}
              </Badge>
            ))}
          </HStack>
        </Box>

        <Button
          size="md"
          colorScheme="brand"
          leftIcon={<Icon as={FiThumbsUp} />}
          onClick={onRequestReference}
          _hover={{ transform: 'translateY(-2px)' }}
          transition="all 0.2s"
        >
          Solicitar Referência
        </Button>
      </VStack>
    </Box>
  );
} 