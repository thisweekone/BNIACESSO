'use client';

import {
  Box,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  Heading,
  HStack,
  VStack,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Icon,
  useColorModeValue,
  Flex,
  Spacer,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { FiSearch, FiFilter, FiMapPin, FiBriefcase, FiMail, FiPhone, FiGlobe, FiMessageSquare } from 'react-icons/fi';
import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import FilterCombobox from './FilterCombobox';

interface Member {
  id: string;
  name: string;
  specialty: string;
  city: string;
  email: string;
  phone: string;
  website: string;
  bio: string;
  services: string[];
  tags: string[];
  references_given: number;
  references_received: number;
  total_given: number;
  total_received: number;
}

export default function MembersList() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');

  const router = useRouter();

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from('members')
        .select(`
          *,
          member_services(services(name)),
          member_references!member_references_giver_id_fkey(type, value)
        `);

      if (error) {
        console.error('Error fetching members:', error);
        return;
      }

      const formattedMembers = data.map((member: any) => {
        // Garantir que temos arrays válidos para evitar erros
        const memberServices = member.member_services || [];
        const memberReferences = member.member_references || [];
        
        // Garantir que tags é sempre um array válido
        const memberTags = Array.isArray(member.tags) ? member.tags : [];
        
        // Logs para ajudar no diagnóstico
        console.log('Dados do membro:', member.name, { 
          services: memberServices,
          tags: memberTags
        });
        
        return {
          ...member,
          // Filtrar valores null/undefined e extrair nomes com segurança
          services: memberServices
            .filter((ms: any) => ms && ms.services)
            .map((ms: any) => ms.services?.name || 'Serviço sem nome'),
          
          // Usar o campo tags diretamente como um array
          tags: memberTags,
          
          // Estatísticas de referências com verificações de segurança
          references_given: memberReferences.filter((r: any) => r && r.type === 'given').length,
          references_received: memberReferences.filter((r: any) => r && r.type === 'received').length,
          total_given: memberReferences
            .filter((r: any) => r && r.type === 'given')
            .reduce((sum: number, r: any) => sum + (r.value || 0), 0),
          total_received: memberReferences
            .filter((r: any) => r && r.type === 'received')
            .reduce((sum: number, r: any) => sum + (r.value || 0), 0),
        };
      });

      setMembers(formattedMembers);
      setFilteredMembers(formattedMembers);
    };

    fetchMembers();
  }, []);

  // Preparar as opções dos comboboxes
  const specialtyOptions = useMemo(() => {
    // Usar um objeto para rastrear valores únicos
    const uniqueSpecialties: Record<string, boolean> = {};
    
    // Preencher o objeto com especialidades únicas
    members.forEach(member => {
      if (member.specialty) {
        uniqueSpecialties[member.specialty] = true;
      }
    });
    
    // Converter o objeto em um array e ordenar
    const specialtyArray = Object.keys(uniqueSpecialties).sort();
    
    return specialtyArray.map(specialty => ({
      value: specialty,
      label: specialty
    }));
  }, [members]);
  
  const serviceOptions = useMemo(() => {
    // Usar um objeto para rastrear valores únicos
    const uniqueServices: Record<string, boolean> = {};
    
    // Preencher o objeto com serviços únicos
    members.forEach(member => {
      if (member.services && Array.isArray(member.services)) {
        member.services.forEach(service => {
          if (service) {
            uniqueServices[service] = true;
          }
        });
      }
    });
    
    // Converter o objeto em um array e ordenar
    const serviceArray = Object.keys(uniqueServices).sort();
    
    return serviceArray.map(service => ({
      value: service,
      label: service
    }));
  }, [members]);
  
  const cityOptions = useMemo(() => {
    // Usar um objeto para rastrear valores únicos
    const uniqueCities: Record<string, boolean> = {};
    
    // Preencher o objeto com cidades únicas
    members.forEach(member => {
      if (member.city) {
        uniqueCities[member.city] = true;
      }
    });
    
    // Converter o objeto em um array e ordenar
    const cityArray = Object.keys(uniqueCities).sort();
    
    return cityArray.map(city => ({
      value: city,
      label: city
    }));
  }, [members]);
  
  const tagOptions = useMemo(() => {
    // Usar um objeto para rastrear valores únicos
    const uniqueTags: Record<string, boolean> = {};
    
    // Preencher o objeto com tags únicas
    members.forEach(member => {
      if (member.tags && Array.isArray(member.tags)) {
        member.tags.forEach(tag => {
          if (tag) {
            uniqueTags[tag] = true;
          }
        });
      }
    });
    
    // Converter o objeto em um array e ordenar
    const tagArray = Object.keys(uniqueTags).sort();
    
    return tagArray.map(tag => ({
      value: tag,
      label: tag
    }));
  }, [members]);
  
  useEffect(() => {
    let filtered = [...members];

    if (searchTerm) {
      filtered = filtered.filter(
        (member) =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.bio.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSpecialty) {
      filtered = filtered.filter((member) => member.specialty === selectedSpecialty);
    }

    if (selectedService) {
      filtered = filtered.filter((member) => member.services.includes(selectedService));
    }

    if (selectedCity) {
      filtered = filtered.filter((member) => member.city === selectedCity);
    }

    if (selectedTag) {
      filtered = filtered.filter((member) => 
        Array.isArray(member.tags) && member.tags.includes(selectedTag)
      );
    }
    
    // Log para debug dos filtros
    console.log('Filtrando membros:', { 
      total: members.length,
      filtrados: filtered.length,
      termo: searchTerm,
      especialidade: selectedSpecialty,
      servico: selectedService,
      cidade: selectedCity,
      tag: selectedTag
    });

    setFilteredMembers(filtered);
  }, [searchTerm, selectedSpecialty, selectedService, selectedCity, selectedTag, members]);

  // Essas variáveis não são mais necessárias, já que agora usamos os options gerados acima

  return (
    <Box>
      {/* Filtros */}
      <Card mb={6} bg={bgColor} borderWidth="1px" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="gray.500" />
                </InputLeftElement>
                <Input
                  placeholder="Buscar por nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Button leftIcon={<Icon as={FiFilter} />} colorScheme="blue">
                Filtros
              </Button>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
              <FilterCombobox
                placeholder="Buscar especialidade"
                value={selectedSpecialty}
                onChange={setSelectedSpecialty}
                options={specialtyOptions}
                label="Especialidade"
              />

              <FilterCombobox
                placeholder="Buscar serviço"
                value={selectedService}
                onChange={setSelectedService}
                options={serviceOptions}
                label="Serviço"
              />

              <FilterCombobox
                placeholder="Buscar cidade"
                value={selectedCity}
                onChange={setSelectedCity}
                options={cityOptions}
                label="Cidade"
              />

              <FilterCombobox
                placeholder="Buscar tag"
                value={selectedTag}
                onChange={setSelectedTag}
                options={tagOptions}
                label="Tag"
              />
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>

      {/* Lista de Membros */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {filteredMembers.map((member) => (
          <Card
            key={member.id}
            bg={bgColor}
            borderColor={borderColor}
            _hover={{ boxShadow: 'md', bg: hoverBgColor, cursor: 'pointer' }}
            transition="all 0.2s"
            onClick={() => router.push(`/membros/${member.id}`)}
          >
            <CardBody>
              <VStack align="stretch" spacing={4}>
                {/* Cabeçalho */}
                <Flex align="center" gap={4}>
                  <Avatar size="lg" name={member.name} />
                  <Box>
                    <Heading size="md">{member.name}</Heading>
                    <Text color="gray.500">{member.specialty}</Text>
                    <HStack mt={1}>
                      <Icon as={FiMapPin} color="gray.500" />
                      <Text fontSize="sm" color="gray.500">{member.city}</Text>
                    </HStack>
                  </Box>
                </Flex>

                {/* Bio */}
                <Text fontSize="sm" color="gray.600" noOfLines={3}>
                  {member.bio}
                </Text>

                {/* Serviços */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Serviços</Text>
                  <HStack wrap="wrap" spacing={2}>
                    {member.services.slice(0, 3).map((service) => (
                      <Badge key={service} colorScheme="blue" variant="subtle">
                        {service}
                      </Badge>
                    ))}
                    {member.services.length > 3 && (
                      <Badge colorScheme="gray" variant="subtle">
                        +{member.services.length - 3}
                      </Badge>
                    )}
                  </HStack>
                </Box>

                {/* Tags */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Tags</Text>
                  <HStack wrap="wrap" spacing={2}>
                    {member.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} colorScheme="green" variant="subtle">
                        {tag}
                      </Badge>
                    ))}
                    {member.tags.length > 3 && (
                      <Badge colorScheme="gray" variant="subtle">
                        +{member.tags.length - 3}
                      </Badge>
                    )}
                  </HStack>
                </Box>

                <Divider />

                {/* Estatísticas */}
                <SimpleGrid columns={2} spacing={4}>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.500">Referências Dadas</Text>
                    <Text fontWeight="bold">{member.references_given}</Text>
                  </VStack>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.500">Referências Recebidas</Text>
                    <Text fontWeight="bold">{member.references_received}</Text>
                  </VStack>
                </SimpleGrid>

                {/* Ações */}
                <HStack spacing={2} justify="center">
                  <Tooltip label="Enviar mensagem">
                    <IconButton
                      aria-label="Enviar mensagem"
                      icon={<Icon as={FiMessageSquare} />}
                      variant="ghost"
                      colorScheme="blue"
                    />
                  </Tooltip>
                  <Tooltip label="Enviar email">
                    <IconButton
                      aria-label="Enviar email"
                      icon={<Icon as={FiMail} />}
                      variant="ghost"
                      colorScheme="blue"
                    />
                  </Tooltip>
                  <Tooltip label="Visitar site">
                    <IconButton
                      aria-label="Visitar site"
                      icon={<Icon as={FiGlobe} />}
                      variant="ghost"
                      colorScheme="blue"
                    />
                  </Tooltip>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );
} 