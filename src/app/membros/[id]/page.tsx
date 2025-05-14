"use client";
import { Box, Flex, Avatar, Heading, Text, Badge, HStack, VStack, Divider, Button, Icon, SimpleGrid, Card, CardBody, Tooltip } from "@chakra-ui/react";
import { FiMail, FiPhone, FiGlobe, FiMapPin } from "react-icons/fi";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import ReferenceRequestModal from './ReferenceRequestModal';

export default async function MemberProfile({ params }: { params: { id: string } }) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  // Busca membro
  const { data: member, error } = await supabase
    .from("members")
    .select(`*, member_services(services(name)), member_tags(tags(name))`)
    .eq("id", params.id)
    .single();
  if (error || !member) return notFound();

  // Busca referências recebidas e dadas
  const { data: references } = await supabase
    .from("member_references")
    .select("*, giver:members!giver_id(name, email), receiver:members!receiver_id(name, email)")
    .or(`giver_id.eq.${member.id},receiver_id.eq.${member.id}`)
    .order("created_at", { ascending: false });

  const services = member.member_services?.map((ms: any) => ms.services?.name) || [];
  const tags = member.member_tags?.map((mt: any) => mt.tags?.name) || [];

  return (
    <Box maxW="1200px" mx="auto" py={6} px={2}>
      <Heading mb={6}>Perfil do Membro</Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        {/* Card lateral */}
        <VStack align="stretch" spacing={4}>
          <Box bg="white" borderRadius="lg" boxShadow="md" p={6} textAlign="center">
            <Avatar name={member.name} size="2xl" mx="auto" mb={2} />
            <Text fontWeight="bold" fontSize="xl">{member.name}</Text>
            <Text color="blue.600" fontWeight="medium">{member.specialty}</Text>
            <HStack justify="center" color="gray.500" mt={1} mb={2}>
              <FiMapPin />
              <Text fontSize="sm">{member.city}</Text>
            </HStack>
            <VStack align="start" spacing={1} mt={2}>
              <HStack><FiPhone /><Text fontSize="sm">{member.phone}</Text></HStack>
              <HStack><FiMail /><Text fontSize="sm">{member.email}</Text></HStack>
              {member.website && <HStack><FiGlobe /><a href={member.website} target="_blank" rel="noopener noreferrer"><Text fontSize="sm" color="blue.600">{member.website}</Text></a></HStack>}
            </VStack>
          </Box>
          <Box bg="white" borderRadius="lg" boxShadow="md" p={4}>
            <Text fontWeight="bold" mb={2}>Tags</Text>
            <HStack wrap="wrap">
              {tags.map((tag: string) => (
                <Badge key={tag} colorScheme="blue" variant="subtle">{tag}</Badge>
              ))}
            </HStack>
          </Box>
          {/* Card Clientes */}
          <Box bg="white" borderRadius="lg" boxShadow="md" p={6}>
            <Text fontWeight="bold" mb={2}>Clientes Atendidos</Text>
            {member.clients && member.clients.length > 0 ? (
              <HStack wrap="wrap" spacing={2} mb={4}>
                {member.clients.map((client: string) => (
                  <Badge key={client} colorScheme="purple" variant="subtle">
                    {client}
                    <Button size="xs" colorScheme="blue" ml={2} variant="outline"
                      onClick={() => {
                        // Abrir modal para pedir referência para este cliente
                        window.dispatchEvent(new CustomEvent('openReferenceModal', { detail: { client, member } }));
                      }}
                    >
                      Pedir referência
                    </Button>
                  </Badge>
                ))}
              </HStack>
            ) : (
              <Text color="gray.500">Nenhum cliente cadastrado ainda.</Text>
            )}
            <ReferenceRequestModal />
          </Box>
        </VStack>
        {/* Centro - Sobre e Serviços */}
        <VStack align="stretch" spacing={4} gridColumn={{ md: 'span 2' }}>
          <Box bg="white" borderRadius="lg" boxShadow="md" p={6}>
            <Text fontWeight="bold" mb={2}>Sobre</Text>
            <Text color="gray.700">{member.bio || 'Nenhuma descrição cadastrada.'}</Text>
          </Box>
          <Box bg="white" borderRadius="lg" boxShadow="md" p={6}>
            <Text fontWeight="bold" mb={2}>Serviços Oferecidos</Text>
            <HStack wrap="wrap">
              {services.length > 0 ? services.map((srv: string) => (
                <Badge key={srv} colorScheme="gray" variant="subtle">{srv}</Badge>
              )) : <Text color="gray.500">Nenhum serviço cadastrado.</Text>}
            </HStack>
          </Box>
          {/* Card ICP, Dicas e Cases */}
          <Box bg="white" borderRadius="lg" boxShadow="md" p={6}>
            <Text fontWeight="bold" mb={2}>Cliente Ideal (ICP)</Text>
            <Text color="gray.700" mb={4}>{member.icp || "Descreva aqui o perfil do cliente ideal para este membro."}</Text>
            <Text fontWeight="bold" mb={2}>Dicas para indicar</Text>
            <Text color="gray.700" mb={4}>{member.tips || "Exemplo: Situações em que você pode ouvir alguém falando sobre [problema X], apresente este membro!"}</Text>
            <Text fontWeight="bold" mb={2}>Cases de Sucesso / Depoimentos</Text>
            <Text color="gray.700">{member.cases || "Inclua aqui cases ou depoimentos que mostrem o valor do trabalho do membro."}</Text>
          </Box>
          {/* Histórico de Referências */}
          <Box bg="white" borderRadius="lg" boxShadow="md" p={6}>
            <Flex justify="space-between" align="center" mb={4}>
              <Text fontWeight="bold" fontSize="lg">Histórico de Referências</Text>
              <Button size="sm" variant="outline" colorScheme="blue">Ver todas</Button>
            </Flex>
            {(!references || references.length === 0) && <Text color="gray.500">Nenhuma referência encontrada.</Text>}
            <VStack align="stretch" spacing={4}>
              {references?.map((ref: any) => {
                const isGiven = ref.giver_id === member.id;
                const other = isGiven ? ref.receiver : ref.giver;
                return (
                  <Card key={ref.id} bg="gray.50" borderRadius="md">
                    <CardBody>
                      <Flex align="center" gap={4}>
                        <Avatar name={other?.name} size="md" />
                        <Box flex={1}>
                          <Text fontWeight="bold">{other?.name}</Text>
                          <Badge colorScheme={isGiven ? 'blue' : 'purple'} mr={2}>
                            {isGiven ? 'REFERÊNCIA DADA' : 'REFERÊNCIA RECEBIDA'}
                          </Badge>
                          <Badge colorScheme={ref.status === 'CONCLUIDA' ? 'green' : ref.status === 'EM ANDAMENTO' ? 'orange' : 'gray'}>
                            {ref.status || 'PENDENTE'}
                          </Badge>
                          <Text color="gray.700" mt={2}>{ref.description}</Text>
                          <HStack mt={2} spacing={4} color="gray.500">
                            {ref.value && <Text fontSize="sm">R$ {ref.value.toLocaleString('pt-BR')}</Text>}
                            <Text fontSize="sm">{new Date(ref.created_at).toLocaleDateString()}</Text>
                          </HStack>
                        </Box>
                      </Flex>
                    </CardBody>
                  </Card>
                );
              })}
            </VStack>
          </Box>
        </VStack>
      </SimpleGrid>
    </Box>
  );
}
