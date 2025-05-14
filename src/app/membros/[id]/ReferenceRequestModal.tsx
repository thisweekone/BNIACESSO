"use client";
import React, { useEffect, useState } from "react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, FormControl, FormLabel, Input, Textarea, useDisclosure, useToast } from "@chakra-ui/react";
import { createClient } from "@supabase/supabase-js";

export default function ReferenceRequestModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [client, setClient] = useState("");
  const [member, setMember] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const toast = useToast();

  useEffect(() => {
    function handleOpen(e: CustomEvent) {
      setClient(e.detail.client);
      setMember(e.detail.member);
      setTitle(`Pedido de referência para ${e.detail.client}`);
      setDescription("");
      onOpen();
    }
    window.addEventListener("openReferenceModal", handleOpen as EventListener);
    return () => window.removeEventListener("openReferenceModal", handleOpen as EventListener);
  }, [onOpen]);

  async function handleSubmit() {
    if (!member || !client || !title) return;
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { error } = await supabase.from("reference_requests").insert({
      title,
      description,
      tags: client,
      user_email: member.email
    });
    if (error) {
      toast({ title: "Erro ao criar pedido de referência", status: "error" });
    } else {
      toast({ title: "Pedido de referência criado!", status: "success" });
      onClose();
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Solicitar Referência para {client}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={3}>
            <FormLabel>Título</FormLabel>
            <Input value={title} onChange={e => setTitle(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Mensagem/Detalhes</FormLabel>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Explique o motivo ou contexto do pedido" />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" mr={3} onClick={handleSubmit}>Enviar Pedido</Button>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
