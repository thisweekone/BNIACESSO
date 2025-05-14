'use client';

import { useState, useEffect, useRef } from 'react';
import {
  VStack,
  Heading,
  Button,
  useToast,
  Box,
  Text,
  Flex,
  Tag,
  TagLabel,
  TagCloseButton,
  useColorModeValue,
  Input,
  Spinner,
  Tooltip,
  List,
  ListItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Interface para a tabela services
interface Service {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

interface ServicesManagerProps {
  memberId: string;
}

export default function ServicesManager({ memberId }: ServicesManagerProps) {
  // Estados
  const [memberServices, setMemberServices] = useState<Service[]>([]);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Modal para selecionar serviços
  const { isOpen, onOpen, onClose } = useDisclosure();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const tagBg = useColorModeValue('brand.100', 'brand.900');
  const tagColor = useColorModeValue('brand.800', 'brand.200');

  useEffect(() => {
    if (memberId) {
      fetchMemberServices();
      fetchAllServices();
    }
  }, [memberId]);

  // Filtra os serviços disponíveis quando a query de busca muda
  useEffect(() => {
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredServices(
        availableServices.filter(service => 
          service.name.toLowerCase().includes(lowerQuery) || 
          (service.description && service.description.toLowerCase().includes(lowerQuery))
        )
      );
    } else {
      setFilteredServices(availableServices);
    }
  }, [searchQuery, availableServices]);

  // Foca no input de busca quando o modal abre
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Busca os serviços que o membro já tem
  const fetchMemberServices = async () => {
    if (!memberId || memberId === 'temp-id') return;
    
    try {
      setLoading(true);
      const supabase = createClientComponentClient();
      
      // Buscar a relação entre membros e serviços
      const { data: relationships, error: relError } = await supabase
        .from('member_services')
        .select('service_id')
        .eq('member_id', memberId);
      
      if (relError) {
        console.error('Erro ao buscar relacionamentos:', relError);
        return;
      }
      
      if (!relationships || relationships.length === 0) {
        setMemberServices([]);
        setLoading(false);
        return;
      }
      
      // Obter os IDs dos serviços
      const serviceIds = relationships.map(rel => rel.service_id);
      
      // Buscar os detalhes dos serviços
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .in('id', serviceIds);
      
      if (servicesError) {
        console.error('Erro ao buscar serviços:', servicesError);
        return;
      }
      
      if (services) {
        setMemberServices(services);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
    } finally {
      setLoading(false);
    }
  };

  // Busca todos os serviços disponíveis
  const fetchAllServices = async () => {
    try {
      setLoading(true);
      console.log('Iniciando busca de serviços...');
      const supabase = createClientComponentClient();
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Erro ao buscar todos os serviços:', error);
        toast({
          title: 'Erro ao buscar serviços',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      
      if (data) {
        console.log(`Encontrados ${data.length} serviços disponíveis`);
        setAvailableServices(data);
        setFilteredServices(data);
      } else {
        console.log('Nenhum serviço encontrado na tabela');
        toast({
          title: 'Nenhum serviço encontrado',
          description: 'Verifique se os scripts SQL foram executados corretamente no Supabase.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error('Erro inesperado ao buscar serviços:', err);
      toast({
        title: 'Erro inesperado',
        description: 'Não foi possível carregar os serviços disponíveis.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Adiciona um serviço ao membro
  const addServiceToMember = async (service: Service) => {
    if (!memberId || memberId === 'temp-id') {
      toast({
        title: 'Erro',
        description: 'ID de membro inválido',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Verificar se o membro já tem este serviço
    if (memberServices.some(s => s.id === service.id)) {
      toast({
        title: 'Serviço já adicionado',
        description: 'Este serviço já está na sua lista',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setLoading(true);
      const supabase = createClientComponentClient();
      
      // Inserir na tabela de relacionamento
      const { error } = await supabase
        .from('member_services')
        .insert({
          member_id: memberId,
          service_id: service.id
        });
      
      if (error) {
        console.error('Erro ao adicionar serviço:', error);
        toast({
          title: 'Erro ao adicionar serviço',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Atualizar a lista local
      setMemberServices([...memberServices, service]);
      
      toast({
        title: 'Serviço adicionado',
        description: `${service.name} foi adicionado aos seus serviços`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Erro inesperado ao adicionar serviço:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o serviço',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Remove um serviço do membro
  const removeServiceFromMember = async (serviceId: string) => {
    if (!memberId || memberId === 'temp-id') {
      toast({
        title: 'Erro',
        description: 'ID de membro inválido',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setLoading(true);
      const supabase = createClientComponentClient();
      
      const { error } = await supabase
        .from('member_services')
        .delete()
        .eq('member_id', memberId)
        .eq('service_id', serviceId);
      
      if (error) {
        console.error('Erro ao remover serviço:', error);
        toast({
          title: 'Erro ao remover serviço',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Atualizar a lista local
      setMemberServices(memberServices.filter(s => s.id !== serviceId));
      
      toast({
        title: 'Serviço removido',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Erro ao remover serviço:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o serviço',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="sm" w="full" mb={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Serviços Oferecidos</Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="brand"
          size="sm"
          onClick={onOpen}
          isLoading={loading}
        >
          Adicionar Serviço
        </Button>
      </Flex>

      {memberServices.length === 0 ? (
        <Text color="gray.500" fontSize="sm" my={4}>
          Você não possui nenhum serviço cadastrado. Clique em "Adicionar Serviço" para começar.
        </Text>
      ) : (
        <Flex wrap="wrap" gap={2} mb={4}>
          {memberServices.map((service) => (
            <Tag
              key={service.id}
              size="md"
              borderRadius="full"
              variant="solid"
              bg={tagBg}
              color={tagColor}
            >
              <TagLabel>{service.name}</TagLabel>
              <TagCloseButton 
                onClick={() => removeServiceFromMember(service.id)} 
                isDisabled={loading} 
              />
            </Tag>
          ))}
        </Flex>
      )}

      {/* Modal para adicionar serviços */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Adicionar Serviço</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Box position="relative">
                <Text fontWeight="medium" mb={1}>Selecione um serviço</Text>
                <Text fontSize="sm" color="gray.600" mb={3}>
                  Digite para filtrar entre as {availableServices.length} opções disponíveis
                </Text>
                
                <Box position="relative">
                  <Input
                    ref={searchInputRef}
                    placeholder="Digite para buscar serviço..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoComplete="off"
                  />
                  {loading ? (
                    <Spinner 
                      position="absolute"
                      right="12px"
                      top="50%"
                      transform="translateY(-50%)"
                      size="sm"
                      color="gray.400"
                    />
                  ) : (
                    <FiSearch 
                      style={{ 
                        position: 'absolute', 
                        right: '12px', 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        color: 'gray'
                      }}
                    />
                  )}
                </Box>
                
                {/* Combobox / Autocomplete */}
                {searchQuery.length > 0 && (
                  <Box 
                    position="absolute"
                    w="100%"
                    zIndex="dropdown"
                    mt={1}
                    borderRadius="md"
                    boxShadow="md"
                    bg="white"
                    maxH="300px"
                    overflowY="auto"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    {filteredServices.length === 0 ? (
                      <Flex align="center" justify="center" p={4}>
                        <Text color="gray.500">Nenhum serviço encontrado</Text>
                      </Flex>
                    ) : (
                      filteredServices.slice(0, 10).map(service => (
                        <Box
                          key={service.id}
                          p={3}
                          _hover={{ bg: 'gray.50' }}
                          cursor="pointer"
                          borderBottom="1px solid"
                          borderColor="gray.100"
                          onClick={() => {
                            addServiceToMember(service);
                            setSearchQuery('');
                            onClose();
                          }}
                        >
                          <Text fontWeight="medium">{service.name}</Text>
                          {service.description && (
                            <Text fontSize="sm" color="gray.600" noOfLines={1}>
                              {service.description}
                            </Text>
                          )}
                        </Box>
                      ))
                    )}
                    
                    {filteredServices.length > 10 && (
                      <Box p={2} textAlign="center" bg="gray.50">
                        <Text fontSize="sm" color="gray.500">
                          {filteredServices.length - 10} mais resultados. Continue digitando para refinar.
                        </Text>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
              
              {/* Serviços populares */}
              {!searchQuery && availableServices.length > 0 && (
                <Box mt={4}>
                  <Text fontWeight="medium" mb={2}>Serviços populares</Text>
                  <Flex wrap="wrap" gap={2}>
                    {availableServices.slice(0, 10).map(service => (
                      <Tag
                        key={service.id}
                        size="md"
                        borderRadius="full"
                        variant="outline"
                        colorScheme="brand"
                        cursor="pointer"
                        onClick={() => {
                          addServiceToMember(service);
                          onClose();
                        }}
                      >
                        <TagLabel>{service.name}</TagLabel>
                      </Tag>
                    ))}
                  </Flex>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
