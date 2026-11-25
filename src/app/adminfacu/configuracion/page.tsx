"use client";

import React, { useEffect, useState } from "react";
import { Check, Loader2, Plus, Trash2 } from "lucide-react";
import { AdminShell } from "../AdminShell";
import type { ShippingZone, StoreSettings } from "@/types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSavedMsg("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setSavedMsg("Configuración guardada correctamente.");
        setTimeout(() => setSavedMsg(""), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const updateZone = (index: number, patch: Partial<ShippingZone>) => {
    if (!settings) return;
    const zones = [...settings.shipping_zones];
    zones[index] = { ...zones[index], ...patch };
    setSettings({ ...settings, shipping_zones: zones });
  };

  const addZone = () => {
    if (!settings) return;
    setSettings({
      ...settings,
      shipping_zones: [
        ...settings.shipping_zones,
        {
          id: `zona-${Date.now().toString().slice(-4)}`,
          name: "Nueva zona de envío",
          description: "Descripción del envío",
          price_ars: 5000,
          estimated_days: "2 a 4 días hábiles",
          enabled: true,
        },
      ],
    });
  };

  const removeZone = (index: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      shipping_zones: settings.shipping_zones.filter((_, i) => i !== index),
    });
  };

  return (
    <AdminShell>
      {loading || !settings ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-crimson-500" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="max-w-4xl space-y-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="font-display text-3xl font-black text-white">
                Configuración de la Tienda
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Medios de pago, envíos, banner superior y visibilidad de
                secciones.
              </p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-crimson-scale px-6 py-3 text-xs font-bold text-white shadow-crimson transition hover:brightness-110 disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>

          {savedMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-4 py-3 text-xs font-bold text-emerald-300">
              <Check className="h-4 w-4" />
              {savedMsg}
            </div>
          )}

          {/* PS4 / PS5 Toggle */}
          <div className="rounded-2xl border border-crimson-500/30 bg-obsidian-850 p-6">
            <h2 className="font-display text-lg font-bold text-white">
              Sección Juegos PS4, PS5 y Accesorios
            </h2>
            <label className="mt-3 inline-flex cursor-pointer items-center gap-3 text-sm font-semibold text-white">
              <input
                type="checkbox"
                checked={settings.games_coming_soon}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    games_coming_soon: e.target.checked,
                  })
                }
                className="h-4 w-4 accent-crimson-600"
              />
              Mostrar sección en modo &ldquo;Próximamente&rdquo; (ocultar venta
              directa hasta tener stock)
            </label>
            <textarea
              rows={2}
              value={settings.games_coming_soon_message}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  games_coming_soon_message: e.target.value,
                })
              }
              className="mt-3 w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white outline-none focus:border-crimson-500"
            />
          </div>

          {/* General & Banner */}
          <div className="rounded-2xl border border-white/10 bg-obsidian-850 p-6">
            <h2 className="font-display text-lg font-bold text-white">
              Identidad, Contacto y Banner
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-slate-400">
                  Nombre de la tienda
                </label>
                <input
                  type="text"
                  value={settings.store_name}
                  onChange={(e) =>
                    setSettings({ ...settings, store_name: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">
                  WhatsApp (con código país, ej: 54911...)
                </label>
                <input
                  type="text"
                  value={settings.whatsapp_number}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      whatsapp_number: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">
                  Instagram
                </label>
                <input
                  type="text"
                  value={settings.instagram_handle}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instagram_handle: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">
                  Email de contacto
                </label>
                <input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) =>
                    setSettings({ ...settings, contact_email: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-white">
                <input
                  type="checkbox"
                  checked={settings.promo_banner_enabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      promo_banner_enabled: e.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-crimson-600"
                />
                Mostrar barra superior promocional
              </label>
              <input
                type="text"
                value={settings.promo_banner_text}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    promo_banner_text: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white"
              />
            </div>
          </div>

          {/* Payments */}
          <div className="rounded-2xl border border-white/10 bg-obsidian-850 p-6">
            <h2 className="font-display text-lg font-bold text-white">
              Formas de Pago y Datos Bancarios
            </h2>

            <div className="mt-4 flex flex-wrap gap-5 text-xs font-semibold text-white">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.transfer_enabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      transfer_enabled: e.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-crimson-600"
                />
                Transferencia Bancaria
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.mercadopago_enabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      mercadopago_enabled: e.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-crimson-600"
                />
                Mercado Pago
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.cash_enabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      cash_enabled: e.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-crimson-600"
                />
                Efectivo / Retiro
              </label>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-slate-400">
                  % Descuento por Transferencia
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={settings.transfer_discount_percent}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      transfer_discount_percent: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">
                  Banco / Billetera
                </label>
                <input
                  type="text"
                  value={settings.bank_name}
                  onChange={(e) =>
                    setSettings({ ...settings, bank_name: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">
                  Titular
                </label>
                <input
                  type="text"
                  value={settings.bank_holder}
                  onChange={(e) =>
                    setSettings({ ...settings, bank_holder: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">
                  Alias
                </label>
                <input
                  type="text"
                  value={settings.bank_alias}
                  onChange={(e) =>
                    setSettings({ ...settings, bank_alias: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs text-slate-400">
                  CBU / CVU
                </label>
                <input
                  type="text"
                  value={settings.bank_cbu}
                  onChange={(e) =>
                    setSettings({ ...settings, bank_cbu: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs font-mono text-white"
                />
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="rounded-2xl border border-white/10 bg-obsidian-850 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-white">
                Zonas y Tarifas de Envío
              </h2>
              <button
                type="button"
                onClick={addZone}
                className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
              >
                <Plus className="h-3.5 w-3.5" /> Agregar zona
              </button>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-xs text-slate-400">
                Envío gratis a partir de ARS (0 para desactivar)
              </label>
              <input
                type="number"
                min={0}
                value={settings.free_shipping_threshold_ars}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    free_shipping_threshold_ars: Number(e.target.value),
                  })
                }
                className="w-full max-w-xs rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white"
              />
            </div>

            <div className="mt-4 space-y-3">
              {settings.shipping_zones.map((z, idx) => (
                <div
                  key={z.id}
                  className="grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-obsidian-950 p-3.5 sm:grid-cols-12"
                >
                  <input
                    type="text"
                    value={z.name}
                    onChange={(e) => updateZone(idx, { name: e.target.value })}
                    placeholder="Nombre"
                    className="rounded-lg border border-white/10 bg-obsidian-900 px-2.5 py-2 text-xs text-white sm:col-span-4"
                  />
                  <input
                    type="text"
                    value={z.estimated_days}
                    onChange={(e) =>
                      updateZone(idx, { estimated_days: e.target.value })
                    }
                    placeholder="Demora"
                    className="rounded-lg border border-white/10 bg-obsidian-900 px-2.5 py-2 text-xs text-white sm:col-span-3"
                  />
                  <input
                    type="number"
                    min={0}
                    value={z.price_ars}
                    onChange={(e) =>
                      updateZone(idx, { price_ars: Number(e.target.value) })
                    }
                    placeholder="Precio ARS"
                    className="rounded-lg border border-white/10 bg-obsidian-900 px-2.5 py-2 text-xs text-white sm:col-span-2"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-white sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={z.enabled}
                      onChange={(e) =>
                        updateZone(idx, { enabled: e.target.checked })
                      }
                      className="accent-crimson-600"
                    />
                    Activa
                  </label>
                  <button
                    type="button"
                    onClick={() => removeZone(idx)}
                    className="flex items-center justify-center rounded-lg text-crimson-400 hover:bg-crimson-950/40 sm:col-span-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Remitente y Calculador Automático Andreani / Correo Argentino */}
          <div className="rounded-2xl border border-white/10 bg-obsidian-850 p-6">
            <h2 className="font-display text-lg font-bold text-white">
              Remitente (Etiquetas/Tickets) y Correos Automáticos por CP
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Datos impresos en el Ticket de Compra y la Etiqueta de Envío, y
              activación del cálculo por Código Postal.
            </p>

            <div className="mt-4 flex flex-wrap gap-5 text-xs font-semibold text-white">
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.andreani_enabled !== false}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      andreani_enabled: e.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-crimson-600"
                />
                Calcular Andreani por CP
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.correo_argentino_enabled !== false}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      correo_argentino_enabled: e.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-crimson-600"
                />
                Calcular Correo Argentino por CP
              </label>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-slate-400">
                  Nombre Remitente
                </label>
                <input
                  type="text"
                  value={settings.sender_name || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, sender_name: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">
                  CUIT (Opcional en tickets)
                </label>
                <input
                  type="text"
                  value={settings.sender_cuit || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, sender_cuit: e.target.value })
                  }
                  placeholder="20-00000000-0"
                  className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs text-slate-400">
                  Dirección Remitente
                </label>
                <input
                  type="text"
                  value={settings.sender_address || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, sender_address: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">
                  Ciudad Remitente
                </label>
                <input
                  type="text"
                  value={settings.sender_city || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, sender_city: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">
                    Provincia
                  </label>
                  <input
                    type="text"
                    value={settings.sender_province || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        sender_province: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">
                    CP Origen
                  </label>
                  <input
                    type="text"
                    value={settings.sender_postal_code || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        sender_postal_code: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">
                  Multiplicador de tarifa correos (1.0 = base)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min={0.1}
                  value={settings.carrier_price_multiplier ?? 1}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      carrier_price_multiplier: Number(e.target.value) || 1,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-3 py-2.5 text-xs text-white"
                />
              </div>
            </div>
          </div>
        </form>
      )}
    </AdminShell>
  );
}
