import { Box, Card, CardBody, Text, Progress, Flex, Tag, Wrap, WrapItem } from '@chakra-ui/react';
import { Match } from '../types/match';
import { formatPercentage } from '../utils/format';

interface MatchCardProps {
  match: Match;
  onClick?: () => void;
}

export const MatchCard = ({ match, onClick }: MatchCardProps) => {
  return (
    <Card 
      cursor={onClick ? 'pointer' : 'default'}
      _hover={onClick ? { bg: 'gray.50' } : {}} 
      onClick={onClick}
    >
      <CardBody>
        <Text fontWeight="bold" fontSize="lg" mb={2}>
          {match.memberName}
        </Text>
        
        <Box mb={4}>
          <Text fontSize="sm" color="gray.600" mb={1}>
            Similaridade
          </Text>
          <Flex alignItems="center" gap={2}>
            <Progress 
              value={match.similarity * 100} 
              size="sm"
              colorScheme="brand"
              flex={1}
            />
            <Text fontSize="sm">
              {formatPercentage(match.similarity)}
            </Text>
          </Flex>
        </Box>

        <Box mb={4}>
          <Text fontSize="sm" color="gray.600" mb={1}>
            Taxa de Sucesso Histórica
          </Text>
          <Flex alignItems="center" gap={2}>
            <Progress 
              value={match.historicalSuccess * 100} 
              size="sm"
              colorScheme="brand"
              flex={1}
            />
            <Text fontSize="sm">
              {formatPercentage(match.historicalSuccess)}
            </Text>
          </Flex>
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.600" mb={1}>
            Tags em Comum
          </Text>
          <Wrap spacing={2}>
            {match.commonTags.map(tag => (
              <WrapItem key={tag}>
                <Tag size="sm" variant="outline">
                  {tag}
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      </CardBody>
    </Card>
  );
}; 