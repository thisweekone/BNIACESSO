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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useDisclosure,
  VStack,
  Divider,
  Card,
  CardBody,
  CardHeader,
  Avatar,
  Wrap,
  WrapItem
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FiSearch, FiPlus, FiMoreVertical, FiEdit, FiTrash2, FiUser, FiUsers } from 'react-icons/fi';

export default function GerenciarGrupos() {
  const [grupos, setGrupos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [novoGrupo, setNovoGrupo] = useState({ nome: '', cidade: '', estado: '' });
  const [membrosGrupo, setMembrosGrupo] = useState<any[]>([]);
  
  const { isOpen: isGroupModalOpen, onOpen: onGroupModalOpen, onClose: onGroupModalClose } = useDisclosure();
  const { isOpen: isMembersModalOpen, onOpen: onMembersModalOpen, onClose: onMembersModalClose } = useDisclosure();
  
  const toast = useToast();
  const supabase = createClientComponentClient();
  const bgColor = useColorModeValue('white', 'gray.800');
  
  useEffect(() => {
    fetchGrupos();
  }, []);
  
  async function fetchGrupos() {
    try {
      setLoading(true);
      
      let query = supabase
        .from('groups')
        .select('*');
      
      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,cidade.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query.order('nome');
      
      if (error) throw error;
      
      // Se não encontrar nenhum grupo, vamos criar um grupo inicial
      if (!data || data.length === 0) {
        // Grupos de exemplo para demonstração da interface
        const exemplos = [
          { nome: 'BNI Sucesso', cidade: 'São Paulo', estado: 'SP', membros: 24 },
          { nome: 'BNI Conquista', cidade: 'Rio de Janeiro', estado: 'RJ', membros: 18 },
          { nome: 'BNI Vitória', cidade: 'Belo Horizonte', estado: 'MG', membros: 15 }
        ];
        setGrupos(exemplos);
      } else {
        setGrupos(data);
      }
      
    } catch (err: any) {
      console.error('Erro ao buscar grupos:', err);
      setError(err.message || 'Erro ao carregar grupos');
      
      // Grupos de exemplo para demonstração da interface
      const exemplos = [
        { nome: 'BNI Sucesso', cidade: 'São Paulo', estado: 'SP', membros: 24 },
        { nome: 'BNI Conquista', cidade: 'Rio de Janeiro', estado: 'RJ', membros: 18 },
        { nome: 'BNI Vitória', cidade: 'Belo Horizonte', estado: 'MG', membros: 15 }
      ];
      setGrupos(exemplos);
      
    } finally {
      setLoading(false);
    }
  }
  
  async function fetchMembrosGrupo(groupId: string) {
    try {
      setLoading(true);
      
      // Simulando dados de membros para um grupo
      // Em produção, isso seria buscado do banco de dados
      const membrosSimulados = [
        { id: 1, name: 'João Silva', email: 'joao@example.com', role: 'membro', specialty: 'Advocacia' },
        { id: 2, name: 'Maria Oliveira', email: 'maria@example.com', role: 'administrador_grupo', specialty: 'Contabilidade' },
        { id: 3, name: 'Pedro Santos', email: 'pedro@example.com', role: 'membro', specialty: 'Marketing Digital' },
        { id: 4, name: 'Ana Costa', email: 'ana@example.com', role: 'membro', specialty: 'Recursos Humanos' }
      ];
      
      setMembrosGrupo(membrosSimulados);
      
    } catch (err: any) {
      console.error('Erro ao buscar membros do grupo:', err);
      toast({
        title: 'Erro ao carregar membros',
        description: err.message || 'Não foi possível carregar os membros do grupo',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }
  
  function handleGroupClick(grupo: any) {
    setSelectedGroup(grupo);
    fetchMembrosGrupo(grupo.id);
    onMembersModalOpen();
  }
  
  function handleCreateGroup() {
    toast({
      title: 'Funcionalidade em desenvolvimento',
      description: 'A criação de novos grupos será implementada em breve',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    onGroupModalClose();
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
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Gerenciar Grupos</Heading>
        <Button
          colorScheme="brand"
          leftIcon={<Icon as={FiPlus} />}
          onClick={onGroupModalOpen}
        >
          Novo Grupo
        </Button>
      </Flex>
      
      {/* Filtros */}
      <Flex mb={6} wrap={{ base: "wrap", md: "nowrap" }} gap={4}>
        <InputGroup flex={{ base: '1 0 100%', md: '1' }}>
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="gray.300" />
          </InputLeftElement>
          <Input 
            placeholder="Buscar por nome ou cidade" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchGrupos()}
          />
        </InputGroup>
        
        <Button 
          onClick={fetchGrupos}
          isLoading={loading}
        >
          Buscar
        </Button>
      </Flex>
      
      {/* Lista de grupos */}
      <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="sm">
        {loading ? (
          <Center py={10}>
            <Spinner size="xl" color="brand.500" />
          </Center>
        ) : grupos.length === 0 ? (
          <Text textAlign="center" py={10}>Nenhum grupo encontrado.</Text>
        ) : (
          <Flex flexWrap="wrap" gap={6}>
            {grupos.map((grupo, index) => (
              <Card 
                key={index} 
                maxW="sm" 
                cursor="pointer" 
                onClick={() => handleGroupClick(grupo)}
                _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
                transition="all 0.2s"
              >
                <CardHeader pb={0}>
                  <Flex justify="space-between" align="center">
                    <Heading size="md">{grupo.nome}</Heading>
                    <Badge colorScheme="green">{grupo.membros || 0} membros</Badge>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <Text color="gray.500">{grupo.cidade}, {grupo.estado}</Text>
                  <Flex mt={4} justifyContent="flex-end">
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        leftIcon={<Icon as={FiUsers} />}
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGroupClick(grupo);
                        }}
                      >
                        Ver Membros
                      </Button>
                      <Menu>
                        <MenuButton 
                          as={Button} 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Icon as={FiMoreVertical} />
                        </MenuButton>
                        <MenuList onClick={(e) => e.stopPropagation()}>
                          <MenuItem icon={<Icon as={FiEdit} />}>Editar</MenuItem>
                          <MenuItem icon={<Icon as={FiTrash2} />} color="red.500">Excluir</MenuItem>
                        </MenuList>
                      </Menu>
                    </HStack>
                  </Flex>
                </CardBody>
              </Card>
            ))}
          </Flex>
        )}
      </Box>
      
      {/* Modal para criar novo grupo */}
      <Modal isOpen={isGroupModalOpen} onClose={onGroupModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Criar Novo Grupo</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nome do Grupo</FormLabel>
                <Input 
                  placeholder="Ex: BNI Sucesso"
                  value={novoGrupo.nome}
                  onChange={(e) => setNovoGrupo({...novoGrupo, nome: e.target.value})}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Cidade</FormLabel>
                <Input 
                  placeholder="Ex: São Paulo"
                  value={novoGrupo.cidade}
                  onChange={(e) => setNovoGrupo({...novoGrupo, cidade: e.target.value})}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Estado (UF)</FormLabel>
                <Input 
                  placeholder="Ex: SP"
                  value={novoGrupo.estado}
                  onChange={(e) => setNovoGrupo({...novoGrupo, estado: e.target.value})}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onGroupModalClose}>Cancelar</Button>
            <Button 
              colorScheme="brand" 
              onClick={handleCreateGroup}
              isDisabled={!novoGrupo.nome || !novoGrupo.cidade || !novoGrupo.estado}
            >
              Criar Grupo
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Modal para visualizar membros do grupo */}
      <Modal isOpen={isMembersModalOpen} onClose={onMembersModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Membros do Grupo: {selectedGroup?.nome}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {membrosGrupo.length === 0 ? (
              <Text textAlign="center" py={5}>Nenhum membro neste grupo</Text>
            ) : (
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Nome</Th>
                    <Th>Papel</Th>
                    <Th>Especialidade</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {membrosGrupo.map((membro) => (
                    <Tr key={membro.id}>
                      <Td>
                        <Flex align="center">
                          <Avatar size="xs" name={membro.name} mr={2} />
                          <Text fontWeight={membro.role === 'administrador_grupo' ? 'bold' : 'normal'}>
                            {membro.name}
                          </Text>
                        </Flex>
                      </Td>
                      <Td>{getRoleBadge(membro.role)}</Td>
                      <Td>{membro.specialty}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
            
            <Divider my={4} />
            
            <Text fontWeight="bold" mb={2}>Adicionar Membro ao Grupo</Text>
            <HStack>
              <Select placeholder="Selecione um membro" disabled>
                <option value="1">João Silva</option>
                <option value="2">Maria Oliveira</option>
              </Select>
              <Button leftIcon={<Icon as={FiUser} />} colorScheme="brand" isDisabled>
                Adicionar
              </Button>
            </HStack>
            <Text fontSize="sm" color="gray.500" mt={2}>
              Funcionalidade em desenvolvimento
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onMembersModalClose}>Fechar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
