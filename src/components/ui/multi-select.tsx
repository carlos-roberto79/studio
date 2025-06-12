"use client";

import * as React from "react";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming you have a utility for classnames

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedValue: string) => {
    const newValue = value.includes(selectedValue)
      ? value.filter((v) => v !== selectedValue)
      : [...value, selectedValue];
    onChange(newValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between h-auto min-h-[38px] px-3 py-2"
        >
          <div className="flex flex-wrap gap-1">
            {value.length > 0 ? (
              value.map((val) => {
                const option = options.find((o) => o.value === val);
                return option ? (
                  <Badge key={val} variant="secondary" className="px-2 py-1">
                    {option.label}
                  </Badge>
                ) : null; // Should not happen if value is derived from options
              })
            ) : (
              <span className="text-sm text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <PlusCircle className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" side="bottom" align="start">
        <Command>
          {/* Add CommandInput later if needed for filtering */}
          {/* <CommandInput placeholder="Buscar..." /> */}
          <CommandGroup className="max-h-[200px] overflow-y-auto">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => handleSelect(option.value)}
                className="cursor-pointer"
              >
                <Checkbox
                  checked={value.includes(option.value)}
                  onCheckedChange={() => handleSelect(option.value)}
                   className="mr-2"
                />
                {option.label}
                {/* <CheckIcon
                  className={cn(
                    "ml-auto h-4 w-4",
                    value.includes(option.value) ? "opacity-100" : "opacity-0"
                  )}
                /> */}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
