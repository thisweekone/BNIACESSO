"use client";

import {
  Box,
  Button,
  Heading,
  Text,
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
  Select,
  HStack,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  Input,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Spinner,
  Center,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FiSearch, FiFilter, FiMoreVertical, FiEdit, FiUserX, FiUserCheck, FiChevronDown } from 'react-icons/fi';

export default function GerenciarMembros() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  
  const toast = useToast();
  const supabase = createClientComponentClient();
  const bgColor = useColorModeValue('white', 'gray.800');
  
  useEffect(() => {
    fetchMembers();
  }, [filtroStatus]);
  
  async function fetchMembers() {
    try {
      setLoading(true);
      
      let query = supabase
        .from('members')
        .select('*');
      
      // Aplicar filtro por status
      if (filtroStatus !== 'todos') {
        query = query.eq('status', filtroStatus);
      }
      
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      
      setMembers(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar membros:', err);
      setError(err.message || 'Erro ao carregar membros');
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
      case 'inativo':
        return <Badge colorScheme="gray">Inativo</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  }
  
  function getRoleBadge(role: string) {
    switch(role) {
      case 'administrador_plataforma':
        return <Badge colorScheme="purple">Admin Plataforma</Badge>;
      case 'administrador_grupo':
        return <Badge colorScheme="blue">Admin Grupo</Badge>;
      case 'administrativo_grupo':
        return <Badge colorScheme="cyan">Admin. Grupo</Badge>;
      case 'membro':
        return <Badge colorScheme="teal">Membro</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  }
  
  async function handleStatusChange(memberId: string, newStatus: string) {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('members')
        .update({ 
          status: newStatus,
          ...(newStatus === 'aprovado' ? { approved_at: new Date().toISOString() } : {})
        })
        .eq('id', memberId);
      
      if (error) throw error;
      
      toast({
        title: 'Status atualizado',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      fetchMembers();
    } catch (err: any) {
      console.error('Erro ao atualizar status:', err);
      toast({
        title: 'Erro ao atualizar status',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Gerenciar Membros</Heading>
        <Button
          colorScheme="brand"
          onClick={() => fetchMembers()}
          isLoading={loading}
        >
          Atualizar
        </Button>
      </Flex>
      
      {/* Filtros */}
      <Flex mb={6} wrap={{ base: "wrap", md: "nowrap" }} gap={4}>
        <InputGroup flex={{ base: '1 0 100%', md: '1' }}>
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="gray.300" />
          </InputLeftElement>
          <Input 
            placeholder="Buscar por nome ou email" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchMembers()}
          />
        </InputGroup>
        
        <HStack spacing={4}>
          <Select
            placeholder="Status"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            icon={<FiChevronDown />}
            w={{ base: 'full', md: '180px' }}
          >
            <option value="todos">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="aprovado">Aprovado</option>
            <option value="rejeitado">Rejeitado</option>
            <option value="inativo">Inativo</option>
          </Select>
          
          <Button 
            leftIcon={<Icon as={FiFilter} />} 
            variant="outline" 
            onClick={fetchMembers}
          >
            Filtrar
          </Button>
        </HStack>
      </Flex>
      
      {/* Lista de membros */}
      <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="sm">
        {loading ? (
          <Center py={10}>
            <Spinner size="xl" color="brand.500" />
          </Center>
        ) : members.length === 0 ? (
          <Text textAlign="center" py={10}>Nenhum membro encontrado com os filtros selecionados.</Text>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Nome</Th>
                  <Th>Email</Th>
                  <Th>Especialidade</Th>
                  <Th>Status</Th>
                  <Th>Perfil</Th>
                  <Th>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {members.map((member) => (
                  <Tr key={member.id}>
                    <Td>{member.name}</Td>
                    <Td>{member.email}</Td>
                    <Td>{member.specialty}</Td>
                    <Td>{getStatusBadge(member.status)}</Td>
                    <Td>{getRoleBadge(member.role)}</Td>
                    <Td>
                      <Menu>
                        <MenuButton as={Button} variant="ghost" size="sm">
                          <Icon as={FiMoreVertical} />
                        </MenuButton>
                        <MenuList>
                          <MenuItem 
                            icon={<Icon as={FiEdit} />}
                            onClick={() => {
                              toast({
                                title: 'Função em desenvolvimento',
                                description: 'Edição de perfil será implementada em breve',
                                status: 'info',
                                duration: 3000,
                                isClosable: true,
                              });
                            }}
                          >
                            Editar Perfil
                          </MenuItem>
                          <MenuItem 
                            icon={<Icon as={FiUserCheck} />}
                            isDisabled={member.status === 'aprovado'}
                            onClick={() => handleStatusChange(member.id, 'aprovado')}
                          >
                            Aprovar
                          </MenuItem>
                          <MenuItem 
                            icon={<Icon as={FiUserX} />}
                            isDisabled={member.status === 'inativo'}
                            onClick={() => {
                              setSelectedMember(member);
                              onOpen();
                            }}
                          >
                            Inativar
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>
      
      {/* Diálogo de confirmação para inativar membro */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Inativar Membro
            </AlertDialogHeader>

            <AlertDialogBody>
              Tem certeza que deseja inativar o membro {selectedMember?.name}? Esta ação pode ser revertida posteriormente.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                colorScheme="red" 
                onClick={() => {
                  if (selectedMember) {
                    handleStatusChange(selectedMember.id, 'inativo');
                    onClose();
                  }
                }} 
                ml={3}
              >
                Inativar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
