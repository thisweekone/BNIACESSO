"use client";
import { useState, useEffect } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
  FormHelperText
} from "@chakra-ui/react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { TagInput } from "@/components/TagInput";

interface ReferenceFormData {
  title: string;
  description: string;
  tags: string[];
}

interface ReferenceRequestFormProps {
  onSubmit: (form: ReferenceFormData) => void;
}

export default function ReferenceRequestForm({ onSubmit }: ReferenceRequestFormProps) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    tags: ""
  });
  
  // Função para converter o formulário para o formato esperado pela API
  const getFormDataForSubmit = (): ReferenceFormData => {
    return {
      title: form.title,
      description: form.description,
      tags: form.tags ? form.tags.split(',') : []
    };
  };
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const toast = useToast();
  const supabase = createClientComponentClient();
  
  // Obter dados do usuário logado
  useEffect(() => {
    async function getUserData() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserEmail(data.user.email || "");
      }
    }
    
    getUserData();
  }, [supabase.auth]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!userEmail) {
        throw new Error("Usuário não está autenticado");
      }
      
      // Insere a solicitação no banco de dados com o email do usuário
      const formDataForApi = getFormDataForSubmit();
      const { data, error } = await supabase.from('reference_requests')
        .insert({
          title: formDataForApi.title,
          description: formDataForApi.description,
          tags: formDataForApi.tags,
          user_email: userEmail,
          created_at: new Date().toISOString()
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Solicitação criada!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Verificar matches automaticamente após criar a solicitação
      if (data && data.length > 0) {
        const requestId = data[0].id;
        
        // Chamar a função de verificar matches e informar ao usuário
        try {
          // Importação dinâmica para evitar dependência circular
          const { findMatchesForRequest } = await import('@/utils/matchFunctions');
          const matches = await findMatchesForRequest(requestId);
          
          if (matches && matches.length > 0) {
            toast({
              title: `${matches.length} matches encontrados!`,
              description: "Clique em sua solicitação para ver os matches sugeridos.",
              status: "info",
              duration: 5000,
              isClosable: true,
            });
          }
        } catch (matchError) {
          console.error('Erro ao verificar matches automáticos:', matchError);
        }
      }
      
      const formData = getFormDataForSubmit();
      setForm({ title: "", description: "", tags: "" });
      onSubmit(formData); // Passa os dados do formulário formatados e fecha o modal
    } catch (err: any) {
      toast({
        title: "Erro ao criar solicitação",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded shadow p-6 mb-6 max-w-xl mx-auto">
      <VStack spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel>Título</FormLabel>
          <Input name="title" value={form.title} onChange={handleChange} placeholder="Ex: Procuro empresas que..." />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Descrição</FormLabel>
          <Textarea name="description" value={form.description} onChange={handleChange} placeholder="Descreva sua necessidade" />
        </FormControl>
        <FormControl>
          <FormLabel>Tags (palavras-chave para matches)</FormLabel>
          <TagInput value={form.tags} onChange={(value) => setForm(prev => ({ ...prev, tags: value }))} />
          <FormHelperText>Escolha tags existentes ou crie novas para melhorar as chances de match</FormHelperText>
        </FormControl>
        <Button colorScheme="brand" type="submit" isLoading={loading}>Criar Solicitação</Button>
      </VStack>
    </form>
  );
}
