import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
const Configuracoes = () => {
  const {
    user
  } = useAuth();
  const [profile, setProfile] = useState({
    nome: "",
    telefone: ""
  });
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);
  const fetchProfile = async () => {
    if (!user) return;
    try {
      const {
        data,
        error
      } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (error && error.code !== "PGRST116") {
        console.error("Erro ao buscar perfil:", error);
        return;
      }
      if (data) {
        setProfile({
          nome: data.nome || "",
          telefone: data.telefone || ""
        });
      }
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
    }
  };
  const handleSave = async () => {
    if (!user) return;
    try {
      const {
        error
      } = await supabase.from("profiles").upsert({
        user_id: user.id,
        nome: profile.nome,
        telefone: profile.telefone
      });
      if (error) throw error;
      toast.success("Perfil atualizado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao salvar perfil:", error);
      toast.error("Erro ao salvar perfil: " + error.message);
    }
  };
  return <div className="container mx-auto p-4 space-y-6 py-0 px-0">
      <Card>
        <CardHeader>
          <CardTitle>Informações do Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" value={profile.nome} onChange={e => setProfile({
            ...profile,
            nome: e.target.value
          })} placeholder="Seu nome" maxLength={40} />
          </div>
          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <Input id="telefone" value={profile.telefone} onChange={e => setProfile({
            ...profile,
            telefone: e.target.value
          })} placeholder="Seu telefone" maxLength={11} />
          </div>
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </CardContent>
      </Card>
    </div>;
};
export default Configuracoes;