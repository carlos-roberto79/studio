"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarPlus, History, Star, Settings } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import React, { useEffect } from 'react';

// Mock data
const upcomingClientAppointments = [
  { id: "1", date: "Tomorrow, June 25th", time: "02:00 PM", service: "Dental Check-up", professional: "Dr. Alice Smith", company: "Bright Smiles Dental", companyLogo: "https://placehold.co/40x40.png?text=BS" },
  { id: "2", date: "July 1st", time: "04:30 PM", service: "Haircut & Style", professional: "John Doe", company: "Trendy Cuts Salon", companyLogo: "https://placehold.co/40x40.png?text=TC" },
];

const clientStats = [
    { title: "Upcoming Appointments", value: "2", icon: <CalendarPlus className="h-6 w-6 text-primary" /> },
    { title: "Past Appointments", value: "15", icon: <History className="h-6 w-6 text-primary" /> },
    { title: "Favorite Professionals", value: "3", icon: <Star className="h-6 w-6 text-primary" /> },
];

export default function ClientPage() {
  useEffect(() => {
    document.title = `Client Dashboard - ${APP_NAME}`;
  }, []);

  return (
    <div className="space-y-8">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-bold">Client Dashboard</CardTitle>
        <CardDescription>View your upcoming appointments and manage your bookings.</CardDescription>
      </CardHeader>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clientStats.map(stat => (
          <Card key={stat.title} className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
               {/* Optional: <p className="text-xs text-muted-foreground">View all</p> */}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Your Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingClientAppointments.length > 0 ? (
            <ul className="space-y-4">
              {upcomingClientAppointments.map((appt) => (
                <li key={appt.id} className="p-4 border rounded-lg hover:bg-secondary/50">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                            <Image src={appt.companyLogo} alt={appt.company} width={40} height={40} className="rounded-md" data-ai-hint="company logo building" />
                            <div>
                                <p className="font-semibold text-lg">{appt.service}</p>
                                <p className="text-sm text-muted-foreground">with {appt.professional} at {appt.company}</p>
                                <p className="text-sm text-muted-foreground">{appt.date} - {appt.time}</p>
                            </div>
                        </div>
                         <Button variant="outline" size="sm">Manage</Button>
                    </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">You have no upcoming appointments. Ready to book one?</p>
          )}
           <Button className="mt-6" asChild>
            <Link href="/schedule/example-company"> {/* Placeholder link */}
              <CalendarPlus className="mr-2 h-4 w-4" /> Book a New Appointment
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Button size="lg" variant="outline" asChild>
            <Link href="/dashboard/client/history">
              <History className="mr-2 h-5 w-5" /> View Appointment History
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
