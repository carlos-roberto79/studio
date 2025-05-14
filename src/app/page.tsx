import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users, CalendarDays, BellRing, Building } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const features = [
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "User Authentication",
      description: "Secure login for clients, professionals, and companies with role-based access.",
    },
    {
      icon: <Building className="h-10 w-10 text-primary" />,
      title: "Company Registration",
      description: "Easy company onboarding with custom public scheduling links.",
    },
    {
      icon: <CalendarDays className="h-10 w-10 text-primary" />,
      title: "Appointment Scheduling",
      description: "Intuitive scheduling, professional availability, and real-time conflict avoidance.",
    },
    {
      icon: <BellRing className="h-10 w-10 text-primary" />,
      title: "Smart Notifications",
      description: "AI-powered, personalized notifications for confirmations, reminders, and updates.",
    },
  ];

  return (
    <div className="flex flex-col ">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-secondary">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            Scheduling Made <span className="text-primary">Effortless</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
            EasyAgenda helps you manage appointments seamlessly. Focus on your clients,
            we&apos;ll handle the scheduling complexities.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground">
            Why Choose EasyAgenda?
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-center text-muted-foreground">
            Powerful features designed for your convenience and efficiency.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works / Visual Section */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Streamline Your Workflow
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                EasyAgenda simplifies every step of the appointment process, from booking to reminders.
                Our intuitive interface ensures a smooth experience for both you and your clients.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Reduce no-shows with automated reminders.",
                  "Manage multiple professionals and locations.",
                  "Access your schedule anytime, anywhere.",
                  "Gain insights with comprehensive reporting."
                ].map(item => (
                  <li key={item} className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" className="mt-8" asChild>
                <Link href="/register-company">Register Your Business</Link>
              </Button>
            </div>
            <div>
              <Image
                src="https://placehold.co/600x450.png?text=EasyAgenda+Dashboard"
                alt="EasyAgenda Dashboard Preview"
                width={600}
                height={450}
                className="rounded-lg shadow-2xl"
                data-ai-hint="dashboard interface"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing Section Placeholder */}
      <section id="pricing" className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Simple, Transparent Pricing</h2>
          <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
            Choose a plan that fits your needs. No hidden fees, ever.
          </p>
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            {/* Placeholder for pricing cards */}
            {[
              { name: "Basic", price: "Free", features: ["1 Professional", "50 Appointments/month", "Basic Notifications"] },
              { name: "Pro", price: "$29/mo", features: ["5 Professionals", "500 Appointments/month", "Smart Notifications", "Company Page"] },
              { name: "Enterprise", price: "Custom", features: ["Unlimited Professionals", "Unlimited Appointments", "Dedicated Support", "API Access"] },
            ].map(plan => (
              <Card key={plan.name} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold text-primary">{plan.name}</CardTitle>
                  <p className="text-4xl font-bold text-foreground mt-2">{plan.price}</p>
                  {plan.name !== "Basic" && <p className="text-sm text-muted-foreground">per month</p>}
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground my-6">
                    {plan.features.map(f => <li key={f} className="flex items-center"><CheckCircle className="h-5 w-5 text-primary mr-2"/>{f}</li>)}
                  </ul>
                  <Button className="w-full" variant={plan.name === "Pro" ? "default" : "outline"}>
                    {plan.name === "Enterprise" ? "Contact Sales" : "Choose Plan"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* Call to Action Section */}
      <section className="py-20 md:py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Simplify Your Scheduling?
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-lg">
            Join hundreds of businesses and professionals who trust EasyAgenda.
            Sign up today and experience the difference.
          </p>
          <Button size="lg" variant="secondary" className="mt-10" asChild>
            <Link href="/signup">Sign Up Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
