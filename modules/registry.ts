import type { ModuleDefinition, ModuleId } from "@/types/module";
import { modulAjarDefinition } from "./modul-ajar";
import { lkpdDefinition } from "./lkpd";
import { asesmenDefinition } from "./asesmen";
import { rubrikDefinition } from "./rubrik";
import { bahanAjarDefinition } from "./bahan-ajar";
import { kisiKisiDefinition } from "./kisi-kisi";
import { remedialPengayaanDefinition } from "./remedial-pengayaan";

/** Central registry — the only place that needs to know every module exists. */
export const moduleRegistry: Record<ModuleId, ModuleDefinition> = {
  "modul-ajar": modulAjarDefinition,
  lkpd: lkpdDefinition,
  asesmen: asesmenDefinition,
  rubrik: rubrikDefinition,
  "bahan-ajar": bahanAjarDefinition,
  "kisi-kisi": kisiKisiDefinition,
  "remedial-pengayaan": remedialPengayaanDefinition,
};

export function getModule(id: ModuleId): ModuleDefinition {
  const module = moduleRegistry[id];
  if (!module) throw new Error(`Unknown module id "${id}"`);
  return module;
}

export function listModules(): ModuleDefinition[] {
  return Object.values(moduleRegistry);
}

/** Topologically-relevant helper: does `id` depend on `dependencyId`? */
export function dependsOn(id: ModuleId, dependencyId: ModuleId): boolean {
  return getModule(id).dependencies.includes(dependencyId);
}
