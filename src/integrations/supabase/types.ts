export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          sender: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          sender: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          sender?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          request_id: string | null
          status: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          request_id?: string | null
          status?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          request_id?: string | null
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      request_comments: {
        Row: {
          comentario: string
          criado_em: string
          id: string
          request_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comentario: string
          criado_em?: string
          id?: string
          request_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comentario?: string
          criado_em?: string
          id?: string
          request_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_comments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          cancelado_em: string | null
          categoria: string[] | null
          classificacao_dado:
            | Database["public"]["Enums"]["data_classification"]
            | null
          codigo_solicitacao: string
          criado_em: string
          curador_id: string | null
          dashboards_relacionados: string[] | null
          descricao: string
          documentacao_gerada: string | null
          entregue_em: string | null
          equipe_solicitante: string | null
          estimativa_entrega: string | null
          feedback_efetividade:
            | Database["public"]["Enums"]["effectiveness_feedback"]
            | null
          id: string
          impacto_estimado: Database["public"]["Enums"]["impact_level"] | null
          justificativa_negocio: string | null
          nova_tabela_gerada: string | null
          objetivo_estrategico:
            | Database["public"]["Enums"]["strategic_objective"]
            | null
          origem_canal: string
          pipeline_reutilizado: string | null
          prioridade: Database["public"]["Enums"]["request_priority"]
          proposito_de_uso: string | null
          proximo_passo_sugerido: string | null
          relevancia_financeira: string | null
          responsavel_tecnico_id: string | null
          revisado_por_compliance: boolean | null
          solicitante_id: string
          status: Database["public"]["Enums"]["request_status"]
          status_curadoria:
            | Database["public"]["Enums"]["curation_status"]
            | null
          titulo: string
          updated_at: string
          usuarios_endosso: string[] | null
          validade_uso: string | null
          votos_endosso: number | null
        }
        Insert: {
          cancelado_em?: string | null
          categoria?: string[] | null
          classificacao_dado?:
            | Database["public"]["Enums"]["data_classification"]
            | null
          codigo_solicitacao: string
          criado_em?: string
          curador_id?: string | null
          dashboards_relacionados?: string[] | null
          descricao: string
          documentacao_gerada?: string | null
          entregue_em?: string | null
          equipe_solicitante?: string | null
          estimativa_entrega?: string | null
          feedback_efetividade?:
            | Database["public"]["Enums"]["effectiveness_feedback"]
            | null
          id?: string
          impacto_estimado?: Database["public"]["Enums"]["impact_level"] | null
          justificativa_negocio?: string | null
          nova_tabela_gerada?: string | null
          objetivo_estrategico?:
            | Database["public"]["Enums"]["strategic_objective"]
            | null
          origem_canal?: string
          pipeline_reutilizado?: string | null
          prioridade?: Database["public"]["Enums"]["request_priority"]
          proposito_de_uso?: string | null
          proximo_passo_sugerido?: string | null
          relevancia_financeira?: string | null
          responsavel_tecnico_id?: string | null
          revisado_por_compliance?: boolean | null
          solicitante_id: string
          status?: Database["public"]["Enums"]["request_status"]
          status_curadoria?:
            | Database["public"]["Enums"]["curation_status"]
            | null
          titulo: string
          updated_at?: string
          usuarios_endosso?: string[] | null
          validade_uso?: string | null
          votos_endosso?: number | null
        }
        Update: {
          cancelado_em?: string | null
          categoria?: string[] | null
          classificacao_dado?:
            | Database["public"]["Enums"]["data_classification"]
            | null
          codigo_solicitacao?: string
          criado_em?: string
          curador_id?: string | null
          dashboards_relacionados?: string[] | null
          descricao?: string
          documentacao_gerada?: string | null
          entregue_em?: string | null
          equipe_solicitante?: string | null
          estimativa_entrega?: string | null
          feedback_efetividade?:
            | Database["public"]["Enums"]["effectiveness_feedback"]
            | null
          id?: string
          impacto_estimado?: Database["public"]["Enums"]["impact_level"] | null
          justificativa_negocio?: string | null
          nova_tabela_gerada?: string | null
          objetivo_estrategico?:
            | Database["public"]["Enums"]["strategic_objective"]
            | null
          origem_canal?: string
          pipeline_reutilizado?: string | null
          prioridade?: Database["public"]["Enums"]["request_priority"]
          proposito_de_uso?: string | null
          proximo_passo_sugerido?: string | null
          relevancia_financeira?: string | null
          responsavel_tecnico_id?: string | null
          revisado_por_compliance?: boolean | null
          solicitante_id?: string
          status?: Database["public"]["Enums"]["request_status"]
          status_curadoria?:
            | Database["public"]["Enums"]["curation_status"]
            | null
          titulo?: string
          updated_at?: string
          usuarios_endosso?: string[] | null
          validade_uso?: string | null
          votos_endosso?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_request_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      curation_status:
        | "aguardando"
        | "em_curadoria"
        | "validado"
        | "reprovado"
        | "reencaminhado"
      data_classification:
        | "nao_sensivel"
        | "PII"
        | "financeiro"
        | "confidencial"
      effectiveness_feedback: "excelente" | "bom" | "mediano" | "incompleto"
      impact_level: "baixo" | "medio" | "alto" | "estrategico"
      request_priority: "baixa" | "normal" | "alta" | "urgente"
      request_status:
        | "pendente"
        | "em_curadoria"
        | "em_desenvolvimento"
        | "concluida"
        | "cancelada"
        | "duplicada"
      strategic_objective:
        | "aumento_de_conversao"
        | "reduzir_churn"
        | "automatizacao"
        | "eficiencia_operacional"
        | "novo_produto"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      curation_status: [
        "aguardando",
        "em_curadoria",
        "validado",
        "reprovado",
        "reencaminhado",
      ],
      data_classification: [
        "nao_sensivel",
        "PII",
        "financeiro",
        "confidencial",
      ],
      effectiveness_feedback: ["excelente", "bom", "mediano", "incompleto"],
      impact_level: ["baixo", "medio", "alto", "estrategico"],
      request_priority: ["baixa", "normal", "alta", "urgente"],
      request_status: [
        "pendente",
        "em_curadoria",
        "em_desenvolvimento",
        "concluida",
        "cancelada",
        "duplicada",
      ],
      strategic_objective: [
        "aumento_de_conversao",
        "reduzir_churn",
        "automatizacao",
        "eficiencia_operacional",
        "novo_produto",
      ],
    },
  },
} as const
