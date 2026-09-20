"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return;

    setFiles(Array.from(event.target.files));
    setMessage("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (files.length === 0) {
      setMessage("Seleciona pelo menos uma fotografia.");
      return;
    }

    setUploading(true);
    setMessage("A enviar as fotografias...");

    try {
      for (const file of files) {
        const extension = file.name.split(".").pop() || "jpg";

        const fileName = `${crypto.randomUUID()}.${extension}`;
        const filePath = fileName;

        console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log("FILE PATH:", filePath);

        const { error: uploadError } = await supabase.storage
          .from("Photos")
          .upload(filePath, file);

        if (uploadError) {
          console.error("UPLOAD ERROR:", uploadError);
          throw uploadError;
        }

        const { error: databaseError } = await supabase
          .from("photos")
          .insert({
            file_path: filePath,
            original_name: file.name,
          });

        if (databaseError) {
          console.error("DATABASE ERROR:", databaseError);
          throw databaseError;
        }
      }

      setFiles([]);

      setMessage(
        `${files.length} fotografia${
          files.length > 1 ? "s" : ""
        } enviada${files.length > 1 ? "s" : ""} com sucesso.`
      );
    } catch (error) {
      console.error("ERRO COMPLETO:", error);

      setMessage(
        "Não foi possível enviar as fotografias. Verifica a consola para mais detalhes."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0d0a09] px-6 text-white">
      <section className="flex min-h-screen flex-col items-center justify-center text-center">

        <p className="mb-4 text-xs tracking-[0.45em] text-white/50">
          CARDOSO · 18 ANOS
        </p>

        <h1 className="text-4xl font-light tracking-[0.12em]">
          PARTILHA A TUA NOITE
        </h1>

        <p className="mt-5 max-w-sm text-sm leading-6 text-white/60">
          Escolhe as fotografias que queres guardar no álbum dos
          18 anos.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 w-full max-w-sm"
        >
          <label
            htmlFor="photos"
            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-white/20 px-6 py-12 transition hover:border-white/50"
          >
            <span className="text-sm tracking-[0.2em]">
              ESCOLHER FOTOGRAFIAS
            </span>

            <span className="mt-3 text-xs text-white/40">
              Podes selecionar várias
            </span>

            <input
              id="photos"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              className="hidden"
            />
          </label>

          {files.length > 0 && (
            <p className="mt-5 text-sm text-white/60">
              {files.length} fotografia
              {files.length > 1 ? "s" : ""} selecionada
              {files.length > 1 ? "s" : ""}
            </p>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="mt-8 w-full rounded-full border border-white/40 px-8 py-4 text-sm tracking-[0.25em] transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            {uploading ? "A ENVIAR..." : "ENVIAR"}
          </button>

          {message && (
            <p className="mt-6 text-sm text-white/60">
              {message}
            </p>
          )}
        </form>

        <p className="mt-12 text-xs tracking-[0.2em] text-white/30">
          25 · 09 · 2026
        </p>

      </section>
    </main>
  );
}