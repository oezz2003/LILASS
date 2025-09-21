import StoreLayout from "../../components/layout/StoreLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Coffee, Award, Users, Globe, Heart, Truck, Shield, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  const features = [
    {
      icon: Coffee,
      title: "Premium Quality",
      description: "We source only the finest coffee beans from ethical suppliers around the world."
    },
    {
      icon: Award,
      title: "Expert Roasting",
      description: "Our master roasters craft each batch with precision and passion for the perfect cup."
    },
    {
      icon: Users,
      title: "Community Focused",
      description: "We're committed to supporting local communities and sustainable farming practices."
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Delivering exceptional coffee experiences to customers worldwide."
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Sustainability",
      description: "Environmental responsibility in every aspect of our business"
    },
    {
      icon: Truck,
      title: "Fair Trade",
      description: "Supporting farmers with fair prices and ethical partnerships"
    },
    {
      icon: Shield,
      title: "Quality Assurance",
      description: "Rigorous testing and quality control for every product"
    },
    {
      icon: Clock,
      title: "Freshness",
      description: "Roasted to order and delivered at peak freshness"
    }
  ];

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Est. 2020
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Our Coffee Story
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            From a small neighborhood roastery to a global community of coffee lovers, 
            we've been passionate about delivering exceptional coffee experiences since day one.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/products">
                Shop Coffee
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                To create meaningful connections through exceptional coffee while supporting 
                sustainable farming practices and empowering coffee-growing communities worldwide.
              </p>
              <p className="text-lg text-muted-foreground">
                Every cup tells a story of dedication, craftsmanship, and the journey from 
                farm to your table. We believe great coffee should taste amazing and do good.
              </p>
            </div>
            <div className="bg-amber-50 p-8 rounded-lg">
              <div className="flex items-center justify-center h-64">
                <Coffee className="h-32 w-32 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">What Makes Us Different</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="mx-auto mb-4 p-3 bg-amber-100 rounded-full w-fit">
                      <IconComponent className="h-6 w-6 text-amber-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <IconComponent className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator className="mb-16" />

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">Sarah Johnson</h3>
                <p className="text-muted-foreground mb-2">Founder & Head Roaster</p>
                <p className="text-sm text-muted-foreground">
                  15+ years of coffee expertise, passionate about sustainable sourcing.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">Michael Chen</h3>
                <p className="text-muted-foreground mb-2">Quality Control Manager</p>
                <p className="text-sm text-muted-foreground">
                  Ensures every batch meets our high standards for taste and quality.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">Elena Rodriguez</h3>
                <p className="text-muted-foreground mb-2">Sustainability Director</p>
                <p className="text-sm text-muted-foreground">
                  Leads our environmental and social responsibility initiatives.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-amber-50 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-amber-600 mb-2">50+</div>
              <p className="text-muted-foreground">Partner Farms</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-600 mb-2">100K+</div>
              <p className="text-muted-foreground">Happy Customers</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-600 mb-2">25</div>
              <p className="text-muted-foreground">Countries Sourced</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-600 mb-2">95%</div>
              <p className="text-muted-foreground">Customer Satisfaction</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Taste the Difference?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of coffee lovers who have made the switch to our premium, 
            ethically-sourced coffee. Your perfect cup is waiting.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/products">
                Shop Now
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/contact">
                Get in Touch
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}