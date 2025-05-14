'use client';

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
} from '@chakra-ui/react';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { DashboardReferencesList } from '@/components/dashboard/DashboardReferencesList';
// import { NextMeetings } from '@/components/dashboard/NextMeetings'; // Temporariamente removido
import { DashboardOpenRequests } from '@/components/dashboard/DashboardOpenRequests';
import { FiUsers, FiTarget, FiDollarSign, FiArrowRight, FiShoppingBag, FiExternalLink } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const bgColor = useColorModeValue('white', 'gray.700');
  const router = useRouter();

  const stats = [
    {
      label: 'Referências Dadas',
      value: '24',
      icon: FiTarget,
      href: '/dashboard/referencias',
    },
    {
      label: 'Referências Recebidas',
      value: '18',
      icon: FiUsers,
      href: '/dashboard/referencias',
    },
    {
      label: 'Negócios Fechados',
      value: 'R$ 45.000',
      icon: FiDollarSign,
      href: '/dashboard/casos-sucesso',
    },
  ];

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
                <StatNumber>{stat.value}</StatNumber>
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