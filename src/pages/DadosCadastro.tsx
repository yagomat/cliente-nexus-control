import { useState } from "react";
import { Plus, Building2, Users, Server, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDadosCadastro } from "@/hooks/useDadosCadastro";
import { toast } from "sonner";

const DadosCadastro = () => {
  const {
    dados,
    loading,
    fetchDados,
    createDado,
    updateDado,
    deleteDado,
  } = useDadosCadastro();
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [totalClientes, setTotalClientes] = useState("");
  const [servidor, setServidor] = useState("");
  const [dispositivo, setDispositivo] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!nomeEmpresa || !totalClientes || !servidor || !dispositivo) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    const novoDado = {
      nome_empresa: nomeEmpresa,
      total_clientes: parseInt(totalClientes),
      servidor: servidor,
      dispositivo_smart: dispositivo,
    };

    try {
      await createDado(novoDado);
      toast.success("Dado de cadastro criado com sucesso!");
      setNomeEmpresa("");
      setTotalClientes("");
      setServidor("");
      setDispositivo("");
      fetchDados();
    } catch (error: any) {
      toast.error(`Erro ao criar dado: ${error.message}`);
    }
  };

  const handleUpdate = async () => {
    if (!editId || !nomeEmpresa || !totalClientes || !servidor || !dispositivo) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    const dadoAtualizado = {
      id: editId,
      nome_empresa: nomeEmpresa,
      total_clientes: parseInt(totalClientes),
      servidor: servidor,
      dispositivo_smart: dispositivo,
    };

    try {
      await updateDado(dadoAtualizado);
      toast.success("Dado de cadastro atualizado com sucesso!");
      setNomeEmpresa("");
      setTotalClientes("");
      setServidor("");
      setDispositivo("");
      setEditId(null);
      fetchDados();
    } catch (error: any) {
      toast.error(`Erro ao atualizar dado: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDado(id);
      toast.success("Dado de cadastro excluído com sucesso!");
      fetchDados();
    } catch (error: any) {
      toast.error(`Erro ao excluir dado: ${error.message}`);
    }
  };

  const handleEdit = (dado: any) => {
    setEditId(dado.id);
    setNomeEmpresa(dado.nome_empresa);
    setTotalClientes(String(dado.total_clientes));
    setServidor(dado.servidor);
    setDispositivo(dado.dispositivo_smart);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card para adicionar dados */}
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Dados de Cadastro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <Input
                type="text"
                placeholder="Nome da Empresa"
                value={nomeEmpresa}
                onChange={(e) => setNomeEmpresa(e.target.value)}
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Total de Clientes"
                value={totalClientes}
                onChange={(e) => setTotalClientes(e.target.value)}
              />
            </div>
            <div>
              <Input
                type="text"
                placeholder="Servidor"
                value={servidor}
                onChange={(e) => setServidor(e.target.value)}
              />
            </div>
            <div>
              <Input
                type="text"
                placeholder="Dispositivo Smart"
                value={dispositivo}
                onChange={(e) => setDispositivo(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              {editId ? (
                <Button variant="secondary" onClick={handleUpdate}>
                  Atualizar
                </Button>
              ) : (
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card para listar dados */}
        <Card>
          <CardHeader>
            <CardTitle>Dados de Cadastro</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Carregando dados...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Empresa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Clientes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Servidor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dispositivo
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700">
                    {dados.map((dado) => (
                      <tr key={dado.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{dado.nome_empresa}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{dado.total_clientes}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{dado.servidor}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{dado.dispositivo_smart}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEdit(dado)}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(dado.id)}
                          >
                            <Server className="mr-2 h-4 w-4" />
                            Excluir
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DadosCadastro;
