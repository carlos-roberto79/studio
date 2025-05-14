"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Briefcase, CalendarCheck, UserCircle } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import type { Metadata } from "next"; // This is not how Metadata is used in client components

// export const metadata: Metadata = { // Metadata can't be used in client components directly
//   title: `Dashboard - ${APP_NAME}`,
// };


export default function DashboardPage() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div className="text-center p-10">Loading dashboard...</div>;
  }

  if (!user) {
    return <div className="text-center p-10">Redirecting to login...</div>; // Should be handled by layout
  }
  
  // Set document title using useEffect for client components
  useEffect(() => {
    document.title = `Dashboard - ${APP_NAME}`;
  }, []);


  const getRoleSpecificInfo = () => {
    switch (role) {
      case "company_admin":
        return {
          title: "Company Dashboard",
          description: "Manage your business, professionals, and view analytics.",
          cta: {
            text: "Manage Company",
            href: "/dashboard/company",
            icon: <Briefcase className="mr-2 h-4 w-4" />
          },
          stats: [
            { label: "Total Appointments", value: "150" },
            { label: "Active Professionals", value: "5" },
            { label: "Revenue This Month", value: "$5,200" },
          ]
        };
      case "professional":
        return {
          title: "Professional Dashboard",
          description: "View your schedule, manage appointments, and update your availability.",
           cta: {
            text: "View My Schedule",
            href: "/dashboard/professional",
            icon: <CalendarCheck className="mr-2 h-4 w-4" />
          },
           stats: [
            { label: "Upcoming Appointments", value: "12" },
            { label: "Available Slots Today", value: "3" },
            { label: "Completed This Week", value: "25" },
          ]
        };
      case "client":
        return {
          title: "Client Dashboard",
          description: "View your upcoming appointments and manage your bookings.",
          cta: {
            text: "My Appointments",
            href: "/dashboard/client",
            icon: <UserCircle className="mr-2 h-4 w-4" />
          },
          stats: [
            { label: "Upcoming Appointments", value: "2" },
            { label: "Past Appointments", value: "8" },
            { label: "Favorite Professionals", value: "1" },
          ]
        };
      default:
        return {
          title: "Welcome to your Dashboard!",
          description: "Manage your activities and settings here.",
          cta: null,
          stats: []
        };
    }
  };

  const roleInfo = getRoleSpecificInfo();

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{roleInfo.title}</CardTitle>
          <CardDescription className="text-lg">{roleInfo.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            Welcome, {user.email}! You are logged in as a {role}.
          </p>
          {roleInfo.cta && (
            <Button asChild size="lg">
              <Link href={roleInfo.cta.href}>
                {roleInfo.cta.icon} {roleInfo.cta.text} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {roleInfo.stats.length > 0 && (
         <div className="grid gap-6 md:grid-cols-3">
          {roleInfo.stats.map(stat => (
            <Card key={stat.label}>
              <CardHeader>
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className="text-4xl font-bold">{stat.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {role === 'client' && (
            <Button variant="outline" asChild><Link href="/schedule/example-company">Book New Appointment</Link></Button>
          )}
          {role === 'professional' && (
            <Button variant="outline" asChild><Link href="/dashboard/professional/availability">Set Availability</Link></Button>
          )}
          {role === 'company_admin' && (
            <Button variant="outline"asChild><Link href="/dashboard/company/professionals">Manage Professionals</Link></Button>
          )}
          <Button variant="outline" asChild><Link href="/dashboard/settings">Account Settings</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Added React to imports for useEffect
import React, { useEffect } from 'react';
