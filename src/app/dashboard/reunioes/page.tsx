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
  Badge,
  Avatar,
  AvatarGroup,
  Divider,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import { FiCalendar, FiClock, FiMapPin, FiPlus, FiUsers } from 'react-icons/fi';

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'weekly' | 'one_to_one' | 'training';
  participants?: {
    name: string;
    avatar: string;
  }[];
  description?: string;
}

export default function Reunioes() {
  const bgColor = useColorModeValue('white', 'gray.800');

  const mockMeetings: Meeting[] = [
    {
      id: '1',
      title: 'Reunião Semanal BNI',
      date: '2024-03-22',
      time: '07:00',
      location: 'Hotel Business',
      type: 'weekly',
      description: 'Reunião semanal do grupo com apresentações e networking.',
      participants: [
        { name: 'João Silva', avatar: '' },
        { name: 'Maria Santos', avatar: '' },
        { name: 'Pedro Oliveira', avatar: '' },
      ],
    },
    {
      id: '2',
      title: '1-a-1 com João Silva',
      date: '2024-03-23',
      time: '10:00',
      location: 'Café Central',
      type: 'one_to_one',
      description: 'Conversa sobre oportunidades de parceria em marketing digital.',
      participants: [
        { name: 'João Silva', avatar: '' },
      ],
    },
  ];

  const getTypeColor = (type: Meeting['type']) => {
    switch (type) {
      case 'weekly':
        return 'blue';
      case 'one_to_one':
        return 'green';
      case 'training':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const getTypeText = (type: Meeting['type']) => {
    switch (type) {
      case 'weekly':
        return 'Reunião Semanal';
      case 'one_to_one':
        return '1-a-1';
      case 'training':
        return 'Treinamento';
      default:
        return 'Outro';
    }
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Reuniões</Heading>
        <Button
          leftIcon={<Icon as={FiPlus} />}
          colorScheme="brand"
          onClick={() => {/* TODO: Abrir modal de nova reunião */}}
        >
          Nova Reunião
        </Button>
      </Flex>

      <Tabs colorScheme="brand">
        <TabList mb={6}>
          <Tab>Próximas Reuniões</Tab>
          <Tab>Histórico</Tab>
          <Tab>Calendário</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            <Grid gap={6}>
              {mockMeetings.map((meeting) => (
                <Box
                  key={meeting.id}
                  bg={bgColor}
                  p={6}
                  borderRadius="lg"
                  boxShadow="sm"
                >
                  <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={6}>
                    <VStack align="start" spacing={4}>
                      <Flex justify="space-between" w="full">
                        <VStack align="start" spacing={1}>
                          <Heading size="md">{meeting.title}</Heading>
                          <Badge colorScheme={getTypeColor(meeting.type)}>
                            {getTypeText(meeting.type)}
                          </Badge>
                        </VStack>
                      </Flex>

                      <Text color="gray.600">
                        {meeting.description}
                      </Text>

                      <Divider />

                      <HStack spacing={6}>
                        <Flex align="center" gap={2}>
                          <Icon as={FiCalendar} color="gray.500" />
                          <Text>{new Date(meeting.date).toLocaleDateString('pt-BR')}</Text>
                        </Flex>
                        <Flex align="center" gap={2}>
                          <Icon as={FiClock} color="gray.500" />
                          <Text>{meeting.time}</Text>
                        </Flex>
                        <Flex align="center" gap={2}>
                          <Icon as={FiMapPin} color="gray.500" />
                          <Text>{meeting.location}</Text>
                        </Flex>
                      </HStack>
                    </VStack>

                    {meeting.participants && (
                      <VStack align="start" spacing={2}>
                        <Flex align="center" gap={2}>
                          <Icon as={FiUsers} color="gray.500" />
                          <Text fontWeight="medium">Participantes</Text>
                        </Flex>
                        <AvatarGroup size="md" max={4}>
                          {meeting.participants.map((participant, index) => (
                            <Avatar
                              key={index}
                              name={participant.name}
                              src={participant.avatar}
                            />
                          ))}
                        </AvatarGroup>
                      </VStack>
                    )}
                  </Grid>
                </Box>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel>
            <Box textAlign="center" py={10}>
              <Text color="gray.500">
                Histórico de reuniões em breve!
              </Text>
            </Box>
          </TabPanel>

          <TabPanel>
            <Box textAlign="center" py={10}>
              <Text color="gray.500">
                Calendário interativo em breve!
              </Text>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
} 