'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Heading, 
  Text, 
  ButtonGroup, 
  Button, 
  Icon, 
  Flex,
  useColorModeValue
} from '@chakra-ui/react';
import { FiList, FiMap } from 'react-icons/fi';
import { createClient } from '@supabase/supabase-js';
import MembersList from '@/components/dashboard/MembersList';
import { MembersMapSimple } from '@/components/dashboard/MembersMapSimple';

// Interface para os membros
interface Member {
  id: string;
  name: string;
  specialty: string;
  city: string;
  email: string;
  phone: string;
  website?: string;
  bio?: string;
  services?: string[];
  tags?: string[];
  address?: string;
  lat?: number;
  lng?: number;
}

export default function MembersPage() {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  
  const activeButtonBg = useColorModeValue('brand.500', 'brand.400');
  const activeButtonColor = useColorModeValue('white', 'white');
  const inactiveButtonBg = useColorModeValue('gray.100', 'gray.700');
  const inactiveButtonColor = useColorModeValue('gray.700', 'gray.200');
  
  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data, error } = await supabase
          .from('members')
          .select(`
            id, name, specialty, city, email, phone, website, bio,
            member_services(services(name)),
            member_tags(tags(name))
          `);
        
        if (error) throw error;
        
        const formattedMembers = data.map((member: any) => {
          const memberServices = member.member_services || [];
          const memberTags = member.member_tags || [];
          
          return {
            ...member,
            services: memberServices
              .filter((ms: any) => ms && ms.services)
              .map((ms: any) => ms.services?.name || 'Serviço sem nome'),
            tags: memberTags
              .filter((mt: any) => mt && mt.tags)
              .map((mt: any) => mt.tags?.name || 'Tag sem nome')
          };
        });
        
        setMembers(formattedMembers);
      } catch (error) {
        console.error('Erro ao buscar membros:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMembers();
  }, []);
  
  return (
    <Container maxW="container.xl" py={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading size="lg">Membros</Heading>
          <Text color="gray.500">
            Encontre membros por especialidade, serviço, localidade ou tags
          </Text>
        </Box>
          
        <ButtonGroup size="md" isAttached variant="outline">
          <Button
            leftIcon={<Icon as={FiList} />}
            onClick={() => setViewMode('list')}
            bg={viewMode === 'list' ? activeButtonBg : inactiveButtonBg}
            color={viewMode === 'list' ? activeButtonColor : inactiveButtonColor}
            borderColor={viewMode === 'list' ? activeButtonBg : 'gray.200'}
            _hover={{
              bg: viewMode === 'list' ? activeButtonBg : 'gray.200',
            }}
          >
            Lista
          </Button>
          <Button
            leftIcon={<Icon as={FiMap} />}
            onClick={() => setViewMode('map')}
            bg={viewMode === 'map' ? activeButtonBg : inactiveButtonBg}
            color={viewMode === 'map' ? activeButtonColor : inactiveButtonColor}
            borderColor={viewMode === 'map' ? activeButtonBg : 'gray.200'}
            _hover={{
              bg: viewMode === 'map' ? activeButtonBg : 'gray.200',
            }}
          >
            Mapa
          </Button>
        </ButtonGroup>
      </Flex>

      {viewMode === 'list' ? (
        <MembersList />
      ) : (
        <Box mt={4}>
          <MembersMapSimple members={members} />
        </Box>
      )}
    </Container>
  );
}