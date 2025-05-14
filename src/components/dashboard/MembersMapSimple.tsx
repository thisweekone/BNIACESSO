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
}

interface MembersMapProps {
  members: Member[];
}

// Adicione isto para o TypeScript reconhecer a API do Google Maps
declare global {
  interface Window {
    google: any;
  }
}

export function MembersMapSimple({ members }: MembersMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    // Função para carregar o script do Google Maps
    const loadGoogleMapsScript = () => {
      // Verificar se a API já está carregada
      if (window.google && window.google.maps) {
        console.log('Google Maps já está carregado');
        initMap();
        return;
      }
      
      // Verificar se o script já está no DOM
      if (document.getElementById('google-maps-script')) {
        console.log('Script do Google Maps já existe no DOM');
        const checkGoogleMaps = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkGoogleMaps);
            initMap();
          }
        }, 100);
        
        setTimeout(() => {
          clearInterval(checkGoogleMaps);
          if (!window.google || !window.google.maps) {
            setError('Tempo limite excedido ao carregar o Google Maps.');
            setLoading(false);
          }
        }, 5000);
        return;
      }
      
      // Criar e adicionar o script
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
          console.error('Chave da API do Google Maps não encontrada');
          setError('Chave da API do Google Maps não configurada.');
          setLoading(false);
          return;
        }
        
        console.log('Carregando script do Google Maps...');
        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          console.log('Script do Google Maps carregado com sucesso');
          initMap();
        };
        
        script.onerror = () => {
          console.error('Erro ao carregar o script do Google Maps');
          setError('Erro ao carregar o mapa. Verifique sua conexão.');
          setLoading(false);
        };
        
        document.head.appendChild(script);
      } catch (err) {
        console.error('Erro ao configurar o script do Google Maps:', err);
        setError('Erro ao configurar o mapa.');
        setLoading(false);
      }
    };
    
    // Função para inicializar o mapa
    const initMap = () => {
      if (!mapRef.current) {
        console.error('Elemento do mapa não encontrado');
        setError('Elemento do mapa não encontrado na página.');
        setLoading(false);
        return;
      }
      
      if (!window.google || !window.google.maps) {
        console.error('API do Google Maps não disponível');
        setError('API do Google Maps não carregada corretamente.');
        setLoading(false);
        return;
      }
      
      try {
        console.log('Inicializando o mapa...');
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: { lat: -23.5505, lng: -46.6333 }, // São Paulo
          zoom: 10,
          mapTypeControl: false,
          fullscreenControl: false
        });
        
        setMap(mapInstance);
        setLoading(false);
        console.log('Mapa inicializado com sucesso');
        
        // Adicionar marcadores depois que o mapa estiver pronto
        if (members.length > 0) {
          addMarkers(mapInstance);
        }
      } catch (err) {
        console.error('Erro ao inicializar o mapa:', err);
        setError('Erro ao inicializar o mapa.');
        setLoading(false);
      }
    };
    
    // Função para adicionar marcadores ao mapa
    const addMarkers = (mapInstance: any) => {
      console.log(`Adicionando ${members.length} marcadores ao mapa`);
      
      // Limpar marcadores existentes
      markers.forEach(marker => marker.setMap(null));
      
      const bounds = new window.google.maps.LatLngBounds();
      const newMarkers: any[] = [];
      
      members.forEach((member, index) => {
        // Para membros sem coordenadas, criar coordenadas simuladas em torno de São Paulo
        const lat = member.lat || -23.5505 + (Math.random() - 0.5) * 0.1;
        const lng = member.lng || -46.6333 + (Math.random() - 0.5) * 0.1;
        
        const position = { lat, lng };
        
        const marker = new window.google.maps.Marker({
          position,
          map: mapInstance,
          title: member.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: '#E53E3E', // Cor vermelha da identidade visual
            fillOpacity: 1,
            strokeWeight: 1.5,
            strokeColor: '#FFFFFF',
            scale: 8
          }
        });
        
        marker.addListener('click', () => {
          console.log('Marcador clicado:', member.name);
          setSelectedMember({
            ...member,
            lat,
            lng
          });
        });
        
        newMarkers.push(marker);
        bounds.extend(position);
      });
      
      setMarkers(newMarkers);
      
      // Ajustar o mapa para mostrar todos os marcadores
      if (newMarkers.length > 0) {
        mapInstance.fitBounds(bounds);
        
        // Se o zoom estiver muito alto, limitá-lo
        const listener = window.google.maps.event.addListener(mapInstance, 'idle', () => {
          if (mapInstance.getZoom() > 15) {
            mapInstance.setZoom(15);
          }
          window.google.maps.event.removeListener(listener);
        });
      }
    };
    
    loadGoogleMapsScript();
    
    // Limpeza ao desmontar
    return () => {
      if (markers.length > 0) {
        markers.forEach(marker => marker?.setMap?.(null));
      }
    };
  }, []);
  
  // Efeito para atualizar marcadores quando os membros mudam
  useEffect(() => {
    if (map && members.length > 0) {
      const addMarkers = () => {
        console.log('Atualizando marcadores com novos membros');
        
        // Limpar marcadores existentes
        markers.forEach(marker => marker.setMap(null));
        
        const bounds = new window.google.maps.LatLngBounds();
        const newMarkers: any[] = [];
        
        members.forEach((member, index) => {
          // Para membros sem coordenadas, criar coordenadas simuladas em torno de São Paulo
          const lat = member.lat || -23.5505 + (Math.random() - 0.5) * 0.1;
          const lng = member.lng || -46.6333 + (Math.random() - 0.5) * 0.1;
          
          const position = { lat, lng };
          
          const marker = new window.google.maps.Marker({
            position,
            map,
            title: member.name,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: '#E53E3E', // Cor vermelha da identidade visual
              fillOpacity: 1,
              strokeWeight: 1.5,
              strokeColor: '#FFFFFF',
              scale: 8
            }
          });
          
          marker.addListener('click', () => {
            console.log('Marcador clicado:', member.name);
            setSelectedMember({
              ...member,
              lat,
              lng
            });
          });
          
          newMarkers.push(marker);
          bounds.extend(position);
        });
        
        setMarkers(newMarkers);
        
        // Ajustar o mapa para mostrar todos os marcadores
        if (newMarkers.length > 0) {
          map.fitBounds(bounds);
          
          // Se o zoom estiver muito alto, limitá-lo
          const listener = window.google.maps.event.addListener(map, 'idle', () => {
            if (map.getZoom() > 15) {
              map.setZoom(15);
            }
            window.google.maps.event.removeListener(listener);
          });
        }
      };
      
      addMarkers();
    }
  }, [map, members]);

  return (
    <Box position="relative" h="600px">
      {/* Mensagem de erro */}
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          <Text ml={2}>{error}</Text>
        </Alert>
      )}

      {/* Container do mapa */}
      <Box
        position="relative"
        h="600px"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="md"
      >
        {/* Loading spinner */}
        {loading && (
          <Center position="absolute" top="0" left="0" right="0" bottom="0" bg="rgba(255,255,255,0.8)" zIndex="10">
            <Spinner size="xl" color="blue.500" thickness="4px" />
          </Center>
        )}

        {/* Div do mapa */}
        <Box
          id="google-map-container"
          ref={mapRef}
          w="100%"
          h="100%"
          bg="gray.100"
        />
      </Box>

      {/* Card do membro selecionado */}
      {selectedMember && (
        <Card
          position="absolute"
          bottom="16px"
          right="16px"
          width="300px"
          borderWidth="1px"
          borderColor={borderColor}
          bg={bgColor}
          boxShadow="lg"
          zIndex={10}
        >
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <Heading size="md">{selectedMember.name}</Heading>
              <Text color="gray.600">{selectedMember.specialty}</Text>
              
              <HStack>
                <Icon as={FiMapPin} color="gray.500" />
                <Text fontSize="sm">{selectedMember.city || 'Local não especificado'}</Text>
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
                    {selectedMember.services.slice(0, 3).map((service, idx) => (
                      <Badge key={idx} colorScheme="blue" size="sm">
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
                    {selectedMember.tags.slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} colorScheme="green" size="sm">
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
