"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, UserCheck, Settings, Edit3 } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // Import Image
import { APP_NAME } from "@/lib/constants";
import React, { useEffect } from 'react';

// Mock data
const upcomingAppointments = [
  { id: "1", time: "10:00 AM", clientName: "Alice Johnson", service: "Haircut", avatar: "https://placehold.co/40x40.png?text=AJ" },
  { id: "2", time: "11:30 AM", clientName: "Bob Williams", service: "Consultation", avatar: "https://placehold.co/40x40.png?text=BW" },
  { id: "3", time: "02:00 PM", clientName: "Carol Davis", service: "Check-up", avatar: "https://placehold.co/40x40.png?text=CD" },
];

const professionalStats = [
    { title: "Appointments Today", value: "7", icon: <Calendar className="h-6 w-6 text-primary" /> },
    { title: "Available Slots", value: "3", icon: <Clock className="h-6 w-6 text-primary" /> },
    { title: "Total Clients", value: "48", icon: <UserCheck className="h-6 w-6 text-primary" /> },
];


export default function ProfessionalPage() {
  useEffect(() => {
    document.title = `Professional Dashboard - ${APP_NAME}`;
  }, []);

  return (
    <div className="space-y-8">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-bold">Professional Dashboard</CardTitle>
        <CardDescription>Manage your schedule, appointments, and availability.</CardDescription>
      </CardHeader>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {professionalStats.map(stat => (
          <Card key={stat.title} className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {/* Optional: <p className="text-xs text-muted-foreground">+2 from yesterday</p> */}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Today&apos;s Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length > 0 ? (
            <ul className="space-y-4">
              {upcomingAppointments.map((appt) => (
                <li key={appt.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50">
                  <div className="flex items-center space-x-3">
                    <Image src={appt.avatar} alt={appt.clientName} width={40} height={40} className="rounded-full" data-ai-hint="person avatar" />
                    <div>
                      <p className="font-semibold">{appt.clientName}</p>
                      <p className="text-sm text-muted-foreground">{appt.service}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{appt.time}</p>
                    <Button variant="link" size="sm" className="p-0 h-auto text-primary">View Details</Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No upcoming appointments for today.</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Manage Your Schedule</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Button size="lg" variant="outline" asChild>
            <Link href="/dashboard/professional/availability">
              <Clock className="mr-2 h-5 w-5" /> Set/Update Availability
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/dashboard/professional/calendar">
              <Calendar className="mr-2 h-5 w-5" /> View Full Calendar
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/dashboard/professional/profile">
              <Edit3 className="mr-2 h-5 w-5" /> Edit My Profile
            </Link>
          </Button>
           <Button size="lg" variant="outline" asChild>
            <Link href="/dashboard/settings">
              <Settings className="mr-2 h-5 w-5" /> Account Settings
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
