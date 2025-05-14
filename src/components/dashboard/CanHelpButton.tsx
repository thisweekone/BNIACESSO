"use client";

import { useState, useRef } from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useDisclosure,
  useToast,
  RadioGroup,
  Radio,
  HStack,
  Text,
  Box
} from "@chakra-ui/react";
import { FiHelpCircle } from "react-icons/fi";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface CanHelpButtonProps {
  referenceId: string;
  onResponse?: () => void;
}

export default function CanHelpButton({ referenceId, onResponse }: CanHelpButtonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [form, setForm] = useState({
    contactName: "",
    companyName: "",
    contactPhone: "",
    contactEmail: "",
    contactAddress: "",
    description: "",
    heatLevel: "3"
  });
  const [loading, setLoading] = useState(false);
  const initialRef = useRef(null);
  const toast = useToast();
  const supabase = createClientComponentClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleHeatLevelChange = (value: string) => {
    setForm((prev) => ({ ...prev, heatLevel: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) {
        throw new Error("Usuário não autenticado");
      }

      // 2. Buscar ID do membro
      const { data: memberData, error: memberError } = await supabase
        .from("members")
        .select("id")
        .eq("email", user.email)
        .single();

      if (memberError) throw memberError;
      const memberId = memberData?.id;

      // 3. Salvar resposta
      const { error: responseError } = await supabase
        .from("reference_responses")
        .insert({
          request_id: referenceId,
          responder_id: memberId,
          responder_email: user.email,
          contact_name: form.contactName,
          company_name: form.companyName,
          contact_phone: form.contactPhone,
          contact_email: form.contactEmail,
          contact_address: form.contactAddress,
          description: form.description,
          heat_level: parseInt(form.heatLevel)
        });

      if (responseError) throw responseError;

      // 4. Salvar histórico de contatos para alertas futuros
      const { data: requestData } = await supabase
        .from("reference_requests")
        .select("tags")
        .eq("id", referenceId)
        .single();

      await supabase.from("contact_history").insert({
        member_id: memberId,
        contact_name: form.contactName,
        contact_email: form.contactEmail,
        contact_phone: form.contactPhone,
        tags: requestData?.tags || ""
      });

      toast({
        title: "Resposta enviada",
        description: "Sua indicação foi registrada com sucesso!",
        status: "success",
        duration: 3000,
        isClosable: true
      });

      if (onResponse) onResponse();
      onClose();
      
      // Resetar formulário
      setForm({
        contactName: "",
        companyName: "",
        contactPhone: "",
        contactEmail: "",
        contactAddress: "",
        description: "",
        heatLevel: "3"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar sua resposta",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        leftIcon={<FiHelpCircle />} 
        colorScheme="brand" 
        onClick={onOpen}
      >
        Posso Ajudar
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        initialFocusRef={initialRef}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>Indicar Contato</ModalHeader>
            <ModalCloseButton />
            
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Nome do Contato</FormLabel>
                  <Input 
                    ref={initialRef}
                    name="contactName"
                    value={form.contactName}
                    onChange={handleChange}
                    placeholder="Nome completo do contato"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Empresa</FormLabel>
                  <Input 
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder="Nome da empresa (opcional)"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Telefone</FormLabel>
                  <Input 
                    name="contactPhone"
                    value={form.contactPhone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input 
                    name="contactEmail"
                    type="email"
                    value={form.contactEmail}
                    onChange={handleChange}
                    placeholder="email@exemplo.com"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Endereço</FormLabel>
                  <Input 
                    name="contactAddress"
                    value={form.contactAddress}
                    onChange={handleChange}
                    placeholder="Endereço (opcional)"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Descrição/Observações</FormLabel>
                  <Textarea 
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Informações adicionais sobre o contato"
                    rows={3}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Quão quente é esta referência?</FormLabel>
                  <Box py={2}>
                    <RadioGroup value={form.heatLevel} onChange={handleHeatLevelChange}>
                      <HStack spacing={4} justifyContent="space-between">
                        {[1, 2, 3, 4, 5].map(level => (
                          <Box key={level} textAlign="center">
                            <Radio value={level.toString()} colorScheme={
                              level === 1 ? "yellow" :
                              level === 2 ? "orange" :
                              level === 3 ? "red" :
                              level === 4 ? "pink" :
                              "purple"
                            }>
                              <Text fontSize="lg">{level}</Text>
                            </Radio>
                            <Text fontSize="xs" mt={1} color="gray.500">
                              {level === 1 ? "Fria" :
                               level === 2 ? "Morna" :
                               level === 3 ? "Média" :
                               level === 4 ? "Quente" :
                               "Muito Quente"}
                            </Text>
                          </Box>
                        ))}
                      </HStack>
                    </RadioGroup>
                  </Box>
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                colorScheme="brand" 
                type="submit" 
                isLoading={loading}
              >
                Enviar Indicação
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}
