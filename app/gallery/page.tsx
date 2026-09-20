"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Photo = {
  id: string;
  file_path: string;
  original_name: string | null;
  uploaded_at: string;
  url?: string;
};

const UNLOCK_DATE = new Date("2026-09-27T15:00:00+01:00").getTime();

function getTimeRemaining() {
  const difference = Math.max(0, UNLOCK_DATE - Date.now());

  const totalSeconds = Math.floor(difference / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    unlocked: difference <= 0,
  };
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export default function GalleryPage() {
  const [time, setTime] = useState(getTimeRemaining());
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadPhotos() {
    setLoading(true);

    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .eq("approved", true)
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const photosWithUrls = await Promise.all(
      (data || []).map(async (photo) => {
        const { data: signedData, error: signedError } =
          await supabase.storage
            .from("Photos")
            .createSignedUrl(photo.file_path, 3600);

        if (signedError || !signedData) {
          console.error(signedError);
          return null;
        }

        return {
          ...photo,
          url: signedData.signedUrl,
        };
      })
    );

    setPhotos(
      photosWithUrls.filter(
        (photo): photo is Photo => photo !== null
      )
    );

    setLoading(false);
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(getTimeRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!time.unlocked) return;

    loadPhotos();

    const refresh = setInterval(() => {
      loadPhotos();
    }, 30000);

    return () => clearInterval(refresh);
  }, [time.unlocked]);

  async function downloadOriginal(photo: Photo) {
    const { data, error } = await supabase.storage
      .from("Photos")
      .createSignedUrl(photo.file_path, 300);

    if (error || !data?.signedUrl) {
      alert("Não foi possível preparar o download.");
      return;
    }

    const response = await fetch(data.signedUrl);

    if (!response.ok) {
      alert("Não foi possível descarregar a fotografia.");
      return;
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = photo.original_name || "fotografia";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  }

  if (!time.unlocked) {
    return (
      <main className="min-h-screen bg-[#0d0a09] px-6 text-white">
        <section className="flex min-h-screen flex-col items-center justify-center text-center">
          <p className="text-xs tracking-[0.45em] text-white/40">
            CARDOSO · 18 ANOS
          </p>

          <h1 className="mt-6 text-5xl font-light tracking-[0.15em]">
            THE GALLERY
          </h1>

          <p className="mt-8 text-sm tracking-[0.5em] text-white/30">
            SOON
          </p>

          <div className="mt-14 grid grid-cols-4 gap-4">
            <div>
              <p className="text-4xl font-light">
                {time.days}
              </p>
              <p className="mt-2 text-[10px] tracking-[0.3em] text-white/30">
                DIAS
              </p>
            </div>

            <div>
              <p className="text-4xl font-light">
                {pad(time.hours)}
              </p>
              <p className="mt-2 text-[10px] tracking-[0.3em] text-white/30">
                HORAS
              </p>
            </div>

            <div>
              <p className="text-4xl font-light">
                {pad(time.minutes)}
              </p>
              <p className="mt-2 text-[10px] tracking-[0.3em] text-white/30">
                MINUTOS
              </p>
            </div>

            <div>
              <p className="text-4xl font-light">
                {pad(time.seconds)}
              </p>
              <p className="mt-2 text-[10px] tracking-[0.3em] text-white/30">
                SEGUNDOS
              </p>
            </div>
          </div>

          <p className="mt-14 max-w-sm text-sm leading-6 text-white/40">
            As fotografias da noite estarão disponíveis
            aqui a partir das 15:00.
          </p>

          <p className="mt-12 text-xs tracking-[0.2em] text-white/20">
            27 · 09 · 2026
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d0a09] px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12 text-center">
          <p className="text-xs tracking-[0.45em] text-white/40">
            CARDOSO · 18 ANOS
          </p>

          <h1 className="mt-5 text-5xl font-light tracking-[0.15em]">
            THE GALLERY
          </h1>

          <p className="mt-4 text-sm text-white/40">
            Todas as fotografias da noite.
          </p>
        </header>

        {loading && photos.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm tracking-[0.3em] text-white/30">
              A CARREGAR...
            </p>
          </div>
        ) : photos.length === 0 ? (
          <div className="rounded-2xl border border-white/10 p-12 text-center">
            <p className="text-sm text-white/40">
              Ainda não existem fotografias aprovadas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                <div className="flex min-h-[300px] items-center justify-center bg-black p-3">
                  {photo.url && (
                    <img
                      src={photo.url}
                      alt=""
                      className="max-h-[600px] w-full object-contain"
                    />
                  )}
                </div>

                <div className="p-4">
                  <p className="truncate text-xs text-white/40">
                    {photo.original_name || "Fotografia"}
                  </p>

                  <button
                    onClick={() => downloadOriginal(photo)}
                    className="mt-4 w-full rounded-full border border-white/20 px-4 py-3 text-xs tracking-[0.2em] transition hover:border-white/50 hover:bg-white hover:text-black"
                  >
                    DESCARREGAR ORIGINAL
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