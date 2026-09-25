"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Photo = {
  id: string;
  file_path: string;
};

type ScreenPhoto = Photo & {
  url: string;
};

export default function ScreenPage() {
  const [photos, setPhotos] = useState<ScreenPhoto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  async function loadPhotos() {
    const { data, error } = await supabase
      .from("photos")
      .select("id, file_path")
      .eq("approved", true)
      .eq("visible_on_screen", true)
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error(error);
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

    const validPhotos = photosWithUrls.filter(
      (photo): photo is ScreenPhoto => photo !== null
    );

    setPhotos(validPhotos);

    setCurrentIndex((oldIndex) => {
      if (validPhotos.length === 0) return 0;
      return oldIndex >= validPhotos.length
        ? 0
        : oldIndex;
    });
  }

  useEffect(() => {
    loadPhotos();

    const interval = setInterval(() => {
      loadPhotos();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (photos.length <= 1) return;

    const slideshow = setInterval(() => {
      setCurrentIndex((current) =>
        (current + 1) % photos.length
      );
    }, 3000);

    return () => clearInterval(slideshow);
  }, [photos.length]);

  const currentPhoto = photos[currentIndex];

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">

      {currentPhoto ? (
        <img
          src={currentPhoto.url}
          alt=""
          className="max-h-screen max-w-full object-contain"
        />
      ) : (
        <div className="text-center">
          <p className="text-xs tracking-[0.45em] text-white/30">
            CARDOSO · 18 ANOS
          </p>

          <p className="mt-4 text-sm text-white/20">
            A aguardar fotografias...
          </p>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-6 left-0 right-0 text-center">
        <p className="text-[10px] tracking-[0.5em] text-white/30">
          CARDOSO · 18 ANOS
        </p>
      </div>

    </main>
  );
}