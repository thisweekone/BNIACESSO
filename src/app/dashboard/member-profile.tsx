import MemberProfileForm from "../../components/dashboard/MemberProfileForm";

export default function MemberProfilePage() {
  // Aqui você pode buscar os dados do membro autenticado, se necessário
  // Por enquanto, vamos simular um membro já existente para edição
  const mockMember = {
    name: "João Silva",
    email: "joao@email.com",
    phone: "(11) 99999-9999",
    occupation: "Empresário",
    company: "Empresa Exemplo",
    bio: "Sou um membro ativo do BNI!",
    specialty: "Consultoria",  // Propriedade obrigatória adicionada
    city: "São Paulo"         // Propriedade obrigatória adicionada
  };

  // No cadastro, passe initialData como undefined
  // Para edição, passe o objeto do membro
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <MemberProfileForm initialData={mockMember} onSubmit={(data) => alert("Dados salvos: " + JSON.stringify(data))} />
    </div>
  );
}
