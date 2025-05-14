"use client";

import { useState, useEffect } from "react";
import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  VStack,
  Box,
  SimpleGrid,
  Divider,
  Heading,
  InputGroup,
  InputLeftAddon,
  useToast,
  Icon,
  Flex,
  Text,
  Spinner,
  Tooltip,
  Checkbox,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import TagInput from './TagInput';
import SpecialtySelect from './SpecialtySelect';
import { FiLinkedin, FiInstagram, FiFacebook, FiMapPin, FiSearch } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import axios from 'axios';

// Importação dinâmica do componente de máscara para evitar problemas de SSR
const InputMask = dynamic(() => import('react-input-mask'), {
  ssr: false,
  loading: () => <Input placeholder="Carregando..." />
});

interface AddressInfo {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

interface MemberFormData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  specialty_id?: string; // Novo campo para armazenar o ID da especialidade
  company: string;
  bio: string;
  city: string;
  website?: string;
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  services?: string[];
  tags?: string[];
  created_at?: string;
  icp?: string;
  tips?: string;
  cases?: string;
  // Campos de endereço
  zipcode?: string;
  street?: string;
  street_number?: string;
  complement?: string;
  neighborhood?: string;
  state?: string;
  // Campos LGPD e perfil público
  public_profile?: boolean;
  lgpd_consent_date?: string;
  profile_description?: string;
}

interface MemberProfileFormProps {
  initialData?: MemberFormData;
  onSubmit: (data: MemberFormData) => void;
}

export default function MemberProfileForm({ initialData, onSubmit }: MemberProfileFormProps) {
  const toast = useToast();
  const [form, setForm] = useState<MemberFormData>(
    initialData || {
      name: "",
      email: "",
      phone: "",
      specialty: "",
      specialty_id: "",
      company: "",
      bio: "",
      city: "",
      website: "",
      linkedin: "",
      instagram: "",
      facebook: "",
      services: [],
      tags: [],
      icp: "",
      tips: "",
      cases: "",
      zipcode: "",
      street: "",
      street_number: "",
      complement: "",
      neighborhood: "",
      state: "",
      public_profile: false,
      profile_description: ""
    }
  );
  const [loading, setLoading] = useState(false);
  
  // Estado adicional para rastrear se estamos usando a nova estrutura de especialidades
  const [usingSpecialtyId, setUsingSpecialtyId] = useState(!!initialData?.specialty_id);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // Função para buscar os dados do CEP na API ViaCEP
  async function fetchAddressByCep(cep: string) {
    if (!cep || cep.replace(/[^0-9]/g, '').length !== 8) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`https://viacep.com.br/ws/${cep.replace(/[^0-9]/g, '')}/json/`);
      const data = response.data;
      
      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      setForm(prev => ({
        ...prev,
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf
      }));
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast({
        title: "Erro ao buscar CEP",
        description: "Tente novamente mais tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  function handleCepChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    setForm(prev => ({ ...prev, zipcode: value }));
    
    // Se o CEP tiver 8 dígitos, busca o endereço automaticamente
    if (value.replace(/[^0-9]/g, '').length === 8) {
      fetchAddressByCep(value);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Se estamos usando o sistema de especialidades por ID, verificamos se temos o ID
    if (usingSpecialtyId && !form.specialty_id && form.specialty) {
      toast({
        title: "Especialidade não selecionada",
        description: "Por favor, selecione uma especialidade da lista",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Definir a data do consentimento LGPD se o perfil público estiver ativado e não tiver data
    const finalForm = {...form};
    if (finalForm.public_profile && !finalForm.lgpd_consent_date) {
      finalForm.lgpd_consent_date = new Date().toISOString();
    }
    
    if (onSubmit) onSubmit(finalForm);
  }
  
  // Função para lidar com a seleção de especialidade
  function handleSpecialtySelect(specialtyId: string, specialtyObj: any) {
    setUsingSpecialtyId(true);
    setForm(prev => ({
      ...prev,
      specialty_id: specialtyId,
      specialty: specialtyObj ? specialtyObj.name : ''
    }));
  }

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={6} align="flex-start">
        <Heading size="md">Informações Principais</Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="full">
          <FormControl isRequired>
            <FormLabel>Nome</FormLabel>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nome completo"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Seu email"
              readOnly // Email não deve ser editável, pois é definido pela autenticação
            />
          </FormControl>

          <FormControl>
            <FormLabel>Telefone</FormLabel>
            <InputMask
              mask="(99) 99999-9999"
              value={form.phone || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setForm(prev => ({ ...prev, phone: e.target.value }));
              }}
            >
              {(inputProps: any) => (
                <Input
                  {...inputProps}
                  name="phone"
                  placeholder="(XX) XXXXX-XXXX"
                />
              )}
            </InputMask>
          </FormControl>

          <FormControl>
            <FormLabel>Empresa/Negócio</FormLabel>
            <Input
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Nome da sua empresa"
            />
          </FormControl>

          <FormControl isRequired mb={4}>
            <FormLabel>Especialidade</FormLabel>
            <SpecialtySelect
              value={usingSpecialtyId ? form.specialty_id : form.specialty}
              onChange={handleSpecialtySelect}
              placeholder="Selecione ou digite sua especialidade"
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Website</FormLabel>
            <Input
              name="website"
              value={form.website || ""}
              onChange={handleChange}
              placeholder="https://seusite.com.br"
            />
          </FormControl>
        </SimpleGrid>

        <Divider my={2} />
        <Heading size="md">Redes Sociais</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} width="full">
          <FormControl>
            <FormLabel>LinkedIn</FormLabel>
            <InputGroup>
              <InputLeftAddon>
                <Icon as={FiLinkedin} />
              </InputLeftAddon>
              <Input
                name="linkedin"
                value={form.linkedin || ""}
                onChange={handleChange}
                placeholder="URL do LinkedIn"
              />
            </InputGroup>
          </FormControl>

          <FormControl>
            <FormLabel>Instagram</FormLabel>
            <InputGroup>
              <InputLeftAddon>
                <Icon as={FiInstagram} />
              </InputLeftAddon>
              <Input
                name="instagram"
                value={form.instagram || ""}
                onChange={handleChange}
                placeholder="@seuperfil"
              />
            </InputGroup>
          </FormControl>

          <FormControl>
            <FormLabel>Facebook</FormLabel>
            <InputGroup>
              <InputLeftAddon>
                <Icon as={FiFacebook} />
              </InputLeftAddon>
              <Input
                name="facebook"
                value={form.facebook || ""}
                onChange={handleChange}
                placeholder="URL do Facebook"
              />
            </InputGroup>
          </FormControl>
        </SimpleGrid>

        <Divider my={2} />
        <Heading size="md">Endereço</Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="full">
          <FormControl>
            <FormLabel>CEP</FormLabel>
            <InputGroup>
              <InputMask
                mask="99999-999"
                value={form.zipcode || ""}
                onChange={handleCepChange}
                alwaysShowMask={false}
              >
                {(inputProps: any) => (
                  <Input
                    {...inputProps}
                    name="zipcode"
                    placeholder="XXXXX-XXX"
                  />
                )}
              </InputMask>
              {loading && (
                <Spinner
                  ml={2}
                  color="brand.500"
                  thickness="2px"
                  speed="0.65s"
                  size="sm"
                />
              )}
            </InputGroup>
          </FormControl>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="full">
          <FormControl>
            <FormLabel>Logradouro</FormLabel>
            <Input
              name="street"
              value={form.street || ""}
              onChange={handleChange}
              placeholder="Rua, Avenida, etc."
            />
          </FormControl>

          <FormControl>
            <FormLabel>Número</FormLabel>
            <Input
              name="street_number"
              value={form.street_number || ""}
              onChange={handleChange}
              placeholder="Número"
            />
          </FormControl>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="full">
          <FormControl>
            <FormLabel>Complemento</FormLabel>
            <Input
              name="complement"
              value={form.complement || ""}
              onChange={handleChange}
              placeholder="Apto, Sala, etc."
            />
          </FormControl>

          <FormControl>
            <FormLabel>Bairro</FormLabel>
            <Input
              name="neighborhood"
              value={form.neighborhood || ""}
              onChange={handleChange}
              placeholder="Bairro"
            />
          </FormControl>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="full">
          <FormControl>
            <FormLabel>Cidade</FormLabel>
            <Input
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Cidade"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Estado</FormLabel>
            <Input
              name="state"
              value={form.state || ""}
              onChange={handleChange}
              placeholder="UF"
              maxLength={2}
            />
          </FormControl>
        </SimpleGrid>

        <Divider my={2} />
        <Heading size="md">Informações Profissionais</Heading>

        <FormControl>
          <FormLabel>Biografia</FormLabel>
          <Textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="Fale sobre você e sua experiência profissional"
            rows={4}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Cliente Ideal (ICP)</FormLabel>
          <Textarea
            name="icp"
            value={form.icp || ""}
            onChange={handleChange}
            placeholder="Descreva seu cliente ideal"
            rows={3}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Dicas para indicar</FormLabel>
          <Textarea
            name="tips"
            value={form.tips || ""}
            onChange={handleChange}
            placeholder="Dicas para quem quiser lhe indicar"
            rows={3}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Cases de Sucesso / Depoimentos</FormLabel>
          <Textarea
            name="cases"
            value={form.cases || ""}
            onChange={handleChange}
            placeholder="Compartilhe alguns cases de sucesso ou depoimentos de clientes"
            rows={3}
          />
        </FormControl>

        {/* A funcionalidade de tags foi movida para um componente separado */}

        <Divider my={2} />
        <Heading size="md">Perfil Público (Marketplace)</Heading>

        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Termos de consentimento LGPD</AlertTitle>
            <AlertDescription>
              Ao ativar seu perfil público, você autoriza que suas informações profissionais sejam exibidas no marketplace público do BNI Acesso, 
              visível para qualquer visitante da plataforma. Seus dados serão utilizados apenas para fins de networking e divulgação de serviços 
              conforme a Lei Geral de Proteção de Dados (LGPD). Você pode revogar este consentimento a qualquer momento desativando o perfil público.
            </AlertDescription>
          </Box>
        </Alert>

        <FormControl>
          <Checkbox 
            isChecked={form.public_profile} 
            onChange={(e) => setForm(prev => ({ ...prev, public_profile: e.target.checked }))}
            colorScheme="brand"
            size="lg"
            my={2}
          >
            <Text fontWeight="medium">Ativar meu perfil no marketplace público</Text>
          </Checkbox>
          <Text fontSize="sm" color="gray.600" ml={8}>
            {form.lgpd_consent_date ? 
              `Consentimento registrado em ${new Date(form.lgpd_consent_date).toLocaleDateString()}` : 
              'Seu consentimento será registrado ao salvar o perfil com esta opção ativada.'}
          </Text>
        </FormControl>

        {form.public_profile && (
          <FormControl mt={4}>
            <FormLabel>Descrição do perfil público</FormLabel>
            <Textarea
              name="profile_description"
              value={form.profile_description || ""}
              onChange={handleChange}
              placeholder="Escreva uma descrição específica para seu perfil público. Esta informação aparecerá para qualquer visitante no marketplace."
              rows={4}
            />
            <Text fontSize="sm" color="gray.600" mt={1}>
              Dica: Descreva seus principais serviços e diferenciais de forma clara e objetiva para atrair potenciais clientes.  
            </Text>
          </FormControl>
        )}

        <Button colorScheme="brand" type="submit" size="lg" mt={4}>
          Salvar Perfil
        </Button>
      </VStack>
    </Box>
  );
}
