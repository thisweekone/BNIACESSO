"use client";

import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  useColorModeValue,
  useDisclosure,
  IconButton,
  Container,
  Image,
  Link as ChakraLink
} from '@chakra-ui/react';
import { FiMenu, FiX } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PublicHeader() {
  const { isOpen, onToggle } = useDisclosure();
  const router = useRouter();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      bg={bgColor}
      borderBottom={1}
      borderStyle={'solid'}
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex={100}
      shadow="sm"
    >
      <Container maxW="container.xl">
        <Flex
          minH={'60px'}
          py={{ base: 2 }}
          align={'center'}
          justify={'space-between'}
        >
          <Flex
            flex={{ base: 1, md: 'auto' }}
            ml={{ base: -2 }}
            display={{ base: 'flex', md: 'none' }}
          >
            <IconButton
              onClick={onToggle}
              icon={
                isOpen ? <FiX size={16} /> : <FiMenu size={24} />
              }
              variant={'ghost'}
              aria-label={'Toggle Navigation'}
            />
          </Flex>
          
          <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
            <ChakraLink as={Link} href="/">
              <Flex align="center">
                {/* Logo do BNI (substitua pelo caminho correto da imagem) */}
                <Text 
                  fontSize="xl" 
                  fontWeight="bold" 
                  color="brand.500"
                  letterSpacing="tight"
                >
                  BNI ACESSO
                </Text>
              </Flex>
            </ChakraLink>

            <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
              <DesktopNav />
            </Flex>
          </Flex>

          <Stack
            flex={{ base: 1, md: 0 }}
            justify={'flex-end'}
            direction={'row'}
            spacing={6}
          >
            <Button
              as={Link}
              fontSize={'sm'}
              fontWeight={400}
              variant={'link'}
              href={'/login'}
            >
              Entrar
            </Button>
            <Button
              as={Link}
              display={{ base: 'none', md: 'inline-flex' }}
              fontSize={'sm'}
              fontWeight={600}
              color={'white'}
              bg={'brand.500'}
              href={'/login?register=true'}
              _hover={{
                bg: 'brand.600',
              }}
            >
              Cadastrar
            </Button>
          </Stack>
        </Flex>

        {/* Mobile Navigation */}
        <Box
          display={{ base: isOpen ? 'block' : 'none', md: 'none' }}
          p={4}
          borderBottom={1}
          borderStyle={'solid'}
          borderColor={borderColor}
        >
          <Stack as={'nav'} spacing={4}>
            <ChakraLink as={Link} href="/" _hover={{ textDecoration: 'none' }}>
              Home
            </ChakraLink>
            <ChakraLink as={Link} href="/marketplace" _hover={{ textDecoration: 'none' }}>
              Marketplace
            </ChakraLink>
            <ChakraLink as={Link} href="/sobre" _hover={{ textDecoration: 'none' }}>
              Sobre Nós
            </ChakraLink>
            <ChakraLink as={Link} href="/contato" _hover={{ textDecoration: 'none' }}>
              Contato
            </ChakraLink>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

// Navigation component for desktop view
function DesktopNav() {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('brand.500', 'brand.300');
  
  const NAV_ITEMS = [
    {
      label: 'Home',
      href: '/',
    },
    {
      label: 'Marketplace',
      href: '/marketplace',
    },
    {
      label: 'Sobre Nós',
      href: '/sobre',
    },
    {
      label: 'Contato',
      href: '/contato',
    },
  ];

  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <ChakraLink
            as={Link}
            href={navItem.href}
            p={2}
            fontSize={'sm'}
            fontWeight={500}
            color={linkColor}
            _hover={{
              textDecoration: 'none',
              color: linkHoverColor,
            }}
          >
            {navItem.label}
          </ChakraLink>
        </Box>
      ))}
    </Stack>
  );
}
