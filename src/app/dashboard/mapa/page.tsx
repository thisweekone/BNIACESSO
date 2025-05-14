'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Container, Heading, Text, SimpleGrid, Card, CardBody, VStack, HStack, Badge, useColorModeValue } from '@chakra-ui/react';
import { FiMapPin, FiBriefcase } from 'react-icons/fi';
import { createClient } from '@supabase/supabase-js';

interface Member {
  id: string;
  name: string;
  specialty: string;
  city: string;
  services: string[];
  tags: string[];
  lat: number;
  lng: number;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    // Carregar a API do Google Maps
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initMap`;
    script.async = true;
    script.defer = true;

    // Adicionar tratamento de erro para o carregamento do script
    script.onerror = () => {
      console.error('Erro ao carregar o Google Maps. Verifique sua chave de API e as restrições.');
    };

    window.initMap = () => {
      try {
        if (!mapRef.current) {
          console.error('Elemento do mapa não encontrado');
          return;
        }

        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: -23.5505, lng: -46.6333 }, // São Paulo
          zoom: 12,
          styles: [
            {
              featureType: 'all',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#7c93a3' }]
            },
            {
              featureType: 'all',
              elementType: 'labels.text.stroke',
              stylers: [{ visibility: 'on' }, { color: '#ffffff' }, { weight: 2 }]
            },
            {
              featureType: 'all',
              elementType: 'labels.icon',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'administrative',
              elementType: 'geometry.fill',
              stylers: [{ color: '#000000' }, { lightness: 20 }]
            },
            {
              featureType: 'administrative',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#000000' }, { lightness: 17 }, { weight: 1.2 }]
            },
            {
              featureType: 'landscape',
              elementType: 'geometry',
              stylers: [{ color: '#f5f5f5' }]
            },
            {
              featureType: 'poi',
              elementType: 'geometry',
              stylers: [{ color: '#f5f5f5' }]
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{ color: '#dedede' }]
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry.fill',
              stylers: [{ color: '#ffffff' }]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#ffffff' }]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#dadada' }]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#c9c9c9' }]
            }
          ]
        });
        setMap(map);
      } catch (error) {
        console.error('Erro ao inicializar o mapa:', error);
      }
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      // Limpar a função initMap global
      if ((window as any).initMap) {
        (window as any).initMap = undefined;
      }
    };
  }, []);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from('members')
        .select(`
          *,
          member_services(services(name)),
          member_tags(tags(name))
        `);

      if (error) {
        console.error('Error fetching members:', error);
        return;
      }

      const formattedMembers = data.map((member: any) => ({
        ...member,
        services: member.member_services.map((ms: any) => ms.services.name),
        tags: member.member_tags.map((mt: any) => mt.tags.name),
        // Coordenadas mockadas para exemplo
        lat: -23.5505 + (Math.random() - 0.5) * 0.1,
        lng: -46.6333 + (Math.random() - 0.5) * 0.1
      }));

      setMembers(formattedMembers);
    };

    fetchMembers();
  }, []);

  useEffect(() => {
    if (!map || !members.length) return;

    // Limpar marcadores anteriores
    markers.forEach(marker => marker.setMap(null));
    const newMarkers: any[] = [];

    members.forEach(member => {
      const marker = new window.google.maps.Marker({
        position: { lat: member.lat, lng: member.lng },
        map,
        title: member.name,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        }
      });

      marker.addListener('click', () => {
        setSelectedMember(member);
        map.panTo(marker.getPosition());
        map.setZoom(15);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
  }, [map, members]);

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Heading size="lg">Mapa de Membros</Heading>
        <Text color="gray.500">
          Encontre membros próximos a você e visualize suas especialidades
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        {/* Mapa */}
        <Box
          ref={mapRef}
          h="600px"
          borderRadius="lg"
          overflow="hidden"
          boxShadow="md"
        />

        {/* Lista de Membros */}
        <VStack spacing={4} align="stretch">
          {selectedMember ? (
            <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Box>
                    <Heading size="md">{selectedMember.name}</Heading>
                    <Text color="gray.500">{selectedMember.specialty}</Text>
                    <HStack mt={1}>
                      <FiMapPin color="gray" />
                      <Text fontSize="sm" color="gray.500">{selectedMember.city}</Text>
                    </HStack>
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Serviços</Text>
                    <HStack wrap="wrap" spacing={2}>
                      {selectedMember.services.map((service) => (
                        <Badge key={service} colorScheme="blue">
                          {service}
                        </Badge>
                      ))}
                    </HStack>
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Tags</Text>
                    <HStack wrap="wrap" spacing={2}>
                      {selectedMember.tags.map((tag) => (
                        <Badge key={tag} colorScheme="green">
                          {tag}
                        </Badge>
                      ))}
                    </HStack>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          ) : (
            <Text color="gray.500" textAlign="center">
              Clique em um marcador no mapa para ver os detalhes do membro
            </Text>
          )}
        </VStack>
      </SimpleGrid>
    </Container>
  );
} 