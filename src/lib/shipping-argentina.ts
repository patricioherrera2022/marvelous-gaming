import type { ShippingQuoteOption, StoreSettings } from "@/types";

export type ArgentinaShippingZone =
  | "amba"
  | "regional"
  | "nacional"
  | "patagonia";

export interface PostalCodeInfo {
  cp: string;
  province: string;
  zone: ArgentinaShippingZone;
  zoneLabel: string;
}

/**
 * Extracts 4 numeric digits from standard CP ("1425") or CPA ("C1425ABC")
 * and maps it to its Argentine province and distance zone.
 */
export function parseArgentinePostalCode(raw: string): PostalCodeInfo | null {
  const match = raw.trim().toUpperCase().match(/(\d{4})/);
  if (!match) return null;
  const cpStr = match[1];
  const cp = Number(cpStr);
  if (!Number.isFinite(cp) || cp < 1000 || cp > 9431) return null;

  // CABA (1000-1499)
  if (cp >= 1000 && cp <= 1499) {
    return {
      cp: cpStr,
      province: "Ciudad Autónoma de Buenos Aires",
      zone: "amba",
      zoneLabel: "AMBA (CABA)",
    };
  }
  // GBA / Primer y segundo cordón (1600-1899)
  if (cp >= 1600 && cp <= 1899) {
    return {
      cp: cpStr,
      province: "Buenos Aires (GBA)",
      zone: "amba",
      zoneLabel: "AMBA (GBA)",
    };
  }
  // Resto de Buenos Aires & La Plata (1500-1599, 1900-1999, 2700-2999, 6000-6749, 7000-8199)
  if (
    (cp >= 1500 && cp <= 1599) ||
    (cp >= 1900 && cp <= 1999) ||
    (cp >= 2700 && cp <= 2999) ||
    (cp >= 6000 && cp <= 6749) ||
    (cp >= 7000 && cp <= 8199)
  ) {
    return {
      cp: cpStr,
      province: "Buenos Aires",
      zone: "regional",
      zoneLabel: "Regional (Bs. As.)",
    };
  }
  // Santa Fe (2000-2699, 3000-3099)
  if ((cp >= 2000 && cp <= 2699) || (cp >= 3000 && cp <= 3099)) {
    return {
      cp: cpStr,
      province: "Santa Fe",
      zone: "regional",
      zoneLabel: "Regional (Litoral / Centro)",
    };
  }
  // Entre Ríos (3100-3299)
  if (cp >= 3100 && cp <= 3299) {
    return {
      cp: cpStr,
      province: "Entre Ríos",
      zone: "regional",
      zoneLabel: "Regional (Litoral / Centro)",
    };
  }
  // Corrientes (3340-3499)
  if (cp >= 3340 && cp <= 3499) {
    return {
      cp: cpStr,
      province: "Corrientes",
      zone: "nacional",
      zoneLabel: "Nacional (NEA)",
    };
  }
  // Misiones (3300-3339)
  if (cp >= 3300 && cp <= 3339) {
    return {
      cp: cpStr,
      province: "Misiones",
      zone: "nacional",
      zoneLabel: "Nacional (NEA)",
    };
  }
  // Chaco (3500-3599, 3700-3799)
  if ((cp >= 3500 && cp <= 3599) || (cp >= 3700 && cp <= 3799)) {
    return {
      cp: cpStr,
      province: "Chaco",
      zone: "nacional",
      zoneLabel: "Nacional (NEA)",
    };
  }
  // Formosa (3600-3699)
  if (cp >= 3600 && cp <= 3699) {
    return {
      cp: cpStr,
      province: "Formosa",
      zone: "nacional",
      zoneLabel: "Nacional (NEA)",
    };
  }
  // Tucumán (4000-4199)
  if (cp >= 4000 && cp <= 4199) {
    return {
      cp: cpStr,
      province: "Tucumán",
      zone: "nacional",
      zoneLabel: "Nacional (NOA)",
    };
  }
  // Santiago del Estero (4200-4399)
  if (cp >= 4200 && cp <= 4399) {
    return {
      cp: cpStr,
      province: "Santiago del Estero",
      zone: "nacional",
      zoneLabel: "Nacional (NOA)",
    };
  }
  // Salta (4400-4599)
  if (cp >= 4400 && cp <= 4599) {
    return {
      cp: cpStr,
      province: "Salta",
      zone: "nacional",
      zoneLabel: "Nacional (NOA)",
    };
  }
  // Jujuy (4600-4699)
  if (cp >= 4600 && cp <= 4699) {
    return {
      cp: cpStr,
      province: "Jujuy",
      zone: "nacional",
      zoneLabel: "Nacional (NOA)",
    };
  }
  // Catamarca (4700-4799)
  if (cp >= 4700 && cp <= 4799) {
    return {
      cp: cpStr,
      province: "Catamarca",
      zone: "nacional",
      zoneLabel: "Nacional (NOA)",
    };
  }
  // Córdoba (5000-5299, 5800-5999, 2500-2599 fallback)
  if ((cp >= 5000 && cp <= 5299) || (cp >= 5800 && cp <= 5999)) {
    return {
      cp: cpStr,
      province: "Córdoba",
      zone: "regional",
      zoneLabel: "Regional (Centro)",
    };
  }
  // La Rioja (5300-5399)
  if (cp >= 5300 && cp <= 5399) {
    return {
      cp: cpStr,
      province: "La Rioja",
      zone: "nacional",
      zoneLabel: "Nacional (Cuyo / NOA)",
    };
  }
  // San Juan (5400-5499)
  if (cp >= 5400 && cp <= 5499) {
    return {
      cp: cpStr,
      province: "San Juan",
      zone: "nacional",
      zoneLabel: "Nacional (Cuyo)",
    };
  }
  // Mendoza (5500-5699)
  if (cp >= 5500 && cp <= 5699) {
    return {
      cp: cpStr,
      province: "Mendoza",
      zone: "nacional",
      zoneLabel: "Nacional (Cuyo)",
    };
  }
  // San Luis (5700-5799)
  if (cp >= 5700 && cp <= 5799) {
    return {
      cp: cpStr,
      province: "San Luis",
      zone: "regional",
      zoneLabel: "Regional (Centro / Cuyo)",
    };
  }
  // La Pampa (6300-6399, 8200-8299)
  if ((cp >= 6300 && cp <= 6399) || (cp >= 8200 && cp <= 8299)) {
    return {
      cp: cpStr,
      province: "La Pampa",
      zone: "regional",
      zoneLabel: "Regional (Centro)",
    };
  }
  // Neuquén (8300-8399)
  if (cp >= 8300 && cp <= 8399) {
    return {
      cp: cpStr,
      province: "Neuquén",
      zone: "patagonia",
      zoneLabel: "Patagonia",
    };
  }
  // Río Negro (8400-8539)
  if (cp >= 8400 && cp <= 8539) {
    return {
      cp: cpStr,
      province: "Río Negro",
      zone: "patagonia",
      zoneLabel: "Patagonia",
    };
  }
  // Chubut (9000-9299)
  if (cp >= 9000 && cp <= 9299) {
    return {
      cp: cpStr,
      province: "Chubut",
      zone: "patagonia",
      zoneLabel: "Patagonia",
    };
  }
  // Santa Cruz (9300-9409)
  if (cp >= 9300 && cp <= 9409) {
    return {
      cp: cpStr,
      province: "Santa Cruz",
      zone: "patagonia",
      zoneLabel: "Patagonia Sur",
    };
  }
  // Tierra del Fuego (9410-9431)
  if (cp >= 9410 && cp <= 9431) {
    return {
      cp: cpStr,
      province: "Tierra del Fuego",
      zone: "patagonia",
      zoneLabel: "Patagonia Sur",
    };
  }

  return {
    cp: cpStr,
    province: "Argentina",
    zone: "nacional",
    zoneLabel: "Nacional",
  };
}

export function estimatePackageWeightGrams(
  items: Array<{ item_type: "card" | "product"; quantity: number; title?: string }>
): number {
  let grams = 80; // caja rígida / sobre burbuja + protección
  for (const it of items) {
    const qty = Math.max(1, Number(it.quantity) || 1);
    if (it.item_type === "card") {
      grams += qty * 25;
    } else {
      const lower = (it.title || "").toLowerCase();
      const unitWeight =
        lower.includes("box") ||
        lower.includes("etb") ||
        lower.includes("display") ||
        lower.includes("elite trainer")
          ? 750
          : 450;
      grams += qty * unitWeight;
    }
  }
  return grams;
}

function getWeightMultiplier(weightGrams: number): number {
  if (weightGrams <= 500) return 1;
  if (weightGrams <= 1000) return 1.18;
  if (weightGrams <= 2000) return 1.38;
  if (weightGrams <= 5000) return 1.72;
  return 2.2;
}

const CARRIER_BASE_RATES: Record<
  ArgentinaShippingZone,
  {
    andreani_domicilio: { price: number; days: string };
    andreani_sucursal: { price: number; days: string };
    correo_clasico_domicilio: { price: number; days: string };
    correo_expreso_domicilio: { price: number; days: string };
    correo_sucursal: { price: number; days: string };
  }
> = {
  amba: {
    andreani_domicilio: { price: 5400, days: "1 a 3 días hábiles" },
    andreani_sucursal: { price: 4100, days: "1 a 2 días hábiles" },
    correo_clasico_domicilio: { price: 4800, days: "2 a 4 días hábiles" },
    correo_expreso_domicilio: { price: 6600, days: "24 a 48 hs hábiles" },
    correo_sucursal: { price: 3600, days: "2 a 3 días hábiles" },
  },
  regional: {
    andreani_domicilio: { price: 7600, days: "2 a 4 días hábiles" },
    andreani_sucursal: { price: 5800, days: "2 a 3 días hábiles" },
    correo_clasico_domicilio: { price: 6900, days: "3 a 5 días hábiles" },
    correo_expreso_domicilio: { price: 9400, days: "2 a 3 días hábiles" },
    correo_sucursal: { price: 5100, days: "2 a 4 días hábiles" },
  },
  nacional: {
    andreani_domicilio: { price: 9800, days: "3 a 6 días hábiles" },
    andreani_sucursal: { price: 7600, days: "3 a 5 días hábiles" },
    correo_clasico_domicilio: { price: 8900, days: "4 a 6 días hábiles" },
    correo_expreso_domicilio: { price: 12200, days: "2 a 4 días hábiles" },
    correo_sucursal: { price: 6700, days: "3 a 5 días hábiles" },
  },
  patagonia: {
    andreani_domicilio: { price: 12400, days: "4 a 7 días hábiles" },
    andreani_sucursal: { price: 9600, days: "4 a 6 días hábiles" },
    correo_clasico_domicilio: { price: 11200, days: "5 a 8 días hábiles" },
    correo_expreso_domicilio: { price: 15200, days: "3 a 5 días hábiles" },
    correo_sucursal: { price: 8400, days: "4 a 6 días hábiles" },
  },
};

export function calculateArgentineShippingQuotes(params: {
  postalCode: string;
  items: Array<{ item_type: "card" | "product"; quantity: number; title?: string }>;
  subtotal: number;
  settings: StoreSettings;
}): {
  cpInfo: PostalCodeInfo | null;
  weightGrams: number;
  qualifiesFreeShipping: boolean;
  quotes: ShippingQuoteOption[];
} {
  const cpInfo = parseArgentinePostalCode(params.postalCode);
  const weightGrams = estimatePackageWeightGrams(params.items);
  const weightMult = getWeightMultiplier(weightGrams);
  const adminMult = Math.max(0.1, Number(params.settings.carrier_price_multiplier ?? 1));
  const qualifiesFree =
    params.settings.free_shipping_threshold_ars > 0 &&
    params.subtotal >= params.settings.free_shipping_threshold_ars;

  const quotes: ShippingQuoteOption[] = [];

  if (cpInfo) {
    const rates = CARRIER_BASE_RATES[cpInfo.zone];
    const calcPrice = (base: number) =>
      Math.round((base * weightMult * adminMult) / 100) * 100;

    if (params.settings.andreani_enabled !== false) {
      const domPrice = calcPrice(rates.andreani_domicilio.price);
      quotes.push({
        id: "andreani_domicilio",
        carrier: "andreani",
        carrier_label: "Andreani",
        service_name: "Andreani Estándar a Domicilio",
        delivery_type: "domicilio",
        zone_label: cpInfo.zoneLabel,
        province: cpInfo.province,
        price_ars: qualifiesFree ? 0 : domPrice,
        original_price_ars: domPrice,
        is_free: qualifiesFree,
        estimated_days: rates.andreani_domicilio.days,
        weight_grams: weightGrams,
        requires_address: true,
      });

      const sucPrice = calcPrice(rates.andreani_sucursal.price);
      quotes.push({
        id: "andreani_sucursal",
        carrier: "andreani",
        carrier_label: "Andreani",
        service_name: "Andreani Retiro en Sucursal",
        delivery_type: "sucursal",
        zone_label: cpInfo.zoneLabel,
        province: cpInfo.province,
        price_ars: qualifiesFree ? 0 : sucPrice,
        original_price_ars: sucPrice,
        is_free: qualifiesFree,
        estimated_days: rates.andreani_sucursal.days,
        weight_grams: weightGrams,
        requires_address: true,
      });
    }

    if (params.settings.correo_argentino_enabled !== false) {
      const clasicoPrice = calcPrice(rates.correo_clasico_domicilio.price);
      quotes.push({
        id: "correo_clasico_domicilio",
        carrier: "correo_argentino",
        carrier_label: "Correo Argentino",
        service_name: "Correo Argentino Clásico a Domicilio",
        delivery_type: "domicilio",
        zone_label: cpInfo.zoneLabel,
        province: cpInfo.province,
        price_ars: qualifiesFree ? 0 : clasicoPrice,
        original_price_ars: clasicoPrice,
        is_free: qualifiesFree,
        estimated_days: rates.correo_clasico_domicilio.days,
        weight_grams: weightGrams,
        requires_address: true,
      });

      const sucCorreoPrice = calcPrice(rates.correo_sucursal.price);
      quotes.push({
        id: "correo_sucursal",
        carrier: "correo_argentino",
        carrier_label: "Correo Argentino",
        service_name: "Correo Argentino Retiro en Sucursal",
        delivery_type: "sucursal",
        zone_label: cpInfo.zoneLabel,
        province: cpInfo.province,
        price_ars: qualifiesFree ? 0 : sucCorreoPrice,
        original_price_ars: sucCorreoPrice,
        is_free: qualifiesFree,
        estimated_days: rates.correo_sucursal.days,
        weight_grams: weightGrams,
        requires_address: true,
      });

      const expresoPrice = calcPrice(rates.correo_expreso_domicilio.price);
      quotes.push({
        id: "correo_expreso_domicilio",
        carrier: "correo_argentino",
        carrier_label: "Correo Argentino",
        service_name: "Correo Argentino Expreso a Domicilio",
        delivery_type: "domicilio",
        zone_label: cpInfo.zoneLabel,
        province: cpInfo.province,
        price_ars: qualifiesFree ? 0 : expresoPrice,
        original_price_ars: expresoPrice,
        is_free: qualifiesFree,
        estimated_days: rates.correo_expreso_domicilio.days,
        weight_grams: weightGrams,
        requires_address: true,
      });
    }
  }

  // Include Retiro en Punto de Entrega if enabled in settings
  const retiroZone = params.settings.shipping_zones.find(
    (z) => z.id === "retiro" && z.enabled
  );
  if (retiroZone) {
    quotes.push({
      id: "retiro",
      carrier: "pickup",
      carrier_label: "Retiro",
      service_name: retiroZone.name,
      delivery_type: "retiro",
      zone_label: params.settings.sender_city || "CABA",
      province: params.settings.sender_province || "CABA",
      price_ars: 0,
      original_price_ars: 0,
      is_free: true,
      estimated_days: retiroZone.estimated_days,
      weight_grams: weightGrams,
      requires_address: false,
    });
  }

  return {
    cpInfo,
    weightGrams,
    qualifiesFreeShipping: qualifiesFree,
    quotes,
  };
}
