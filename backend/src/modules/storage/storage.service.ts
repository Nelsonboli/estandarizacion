import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    } else {
      console.warn('Advertencia: SUPABASE_URL o SUPABASE_KEY no están definidas en las variables de entorno.');
    }
  }

  // Sube un buffer a un bucket de Supabase y retorna la URL pública del archivo
  async subirArchivo(bucket: string, rutaArchivo: string, fileBuffer: Buffer, contentType: string): Promise<string> {
    if (!this.supabase) {
      throw new Error('Supabase no está configurado. Verifica las variables SUPABASE_URL y SUPABASE_KEY.');
    }
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(rutaArchivo, fileBuffer, {
        contentType,
        upsert: true, // Reemplazar si ya existe
      });

    if (error) {
      throw new Error(`Error al subir a Supabase: ${error.message}`);
    }

    const { data: urlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(rutaArchivo);

    return urlData.publicUrl;
  }

  // Descarga un archivo desde Supabase (útil para que Jasper lo procese temporalmente)
  async descargarArchivo(bucket: string, rutaArchivo: string): Promise<Buffer> {
    if (!this.supabase) {
      throw new Error('Supabase no está configurado. Verifica las variables SUPABASE_URL y SUPABASE_KEY.');
    }
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .download(rutaArchivo);

    if (error) {
      throw new Error(`Error al descargar de Supabase: ${error.message}`);
    }

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  // Elimina un archivo
  async eliminarArchivo(bucket: string, rutaArchivo: string): Promise<void> {
    if (!this.supabase) {
      throw new Error('Supabase no está configurado. Verifica las variables SUPABASE_URL y SUPABASE_KEY.');
    }
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([rutaArchivo]);

    if (error) {
      throw new Error(`Error al eliminar de Supabase: ${error.message}`);
    }
  }
}
