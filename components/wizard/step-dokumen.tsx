import { listModules } from "@/modules/registry";
import { modulePresets } from "@/config/modules";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DependencyCheckbox } from "./dependency-checkbox";
import type { ModuleId } from "@/types/module";
import type { WizardPreset } from "@/types/context";

const presetLabels: Record<WizardPreset, string> = {
  lengkap: "Lengkap",
  "perangkat-inti": "Perangkat Inti",
  custom: "Custom",
};

export function StepDokumen({
  selectedModules,
  preset,
  onChange,
}: {
  selectedModules: string[];
  preset: WizardPreset;
  onChange: (next: { selectedModules: string[]; preset: WizardPreset }) => void;
}) {
  const modules = listModules();
  const selectedSet = new Set(selectedModules);

  function applyPreset(nextPreset: WizardPreset) {
    if (nextPreset === "custom") {
      onChange({ selectedModules, preset: "custom" });
      return;
    }
    onChange({ selectedModules: modulePresets[nextPreset], preset: nextPreset });
  }

  function toggleModule(moduleId: ModuleId, checked: boolean) {
    const next = checked
      ? [...selectedModules, moduleId]
      : selectedModules.filter((id) => id !== moduleId);
    onChange({ selectedModules: next, preset: "custom" });
  }

  function resolveDependency(moduleId: ModuleId) {
    if (selectedSet.has(moduleId)) return;
    onChange({ selectedModules: [...selectedModules, moduleId], preset: "custom" });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-sm font-medium">Preset</p>
        <div className="flex gap-2">
          {(Object.keys(presetLabels) as WizardPreset[]).map((key) => (
            <Button
              key={key}
              type="button"
              size="sm"
              variant={preset === key ? "default" : "outline"}
              className={cn(preset === key && "pointer-events-none")}
              onClick={() => applyPreset(key)}
            >
              {presetLabels[key]}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {modules.map((module) => {
          const missingDependencies = module.dependencies
            .filter((dep) => !selectedSet.has(dep))
            .map((dep) => modules.find((m) => m.id === dep)!)
            .filter(Boolean);

          return (
            <DependencyCheckbox
              key={module.id}
              module={module}
              checked={selectedSet.has(module.id)}
              missingDependencies={missingDependencies}
              onToggle={(checked) => toggleModule(module.id, checked)}
              onResolveDependency={resolveDependency}
            />
          );
        })}
      </div>
    </div>
  );
}
