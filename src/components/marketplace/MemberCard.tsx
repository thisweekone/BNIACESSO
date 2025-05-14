"use client";

import {
  Box,
  Heading,
  Text,
  Badge,
  Avatar,
  VStack,
  HStack,
  Icon,
  LinkBox,
  LinkOverlay,
  useColorModeValue,
  Button,
  Flex,
  Tag,
  TagLabel,
  Tooltip,
  Spacer
} from '@chakra-ui/react';
import { FiMapPin, FiPhone, FiMail, FiLink, FiUser } from 'react-icons/fi';
import NextLink from 'next/link';

interface MemberCardProps {
  member: {
    id: string;
    name: string;
    email: string;
    phone: string;
    specialty: string;
    company: string;
    city: string;
    website?: string;
    profile_description?: string;
    avatar_url?: string;
    tags?: string[] | string;
  };
}

export default function MemberCard({ member }: MemberCardProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const descBg = useColorModeValue('gray.50', 'gray.700');
  
  // Processar tags se existirem
  let tagsList: string[] = [];
  
  if (member.tags) {
    // Verificar se tags é um array ou uma string
    if (Array.isArray(member.tags)) {
      // Se for array, usar diretamente
      tagsList = member.tags.filter(Boolean);
    } else if (typeof member.tags === 'string') {
      // Se for string (formato legado), dividir por vírgula
      tagsList = member.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    }
  }

  return (
    <LinkBox
      as="article"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={cardBg}
      borderColor={borderColor}
      _hover={{
        transform: 'translateY(-4px)',
        shadow: 'md',
        borderColor: 'brand.300'
      }}
      transition="all 0.3s"
    >
      <Box p={6}>
        <Flex direction="column" align="center" textAlign="center" mb={4}>
          <Avatar
            size="xl"
            name={member.name}
            src={member.avatar_url || ''}
            mb={3}
          />
          <LinkOverlay as={NextLink} href={`/marketplace/${member.id}`}>
            <Heading as="h3" size="md" mb={1}>
              {member.name}
            </Heading>
          </LinkOverlay>
          
          <Badge colorScheme="brand" mb={2}>
            {member.specialty}
          </Badge>
          
          {member.company && (
            <Text fontSize="sm" color="gray.500">
              {member.company}
            </Text>
          )}
        </Flex>
        
        {member.profile_description && (
          <Box 
            bg={descBg} 
            p={3} 
            borderRadius="md" 
            mb={4}
            maxH="100px"
            overflow="hidden"
            position="relative"
          >
            <Text fontSize="sm" noOfLines={3}>
              {member.profile_description}
            </Text>
            {member.profile_description.length > 150 && (
              <Box 
                position="absolute" 
                bottom={0} 
                left={0} 
                right={0} 
                h="30px" 
                bgGradient={useColorModeValue(
                  'linear(to-b, transparent, gray.50)', 
                  'linear(to-b, transparent, gray.700)'
                )}
              />
            )}
          </Box>
        )}
        
        <VStack align="start" spacing={2} mb={4}>
          {member.city && (
            <HStack>
              <Icon as={FiMapPin} color="gray.500" />
              <Text fontSize="sm">{member.city}</Text>
            </HStack>
          )}
          
          {member.phone && (
            <HStack>
              <Icon as={FiPhone} color="gray.500" />
              <Text fontSize="sm">{member.phone}</Text>
            </HStack>
          )}
          
          <HStack>
            <Icon as={FiMail} color="gray.500" />
            <Text fontSize="sm">{member.email}</Text>
          </HStack>
          
          {member.website && (
            <HStack>
              <Icon as={FiLink} color="gray.500" />
              <Text fontSize="sm" as="a" href={member.website} target="_blank" color="brand.500">
                Website
              </Text>
            </HStack>
          )}
        </VStack>
        
        {tagsList.length > 0 && (
          <Box>
            <Flex wrap="wrap" gap={2} mt={2}>
              {tagsList.slice(0, 3).map((tag, index) => (
                <Tag size="sm" key={index} colorScheme="brand" variant="subtle">
                  <TagLabel>{tag}</TagLabel>
                </Tag>
              ))}
              {tagsList.length > 3 && (
                <Tooltip label={tagsList.slice(3).join(', ')}>
                  <Tag size="sm" colorScheme="gray">
                    <TagLabel>+{tagsList.length - 3}</TagLabel>
                  </Tag>
                </Tooltip>
              )}
            </Flex>
          </Box>
        )}
        
        <Flex mt={5} justifyContent="center">
          <Button 
            as={NextLink}
            href={`/marketplace/${member.id}`}
            colorScheme="brand" 
            size="sm"
            leftIcon={<Icon as={FiUser} />}
            width="full"
          >
            Ver Perfil Completo
          </Button>
        </Flex>
      </Box>
    </LinkBox>
  );
}
