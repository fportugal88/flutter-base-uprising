import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

const Profile = () => {
  const navigate = useNavigate();

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
              <CardTitle>Configuração de API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Configure sua chave de API OpenAI para usar o assistente de dados.
              </p>
              <p className="text-xs text-muted-foreground">
                Sua chave será armazenada de forma segura no Supabase.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
