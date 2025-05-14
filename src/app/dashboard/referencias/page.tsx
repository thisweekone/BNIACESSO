'use client';

import {
  Box,
  Button,
  Flex,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useColorModeValue,
  Icon,
  Text,
} from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import { OpenRequests } from '@/components/dashboard/OpenRequests';
import { ReferencesList } from '@/components/dashboard/ReferencesList';
import { useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody } from '@chakra-ui/react';
import ReferenceRequestForm from '@/components/dashboard/ReferenceRequestForm';
import { ReferenceMatches } from '@/components/dashboard/ReferenceMatches';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Referencias() {
  const bgColor = useColorModeValue('white', 'gray.800');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const router = useRouter();

  const handleRequestSelect = (requestId: string) => {
    setActiveRequestId(requestId);
    setActiveTabIndex(2); // Muda para a aba de matches
  };

  const handleViewDetails = (requestId: string) => {
    router.push(`/dashboard/referencias/${requestId}`);
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Referências</Heading>
        <Button
          leftIcon={<Icon as={FiPlus} />}
          colorScheme="brand"
          onClick={onOpen}
        >
          Novo Pedido
        </Button>
      </Flex>

      <Tabs 
        colorScheme="brand" 
        bg={bgColor} 
        p={4} 
        borderRadius="lg" 
        boxShadow="sm"
        index={activeTabIndex}
        onChange={setActiveTabIndex}
      >
        <TabList>
          <Tab>Pedidos em Aberto</Tab>
          <Tab>Minhas Referências</Tab>
          <Tab>Matches Sugeridos</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <OpenRequests 
              onRequestSelect={handleRequestSelect}
              onViewDetails={handleViewDetails}
            />
          </TabPanel>

          <TabPanel>
            <ReferencesList refreshTrigger={refreshTrigger} />
          </TabPanel>

          <TabPanel>
            <Box py={6}>
              {!activeRequestId && (
                <Box textAlign="center">
                  <Text color="gray.500" mb={6}>
                    Selecione um pedido em aberto para ver matches sugeridos
                  </Text>
                </Box>
              )}
              {activeRequestId && (
                <>
                  <Text fontSize="lg" fontWeight="medium" mb={4}>
                    Matches inteligentes baseados nas suas tags e palavras-chave
                  </Text>
                  <ReferenceMatches requestId={activeRequestId} />
                </>
              )}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Criar Solicitação de Referência</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ReferenceRequestForm 
              onSubmit={() => {
                // Fecha o modal e atualiza a lista
                onClose();
                setRefreshTrigger(prev => prev + 1);
                // Muda para a aba 'Minhas Referências'
                setActiveTabIndex(1);
              }} 
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
} 