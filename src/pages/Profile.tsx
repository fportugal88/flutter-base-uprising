import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useApiKeys } from "@/hooks/useApiKeys";
import { AppLayout } from "@/components/layout/AppLayout";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState("");
  const { hasOpenAIKey, saveApiKey, removeApiKey, loading } = useApiKeys();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!apiKey) return;
    
    const success = await saveApiKey('openai', apiKey);
    if (success) {
      setApiKey("");
      toast({
        title: "Chave salva",
        description: "Sua chave OpenAI foi salva com segurança.",
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível salvar a chave. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleRemove = async () => {
    const success = await removeApiKey('openai');
    if (success) {
      toast({
        title: "Chave removida",
        description: "Sua chave OpenAI foi removida.",
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível remover a chave. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center p-3 sm:p-4 border-b bg-card">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg sm:text-xl font-bold">Meu Perfil</h1>
        </div>

        <div className="flex-1 p-4 flex justify-center items-start">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>OpenAI API Key</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasOpenAIKey && (
                <p className="text-sm text-muted-foreground">
                  Uma chave de API já está configurada.
                </p>
              )}
              <Input
                type="password"
                placeholder="Insira sua chave de API"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={loading}
              />
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={!apiKey || loading}>
                  {loading ? "Salvando..." : "Salvar"}
                </Button>
                {hasOpenAIKey && (
                  <Button variant="outline" onClick={handleRemove} disabled={loading}>
                    {loading ? "Removendo..." : "Remover"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
