'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Icon,
  Link,
  Stack,
  Text,
  useColorModeValue,
  useBreakpointValue,
  Badge,
  Divider,
  Collapse,
} from '@chakra-ui/react';
import {
  FiHome,
  FiUsers,
  FiMap,
  FiCalendar,
  FiStar,
  FiLink,
  FiSettings,
  FiUser,
  FiShoppingBag,
  FiExternalLink,
  FiUserCheck,
  FiShield,
  FiLayers,
  FiChevronDown,
  FiChevronRight,
  FiClock,
  FiMail,
  FiMessageSquare,
} from 'react-icons/fi';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItemProps {
  icon: any;
  children: React.ReactNode;
  href: string;
  isActive?: boolean;
}

function NavItem({ icon, children, href, isActive }: NavItemProps) {
  const activeBg = useColorModeValue('brand.50', 'brand.900');
  const activeColor = useColorModeValue('brand.700', 'brand.200');
  const inactiveColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Link
      as={NextLink}
      href={href}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? activeBg : 'transparent'}
        color={isActive ? activeColor : inactiveColor}
        _hover={{
          bg: activeBg,
          color: activeColor,
        }}
      >
        <Icon
          mr="4"
          fontSize="16"
          as={icon}
        />
        <Text fontSize="md">{children}</Text>
      </Flex>
    </Link>
  );
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const bgColor = useColorModeValue('white', 'gray.800');
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminExpanded, setIsAdminExpanded] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const supabase = createClientComponentClient();
  
  // Verificar se o usuário tem papel de administrador e contar solicitações pendentes
  useEffect(() => {
    async function checkAdminRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data: userData, error } = await supabase
          .from('members')
          .select('role')
          .eq('email', user.email)
          .single();
          
        if (!error && userData && [
          'administrador_plataforma', 
          'administrador_grupo'
        ].includes(userData.role)) {
          setIsAdmin(true);
          
          // Expandir o menu de admin automaticamente se a rota atual é uma rota de admin
          if (pathname.includes('/dashboard/admin')) {
            setIsAdminExpanded(true);
          }
          
          // Contar solicitações pendentes
          fetchPendingRequestsCount();
        }
      } catch (err) {
        console.error('Erro ao verificar papel do usuário:', err);
      }
    }
    
    // Função para contar solicitações pendentes
    async function fetchPendingRequestsCount() {
      try {
        const { count, error } = await supabase
          .from('registration_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pendente');
        
        if (!error && count !== null) {
          setPendingRequestsCount(count);
        }
      } catch (err) {
        console.error('Erro ao contar solicitações pendentes:', err);
      }
    }

    // Função para contar mensagens não lidas
    async function fetchUnreadMessagesCount() {
      try {
        // Verifica se o usuário está autenticado
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session) return;
        
        // Conta diretamente as mensagens não lidas para o usuário atual
        // Dependendo apenas das políticas RLS configuradas no banco
        const { count, error } = await supabase
          .from('contact_messages')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false);
        
        if (!error && count !== null) {
          setUnreadMessagesCount(count);
        }
      } catch (err) {
        console.error('Erro ao contar mensagens não lidas:', err);
      }
    }
    
    checkAdminRole();
    fetchUnreadMessagesCount(); // Busca mensagens não lidas para todos os usuários
  }, []);

  const SidebarContent = () => (
    <Box
      bg={bgColor}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w="240px"
      pos="fixed"
      h="full"
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold" color="brand.600">
          BNI Acesso
        </Text>
      </Flex>
      <Stack spacing={1}>
        <NavItem
          icon={FiHome}
          href="/dashboard"
          isActive={pathname === '/dashboard'}
        >
          Dashboard
        </NavItem>
        <NavItem
          icon={FiLink}
          href="/dashboard/referencias"
          isActive={pathname.startsWith('/dashboard/referencias')}
        >
          Referências
        </NavItem>
        <NavItem
          icon={FiUsers}
          href="/dashboard/membros"
          isActive={pathname.startsWith('/dashboard/membros')}
        >
          Membros
        </NavItem>
        <NavItem
          icon={FiUser}
          href="/dashboard/perfil"
          isActive={pathname.startsWith('/dashboard/perfil')}
        >
          Perfil do Membro
        </NavItem>
        <NavItem
          icon={FiMail}
          href="/dashboard/mensagens"
          isActive={pathname.startsWith('/dashboard/mensagens')}
        >
          <Flex align="center" width="full" justify="space-between">
            <Text>Mensagens</Text>
            {unreadMessagesCount > 0 && (
              <Badge colorScheme="red" borderRadius="full" ml={2}>
                {unreadMessagesCount}
              </Badge>
            )}
          </Flex>
        </NavItem>
        {/* Botão do Mapa temporariamente oculto - Integrado à página de membros 
        <NavItem
          icon={FiMap}
          href="/dashboard/mapa"
          isActive={pathname.startsWith('/dashboard/mapa')}
        >
          Mapa
        </NavItem>
        */}
        {/* Botão de Reuniões temporariamente oculto 
        <NavItem
          icon={FiCalendar}
          href="/dashboard/reunioes"
          isActive={pathname.startsWith('/dashboard/reunioes')}
        >
          Reuniões
        </NavItem>
        */}
        <NavItem
          icon={FiStar}
          href="/dashboard/casos-sucesso"
          isActive={pathname.startsWith('/dashboard/casos-sucesso')}
        >
          Casos de Sucesso
        </NavItem>
        <NavItem
          icon={FiClock}
          href="/dashboard/conexoes"
          isActive={pathname.startsWith('/dashboard/conexoes')}
        >
          Conexões
        </NavItem>
        <NavItem
          icon={FiSettings}
          href="/dashboard/configuracoes"
          isActive={pathname.startsWith('/dashboard/configuracoes')}
        >
          Configurações
        </NavItem>
        
        {/* Seção de Administração - visível apenas para admins */}
        {isAdmin && (
          <>
            <Box px={8} py={2} mt={2}>
              <Box borderBottom="1px" borderColor={useColorModeValue('gray.200', 'gray.700')} />
              <Flex 
                align="center" 
                py={2} 
                cursor="pointer"
                onClick={() => setIsAdminExpanded(!isAdminExpanded)}
              >
                <Text fontWeight="bold" fontSize="sm" color="gray.500">ADMINISTRAÇÃO</Text>
                <Icon 
                  as={isAdminExpanded ? FiChevronDown : FiChevronRight} 
                  ml="auto" 
                  color="gray.500"
                />
              </Flex>
            </Box>
            
            <Collapse in={isAdminExpanded} animateOpacity>
              <NavItem
                icon={FiUserCheck}
                href="/dashboard/admin/solicitacoes"
                isActive={pathname.startsWith('/dashboard/admin/solicitacoes')}
              >
                Solicitações
                {pendingRequestsCount > 0 && (
                  <Badge ml={2} colorScheme="red" variant="solid" borderRadius="full">
                    {pendingRequestsCount}
                  </Badge>
                )}
              </NavItem>
              
              <NavItem
                icon={FiUsers}
                href="/dashboard/admin/membros"
                isActive={pathname.startsWith('/dashboard/admin/membros')}
              >
                Gerenciar Membros
              </NavItem>
              
              <NavItem
                icon={FiLayers}
                href="/dashboard/admin/grupos"
                isActive={pathname.startsWith('/dashboard/admin/grupos')}
              >
                Grupos
              </NavItem>
            </Collapse>
          </>
        )}
        
        {/* Divisor para link externo */}
        <Box px={8} py={2}>
          <Box borderBottom="1px" borderColor={useColorModeValue('gray.200', 'gray.700')} />
        </Box>
        
        {/* Link para o marketplace público */}
        <NavItem
          icon={FiShoppingBag}
          href="/marketplace"
          isActive={false}
        >
          Marketplace <Icon as={FiExternalLink} ml={1} boxSize={3} />
        </NavItem>
      </Stack>
    </Box>
  );

  // Versão mobile (Drawer)
  if (isMobile) {
    return (
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody p={0}>
            <SidebarContent />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }

  // Versão desktop
  return <SidebarContent />;
}