'use client';

import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  useColorModeValue,
  Icon,
  Grid,
  VStack,
  HStack,
  Avatar,
  Divider,
  Tag,
  Select,
  InputGroup,
  InputLeftElement,
  Input,
  Badge,
} from '@chakra-ui/react';
import { FiPlus, FiSearch, FiFilter, FiCalendar, FiDollarSign } from 'react-icons/fi';

interface SuccessCase {
  id: string;
  title: string;
  description: string;
  value: number;
  date: string;
  partner: {
    name: string;
    avatar: string;
    specialty: string;
  };
  tags: string[];
  status: 'completed' | 'in_progress';
}

export default function CasosSucesso() {
  const bgColor = useColorModeValue('white', 'gray.800');

  const mockCases: SuccessCase[] = [
    {
      id: '1',
      title: 'Campanha de Marketing Digital',
      description: 'Desenvolvimento de estratégia completa de marketing digital para empresa de tecnologia, resultando em aumento de 150% em leads qualificados.',
      value: 45000,
      date: '2024-03-15',
      partner: {
        name: 'João Silva',
        avatar: '',
        specialty: 'Marketing Digital',
      },
      tags: ['Marketing Digital', 'B2B', 'Tecnologia'],
      status: 'completed',
    },
    {
      id: '2',
      title: 'Consultoria Financeira',
      description: 'Reestruturação financeira e planejamento tributário para empresa de médio porte, gerando economia de 30% em impostos.',
      value: 35000,
      date: '2024-03-10',
      partner: {
        name: 'Maria Santos',
        avatar: '',
        specialty: 'Consultoria Financeira',
      },
      tags: ['Finanças', 'Consultoria', 'Tributos'],
      status: 'in_progress',
    },
  ];

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Casos de Sucesso</Heading>
        <Button
          leftIcon={<Icon as={FiPlus} />}
          colorScheme="brand"
          onClick={() => {/* TODO: Abrir modal de novo caso */}}
        >
          Novo Caso
        </Button>
      </Flex>

      <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="sm" mb={6}>
        <Flex gap={4} flexWrap={{ base: 'wrap', md: 'nowrap' }}>
          <InputGroup>
            <InputLeftElement>
              <Icon as={FiSearch} color="gray.500" />
            </InputLeftElement>
            <Input placeholder="Buscar por título ou descrição" />
          </InputGroup>

          <Select
            maxW="200px"
            icon={<FiFilter />}
            placeholder="Filtrar por área"
          >
            <option value="marketing">Marketing</option>
            <option value="financas">Finanças</option>
            <option value="direito">Direito</option>
            <option value="tecnologia">Tecnologia</option>
          </Select>
        </Flex>
      </Box>

      <Grid gap={6}>
        {mockCases.map((case_) => (
          <Box
            key={case_.id}
            bg={bgColor}
            p={6}
            borderRadius="lg"
            boxShadow="sm"
          >
            <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={6}>
              <VStack align="start" spacing={4}>
                <VStack align="start" spacing={1} w="full">
                  <Flex justify="space-between" w="full">
                    <Heading size="md">{case_.title}</Heading>
                    <Badge
                      colorScheme={case_.status === 'completed' ? 'green' : 'orange'}
                    >
                      {case_.status === 'completed' ? 'Concluído' : 'Em Andamento'}
                    </Badge>
                  </Flex>
                  <Text color="gray.600">
                    {case_.description}
                  </Text>
                </VStack>

                <Flex wrap="wrap" gap={2}>
                  {case_.tags.map((tag) => (
                    <Tag key={tag} colorScheme="brand" variant="subtle">
                      {tag}
                    </Tag>
                  ))}
                </Flex>

                <Divider />

                <HStack spacing={6}>
                  <Flex align="center" gap={2}>
                    <Icon as={FiCalendar} color="gray.500" />
                    <Text>{new Date(case_.date).toLocaleDateString('pt-BR')}</Text>
                  </Flex>
                  <Flex align="center" gap={2}>
                    <Icon as={FiDollarSign} color="gray.500" />
                    <Text>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(case_.value)}
                    </Text>
                  </Flex>
                </HStack>
              </VStack>

              <VStack align="start" spacing={4}>
                <Text fontWeight="medium">Parceiro</Text>
                <Flex gap={3} align="center">
                  <Avatar
                    size="md"
                    name={case_.partner.name}
                    src={case_.partner.avatar}
                  />
                  <Box>
                    <Text fontWeight="medium">{case_.partner.name}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {case_.partner.specialty}
                    </Text>
                  </Box>
                </Flex>
              </VStack>
            </Grid>
          </Box>
        ))}
      </Grid>
    </Box>
  );
} 