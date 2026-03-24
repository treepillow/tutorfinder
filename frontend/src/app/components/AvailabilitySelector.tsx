import { useState } from "react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 10); // 10am to 9pm (12 slots)

interface AvailabilitySelectorProps {
  value: Record<string, string[]>;
  onChange: (value: Record<string, string[]>) => void;
}

export function AvailabilitySelector({ value, onChange }: AvailabilitySelectorProps) {
  const toggleSlot = (day: string, hour: number) => {
    const timeSlot = `${hour}:00-${hour + 1}:00`;
    const currentDaySlots = value[day] || [];
    
    const newDaySlots = currentDaySlots.includes(timeSlot)
      ? currentDaySlots.filter((slot) => slot !== timeSlot)
      : [...currentDaySlots, timeSlot];
    
    onChange({
      ...value,
      [day]: newDaySlots,
    });
  };

  const isSlotSelected = (day: string, hour: number) => {
    const timeSlot = `${hour}:00-${hour + 1}:00`;
    return (value[day] || []).includes(timeSlot);
  };

  return (
    <div className="bg-[#FFF2D5] p-6 rounded-2xl overflow-x-auto">
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
                <button
                  key={`${day}-${hour}`}
                  type="button"
                  onClick={() => toggleSlot(day, hour)}
                  className={`h-10 rounded transition-all duration-200 ${
                    isSlotSelected(day, hour)
                      ? "bg-[#7C8D8C] hover:bg-[#2F3B3D]"
                      : "bg-white hover:bg-[#E9D8BB]"
                  }`}
                />
              ))}
            </>
          ))}
        </div>
      </div>
      <p className="text-sm text-[#2F3B3D]/60 mt-4">
        Click on time slots to mark your availability (10am - 10pm)
      </p>
    </div>
  );
}
