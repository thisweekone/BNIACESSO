"use client";

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  Badge,
  Button,
  Divider,
  useColorModeValue,
  Card,
  CardBody,
  Avatar,
  Icon,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Skeleton,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import { FiMail, FiCheck, FiMessageSquare, FiPhone } from 'react-icons/fi';
import { getMyContactMessages, markMessageAsRead, ContactMessage } from '@/utils/messagesFunctions';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  useEffect(() => {
    fetchMessages();
  }, []);
  
  async function fetchMessages() {
    try {
      setLoading(true);
      const messagesData = await getMyContactMessages();
      setMessages(messagesData);
    } catch (err: any) {
      console.error('Erro ao buscar mensagens:', err);
      setError(err.message || 'Erro ao buscar mensagens');
    } finally {
      setLoading(false);
    }
  }
  
  async function handleMarkAsRead(message: ContactMessage) {
    if (!message.id || message.is_read) return;
    
    try {
      const updatedMessage = await markMessageAsRead(message.id);
      
      // Atualiza a lista de mensagens
      setMessages(prev => 
        prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
      );
      
      // Se estivermos visualizando esta mensagem, atualizamos o estado também
      if (selectedMessage?.id === message.id) {
        setSelectedMessage(updatedMessage);
      }
      
    } catch (err) {
      console.error('Erro ao marcar mensagem como lida:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar a mensagem como lida',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }
  
  function handleViewMessage(message: ContactMessage) {
    setSelectedMessage(message);
    onOpen();
    
    // Se a mensagem não foi lida, marca como lida
    if (message.id && !message.is_read) {
      handleMarkAsRead(message);
    }
  }
  
  // Função para responder por email
  function handleReplyByEmail() {
    if (!selectedMessage) return;
    
    window.open(`mailto:${selectedMessage.sender_email}?subject=Re: Contato via BNI ACESSO`, '_blank');
    onClose();
  }
  
  // Função para responder por WhatsApp
  function handleReplyByWhatsApp() {
    if (!selectedMessage || !selectedMessage.sender_whatsapp) return;
    
    // Limpa o número de telefone para ter apenas dígitos
    const cleanPhone = selectedMessage.sender_whatsapp.replace(/\D/g, '');
    
    // Adiciona o código do país se não estiver presente
    const whatsappNumber = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    
    window.open(`https://wa.me/${whatsappNumber}`, '_blank');
    onClose();
  }
  
  const unreadCount = messages.filter(msg => !msg.is_read).length;
  
  // Separar mensagens lidas e não lidas
  const unreadMessages = messages.filter(msg => !msg.is_read);
  const readMessages = messages.filter(msg => msg.is_read);
  
  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Heading size="lg" mb={6}>Minhas Mensagens</Heading>
        <VStack spacing={4} align="stretch">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardBody>
                <Skeleton height="20px" mb={2} />
                <Skeleton height="20px" width="60%" />
              </CardBody>
            </Card>
          ))}
        </VStack>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Heading size="lg" mb={6}>Minhas Mensagens</Heading>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.xl" py={8}>
      <Heading size="lg" mb={2}>Minhas Mensagens</Heading>
      <Text color="gray.600" mb={6}>
        Visualize e responda às mensagens que você recebeu no marketplace
      </Text>
      
      {messages.length === 0 ? (
        <Card>
          <CardBody textAlign="center" py={10}>
            <Icon as={FiMail} boxSize={12} color="gray.400" mb={4} />
            <Heading size="md" mb={2} color="gray.500">Nenhuma mensagem recebida</Heading>
            <Text color="gray.500">
              Quando alguém enviar uma mensagem para você pelo marketplace, ela aparecerá aqui.
            </Text>
          </CardBody>
        </Card>
      ) : (
        <Tabs variant="enclosed" colorScheme="red">
          <TabList>
            <Tab>
              Todas ({messages.length})
            </Tab>
            <Tab>
              Não lidas {unreadCount > 0 && <Badge ml={2} colorScheme="red" borderRadius="full">{unreadCount}</Badge>}
            </Tab>
            <Tab>
              Lidas ({readMessages.length})
            </Tab>
          </TabList>
          
          <TabPanels>
            {/* Todas as mensagens */}
            <TabPanel p={0} pt={4}>
              <VStack spacing={4} align="stretch">
                {messages.map(message => (
                  <MessageCard 
                    key={message.id} 
                    message={message} 
                    onView={handleViewMessage} 
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))}
              </VStack>
            </TabPanel>
            
            {/* Mensagens não lidas */}
            <TabPanel p={0} pt={4}>
              {unreadMessages.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Icon as={FiCheck} boxSize={10} color="green.500" mb={4} />
                  <Text color="gray.600">Nenhuma mensagem não lida.</Text>
                </Box>
              ) : (
                <VStack spacing={4} align="stretch">
                  {unreadMessages.map(message => (
                    <MessageCard 
                      key={message.id} 
                      message={message} 
                      onView={handleViewMessage} 
                      onMarkAsRead={handleMarkAsRead}
                    />
                  ))}
                </VStack>
              )}
            </TabPanel>
            
            {/* Mensagens lidas */}
            <TabPanel p={0} pt={4}>
              {readMessages.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Text color="gray.600">Nenhuma mensagem lida.</Text>
                </Box>
              ) : (
                <VStack spacing={4} align="stretch">
                  {readMessages.map(message => (
                    <MessageCard 
                      key={message.id} 
                      message={message} 
                      onView={handleViewMessage} 
                      onMarkAsRead={handleMarkAsRead}
                    />
                  ))}
                </VStack>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
      
      {/* Modal de visualização da mensagem */}
      {selectedMessage && (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
          <ModalOverlay />
          <ModalContent borderRadius="xl">
            <ModalHeader>
              Mensagem de {selectedMessage.sender_name}
              {!selectedMessage.is_read && (
                <Badge ml={2} colorScheme="red" variant="solid">Nova</Badge>
              )}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack align="stretch" spacing={4}>
                <Flex gap={4}>
                  <Avatar size="md" name={selectedMessage.sender_name} bg="red.500" color="white" />
                  <Box>
                    <Heading size="sm">{selectedMessage.sender_name}</Heading>
                    <HStack mt={1} color="gray.600" fontSize="sm">
                      <Icon as={FiMail} />
                      <Text>{selectedMessage.sender_email}</Text>
                    </HStack>
                    {selectedMessage.sender_whatsapp && (
                      <HStack mt={1} color="gray.600" fontSize="sm">
                        <Icon as={FiPhone} />
                        <Text>{selectedMessage.sender_whatsapp}</Text>
                      </HStack>
                    )}
                    {selectedMessage.created_at && (
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        Recebido há {formatDistanceToNow(new Date(selectedMessage.created_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </Text>
                    )}
                  </Box>
                </Flex>
                
                <Divider />
                
                <FormControl>
                  <FormLabel fontWeight="bold">Mensagem:</FormLabel>
                  <Box
                    p={4}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="md"
                    bg={bgColor}
                    whiteSpace="pre-wrap"
                  >
                    {selectedMessage.message}
                  </Box>
                </FormControl>
              </VStack>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Fechar
              </Button>
              <Button 
                colorScheme="red" 
                mr={3}
                onClick={handleReplyByEmail}
                leftIcon={<FiMail />}
              >
                Responder por Email
              </Button>
              {selectedMessage.sender_whatsapp && (
                <Button 
                  colorScheme="green" 
                  onClick={handleReplyByWhatsApp}
                  leftIcon={<FiMessageSquare />}
                >
                  Responder por WhatsApp
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}

// Componente de card de mensagem
function MessageCard({ 
  message, 
  onView, 
  onMarkAsRead 
}: { 
  message: ContactMessage, 
  onView: (message: ContactMessage) => void,
  onMarkAsRead: (message: ContactMessage) => void
}) {
  const isUnread = !message.is_read;
  const bgColor = useColorModeValue(isUnread ? 'red.50' : 'white', isUnread ? 'red.900' : 'gray.800');
  const borderColor = useColorModeValue(isUnread ? 'red.200' : 'gray.200', isUnread ? 'red.700' : 'gray.700');
  const hoverBg = useColorModeValue(isUnread ? 'red.100' : 'gray.50', isUnread ? 'red.800' : 'gray.700');
  
  // Formatação da data
  const formattedDate = message.created_at 
    ? formatDistanceToNow(new Date(message.created_at), { 
        addSuffix: true,
        locale: ptBR
      }) 
    : '';
  
  return (
    <Card
      borderWidth="1px"
      borderColor={borderColor}
      bg={bgColor}
      _hover={{ bg: hoverBg }}
      transition="all 0.2s"
      position="relative"
      overflow="hidden"
    >
      {isUnread && (
        <Box position="absolute" left={0} top={0} bottom={0} width="4px" bg="red.500" />
      )}
      
      <CardBody>
        <Flex justify="space-between" align="center">
          <HStack spacing={4}>
            <Avatar size="sm" name={message.sender_name} bg={isUnread ? 'red.500' : 'gray.500'} />
            <VStack align="start" spacing={0}>
              <Heading size="sm" fontWeight={isUnread ? 'bold' : 'medium'}>
                {message.sender_name}
                {isUnread && <Badge ml={2} colorScheme="red" fontSize="xs">Nova</Badge>}
              </Heading>
              <Text fontSize="sm" color="gray.600" noOfLines={1} maxW="500px">
                {message.message}
              </Text>
            </VStack>
          </HStack>
          
          <HStack>
            <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
              {formattedDate}
            </Text>
            
            <Button 
              size="sm"
              variant="ghost"
              colorScheme="blue"
              onClick={() => onView(message)}
            >
              Ver
            </Button>
            
            {isUnread && (
              <Button
                size="sm"
                variant="ghost"
                colorScheme="green"
                onClick={() => onMarkAsRead(message)}
                title="Marcar como lida"
              >
                <Icon as={FiCheck} />
              </Button>
            )}
          </HStack>
        </Flex>
      </CardBody>
    </Card>
  );
}
