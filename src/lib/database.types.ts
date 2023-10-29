export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          content: string | null;
          embedding: string | null;
          id: number;
          metadata: Json | null;
        };
        Insert: {
          content?: string | null;
          embedding?: string | null;
          id?: number;
          metadata?: Json | null;
        };
        Update: {
          content?: string | null;
          embedding?: string | null;
          id?: number;
          metadata?: Json | null;
        };
        Relationships: [];
      };
      File: {
        Row: {
          createdAt: string;
          id: string;
          key: string;
          name: string;
          updatedAt: string;
          uploadStatus: Database["public"]["Enums"]["UploadStatus"];
          url: string;
          userId: string | null;
        };
        Insert: {
          createdAt?: string;
          id: string;
          key: string;
          name: string;
          updatedAt: string;
          uploadStatus?: Database["public"]["Enums"]["UploadStatus"];
          url: string;
          userId?: string | null;
        };
        Update: {
          createdAt?: string;
          id?: string;
          key?: string;
          name?: string;
          updatedAt?: string;
          uploadStatus?: Database["public"]["Enums"]["UploadStatus"];
          url?: string;
          userId?: string | null;
        };
        Relationships: [];
      };
      Message: {
        Row: {
          createdAt: string;
          fileId: string | null;
          id: string;
          isUserMessage: boolean;
          text: string;
          updatedAt: string;
          userId: string | null;
        };
        Insert: {
          createdAt?: string;
          fileId?: string | null;
          id: string;
          isUserMessage: boolean;
          text: string;
          updatedAt: string;
          userId?: string | null;
        };
        Update: {
          createdAt?: string;
          fileId?: string | null;
          id?: string;
          isUserMessage?: boolean;
          text?: string;
          updatedAt?: string;
          userId?: string | null;
        };
        Relationships: [];
      };
      User: {
        Row: {
          email: string;
          id: string;
          stripe_current_period_end: string | null;
          stripe_customer_id: string | null;
          stripe_price_id: string | null;
          stripe_subscription_id: string | null;
        };
        Insert: {
          email: string;
          id: string;
          stripe_current_period_end?: string | null;
          stripe_customer_id?: string | null;
          stripe_price_id?: string | null;
          stripe_subscription_id?: string | null;
        };
        Update: {
          email?: string;
          id?: string;
          stripe_current_period_end?: string | null;
          stripe_customer_id?: string | null;
          stripe_price_id?: string | null;
          stripe_subscription_id?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      match_documents: {
        Args: {
          query_embedding: string;
          match_count?: number;
          filter?: Json;
        };
        Returns: {
          id: number;
          content: string;
          metadata: Json;
          embedding: Json;
          similarity: number;
        }[];
      };
    };
    Enums: {
      UploadStatus: "PENDING" | "PROCESSING" | "FAILED" | "SUCCESS";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
