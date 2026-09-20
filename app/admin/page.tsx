"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Photo = {
  id: string;
  file_path: string;
  original_name: string | null;
  uploaded_at: string;
  approved: boolean;
  visible_on_screen: boolean;
  url?: string;
};

export default function AdminPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPhotos() {
    setLoading(true);

    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const photosWithUrls = await Promise.all(
      (data || []).map(async (photo) => {
        const { data: signedData } = await supabase.storage
          .from("Photos")
          .createSignedUrl(photo.file_path, 3600);

        return {
          ...photo,
          url: signedData?.signedUrl,
        };
      })
    );

    setPhotos(photosWithUrls);
    setLoading(false);
  }

  useEffect(() => {
    loadPhotos();
  }, []);

  async function updatePhoto(
    id: string,
    changes: Partial<Photo>
  ) {
    const { error } = await supabase
      .from("photos")
      .update(changes)
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Não foi possível atualizar a fotografia.");
      return;
    }

    setPhotos((current) =>
      current.map((photo) =>
        photo.id === id
          ? { ...photo, ...changes }
          : photo
      )
    );
  }

  async function deletePhoto(photo: Photo) {
    const confirmed = window.confirm(
      "Tens a certeza que queres apagar esta fotografia?"
    );

    if (!confirmed) return;

    const { error: storageError } = await supabase.storage
      .from("Photos")
      .remove([photo.file_path]);

    if (storageError) {
      console.error(storageError);
      alert("Não foi possível apagar o ficheiro.");
      return;
    }

    const { error: databaseError } = await supabase
      .from("photos")
      .delete()
      .eq("id", photo.id);

    if (databaseError) {
      console.error(databaseError);
      alert("O ficheiro foi apagado, mas houve um erro na base de dados.");
      return;
    }

    setPhotos((current) =>
      current.filter((item) => item.id !== photo.id)
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0d0a09] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm tracking-[0.3em] text-white/40">
            A CARREGAR...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d0a09] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">

        <header className="mb-10">
          <p className="text-xs tracking-[0.4em] text-white/40">
            CARDOSO · 18 ANOS
          </p>

          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-light tracking-[0.08em]">
                ADMIN
              </h1>

              <p className="mt-2 text-sm text-white/40">
                {photos.length} fotografia
                {photos.length !== 1 ? "s" : ""} recebida
                {photos.length !== 1 ? "s" : ""}
              </p>
            </div>

            <button
              onClick={loadPhotos}
              className="rounded-full border border-white/20 px-5 py-2 text-xs tracking-[0.2em] transition hover:border-white/50"
            >
              ATUALIZAR
            </button>
          </div>
        </header>

        {photos.length === 0 ? (
          <div className="rounded-2xl border border-white/10 p-12 text-center">
            <p className="text-sm text-white/40">
              Ainda não foram recebidas fotografias.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                <div className="aspect-square bg-black">
                  {photo.url && (
                    <img
                      src={photo.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="p-4">

                  <p className="truncate text-xs text-white/40">
                    {photo.original_name || "Fotografia"}
                  </p>

                  <div className="mt-4 flex gap-2">

                    <button
                      onClick={() =>
                        updatePhoto(photo.id, {
                          approved: !photo.approved,
                        })
                      }
                      className={`flex-1 rounded-full px-3 py-3 text-xs tracking-[0.1em] transition ${
                        photo.approved
                          ? "bg-white text-black"
                          : "border border-white/20 hover:border-white/50"
                      }`}
                    >
                      {photo.approved
                        ? "APROVADA"
                        : "APROVAR"}
                    </button>

                    <button
                      onClick={() =>
                        updatePhoto(photo.id, {
                          visible_on_screen:
                            !photo.visible_on_screen,
                        })
                      }
                      className={`flex-1 rounded-full px-3 py-3 text-xs tracking-[0.1em] transition ${
                        photo.visible_on_screen
                          ? "bg-white text-black"
                          : "border border-white/20 hover:border-white/50"
                      }`}
                    >
                      {photo.visible_on_screen
                        ? "NA TV"
                        : "MOSTRAR TV"}
                    </button>

                  </div>

                  <button
                    onClick={() => deletePhoto(photo)}
                    className="mt-2 w-full rounded-full border border-red-400/20 px-3 py-3 text-xs tracking-[0.1em] text-red-300 transition hover:border-red-400/50"
                  >
                    APAGAR
                  </button>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}