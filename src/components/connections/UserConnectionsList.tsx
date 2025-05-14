'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Avatar,
  Divider,
  useToast,
  Skeleton,
  AlertIcon,
  Alert,
  Icon,
  Tag,
  TagLabel,
} from '@chakra-ui/react';
import { FiCheck, FiX, FiClock, FiSend, FiUser, FiMail, FiTag } from 'react-icons/fi';
import { getUserConnections, updateConnectionStatus } from '@/utils/connectionFunctions';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';

interface UserConnection {
  id: string;
  requester_email: string;
  target_email: string;
  request_id: string;
  target_request_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  created_at: string;
  updated_at: string;
  requester: {
    email: string;
    id: string;
  };
  target: {
    email: string;
    id: string;
  };
  requester_request: {
    title: string;
    description: string;
    tags: string;
  };
  target_request: {
    title: string;
    description: string;
    tags: string;
  };
}

export function UserConnectionsList() {
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    // Buscar o usuário atual
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserEmail(user.email);
      }
    };

    fetchCurrentUser();
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      setError(null);
      const connectionsData = await getUserConnections();
      setConnections(connectionsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao buscar conexões'));
      console.error('Erro ao buscar conexões:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (connectionId: string, status: 'accepted' | 'rejected') => {
    try {
      const result = await updateConnectionStatus(connectionId, status);
      
      if (result.success) {
        toast({
          title: status === 'accepted' ? 'Conexão aceita!' : 'Conexão rejeitada',
          description: result.message,
          status: status === 'accepted' ? 'success' : 'info',
          duration: 3000,
          isClosable: true,
        });
        
        // Atualiza localmente o status da conexão
        setConnections(prevConnections => 
          prevConnections.map(conn => 
            conn.id === connectionId ? { ...conn, status } : conn
          )
        );
      } else {
        toast({
          title: 'Erro ao atualizar status',
          description: result.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao processar solicitação',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Função auxiliar para verificar se o usuário atual é o alvo
  function isCurrentUserTarget(conn: UserConnection): boolean {
    return currentUserEmail === conn.target_email;
  }

  // Filtra conexões recebidas (onde o usuário atual é o alvo)
  const incomingConnections = connections.filter(conn => 
    conn.status === 'pending' && isCurrentUserTarget(conn)
  );

  // Filtra conexões enviadas (onde o usuário atual é o remetente)
  const outgoingConnections = connections.filter(conn => 
    conn.requester_email === currentUserEmail
  );

  // Filtra conexões aceitas
  const acceptedConnections = connections.filter(conn => 
    conn.status === 'accepted' && 
    (conn.requester_email === currentUserEmail || conn.target_email === currentUserEmail)
  );

  // Renderiza tags como componentes visuais
  const renderTags = (tagsString: string) => {
    if (!tagsString) return null;
    
    const tagArray = tagsString.split(',').map(tag => tag.trim());
    
    return (
      <HStack spacing={2} mt={2} wrap="wrap">
        {tagArray.map((tag, index) => (
          <Tag size="sm" key={index} colorScheme="blue" borderRadius="full">
            <TagLabel>{tag}</TagLabel>
          </Tag>
        ))}
      </HStack>
    );
  };

  const renderConnectionCard = (connection: UserConnection) => {
    const isTarget = isCurrentUserTarget(connection);
    const otherUser = isTarget ? connection.requester : connection.target;
    const userRequest = isTarget ? connection.target_request : connection.requester_request;
    const otherRequest = isTarget ? connection.requester_request : connection.target_request;
    
    return (
      <Card key={connection.id} variant="outline" mb={4}>
        <CardHeader pb={0}>
          <HStack justify="space-between">
            <HStack>
              <Avatar size="sm" name={otherUser.email.split('@')[0]} />
              <Box>
                <Text fontWeight="bold">{otherUser.email.split('@')[0]}</Text>
                <Text fontSize="xs" color="gray.500">
                  {formatDistanceToNow(new Date(connection.created_at), { 
                    addSuffix: true,
                    locale: ptBR
                  })}
                </Text>
              </Box>
            </HStack>
            <Badge 
              colorScheme={
                connection.status === 'accepted' ? 'green' : 
                connection.status === 'rejected' ? 'red' : 
                'yellow'
              }
            >
              {connection.status === 'accepted' ? 'Aceita' : 
               connection.status === 'rejected' ? 'Rejeitada' : 
               'Pendente'}
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody pt={2}>
          <VStack align="start" spacing={2}>
            <HStack>
              <Icon as={FiMail} color="gray.500" />
              <Text fontSize="sm">{otherUser.email}</Text>
            </HStack>
            
            <Box w="100%">
              <Text fontSize="sm" fontWeight="medium">Referência solicitada:</Text>
              <Text fontSize="sm">{userRequest?.title}</Text>
              {renderTags(userRequest?.tags)}
            </Box>
            
            <Box w="100%">
              <Text fontSize="sm" fontWeight="medium">Referência correspondente:</Text>
              <Text fontSize="sm">{otherRequest?.title}</Text>
              {renderTags(otherRequest?.tags)}
            </Box>
            
            {connection.message && (
              <Box w="100%" p={2} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" fontStyle="italic">"{connection.message}"</Text>
              </Box>
            )}
          </VStack>
        </CardBody>
        
        {connection.status === 'pending' && isCurrentUserTarget(connection) && (
          <CardFooter pt={0}>
            <HStack spacing={2}>
              <Button 
                leftIcon={<FiCheck />} 
                colorScheme="green" 
                size="sm"
                onClick={() => handleUpdateStatus(connection.id, 'accepted')}
              >
                Aceitar
              </Button>
              <Button 
                leftIcon={<FiX />} 
                colorScheme="red" 
                size="sm"
                onClick={() => handleUpdateStatus(connection.id, 'rejected')}
              >
                Rejeitar
              </Button>
            </HStack>
          </CardFooter>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <VStack spacing={4} w="full" align="stretch">
        <Skeleton height="80px" />
        <Skeleton height="120px" />
        <Skeleton height="120px" />
      </VStack>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Heading size="md" mb={6}>Gerenciamento de Conexões</Heading>
      
      <Tabs variant="soft-rounded" colorScheme="blue">
        <TabList>
          <Tab>Recebidas ({incomingConnections.length})</Tab>
          <Tab>Enviadas ({outgoingConnections.length})</Tab>
          <Tab>Aceitas ({acceptedConnections.length})</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            {incomingConnections.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Icon as={FiClock} fontSize="3xl" color="gray.400" mb={3} />
                <Text color="gray.500">Nenhuma solicitação de conexão pendente</Text>
              </Box>
            ) : (
              <VStack spacing={4} align="stretch">
                {incomingConnections.map(renderConnectionCard)}
              </VStack>
            )}
          </TabPanel>
          
          <TabPanel>
            {outgoingConnections.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Icon as={FiSend} fontSize="3xl" color="gray.400" mb={3} />
                <Text color="gray.500">Você ainda não enviou solicitações de conexão</Text>
              </Box>
            ) : (
              <VStack spacing={4} align="stretch">
                {outgoingConnections.map(renderConnectionCard)}
              </VStack>
            )}
          </TabPanel>
          
          <TabPanel>
            {acceptedConnections.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Icon as={FiUser} fontSize="3xl" color="gray.400" mb={3} />
                <Text color="gray.500">Nenhuma conexão estabelecida ainda</Text>
              </Box>
            ) : (
              <VStack spacing={4} align="stretch">
                {acceptedConnections.map(renderConnectionCard)}
              </VStack>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
