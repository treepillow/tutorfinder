import { useState, useRef, useEffect, useCallback } from "react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 10); // 10am to 9pm

interface AvailabilitySelectorProps {
  value: Record<string, string[]>;
  onChange: (value: Record<string, string[]>) => void;
}

export function AvailabilitySelector({ value, onChange }: AvailabilitySelectorProps) {
  // painting = true means we're mid-drag; paintMode = whether we're adding or removing
  const painting = useRef(false);
  const paintMode = useRef<"add" | "remove">("add");
  // Use a ref for in-progress selection to avoid stale closures
  const pendingValue = useRef<Record<string, string[]>>(value);

  // Keep pendingValue in sync when value changes externally
  useEffect(() => { pendingValue.current = value; }, [value]);

  const slotKey = (day: string, hour: number) => `${hour}:00-${hour + 1}:00`;

  const isSelected = (day: string, hour: number) =>
    (value[day] || []).includes(slotKey(day, hour));

  const applySlot = useCallback((day: string, hour: number) => {
    const key = slotKey(day, hour);
    const current = pendingValue.current[day] || [];
    let updated: string[];
    if (paintMode.current === "add") {
      updated = current.includes(key) ? current : [...current, key];
    } else {
      updated = current.filter((s) => s !== key);
    }
    pendingValue.current = { ...pendingValue.current, [day]: updated };
    onChange({ ...pendingValue.current });
  }, [onChange]);

  const handleMouseDown = (day: string, hour: number) => {
    painting.current = true;
    paintMode.current = isSelected(day, hour) ? "remove" : "add";
    applySlot(day, hour);
  };

  const handleMouseEnter = (day: string, hour: number) => {
    if (!painting.current) return;
    applySlot(day, hour);
  };

  // Stop painting on mouseup anywhere
  useEffect(() => {
    const stop = () => { painting.current = false; };
    window.addEventListener("mouseup", stop);
    return () => window.removeEventListener("mouseup", stop);
  }, []);

  return (
    <div
      className="bg-[#F5F3EF] p-6 rounded-2xl overflow-x-auto select-none"
      onDragStart={(e) => e.preventDefault()}
    >
      <div className="min-w-[800px]">
        <div className="grid grid-cols-8 gap-2">
          {/* Header */}
          <div className="text-sm text-[#2F3B3D]/70"></div>
          {DAYS.map((day) => (
            <div key={day} className="text-sm text-[#2F3B3D]/70 text-center">
              {day.slice(0, 3)}
            </div>
          ))}

          {/* Time Slots */}
          {HOURS.map((hour) => (
            <>
              <div key={`label-${hour}`} className="text-sm text-[#2F3B3D]/70 flex items-center">
                {hour}:00
              </div>
              {DAYS.map((day) => (
                <div
                  key={`${day}-${hour}`}
                  onMouseDown={() => handleMouseDown(day, hour)}
                  onMouseEnter={() => handleMouseEnter(day, hour)}
                  className={`h-10 rounded cursor-pointer transition-colors duration-100 ${
                    isSelected(day, hour)
                      ? "bg-[#7C8D8C] hover:bg-[#2F3B3D]"
                      : "bg-white hover:bg-[#EDE9DF]"
                  }`}
                />
              ))}
            </>
          ))}
        </div>
      </div>
      <p className="text-sm text-[#2F3B3D]/60 mt-4">
        Click or drag to mark your availability (10am - 10pm)
      </p>
    </div>
  );
}
