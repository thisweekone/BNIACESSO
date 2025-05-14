'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  Center,
  Spinner,
  Alert,
  AlertIcon,
  Text,
  Heading,
  Badge,
  useColorModeValue,
  VStack,
  HStack,
  Icon
} from '@chakra-ui/react';
import { FiMapPin, FiMail, FiPhone, FiUser } from 'react-icons/fi';

interface Member {
  id: string;
  name: string;
  specialty: string;
  city: string;
  email: string;
  phone: string;
  services?: string[];
  tags?: string[];
  lat?: number;
  lng?: number;
  address?: string;
}

interface MembersMapProps {
  members: Member[];
  onSelectMember?: (member: Member) => void;
}

export function MembersMap({ members, onSelectMember }: MembersMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Função para geocodificar endereços e obter coordenadas
  const geocodeAddress = async (member: Member): Promise<Member> => {
    // Se já temos coordenadas, retornar sem alterações
    if (member.lat && member.lng) return member;
    
    // Se não temos endereço para geocodificar, usar coordenadas aleatórias em São Paulo
    const address = member.address || member.city || 'São Paulo, Brasil';
    if (!address) {
      return {
        ...member,
        lat: -23.5505 + (Math.random() - 0.5) * 0.1,
        lng: -46.6333 + (Math.random() - 0.5) * 0.1
      };
    }
    
    try {
      // Na implementação real, usaria o serviço de geocodificação do Google Maps
      // Por enquanto, usar coordenadas aleatórias baseadas em São Paulo
      return {
        ...member,
        lat: -23.5505 + (Math.random() - 0.5) * 0.1,
        lng: -46.6333 + (Math.random() - 0.5) * 0.1
      };
      
      // Implementação com geocodificação real (descomentada quando necessário)
      /*
      const geocoder = new window.google.maps.Geocoder();
      const result = await new Promise((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results && results.length > 0) {
            resolve(results[0].geometry.location);
          } else {
            reject(new Error(`Geocoding falhou: ${status}`));
          }
        });
      });
      
      return {
        ...member,
        lat: result.lat(),
        lng: result.lng()
      };
      */
    } catch (error) {
      console.error(`Erro ao geocodificar endereço para ${member.name}:`, error);
      // Fallback para coordenadas aleatórias
      return {
        ...member,
        lat: -23.5505 + (Math.random() - 0.5) * 0.1,
        lng: -46.6333 + (Math.random() - 0.5) * 0.1
      };
    }
  };

  useEffect(() => {
    // Verificar se a API do Google Maps já está carregada
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }
    
    // Evitar carregar a API múltiplas vezes
    if (document.querySelector('script[src*="maps.googleapis.com/maps/api"]')) {
      // Se o script já existe mas o API ainda não está disponível, aguardar inicialização
      const checkGoogleMaps = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogleMaps);
          initializeMap();
        }
      }, 100);
      
      // Timeout após 10 segundos para evitar loop infinito
      setTimeout(() => {
        clearInterval(checkGoogleMaps);
        if (!window.google || !window.google.maps) {
          setError('Tempo esgotado ao aguardar carregamento do Google Maps.');
          setLoading(false);
        }
      }, 10000);
      
      return;
    }
    
    // Carregar a API do Google Maps
    const loadGoogleMapsApi = () => {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        // Inicializar o mapa após carregamento da API
        initializeMap();
      };
      
      script.onerror = () => {
        console.error('Erro ao carregar o Google Maps. Verifique sua chave de API.');
        setError('Erro ao carregar o mapa. Verifique sua conexão e tente novamente.');
        setLoading(false);
      };
      
      document.head.appendChild(script);
    };
    
    loadGoogleMapsApi();
    
    return () => {
      // Limpar marcadores ao desmontar
      markers.forEach(marker => marker && marker.setMap && marker.setMap(null));
    };
  }, []);
  
  // Função separada para inicializar o mapa
  const initializeMap = () => {
    try {
      if (!mapRef.current) {
        console.error('Elemento do mapa não encontrado');
        setError('Não foi possível carregar o mapa. Tente novamente mais tarde.');
        setLoading(false);
        return;
      }
      
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: -23.5505, lng: -46.6333 }, // São Paulo
        zoom: 11,
        styles: [
          {
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#7c93a3' }]
          },
          {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#c9c9c9' }]
          }
        ]
      });
      
      setMap(mapInstance);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao inicializar o mapa:', error);
      setError('Erro ao inicializar o mapa. Verifique sua conexão e tente novamente.');
      setLoading(false);
    }
  };

  useEffect(() => {
    const processMembers = async () => {
      if (!map || !members.length) return;

      try {
        // Limpar marcadores anteriores
        markers.forEach(marker => marker.setMap(null));
        const newMarkers: any[] = [];
        
        // Geocodificar endereços (ou usar coordenadas existentes)
        const membersWithCoordinates = await Promise.all(
          members.map(geocodeAddress)
        );
        
        // Criar marcadores no mapa
        membersWithCoordinates.forEach(member => {
          if (!member.lat || !member.lng) return;
          
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
            if (onSelectMember) onSelectMember(member);
            map.panTo(marker.getPosition());
            map.setZoom(14);
          });

          newMarkers.push(marker);
        });

        setMarkers(newMarkers);
        
        // Ajustar o zoom para incluir todos os marcadores
        if (newMarkers.length > 0) {
          const bounds = new window.google.maps.LatLngBounds();
          newMarkers.forEach(marker => bounds.extend(marker.getPosition()));
          map.fitBounds(bounds);
          
          // Limitar o zoom máximo para evitar zoom excessivo quando há poucos marcadores
          const listener = window.google.maps.event.addListener(map, 'idle', () => {
            if (map.getZoom() > 15) map.setZoom(15);
            window.google.maps.event.removeListener(listener);
          });
        }
      } catch (error) {
        console.error('Erro ao processar membros para o mapa:', error);
        setError('Erro ao exibir os membros no mapa');
      }
    };

    if (map && members.length > 0) {
      processMembers();
    }
  }, [map, members, onSelectMember]);

  if (loading) {
    return (
      <Center h="500px">
        <VStack>
          <Spinner size="xl" color="brand.500" />
          <Text mt={4}>Carregando mapa...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="lg">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Box position="relative" h="600px">
      {/* Mensagem de erro */}
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          <Text color="red.500" fontWeight="medium">{error}</Text>
        </Alert>
      )}
      
      {/* Mapa */}
      <Box
        position="relative"
        h="600px"
        borderRadius="md"
        overflow="hidden"
        boxShadow="md"
      >
        {loading && (
          <Center position="absolute" top="0" left="0" right="0" bottom="0" bg="rgba(255,255,255,0.8)" zIndex="10">
            <Spinner size="xl" color="blue.500" thickness="4px" />
          </Center>
        )}

        <Box 
          id="google-map-container" 
          ref={mapRef} 
          w="100%" 
          h="100%" 
        />
      </Box>

      {/* Card do membro selecionado */}
      {selectedMember && (
        <Card 
          bg={bgColor} 
          position="absolute" 
          bottom="16px" 
          right="16px" 
          width="300px"
          borderWidth="1px" 
          borderColor={borderColor}
          boxShadow="lg"
          zIndex={10}
        >
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <Heading size="md">{selectedMember.name}</Heading>
              <Text color="gray.600">{selectedMember.specialty}</Text>
              
              <HStack>
                <Icon as={FiMapPin} color="gray.500" />
                <Text fontSize="sm">{selectedMember.city || selectedMember.address || 'Local não especificado'}</Text>
              </HStack>

              {selectedMember.email && (
                <HStack>
                  <Icon as={FiMail} color="gray.500" />
                  <Text fontSize="sm">{selectedMember.email}</Text>
                </HStack>
              )}

              {selectedMember.phone && (
                <HStack>
                  <Icon as={FiPhone} color="gray.500" />
                  <Text fontSize="sm">{selectedMember.phone}</Text>
                </HStack>
              )}

              {selectedMember.services && selectedMember.services.length > 0 && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={1}>Serviços</Text>
                  <HStack wrap="wrap" spacing={1}>
                    {selectedMember.services.slice(0, 3).map((service) => (
                      <Badge key={service} colorScheme="blue" size="sm">
                        {service}
                      </Badge>
                    ))}
                    {selectedMember.services.length > 3 && (
                      <Badge colorScheme="gray" size="sm">
                        +{selectedMember.services.length - 3}
                      </Badge>
                    )}
                  </HStack>
                </Box>
              )}

              {selectedMember.tags && selectedMember.tags.length > 0 && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={1}>Tags</Text>
                  <HStack wrap="wrap" spacing={1}>
                    {selectedMember.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} colorScheme="green" size="sm">
                        {tag}
                      </Badge>
                    ))}
                    {selectedMember.tags.length > 3 && (
                      <Badge colorScheme="gray" size="sm">
                        +{selectedMember.tags.length - 3}
                      </Badge>
                    )}
                  </HStack>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>
      )}
    </Box>
  );
}
