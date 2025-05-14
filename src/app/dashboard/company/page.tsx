"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Users, CalendarDays, BarChart3 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import React, { useEffect } from 'react';


// Mock data
const professionals = [
  { id: "1", name: "Dr. Alice Smith", specialty: "Dentist", appointmentsToday: 5, avatar: "https://placehold.co/40x40.png?text=AS" },
  { id: "2", name: "John Doe", specialty: "Hair Stylist", appointmentsToday: 8, avatar: "https://placehold.co/40x40.png?text=JD" },
  { id: "3", name: "Maria Garcia", specialty: "Therapist", appointmentsToday: 3, avatar: "https://placehold.co/40x40.png?text=MG" },
];

const companyStats = [
    { title: "Total Appointments", value: "256", icon: <CalendarDays className="h-6 w-6 text-primary" /> },
    { title: "Active Professionals", value: "3", icon: <Users className="h-6 w-6 text-primary" /> },
    { title: "Monthly Revenue", value: "$12,500", icon: <BarChart3 className="h-6 w-6 text-primary" /> },
];

export default function CompanyAdminPage() {
  useEffect(() => {
    document.title = `Company Dashboard - ${APP_NAME}`;
  }, []);

  return (
    <div className="space-y-8">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-bold">Company Management</CardTitle>
        <CardDescription>Oversee your company&apos;s operations, professionals, and performance.</CardDescription>
      </CardHeader>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {companyStats.map(stat => (
          <Card key={stat.title} className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">+10% from last month</p> {/* Placeholder change */}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Manage Professionals</CardTitle>
            <CardDescription>View, add, or edit professionals in your company.</CardDescription>
          </div>
          <Button asChild>
            <Link href="/dashboard/company/add-professional">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Professional
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Avatar</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Appointments Today</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professionals.map((prof) => (
                <TableRow key={prof.id}>
                  <TableCell>
                    <Image src={prof.avatar} alt={prof.name} width={40} height={40} className="rounded-full" data-ai-hint="person avatar" />
                  </TableCell>
                  <TableCell className="font-medium">{prof.name}</TableCell>
                  <TableCell>{prof.specialty}</TableCell>
                  <TableCell>{prof.appointmentsToday}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" aria-label="Edit professional">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" aria-label="Remove professional">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Company Profile & Settings</CardTitle>
            <CardDescription>Update your company&apos;s information and public scheduling link.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-muted-foreground">Your public scheduling link: <Link href="/schedule/your-company-slug" className="text-primary hover:underline">/agendar/your-company-slug</Link></p>
            <Button asChild>
              <Link href="/dashboard/company/edit-profile">
                <Edit className="mr-2 h-4 w-4" /> Edit Company Profile
              </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
