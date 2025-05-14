'use client';

import {
  Box,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiMenu, FiUser, FiBell } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface HeaderProps {
  onOpenSidebar: () => void;
}

export function Header({ onOpenSidebar }: HeaderProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const bgColor = useColorModeValue('white', 'gray.800');

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <Box
      as="header"
      bg={bgColor}
      px={4}
      py={2}
      boxShadow="sm"
      position="sticky"
      top={0}
      zIndex="sticky"
      height="60px"
    >
      <Flex justify="space-between" align="center" h="full">
        <Flex align="center">
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onOpenSidebar}
            variant="ghost"
            aria-label="Abrir menu"
            icon={<FiMenu />}
            mr={2}
          />
          <Text
            fontSize="lg"
            fontWeight="bold"
            color="brand.600"
          >
            BNI Acesso
          </Text>
        </Flex>

        <Flex align="center" gap={2}>
          <IconButton
            variant="ghost"
            aria-label="Notificações"
            icon={<FiBell />}
            size="sm"
          />

          <Menu>
            <MenuButton
              as={IconButton}
              variant="ghost"
              aria-label="Menu do usuário"
              icon={<FiUser />}
              size="sm"
            />
            <MenuList>
              <MenuItem onClick={() => router.push('/dashboard/perfil')}>
                Meu Perfil
              </MenuItem>
              <MenuItem onClick={handleSignOut}>Sair</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </Box>
  );
}