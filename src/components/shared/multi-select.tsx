"use client";

import * as React from "react";
import { CheckIcon, PlusCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onSelectedChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onSelectedChange,
  placeholder = "Selecione...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (value: string) => {
    const isSelected = selected.includes(value);
    if (isSelected) {
      onSelectedChange(selected.filter((item) => item !== value));
    } else {
      onSelectedChange([...selected, value]);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-10 w-full justify-between border-dashed"
          >
            <div className="flex items-center space-x-2">
              <PlusCircle className="mr-2 h-4 w-4" />
              <span className="text-sm font-medium">{placeholder}</span>
              {selected.length > 0 && (
                <Separator orientation="vertical" className="mx-2 h-4" />
              )}
              {selected.length > 0 && (
                <div className="space-x-1 overflow-hidden">
                  {selected.length === 1 ? (
                     <Badge
                        variant="secondary"
                        className="rounded-sm px-1 font-normal"
                      >
                       {options.find(o => o.value === selected[0])?.label || selected[0]}
                      </Badge>
                  ) : (
                     <Badge
                      variant="secondary"
                      className="rounded-sm px-1 font-normal"
                    >
                      {selected.length} selecionados
                    </Badge>
                  )}
                </div>
              )}
            </div>
            {selected.length > 0 && (
              <div className="space-x-1 flex items-center">
                 <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal hover:bg-red-200 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); onSelectedChange([]); setOpen(false); }}
                >
                  Limpar
                 </Badge>
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar opções..." />
            <CommandList>
              <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        selected.includes(option.value)
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className={"h-4 w-4"} />
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              {selected.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => onSelectedChange([])}
                      className="justify-center text-center cursor-pointer"
                    >
                      Limpar filtros
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
"