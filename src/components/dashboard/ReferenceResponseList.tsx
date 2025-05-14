"use client";

import { useState, useEffect } from "react";
import {
  VStack,
  Box,
  Text,
  Badge,
  HStack,
  Icon,
  useColorModeValue,
  Spinner,
  Center,
  Heading,
  Divider,
  Flex
} from "@chakra-ui/react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { FiUser, FiMail, FiPhone, FiBriefcase, FiMapPin } from "react-icons/fi";

interface ReferenceResponseListProps {
  referenceId: string;
  isOwner: boolean;
  onResponsesLoaded?: (count: number) => void;
}

export default function ReferenceResponseList({ referenceId, isOwner, onResponsesLoaded }: ReferenceResponseListProps) {
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchResponses = async () => {
      setLoading(true);
      try {
        // Primeiro verificamos se a tabela reference_responses existe
        // usando uma consulta segura que falha silenciosamente se a tabela não existir
        try {
          const { count, error: countError } = await supabase
            .from("reference_responses")
            .select("*", { count: "exact", head: true });
            
          // Se tivemos um erro como "relation \"reference_responses\" does not exist",
          // então a tabela ainda não foi criada
          if (countError) {
            console.warn("A tabela reference_responses pode não existir ainda:", countError);
            setResponses([]);
            if (onResponsesLoaded) onResponsesLoaded(0);
            setLoading(false);
            return;
          }
        } catch (checkError) {
          console.warn("Erro ao verificar existência da tabela:", checkError);
          // Continuamos mesmo com erro, pois pode ser outro problema
        }
          
        // Se não for o dono, precisamos verificar se o usuário atual respondeu
        if (!isOwner) {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user?.email) {
            setLoading(false);
            return;
          }
          
          try {
            const { data, error } = await supabase
              .from("reference_responses")
              .select("*")
              .eq("request_id", referenceId)
              .eq("responder_email", user.email);
              
            if (error) {
              console.warn("Erro ao buscar respostas do usuário atual:", error);
              setResponses([]);
            } else {
              setResponses(data || []);
            }
            
            if (onResponsesLoaded) onResponsesLoaded(data?.length || 0);
          } catch (error) {
            console.error("Erro ao buscar respostas do usuário:", error);
            setResponses([]);
            if (onResponsesLoaded) onResponsesLoaded(0);
          }
        } else {
          // Se for o dono, buscar todas as respostas
          try {
            const { data, error } = await supabase
              .from("reference_responses")
              .select("*, members(name)")
              .eq("request_id", referenceId)
              .order("created_at", { ascending: false });
              
            if (error) {
              console.warn("Erro ao buscar todas as respostas:", error);
              setResponses([]);
            } else {
              setResponses(data || []);
            }
            
            if (onResponsesLoaded) onResponsesLoaded(data?.length || 0);
          } catch (error) {
            console.error("Erro ao buscar todas as respostas:", error);
            setResponses([]);
            if (onResponsesLoaded) onResponsesLoaded(0);
          }
        }
      } catch (error) {
        console.error("Erro geral ao buscar respostas:", error);
        setResponses([]);
        if (onResponsesLoaded) onResponsesLoaded(0);
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [referenceId, isOwner, supabase, onResponsesLoaded]);

  if (loading) {
    return (
      <Center py={8}>
        <Spinner size="lg" color="brand.500" />
      </Center>
    );
  }

  if (responses.length === 0) {
    return (
      <Box p={6} bg={bgColor} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
        <Text textAlign="center" color="gray.500">
          {isOwner ? 
            "Nenhuma resposta recebida ainda." : 
            "Você ainda não respondeu a esta solicitação."}
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch" width="100%">
      {responses.map((response) => (
        <Box
          key={response.id}
          p={6}
          bg={bgColor}
          borderRadius="md"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          <Flex justify="space-between" align="start" mb={4}>
            <Box>
              <Heading size="sm" mb={1}>
                {response.contact_name}
                {response.company_name && ` - ${response.company_name}`}
              </Heading>
              <Text fontSize="sm" color="gray.500">
                {isOwner ? `Indicado por ${response.members?.name || 'Membro BNI'}` : ''}
                {' '} em {new Date(response.created_at).toLocaleDateString()}
              </Text>
            </Box>
            <HStack spacing={1}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Badge
                  key={i}
                  colorScheme={i < response.heat_level ? "red" : "gray"}
                  variant={i < response.heat_level ? "solid" : "outline"}
                  px={2}
                >
                  {i + 1}
                </Badge>
              ))}
            </HStack>
          </Flex>

          <Text mb={4}>{response.description}</Text>

          <Divider mb={4} />

          <VStack align="start" spacing={2}>
            <HStack>
              <Icon as={FiUser} color="gray.500" />
              <Text>{response.contact_name}</Text>
            </HStack>
            
            {response.company_name && (
              <HStack>
                <Icon as={FiBriefcase} color="gray.500" />
                <Text>{response.company_name}</Text>
              </HStack>
            )}
            
            <HStack>
              <Icon as={FiPhone} color="gray.500" />
              <Text>{response.contact_phone || "Não informado"}</Text>
            </HStack>
            
            <HStack>
              <Icon as={FiMail} color="gray.500" />
              <Text>{response.contact_email || "Não informado"}</Text>
            </HStack>
            
            {response.contact_address && (
              <HStack>
                <Icon as={FiMapPin} color="gray.500" />
                <Text>{response.contact_address}</Text>
              </HStack>
            )}
          </VStack>
        </Box>
      ))}
    </VStack>
  );
}
