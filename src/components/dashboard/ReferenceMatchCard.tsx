'use client';

import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Avatar,
  Button,
  useColorModeValue,
  Flex,
  Icon,
  Tag,
  TagLabel,
  Tooltip,
} from '@chakra-ui/react';
import { FiUser, FiBox, FiTag, FiPercent, FiMessageCircle } from 'react-icons/fi';
import { ReferenceMatch } from '@/types/references';
// Função interna para formatação de datas relativas
function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Menos de 1 minuto
  if (diffInSeconds < 60) {
    return 'agora mesmo';
  }
  
  // Menos de 1 hora
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  }
  
  // Menos de 1 dia
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }
  
  // Menos de 1 mês (30 dias)
  if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `há ${days} ${days === 1 ? 'dia' : 'dias'}`;
  }
  
  // Menos de 1 ano
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `há ${months} ${months === 1 ? 'mês' : 'meses'}`;
  }
  
  // Mais de 1 ano
  const years = Math.floor(diffInSeconds / 31536000);
  return `há ${years} ${years === 1 ? 'ano' : 'anos'}`;
}

interface ReferenceMatchCardProps {
  match: ReferenceMatch;
  onConnect: (match: ReferenceMatch) => void;
}

export function ReferenceMatchCard({ match, onConnect }: ReferenceMatchCardProps) {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const scoreBg = useColorModeValue('red.50', 'red.900');
  
  // Converte a pontuação (0-1) para porcentagem
  const matchScorePercent = Math.round(match.match_score * 100);
  
  // Determina a cor do badge de acordo com a pontuação
  let scoreColor = 'gray';
  if (matchScorePercent >= 80) scoreColor = 'green';
  else if (matchScorePercent >= 60) scoreColor = 'teal';
  else if (matchScorePercent >= 40) scoreColor = 'yellow';
  else if (matchScorePercent >= 20) scoreColor = 'orange';
  else scoreColor = 'red';

  return (
    <Box 
      bg={cardBg} 
      borderWidth="1px" 
      borderColor={borderColor} 
      borderRadius="lg" 
      p={4} 
      shadow="sm"
      position="relative"
      overflow="hidden"
      w="full"
    >
      {/* Indicador de match */}
      <Box 
        position="absolute" 
        top={0} 
        right={0} 
        bg={scoreBg} 
        px={3} 
        py={1} 
        borderBottomLeftRadius="md"
      >
        <HStack spacing={1}>
          <Icon as={FiPercent} fontSize="sm" />
          <Text fontWeight="bold" fontSize="sm">
            {matchScorePercent}% match
          </Text>
        </HStack>
      </Box>
      
      <VStack align="stretch" spacing={4}>
        {/* Cabeçalho */}
        <HStack>
          <Avatar 
            size="md" 
            name={match.user_info?.name || match.user_email} 
            src={match.user_info?.avatar_url} 
            bg="red.500"
          />
          <VStack align="start" spacing={0}>
            <Text fontWeight="bold">{match.user_info?.name || match.user_email}</Text>
            {match.user_info?.company && (
              <Text fontSize="sm" color="gray.500">
                {match.user_info.company} {match.user_info.role ? `• ${match.user_info.role}` : ''}
              </Text>
            )}
          </VStack>
        </HStack>
        
        {/* Conteúdo da referência */}
        <Box>
          <Text fontWeight="semibold" fontSize="lg" mb={2}>
            {match.title}
          </Text>
          <Text color="gray.600" noOfLines={3}>
            {match.description}
          </Text>
          
          {/* Data */}
          <Text fontSize="sm" color="gray.500" mt={2}>
            Publicado {formatDistanceToNow(new Date(match.created_at))}
          </Text>
        </Box>
        
        {/* Tags */}
        {match.matching_tags.length > 0 && (
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Tags em comum:
            </Text>
            <Flex wrap="wrap" gap={2}>
              {match.matching_tags.map((tag, index) => (
                <Tag key={index} size="sm" colorScheme={scoreColor} borderRadius="full">
                  <TagLabel>{tag}</TagLabel>
                </Tag>
              ))}
            </Flex>
          </Box>
        )}
        
        {/* Botão de ação */}
        <Button 
          rightIcon={<Icon as={FiMessageCircle} />} 
          colorScheme="brand" 
          onClick={() => onConnect(match)}
          size="sm"
        >
          Conectar
        </Button>
      </VStack>
    </Box>
  );
}
