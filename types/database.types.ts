export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      zones: {
        Row: {
          id: string
          slug: string
          name: string
          label: string
          status: 'available' | 'reserved' | 'sold' | 'not_available'
          svg_path: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          label: string
          status: 'available' | 'reserved' | 'sold' | 'not_available'
          svg_path: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          label?: string
          status?: 'available' | 'reserved' | 'sold' | 'not_available'
          svg_path?: string
          created_at?: string
          updated_at?: string
        }
      }
      blocks: {
        Row: {
          id: string
          zone_id: string
          slug: string
          name: string
          label: string
          status: 'available' | 'reserved' | 'sold' | 'not_available'
          svg_path: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          zone_id: string
          slug: string
          name: string
          label: string
          status: 'available' | 'reserved' | 'sold' | 'not_available'
          svg_path: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          zone_id?: string
          slug?: string
          name?: string
          label?: string
          status?: 'available' | 'reserved' | 'sold' | 'not_available'
          svg_path?: string
          created_at?: string
          updated_at?: string
        }
      }
      lots: {
        Row: {
          id: string
          block_id: string
          zone_id: string
          slug: string
          name: string
          label: string
          status: 'available' | 'reserved' | 'sold' | 'not_available'
          area: number
          price: number | null
          is_corner: boolean
          description: string | null
          front_meters: number | null
          depth_meters: number | null
          orientation: string | null
          features: Json | null
          image_url: string | null
          buyer_name: string | null
          buyer_email: string | null
          buyer_phone: string | null
          buyer_notes: string | null
          reserved_at: string | null
          sold_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          block_id: string
          zone_id: string
          slug: string
          name: string
          label: string
          status: 'available' | 'reserved' | 'sold' | 'not_available'
          area: number
          price?: number | null
          is_corner?: boolean
          description?: string | null
          front_meters?: number | null
          depth_meters?: number | null
          orientation?: string | null
          features?: Json | null
          image_url?: string | null
          buyer_name?: string | null
          buyer_email?: string | null
          buyer_phone?: string | null
          buyer_notes?: string | null
          reserved_at?: string | null
          sold_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          block_id?: string
          zone_id?: string
          slug?: string
          name?: string
          label?: string
          status?: 'available' | 'reserved' | 'sold' | 'not_available'
          area?: number
          price?: number | null
          is_corner?: boolean
          buyer_name?: string | null
          buyer_email?: string | null
          buyer_phone?: string | null
          buyer_notes?: string | null
          reserved_at?: string | null
          sold_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
