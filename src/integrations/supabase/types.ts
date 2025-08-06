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
  api: {
    Tables: {
      requests: {
        Row: {
          id: string
          codigo_solicitacao: string
          titulo: string
          descricao: string
          status:
            | "pendente"
            | "em_curadoria"
            | "em_desenvolvimento"
            | "concluida"
            | "cancelada"
            | "duplicada"
          prioridade: "baixa" | "normal" | "alta" | "urgente"
          categoria: string[]
          origem_canal: string
          criado_em: string
          estimativa_entrega: string | null
          entregue_em: string | null
          cancelado_em: string | null
          solicitante_id: string
          equipe_solicitante: string | null
          justificativa_negocio: string | null
          objetivo_estrategico:
            | "aumento_de_conversao"
            | "reduzir_churn"
            | "automatizacao"
            | "eficiencia_operacional"
            | "novo_produto"
            | null
          relevancia_financeira: string | null
          impacto_estimado: "baixo" | "medio" | "alto" | "estrategico" | null
          responsavel_tecnico_id: string | null
          curador_id: string | null
          status_curadoria:
            | "aguardando"
            | "em_curadoria"
            | "validado"
            | "reprovado"
            | "reencaminhado"
          votos_endosso: number
          usuarios_endosso: string[]
          pipeline_reutilizado: string | null
          nova_tabela_gerada: string | null
          dashboards_relacionados: string[]
          documentacao_gerada: string | null
          feedback_efetividade:
            | "excelente"
            | "bom"
            | "mediano"
            | "incompleto"
            | null
          proximo_passo_sugerido: string | null
          classificacao_dado:
            | "nao_sensivel"
            | "PII"
            | "financeiro"
            | "confidencial"
          revisado_por_compliance: boolean
          proposito_de_uso: string | null
          validade_uso: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          codigo_solicitacao?: string
          titulo: string
          descricao: string
          status?:
            | "pendente"
            | "em_curadoria"
            | "em_desenvolvimento"
            | "concluida"
            | "cancelada"
            | "duplicada"
          prioridade?: "baixa" | "normal" | "alta" | "urgente"
          categoria?: string[]
          origem_canal?: string
          criado_em?: string
          estimativa_entrega?: string | null
          entregue_em?: string | null
          cancelado_em?: string | null
          solicitante_id: string
          equipe_solicitante?: string | null
          justificativa_negocio?: string | null
          objetivo_estrategico?:
            | "aumento_de_conversao"
            | "reduzir_churn"
            | "automatizacao"
            | "eficiencia_operacional"
            | "novo_produto"
            | null
          relevancia_financeira?: string | null
          impacto_estimado?: "baixo" | "medio" | "alto" | "estrategico" | null
          responsavel_tecnico_id?: string | null
          curador_id?: string | null
          status_curadoria?:
            | "aguardando"
            | "em_curadoria"
            | "validado"
            | "reprovado"
            | "reencaminhado"
          votos_endosso?: number
          usuarios_endosso?: string[]
          pipeline_reutilizado?: string | null
          nova_tabela_gerada?: string | null
          dashboards_relacionados?: string[]
          documentacao_gerada?: string | null
          feedback_efetividade?:
            | "excelente"
            | "bom"
            | "mediano"
            | "incompleto"
            | null
          proximo_passo_sugerido?: string | null
          classificacao_dado?:
            | "nao_sensivel"
            | "PII"
            | "financeiro"
            | "confidencial"
          revisado_por_compliance?: boolean
          proposito_de_uso?: string | null
          validade_uso?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          codigo_solicitacao?: string
          titulo?: string
          descricao?: string
          status?:
            | "pendente"
            | "em_curadoria"
            | "em_desenvolvimento"
            | "concluida"
            | "cancelada"
            | "duplicada"
          prioridade?: "baixa" | "normal" | "alta" | "urgente"
          categoria?: string[]
          origem_canal?: string
          criado_em?: string
          estimativa_entrega?: string | null
          entregue_em?: string | null
          cancelado_em?: string | null
          solicitante_id?: string
          equipe_solicitante?: string | null
          justificativa_negocio?: string | null
          objetivo_estrategico?:
            | "aumento_de_conversao"
            | "reduzir_churn"
            | "automatizacao"
            | "eficiencia_operacional"
            | "novo_produto"
            | null
          relevancia_financeira?: string | null
          impacto_estimado?: "baixo" | "medio" | "alto" | "estrategico" | null
          responsavel_tecnico_id?: string | null
          curador_id?: string | null
          status_curadoria?:
            | "aguardando"
            | "em_curadoria"
            | "validado"
            | "reprovado"
            | "reencaminhado"
          votos_endosso?: number
          usuarios_endosso?: string[]
          pipeline_reutilizado?: string | null
          nova_tabela_gerada?: string | null
          dashboards_relacionados?: string[]
          documentacao_gerada?: string | null
          feedback_efetividade?:
            | "excelente"
            | "bom"
            | "mediano"
            | "incompleto"
            | null
          proximo_passo_sugerido?: string | null
          classificacao_dado?:
            | "nao_sensivel"
            | "PII"
            | "financeiro"
            | "confidencial"
          revisado_por_compliance?: boolean
          proposito_de_uso?: string | null
          validade_uso?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      request_comments: {
        Row: {
          id: string
          request_id: string
          user_id: string
          comentario: string
          criado_em: string
          updated_at: string
        }
        Insert: {
          id?: string
          request_id: string
          user_id: string
          comentario: string
          criado_em?: string
          updated_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          user_id?: string
          comentario?: string
          criado_em?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "api">]

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
  api: {
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
