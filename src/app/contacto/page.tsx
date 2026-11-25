import React from "react";
import { Mail, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { getStoreSettings } from "@/lib/repository";
import { MotionReveal } from "@/components/motion/MotionReveal";
import { buildWhatsAppUrl, formatARS } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getStoreSettings();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <MotionReveal className="mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-crimson-500">
          Atención Personalizada
        </span>
        <h1 className="mt-1 font-display text-3xl font-black text-white sm:text-4xl">
          Sobre {settings.store_name} y Contacto
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          ¿Buscás una carta puntual, querés consultar por productos sellados o
          seguimiento de tu envío? Escribinos directo.
        </p>
      </MotionReveal>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-obsidian-850 p-7">
          <h2 className="font-display text-xl font-bold text-white">
            Canales de Contacto Directo
          </h2>
          <div className="mt-5 space-y-4 text-sm text-slate-300">
            <a
              href={buildWhatsAppUrl(
                settings.whatsapp_number,
                "Hola Marvelous Gaming! Tengo una consulta."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-emerald-300 transition hover:bg-emerald-950/35"
            >
              <MessageCircle className="h-6 w-6 shrink-0" />
              <div>
                <p className="font-bold text-white">WhatsApp Directo</p>
                <p className="text-xs">+{settings.whatsapp_number}</p>
              </div>
            </a>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-obsidian-950 p-4">
              <Mail className="h-5 w-5 text-crimson-500" />
              <div>
                <p className="font-bold text-white">Email</p>
                <p className="text-xs text-slate-400">
                  {settings.contact_email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-obsidian-950 p-4">
              <ShieldCheck className="h-5 w-5 text-crimson-500" />
              <div>
                <p className="font-bold text-white">Instagram</p>
                <p className="text-xs text-slate-400">
                  {settings.instagram_handle}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-obsidian-850 p-7">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-crimson-500" />
            <h2 className="font-display text-xl font-bold text-white">
              Zonas y Costos de Envío
            </h2>
          </div>

          {settings.free_shipping_threshold_ars > 0 && (
            <p className="mt-3 rounded-xl bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-300">
              Envío gratis superando los{" "}
              {formatARS(settings.free_shipping_threshold_ars)}
            </p>
          )}

          <div className="mt-4 space-y-2.5">
            {settings.shipping_zones
              .filter((z) => z.enabled)
              .map((zone) => (
                <div
                  key={zone.id}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-obsidian-950 p-3.5 text-xs"
                >
                  <div>
                    <p className="font-bold text-white">{zone.name}</p>
                    <p className="text-slate-400">{zone.estimated_days}</p>
                  </div>
                  <span className="font-bold text-crimson-400">
                    {zone.price_ars === 0 ? "Gratis" : formatARS(zone.price_ars)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
