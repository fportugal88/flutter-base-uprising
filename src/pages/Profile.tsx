import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { saveApiKey, getApiKey, clearApiKey } from "@/lib/secureStorage";
import { AppLayout } from "@/components/layout/AppLayout";

const Profile = () => {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState("");
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const existing = getApiKey();
    setHasKey(!!existing);
  }, []);

  const handleSave = () => {
    if (!apiKey) return;
    saveApiKey(apiKey);
    setApiKey("");
    setHasKey(true);
  };

  const handleRemove = () => {
    clearApiKey();
    setHasKey(false);
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
              {hasKey && (
                <p className="text-sm text-muted-foreground">
                  Uma chave de API já está configurada.
                </p>
              )}
              <Input
                type="password"
                placeholder="Insira sua chave de API"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={!apiKey}>Salvar</Button>
                {hasKey && (
                  <Button variant="outline" onClick={handleRemove}>
                    Remover
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
