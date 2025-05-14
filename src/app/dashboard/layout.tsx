'use client';

import { Box, Flex, useDisclosure } from '@chakra-ui/react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex minH="100vh">
      {/* Sidebar - escondida em mobile */}
      <Box
        display={{ base: 'none', md: 'block' }}
        w="240px"
        minW="240px"
      >
        <Sidebar isOpen={isOpen} onClose={onClose} />
      </Box>

      {/* Conteúdo principal */}
      <Box flex="1" overflow="auto">
        <Header onOpenSidebar={onOpen} />
        <Box as="main" p={4} bg="gray.50" minH="calc(100vh - 60px)">
          {children}
        </Box>
      </Box>

      {/* Sidebar mobile - drawer */}
      <Box display={{ base: 'block', md: 'none' }}>
        <Sidebar isOpen={isOpen} onClose={onClose} />
      </Box>
    </Flex>
  );
}