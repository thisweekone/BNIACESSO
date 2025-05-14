'use client';

import {
  VStack,
  Box,
  Text,
  Badge,
  Flex,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiClock, FiMapPin } from 'react-icons/fi';

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'weekly' | 'one_to_one' | 'training';
}

const mockMeetings: Meeting[] = [
  {
    id: '1',
    title: 'Reunião Semanal BNI',
    date: '2023-12-22',
    time: '07:00',
    location: 'Hotel Business',
    type: 'weekly',
  },
  {
    id: '2',
    title: '1-a-1 com João Silva',
    date: '2023-12-23',
    time: '10:00',
    location: 'Café Central',
    type: 'one_to_one',
  },
];

export function NextMeetings() {
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const getTypeColor = (type: Meeting['type']) => {
    switch (type) {
      case 'weekly':
        return 'red';
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
    <VStack spacing={4} align="stretch">
      {mockMeetings.map((meeting) => (
        <Box
          key={meeting.id}
          p={4}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="md"
        >
          <Flex justify="space-between" align="start" mb={2}>
            <Text fontWeight="medium">{meeting.title}</Text>
            <Badge colorScheme={getTypeColor(meeting.type)}>
              {getTypeText(meeting.type)}
            </Badge>
          </Flex>

          <Flex gap={4}>
            <Flex align="center" gap={1}>
              <Icon as={FiClock} color="gray.500" />
              <Text fontSize="sm" color="gray.500">
                {new Date(meeting.date).toLocaleDateString('pt-BR')} às{' '}
                {meeting.time}
              </Text>
            </Flex>

            <Flex align="center" gap={1}>
              <Icon as={FiMapPin} color="gray.500" />
              <Text fontSize="sm" color="gray.500">
                {meeting.location}
              </Text>
            </Flex>
          </Flex>
        </Box>
      ))}
    </VStack>
  );
}