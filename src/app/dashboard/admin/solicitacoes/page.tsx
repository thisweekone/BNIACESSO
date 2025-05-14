"use client";

import {
  Box,
  Button,
  HStack,
  VStack,
  Text,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
  Flex,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Alert,
  AlertIcon,
  Spinner,
  useColorModeValue
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FiCheck, FiX, FiInfo, FiUser, FiMail, FiPhone, FiCalendar } from 'react-icons/fi';

export default function SolicitacoesCadastro() {
  const [requests, setRequests] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    group_id: '',
    role: 'membro', // Valor padrão para o perfil de acesso
    rejection_reason: '',
  });
  
  const { isOpen: isApproveOpen, onOpen: onApproveOpen, onClose: onApproveClose } = useDisclosure();
  const { isOpen: isRejectOpen, onOpen: onRejectOpen, onClose: onRejectClose } = useDisclosure();
  const toast = useToast();
  const supabase = createClientComponentClient();
  const bgColor = useColorModeValue('white', 'gray.800');

  // Verificar se o usuário tem permissão de administrador
  useEffect(() => {
    async function checkAdminRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError('Usuário não autenticado');
          setLoading(false);
          return;
        }
        
        // Buscar papel do usuário
        const { data: userData, error: userError } = await supabase
          .from('members')
          .select('role')
          .eq('email', user.email)
          .single();
          
        if (userError) {
          setError('Erro ao verificar permissões');
          setLoading(false);
          return;
        }
        
        if (!userData || !['administrador_plataforma', 'administrador_grupo', 'administrativo_grupo'].includes(userData.role)) {
          setError('Você não tem permissão para acessar esta página');
          setLoading(false);
          return;
        }
        
        setAdminRole(userData.role);
        
        // Se chegou aqui, o usuário tem permissão
        fetchRequests();
        fetchGroups();
      } catch (err) {
        console.error('Erro ao verificar permissões:', err);
        setError('Erro ao verificar permissões de acesso');
        setLoading(false);
      }
    }
    
    checkAdminRole();
  }, []);
  
  async function fetchRequests() {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('registration_requests')
        .select('*, groups(name)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setRequests(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar solicitações:', err);
      setError(err.message || 'Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  }
  
  async function fetchGroups() {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      
      setGroups(data || []);
    } catch (err) {
      console.error('Erro ao buscar grupos:', err);
    }
  }
  
  function handleApproveClick(request: any) {
    setSelectedRequest(request);
    setFormData({ ...formData, group_id: request.group_id || '' });
    onApproveOpen();
  }
  
  function handleRejectClick(request: any) {
    setSelectedRequest(request);
    setFormData({ ...formData, rejection_reason: '' });
    onRejectOpen();
  }
  
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }
  
  async function handleApprove() {
    if (!selectedRequest) return;
    
    try {
      setLoading(true);
      
      // Gerar senha temporária aleatória
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4);
      
      // 1. Usar nossa nova API para criar o usuário com permissões de admin
      const response = await fetch('/api/admin/approve-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: selectedRequest.email,
          password: tempPassword,
          memberData: {
            name: selectedRequest.name,
            email: selectedRequest.email,
            phone: selectedRequest.phone,
            status: 'aprovado',
            role: formData.role,
            specialty: 'Não informado', // Adicionando o campo obrigatório
            group_id: formData.group_id || null,
            approved_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          }
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar usuário');
      }
      
      // 2. Atualizar status da solicitação
      const { error: updateError } = await supabase
        .from('registration_requests')
        .update({ status: 'aprovado' })
        .eq('id', selectedRequest.id);
      
      if (updateError) throw updateError;
      
      // 3. Enviar email com a senha temporária usando nossa API
      const emailResponse = await fetch('/api/email/send-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: selectedRequest.email,
          password: tempPassword,
          name: selectedRequest.name
        }),
      });
      
      if (!emailResponse.ok) {
        const emailError = await emailResponse.json();
        console.error('Erro ao enviar email:', emailError);
        // Continuamos mesmo com erro no email, pois o usuário já foi criado
      }
      
      console.log(`Email enviado para ${selectedRequest.email} com a senha temporária.`);
      
      toast({
        title: 'Membro aprovado com sucesso!',
        description: `Um email foi enviado para ${selectedRequest.email} com instruções para acessar a plataforma.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      onApproveClose();
      fetchRequests();
    } catch (err: any) {
      console.error('Erro ao aprovar membro:', err);
      toast({
        title: 'Erro ao aprovar membro',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }
  
  async function handleReject() {
    if (!selectedRequest) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('registration_requests')
        .update({
          status: 'rejeitado',
          notes: formData.rejection_reason
        })
        .eq('id', selectedRequest.id);
      
      if (error) throw error;
      
      toast({
        title: 'Solicitação rejeitada',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      
      onRejectClose();
      fetchRequests();
    } catch (err: any) {
      console.error('Erro ao rejeitar solicitação:', err);
      toast({
        title: 'Erro ao rejeitar solicitação',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }
  
  function getStatusBadge(status: string) {
    switch(status) {
      case 'pendente':
        return <Badge colorScheme="yellow">Pendente</Badge>;
      case 'aprovado':
        return <Badge colorScheme="green">Aprovado</Badge>;
      case 'rejeitado':
        return <Badge colorScheme="red">Rejeitado</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  }
  
  if (error) {
    return (
      <Box p={5}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }
  
  if (loading && requests.length === 0) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Solicitações de Cadastro</Heading>
        <Button
          colorScheme="brand"
          onClick={() => fetchRequests()}
          isLoading={loading}
        >
          Atualizar
        </Button>
      </Flex>
      
      <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="sm">
        {requests.length === 0 ? (
          <Text textAlign="center" py={10}>Nenhuma solicitação de cadastro disponível.</Text>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Nome</Th>
                  <Th>Email</Th>
                  <Th>Telefone</Th>
                  <Th>Data</Th>
                  <Th>Status</Th>
                  <Th>Grupo</Th>
                  <Th>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {requests.map((request) => (
                  <Tr key={request.id}>
                    <Td>{request.name}</Td>
                    <Td>{request.email}</Td>
                    <Td>{request.phone}</Td>
                    <Td>{new Date(request.created_at).toLocaleDateString()}</Td>
                    <Td>{getStatusBadge(request.status)}</Td>
                    <Td>{request.groups?.name || 'Não associado'}</Td>
                    <Td>
                      <HStack spacing={2}>
                        {request.status === 'pendente' && (
                          <>
                            <Button
                              size="sm"
                              colorScheme="green"
                              leftIcon={<Icon as={FiCheck} />}
                              onClick={() => handleApproveClick(request)}
                            >
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="red"
                              leftIcon={<Icon as={FiX} />}
                              onClick={() => handleRejectClick(request)}
                            >
                              Rejeitar
                            </Button>
                          </>
                        )}
                        {request.status !== 'pendente' && (
                          <Button
                            size="sm"
                            colorScheme="blue"
                            leftIcon={<Icon as={FiInfo} />}
                            onClick={() => {
                              setSelectedRequest(request);
                              toast({
                                title: 'Detalhes da Solicitação',
                                description: `Status: ${request.status}\nNotas: ${request.notes || 'Nenhuma nota adicional'}`,
                                status: 'info',
                                duration: 5000,
                                isClosable: true,
                              });
                            }}
                          >
                            Detalhes
                          </Button>
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>
      
      {/* Modal de Aprovação */}
      <Modal isOpen={isApproveOpen} onClose={onApproveClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Aprovar Solicitação</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRequest && (
              <VStack spacing={4} align="start">
                <HStack>
                  <Icon as={FiUser} color="gray.500" />
                  <Text fontWeight="bold">{selectedRequest.name}</Text>
                </HStack>
                
                <HStack>
                  <Icon as={FiMail} color="gray.500" />
                  <Text>{selectedRequest.email}</Text>
                </HStack>
                
                <HStack>
                  <Icon as={FiPhone} color="gray.500" />
                  <Text>{selectedRequest.phone}</Text>
                </HStack>
                
                <HStack>
                  <Icon as={FiCalendar} color="gray.500" />
                  <Text>{new Date(selectedRequest.created_at).toLocaleDateString()}</Text>
                </HStack>
                
                <FormControl>
                  <FormLabel>Associar ao Grupo</FormLabel>
                  <Select 
                    name="group_id"
                    value={formData.group_id}
                    onChange={handleChange}
                  >
                    <option value="">Selecione um grupo</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Perfil de Acesso</FormLabel>
                  <Select 
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="membro">Membro</option>
                    <option value="moderador_grupo">Moderador de Grupo</option>
                    <option value="administrativo_grupo">Administrador de Grupo</option>
                    {adminRole === 'administrador_plataforma' && (
                      <option value="administrador_plataforma">Administrador da Plataforma</option>
                    )}
                  </Select>
                </FormControl>
                
                <Alert status="info">
                  <AlertIcon />
                  Um email será enviado ao novo membro com instruções para acessar a plataforma.
                </Alert>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onApproveClose}>
              Cancelar
            </Button>
            <Button colorScheme="green" onClick={handleApprove} isLoading={loading}>
              Confirmar Aprovação
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Modal de Rejeição */}
      <Modal isOpen={isRejectOpen} onClose={onRejectClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Rejeitar Solicitação</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRequest && (
              <VStack spacing={4} align="start">
                <Text>
                  Tem certeza que deseja rejeitar a solicitação de <strong>{selectedRequest.name}</strong>?
                </Text>
                
                <FormControl isRequired>
                  <FormLabel>Motivo da Rejeição</FormLabel>
                  <Textarea 
                    name="rejection_reason"
                    value={formData.rejection_reason}
                    onChange={handleChange}
                    placeholder="Informe o motivo da rejeição"
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRejectClose}>
              Cancelar
            </Button>
            <Button colorScheme="red" onClick={handleReject} isLoading={loading}>
              Confirmar Rejeição
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
