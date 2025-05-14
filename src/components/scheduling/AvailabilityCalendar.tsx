"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DateRange } from "react-day-picker";

// Mock available time slots for a selected day
const mockTimeSlots = {
  "2024-07-15": ["09:00 AM", "10:00 AM", "02:00 PM", "03:00 PM"],
  "2024-07-16": ["09:30 AM", "11:00 AM", "01:00 PM"],
  // Add more dates and slots as needed
};

type MockTimeSlots = typeof mockTimeSlots;

export function AvailabilityCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const today = new Date();
  today.setHours(0,0,0,0); // for disabling past dates correctly

  const selectedDateString = date ? date.toISOString().split('T')[0] : null;
  const availableSlotsForDay = selectedDateString ? (mockTimeSlots as MockTimeSlots)[selectedDateString as keyof MockTimeSlots] || [] : [];

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  // Example: disable weekends (Saturday: 6, Sunday: 0) and past dates
  const disabledDays: (Date | DateRange | ((date: Date) => boolean))[] = [
    { before: today }, // Disable all past dates
    (day) => day.getDay() === 0 || day.getDay() === 6, // Disable Sundays and Saturdays
  ];

  return (
    <Card className="w-full max-w-xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Select Date and Time</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border p-0"
            disabled={disabledDays}
          />
        </div>
        <div className="flex-grow space-y-4">
          <h3 className="font-semibold text-lg">
            Available Slots for {date ? date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "selected date"}
          </h3>
          {availableSlotsForDay.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableSlotsForDay.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  onClick={() => handleTimeSelect(time)}
                  className="w-full"
                >
                  {time}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No available slots for this day. Please select another date.</p>
          )}
          {selectedTime && date && (
            <div className="mt-4 p-3 bg-secondary rounded-md">
              <p className="font-semibold">You selected:</p>
              <p>{date.toLocaleDateString()} at <Badge>{selectedTime}</Badge></p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
