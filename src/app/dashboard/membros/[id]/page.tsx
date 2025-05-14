'use client';

import {
  Box,
  Container,
  Grid,
  VStack,
  Text,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  HStack,
  Avatar,
  Button,
  Icon,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiMail, FiPhone, FiGlobe, FiMapPin } from 'react-icons/fi';
import { ReferencesList } from '@/components/dashboard/ReferencesList';

interface MemberDetails {
  id: string;
  name: string;
  specialty: string;
  city: string;
  bio: string;
  services: string[];
  tags: string[];
  email: string;
  phone: string;
  website: string;
  stats: {
    referencesGiven: number;
    referencesReceived: number;
    totalValue: number;
  };
}

export default function MemberDetailsPage() {
  // Dados mockados do membro
  const member: MemberDetails = {
    id: '1',
    name: 'João Silva',
    specialty: 'Marketing Digital',
    city: 'São Paulo, SP',
    bio: 'Especialista em marketing digital com mais de 10 anos de experiência...',
    services: [
      'Consultoria em Marketing Digital',
      'Gestão de Mídias Sociais',
      'SEO e Otimização',
      'Marketing de Conteúdo',
    ],
    tags: ['Marketing', 'Digital', 'SEO', 'Redes Sociais'],
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    website: 'www.joaosilva.com.br',
    stats: {
      referencesGiven: 45,
      referencesReceived: 38,
      totalValue: 250000,
    },
  };

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Container maxW="container.xl" py={8}>
      <Grid templateColumns={{ base: '1fr', md: '300px 1fr' }} gap={8}>
        {/* Sidebar com informações do membro */}
        <VStack spacing={6} align="stretch">
          <Box bg={bgColor} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
            <VStack spacing={4} align="center">
              <Avatar size="2xl" name={member.name} />
              <Box textAlign="center">
                <Heading size="md">{member.name}</Heading>
                <Text color="gray.500">{member.specialty}</Text>
              </Box>

              <HStack>
                <Icon as={FiMapPin} color="gray.500" />
                <Text color="gray.500">{member.city}</Text>
              </HStack>

              <VStack spacing={2} align="stretch" w="full">
                <Button leftIcon={<Icon as={FiMail} />} variant="outline" size="sm">
                  {member.email}
                </Button>
                <Button leftIcon={<Icon as={FiPhone} />} variant="outline" size="sm">
                  {member.phone}
                </Button>
                <Button leftIcon={<Icon as={FiGlobe} />} variant="outline" size="sm">
                  {member.website}
                </Button>
              </VStack>
            </VStack>
          </Box>

          <Box bg={bgColor} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
            <VStack align="stretch" spacing={4}>
              <Heading size="sm">Serviços</Heading>
              {member.services.map((service, index) => (
                <Text key={index} color="gray.600">
                  {service}
                </Text>
              ))}
            </VStack>
          </Box>

          <Box bg={bgColor} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
            <VStack align="stretch" spacing={4}>
              <Heading size="sm">Tags</Heading>
              <HStack wrap="wrap" spacing={2}>
                {member.tags.map((tag, index) => (
                  <Badge key={index} colorScheme="blue">
                    {tag}
                  </Badge>
                ))}
              </HStack>
            </VStack>
          </Box>
        </VStack>

        {/* Conteúdo principal */}
        <VStack spacing={6} align="stretch">
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Stat bg={bgColor} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
              <StatLabel>Referências Dadas</StatLabel>
              <StatNumber>{member.stats.referencesGiven}</StatNumber>
            </Stat>
            <Stat bg={bgColor} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
              <StatLabel>Referências Recebidas</StatLabel>
              <StatNumber>{member.stats.referencesReceived}</StatNumber>
            </Stat>
            <Stat bg={bgColor} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
              <StatLabel>Valor Total</StatLabel>
              <StatNumber>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(member.stats.totalValue)}
              </StatNumber>
            </Stat>
          </SimpleGrid>

          <Box bg={bgColor} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
            <Tabs>
              <TabList>
                <Tab>Sobre</Tab>
                <Tab>Referências</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <Text color="gray.600">{member.bio}</Text>
                </TabPanel>
                <TabPanel>
                  <ReferencesList />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </VStack>
      </Grid>
    </Container>
  );
} 