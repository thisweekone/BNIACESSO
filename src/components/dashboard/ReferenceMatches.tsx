'use client';

import { useState, useEffect } from 'react';
import {
  VStack,
  Box,
  Text,
  Button,
  SimpleGrid,
  Skeleton,
  Alert,
  AlertIcon,
  HStack,
  Icon,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
} from '@chakra-ui/react';
import { FiRefreshCw, FiSearch } from 'react-icons/fi';
import { ReferenceMatch } from '@/types/references';
import { findMatchesForRequest, getUserInfoForMatches } from '@/utils/matchFunctions';
import { ReferenceMatchCard } from './ReferenceMatchCard';

interface ReferenceMatchesProps {
  requestId: string;
}

export function ReferenceMatches({ requestId }: ReferenceMatchesProps) {
  const [matches, setMatches] = useState<ReferenceMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (requestId) {
      fetchMatches();
    }
  }, [requestId]);

  const fetchMatches = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Busca matches para a solicitação
      let matchesData = [];
      try {
        matchesData = await findMatchesForRequest(requestId);
      } catch (matchError) {
        console.error('Erro ao buscar matches:', matchError);
        throw matchError;
      }
      
      if (matchesData.length > 0) {
        try {
          // Busca informações dos usuários para enriquecer os matches
          const userEmails = matchesData.map(match => match.user_email);
          const userInfo = await getUserInfoForMatches(userEmails);
          
          // Adiciona informações de usuário aos matches
          const enrichedMatches = matchesData.map(match => ({
            ...match,
            user_info: userInfo[match.user_email]
          }));
          
          setMatches(enrichedMatches);
        } catch (userInfoError) {
          // Se falhar ao obter informções do usuário, ainda mostra os matches com info básica
          console.warn('Erro ao obter info dos usuários, mostrando matches básicos:', userInfoError);
          
          const basicMatches = matchesData.map(match => ({
            ...match,
            user_info: {
              name: match.user_email.split('@')[0].replace(/[\._]/g, ' '),
              email: match.user_email
            }
          }));
          
          setMatches(basicMatches);
        }
      } else {
        setMatches([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido ao buscar matches'));
      console.error('Erro ao buscar matches:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<ReferenceMatch | null>(null);
  const [connectionMessage, setConnectionMessage] = useState('');
  const [connecting, setConnecting] = useState(false);

  // Importar a função de conexão
  const { createUserConnection } = require('@/utils/connectionFunctions');

  const handleConnect = (match: ReferenceMatch) => {
    setSelectedMatch(match);
    // Mensagem padrão baseada nas tags em comum
    const defaultMessage = `Olá! Vi que temos interesses em comum relacionados a tags como ${match.matching_tags.join(', ')}. Gostaria de conectar para trocarmos mais informações.`;
    setConnectionMessage(defaultMessage);
    setIsConnectModalOpen(true);
  };

  const closeConnectModal = () => {
    setIsConnectModalOpen(false);
    setSelectedMatch(null);
    setConnectionMessage('');
  };

  const submitConnection = async () => {
    if (!selectedMatch) return;
    
    try {
      setConnecting(true);
      
      const result = await createUserConnection(
        requestId,
        selectedMatch,
        connectionMessage
      );
      
      if (result.success) {
        toast({
          title: 'Solicitação enviada!',
          description: `Uma solicitação de conexão foi enviada para ${selectedMatch.user_info?.name || selectedMatch.user_email}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        closeConnectModal();
      } else {
        toast({
          title: 'Aviso',
          description: result.message,
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao conectar',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setConnecting(false);
    }
  };

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
        <Icon as={FiSearch} fontSize="4xl" color="gray.400" mb={4} />
        <Text color="gray.500" fontWeight="medium">
          Nenhum match encontrado para esta solicitação.
        </Text>
        <Text color="gray.500" fontSize="sm" mt={2} mb={4}>
          Tente adicionar mais tags relevantes à sua solicitação ou aguardar novas postagens.
        </Text>
        <Button
          leftIcon={<Icon as={FiRefreshCw} />}
          size="sm"
          onClick={() => fetchMatches(true)}
          isLoading={refreshing}
        >
          Buscar Novamente
        </Button>
      </Box>
    );
  }

  return (
    <VStack spacing={4} w="full">
      <HStack w="full" justify="flex-end">
        <Button
          leftIcon={<Icon as={FiRefreshCw} />}
          size="sm"
          onClick={() => fetchMatches(true)}
          isLoading={refreshing}
        >
          Atualizar Matches
        </Button>
      </HStack>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4} w="full">
        {matches.map((match) => (
          <ReferenceMatchCard
            key={match.request_id}
            match={match}
            onConnect={() => handleConnect(match)}
          />
        ))}
      </SimpleGrid>

      {/* Modal de Conexão */}
      <Modal isOpen={isConnectModalOpen} onClose={closeConnectModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Conectar com {selectedMatch?.user_info?.name || selectedMatch?.user_email}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text mb={4}>
              Você está prestes a enviar uma solicitação de conexão para{' '}
              <strong>{selectedMatch?.user_info?.name || selectedMatch?.user_email}</strong>.
            </Text>
            <Text mb={4} fontSize="sm">
              Tags em comum: {selectedMatch?.matching_tags?.join(', ')}
            </Text>
            <FormControl>
              <FormLabel>Mensagem</FormLabel>
              <Textarea
                value={connectionMessage}
                onChange={(e) => setConnectionMessage(e.target.value)}
                placeholder="Escreva uma mensagem personalizada..."
                rows={5}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button 
              colorScheme="blue" 
              mr={3} 
              onClick={submitConnection}
              isLoading={connecting}
            >
              Enviar Solicitação
            </Button>
            <Button onClick={closeConnectModal}>Cancelar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
