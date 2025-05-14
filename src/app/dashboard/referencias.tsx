import ReferenceRequestForm from "../../components/dashboard/ReferenceRequestForm";
import { ReferencesList } from "../../components/dashboard/ReferencesList";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Box, Heading, useDisclosure, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody } from "@chakra-ui/react";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import { OpenRequests } from '../../components/dashboard/OpenRequests';
// Removendo importação não utilizada de @supabase/auth-helpers-react

export default function ReferenciasPage() {
  const [refresh, setRefresh] = useState(0);
  const supabase = createClientComponentClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [userEmail, setUserEmail] = useState('');
  
  // Obtendo os dados do usuário diretamente do cliente Supabase
  useEffect(() => {
    async function getUserEmail() {
      const { data: { session } } = await supabase.auth.getSession();
      setUserEmail(session?.user?.email || '');
    }
    getUserEmail();
  }, [supabase]);

  // Interface para tipar o formulário de referência
  interface ReferenceFormData {
    title: string;
    description: string;
    tags: string[];
  }

  // Função para criar solicitação no banco
  async function handleCreateReference(form: ReferenceFormData) {
    await supabase.from("reference_requests").insert({
      title: form.title,
      description: form.description,
      tags: form.tags
    });
    setRefresh((r) => r + 1);
  }

  // Você pode passar refresh para o ReferencesList para recarregar quando criar
  return (
    <main className="p-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Heading as="h2" size="lg">Referências</Heading>
        <Button colorScheme="brand" onClick={onOpen}>+ Novo Pedido</Button>
      </div>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Criar Solicitação de Referência</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ReferenceRequestForm onSubmit={async (form) => { await handleCreateReference(form); onClose(); }} />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Tabs colorScheme="brand" isFitted variant="enclosed">
        <TabList>
          <Tab>Pedidos em Aberto</Tab>
          <Tab>Meus Pedidos</Tab>
          <Tab>Pedidos do Meu Grupo</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <OpenRequests />
          </TabPanel>
          <TabPanel>
            <OpenRequests userEmail={userEmail} />
          </TabPanel>
          <TabPanel>
            <OpenRequests userGroup={"TODO_GRUPO_USUARIO"} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </main>
  );
}
