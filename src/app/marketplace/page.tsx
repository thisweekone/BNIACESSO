"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Input,
  Select,
  HStack,
  Button,
  Flex,
  Spacer,
  InputGroup,
  InputLeftElement,
  VStack,
  useColorModeValue,
  Center,
  Spinner
} from '@chakra-ui/react';
import { FiSearch, FiMapPin } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import MemberCard from '@/components/marketplace/MemberCard';
import PublicHeader from '@/components/marketplace/PublicHeader';

export default function Marketplace() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nameFilter, setNameFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [specialtyOptions, setSpecialtyOptions] = useState<string[]>([]);
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const supabase = createClientComponentClient();

  // Carregar membros com perfil público
  useEffect(() => {
    async function fetchMembers() {
      try {
        setLoading(true);
        
        let query = supabase
          .from('members')
          .select('*')
          .eq('public_profile', true);
        
        // Aplicar filtros
        if (nameFilter) query = query.ilike('name', `%${nameFilter}%`);
        if (specialtyFilter) query = query.eq('specialty', specialtyFilter);
        if (cityFilter) query = query.eq('city', cityFilter);
        
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
    
    // Buscar opções de filtro (especialidades e cidades)
    async function fetchFilterOptions() {
      try {
        // Buscar especialidades únicas de membros públicos
        const { data: specialtyData } = await supabase
          .from('members')
          .select('specialty')
          .eq('public_profile', true)
          .not('specialty', 'is', null);
        
        if (specialtyData) {
          const uniqueSpecialties = Array.from(
            new Set(specialtyData.map(item => item.specialty).filter(Boolean))
          );
          setSpecialtyOptions(uniqueSpecialties.sort());
        }
        
        // Buscar cidades únicas de membros públicos
        const { data: cityData } = await supabase
          .from('members')
          .select('city')
          .eq('public_profile', true)
          .not('city', 'is', null);
        
        if (cityData) {
          const uniqueCities = Array.from(
            new Set(cityData.map(item => item.city).filter(Boolean))
          );
          setCityOptions(uniqueCities.sort());
        }
      } catch (err) {
        console.error('Erro ao buscar opções de filtro:', err);
      }
    }
    
    fetchMembers();
    fetchFilterOptions();
  }, [nameFilter, specialtyFilter, cityFilter]);
  
  return (
    <Box minH="100vh" bg={bgColor}>
      <PublicHeader />
      
      <Container maxW="container.xl" py={8}>
        <Box mb={8} textAlign="center">
          <Heading as="h1" size="2xl" mb={2}>Marketplace BNI</Heading>
          <Text fontSize="xl" color="gray.600">
            Encontre profissionais qualificados para seus projetos e necessidades
          </Text>
        </Box>
        
        {/* Filtros */}
        <Box
          mb={8}
          p={6}
          borderRadius="lg"
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          shadow="md"
        >
          <VStack spacing={4}>
            <Flex direction={{ base: 'column', md: 'row' }} w="full" gap={4}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray.300" />
                </InputLeftElement>
                <Input 
                  placeholder="Buscar por nome" 
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                />
              </InputGroup>
              
              <Select 
                placeholder="Todas as especialidades" 
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
              >
                {specialtyOptions.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </Select>
              
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FiMapPin color="gray.300" />
                </InputLeftElement>
                <Select 
                  placeholder="Todas as cidades" 
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                >
                  {cityOptions.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </Select>
              </InputGroup>
            </Flex>
            
            <HStack w="full">
              <Spacer />
              <Button 
                colorScheme="brand" 
                onClick={() => {
                  setNameFilter('');
                  setSpecialtyFilter('');
                  setCityFilter('');
                }}
              >
                Limpar Filtros
              </Button>
            </HStack>
          </VStack>
        </Box>
        
        {/* Lista de Membros */}
        {loading ? (
          <Center py={20}>
            <Spinner size="xl" color="brand.500" />
          </Center>
        ) : error ? (
          <Center py={20}>
            <Text color="red.500">{error}</Text>
          </Center>
        ) : members.length === 0 ? (
          <Center py={20}>
            <VStack>
              <Text fontSize="xl">Nenhum membro encontrado</Text>
              <Text color="gray.500">
                Tente remover alguns filtros ou busque por outros termos
              </Text>
            </VStack>
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </SimpleGrid>
        )}
      </Container>
      
      <Box as="footer" py={8} textAlign="center" borderTopWidth="1px" borderColor={borderColor} mt={12}>
        <Text>&copy; {new Date().getFullYear()} BNI Acesso. Todos os direitos reservados.</Text>
        <Text fontSize="sm" mt={1}>
          As informações exibidas nesta página são divulgadas com o consentimento dos membros conforme a LGPD.
        </Text>
      </Box>
    </Box>
  );
}
