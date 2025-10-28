"use client";

import { useLanguage } from "@/components/language/LanguageContext";

export default function MinEducFooter() {
  const { t } = useLanguage();

  return (
    <div className="w-full bg-[#173277] text-white">
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        {/* Top bars and social icons */}
        <div className="flex items-center justify-between">
          {/* Bars and Ministerio de Educación */}
          <a
            href="https://www.mineduc.cl/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("footer.mineduc", "common")}
            className="group focus:outline-none"
          >
            <div className="flex h-3 w-40 mb-2">
              <div className="bg-[#1a69b1] h-full w-2/5 group-hover:opacity-80 transition" />
              <div className="bg-[#E73C48] h-full w-3/5 group-hover:opacity-80 transition" />
            </div>
            <div className="text-2xl font-bold group-hover:underline">
              {t("footer.mineduc", "common")}
            </div>
          </a>
          {/* Social icons */}
          <div className="grid grid-cols-2 md:flex md:items-center gap-6">
            <a
              href="https://www.facebook.com/mineduc"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("footer.social_facebook", "common")}
              className="hover:text-blue-200"
            >
              <svg
                width="32"
                height="32"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <rect
                  x="1"
                  y="1"
                  width="22"
                  height="22"
                  rx="4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path d="M15.5 8.5h-2a.5.5 0 0 0-.5.5v1.5h2.5l-.5 2.5H13V18h-2.5v-5.5H8.5v-2.5H10.5V9c0-1.1.9-2 2-2h2.5v2z" />
              </svg>
            </a>
            <a
              href="https://twitter.com/mineduc"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("footer.social_twitter", "common")}
              className="hover:text-blue-200"
            >
              <svg
                width="32"
                height="32"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/mineducchile/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("footer.social_instagram", "common")}
              className="hover:text-blue-200"
            >
              <svg
                width="32"
                height="32"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <rect
                  x="2"
                  y="2"
                  width="20"
                  height="20"
                  rx="5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
              </svg>
            </a>
            <a
              href="https://www.youtube.com/user/mineducchile"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("footer.social_youtube", "common")}
              className="hover:text-blue-200"
            >
              <svg
                width="32"
                height="32"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <rect
                  x="0.7"
                  y="2.7"
                  width="22.6"
                  height="18.6"
                  rx="3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                <polygon
                  points="8.5,8.5 16.5,12 8.5,15.5"
                  fill="currentColor"
                />
              </svg>
            </a>
          </div>
        </div>
        {/* White horizontal line */}
        <hr className="border-t-2 border-white mt-[21px] mb-4" />
        {/* Bottom row: GOBIERNO DE CHILE | CHILE AVANZA CONTIGO */}
        <div className="grid grid-cols-2 sm:flex sm:flex-row sm:items-center sm:justify-between flex-grow min-h-12 gap-4 sm:gap-0">
          <a
            href="https://www.gob.cl/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col sm:flex-row sm:items-center items-center text-center sm:text-left text-lg font-bold hover:underline focus:outline-none gap-1 sm:gap-2"
            aria-label="Gobierno de Chile"
          >
            <span>GOBIERNO</span>
            <div className="flex items-center gap-1">
              <span className="font-normal">DE</span>
              <span className="text-red-500">CHILE</span>
            </div>
          </a>
          <a
            href="https://www.mineduc.cl/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col sm:flex-row sm:items-center items-center text-center sm:text-left text-lg font-bold hover:underline focus:outline-none gap-1 sm:gap-2"
            aria-label="Chile Avanza Contigo"
          >
            <span>
              <span className="text-red-500">CHILE</span> AVANZA
            </span>
            <span>CONTIGO</span>
          </a>
        </div>
      </div>
    </div>
  );
}
