'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  Text,
  Button,
  Flex,
  Icon,
  Badge,
  Spinner,
} from '@chakra-ui/react';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { DashboardReferencesList } from '@/components/dashboard/DashboardReferencesList';
// import { NextMeetings } from '@/components/dashboard/NextMeetings'; // Temporariamente removido
import { DashboardOpenRequests } from '@/components/dashboard/DashboardOpenRequests';
import { FiUsers, FiTarget, FiDollarSign, FiArrowRight, FiShoppingBag, FiExternalLink } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Dashboard() {
  const bgColor = useColorModeValue('white', 'gray.700');
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // Estatísticas do usuário
  const [stats, setStats] = useState([
    {
      label: 'Referências Dadas',
      value: '0',
      icon: FiTarget,
      href: '/dashboard/referencias',
      loading: true
    },
    {
      label: 'Referências Recebidas',
      value: '0',
      icon: FiUsers,
      href: '/dashboard/referencias',
      loading: true
    },
    {
      label: 'Negócios Fechados',
      value: 'R$ 0',
      icon: FiDollarSign,
      href: '/dashboard/casos-sucesso',
      loading: true
    },
  ]);
  
  useEffect(() => {
    async function fetchUserData() {
      try {
        // Obter usuário logado
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }
        
        setUserId(user.id);
        setUserEmail(user.email);
        
        // Buscar os dados do membro
        const { data: memberData } = await supabase
          .from('members')
          .select('id, email')
          .eq('id', user.id)
          .single();
        
        if (!memberData) {
          setLoading(false);
          return;
        }
        
        // Buscar referências dadas pelo usuário
        const { data: referencesGiven, error: referencesGivenError } = await supabase
          .from('reference_requests')
          .select('id')
          .eq('user_id', user.id);
          
        // Buscar referências recebidas pelo usuário (onde o email é mencionado)
        const { data: referencesReceived, error: referencesReceivedError } = await supabase
          .from('reference_requests')
          .select('id')
          .eq('receiver_email', user.email);
          
        // Buscar negócios fechados relacionados ao usuário
        const { data: closedDeals, error: closedDealsError } = await supabase
          .from('success_cases')
          .select('amount')
          .or(`user_id.eq.${user.id},member_id.eq.${user.id}`)
          .eq('status', 'closed');
          
        // Calcular valor total dos negócios fechados
        const totalAmount = closedDeals?.reduce((sum, deal) => sum + (parseFloat(deal.amount) || 0), 0) || 0;
        
        // Atualizar as estatísticas com os dados reais
        setStats([
          {
            label: 'Referências Dadas',
            value: referencesGiven?.length.toString() || '0',
            icon: FiTarget,
            href: '/dashboard/referencias',
            loading: false
          },
          {
            label: 'Referências Recebidas',
            value: referencesReceived?.length.toString() || '0',
            icon: FiUsers,
            href: '/dashboard/referencias',
            loading: false
          },
          {
            label: 'Negócios Fechados',
            value: `R$ ${totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            icon: FiDollarSign,
            href: '/dashboard/casos-sucesso',
            loading: false
          },
        ]);
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserData();
  }, [supabase]);

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Dashboard</Heading>
        <Button
          rightIcon={<Icon as={FiArrowRight} />}
          colorScheme="brand"
          variant="ghost"
          onClick={() => router.push('/dashboard/perfil')}
        >
          Ver meu perfil
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
        {stats.map((stat, index) => (
          <DashboardCard key={index} onClick={() => router.push(stat.href)}>
            <Flex align="center" justify="space-between">
              <Stat>
                <StatLabel>{stat.label}</StatLabel>
                <StatNumber>
                  {stat.loading ? <Spinner size="sm" color="brand.500" /> : stat.value}
                </StatNumber>
              </Stat>
              <Icon as={stat.icon} boxSize={6} color="brand.500" />
            </Flex>
          </DashboardCard>
        ))}
      </SimpleGrid>

      {/* Card destacado do Marketplace */}
      <Box 
        bg="brand.500" 
        color="white" 
        p={6} 
        borderRadius="lg" 
        boxShadow="md" 
        mb={6}
        position="relative"
        overflow="hidden"
      >
        <Box 
          position="absolute" 
          top={0} 
          right={0} 
          width="200px" 
          height="200px" 
          opacity={0.1} 
          transform="translate(30px, -100px)" 
          borderRadius="full" 
          bg="white" 
        />
        
        <Flex align="center" justify="space-between">
          <Box>
            <Heading size="md" mb={2}>
              <Flex align="center">
                <Icon as={FiShoppingBag} mr={2} />
                Marketplace de Membros
                <Badge ml={2} colorScheme="green" variant="solid">
                  Novo
                </Badge>
              </Flex>
            </Heading>
            <Text mb={4}>
              Divulgue seu perfil profissional para todos que acessarem o site. 
              Seja encontrado por potenciais clientes e parceiros!
            </Text>
            <Flex>
              <Button 
                rightIcon={<Icon as={FiExternalLink} />}
                variant="solid"
                bg="white"
                color="brand.500"
                _hover={{ bg: 'gray.100' }}
                onClick={() => window.open('/marketplace', '_blank')}
                mr={2}
              >
                Ver Marketplace
              </Button>
              <Button
                rightIcon={<Icon as={FiArrowRight} />}
                variant="outline"
                colorScheme="whiteAlpha"
                onClick={() => router.push('/dashboard/perfil')}
              >
                Atualizar Meu Perfil
              </Button>
            </Flex>
          </Box>
          <Icon as={FiShoppingBag} boxSize={16} opacity={0.8} />
        </Flex>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="sm">
          <Heading size="md" mb={4}>Pedidos em Aberto</Heading>
          <DashboardOpenRequests />
        </Box>

        <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="sm">
          <Heading size="md" mb={4}>Últimas Referências</Heading>
          <DashboardReferencesList />
        </Box>
      </SimpleGrid>
    </Box>
  );
}