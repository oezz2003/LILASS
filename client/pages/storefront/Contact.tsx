import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import StoreLayout from "../../components/layout/StoreLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, MessageSquare, HelpCircle, Truck } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  phone: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

const contactReasons = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'order', label: 'Order Support' },
  { value: 'product', label: 'Product Question' },
  { value: 'wholesale', label: 'Wholesale/Business' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'other', label: 'Other' },
];

export default function Contact() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      phone: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement actual form submission to backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      console.log('Contact form submitted:', data);
      setIsSubmitted(true);
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Our Store",
      details: [
        "123 Coffee Street",
        "Downtown District",
        "New York, NY 10001"
      ]
    },
    {
      icon: Phone,
      title: "Call Us",
      details: [
        "+1 (555) 123-4567",
        "Mon-Fri: 8AM - 6PM EST",
        "Weekend: 9AM - 4PM EST"
      ]
    },
    {
      icon: Mail,
      title: "Email Us",
      details: [
        "hello@coffeeshop.com",
        "support@coffeeshop.com",
        "wholesale@coffeeshop.com"
      ]
    },
    {
      icon: Clock,
      title: "Store Hours",
      details: [
        "Monday - Friday: 6AM - 8PM",
        "Saturday: 7AM - 8PM",
        "Sunday: 8AM - 6PM"
      ]
    }
  ];

  const faqs = [
    {
      question: "How fresh is your coffee?",
      answer: "All our coffee is roasted to order and shipped within 24-48 hours of roasting for maximum freshness."
    },
    {
      question: "Do you offer wholesale pricing?",
      answer: "Yes! We offer competitive wholesale pricing for cafes, restaurants, and businesses. Contact us for details."
    },
    {
      question: "What's your return policy?",
      answer: "We offer a 30-day satisfaction guarantee. If you're not happy with your coffee, we'll make it right."
    },
    {
      question: "Do you ship internationally?",
      answer: "Currently we ship within the US and Canada. International shipping is coming soon!"
    }
  ];

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Get in Touch
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have a question, need support, or just want to chat about coffee? 
            We'd love to hear from you!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Thank you for your message! We'll get back to you within 24 hours.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="John Doe"
                                  disabled={isSubmitting}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address *</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="john@example.com"
                                  disabled={isSubmitting}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input
                                  type="tel"
                                  placeholder="(555) 123-4567"
                                  disabled={isSubmitting}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a topic" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {contactReasons.map((reason) => (
                                    <SelectItem key={reason.value} value={reason.value}>
                                      {reason.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us what's on your mind..."
                                rows={5}
                                disabled={isSubmitting}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => {
              const IconComponent = info.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-amber-100 rounded-lg">
                        <IconComponent className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{info.title}</h3>
                        <div className="space-y-1">
                          {info.details.map((detail, idx) => (
                            <p key={idx} className="text-muted-foreground">{detail}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Separator className="mb-16" />

        {/* FAQ Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find quick answers to common questions. Don't see what you're looking for? 
              Feel free to reach out!
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-start gap-2 text-lg">
                    <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Support Options */}
        <div className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-8">Other Ways to Get Help</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Order Support</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Track your order, make changes, or get shipping updates
                </p>
                <Button variant="outline" size="sm">
                  Track Order
                </Button>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Live Chat</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get instant help from our customer service team
                </p>
                <Button variant="outline" size="sm">
                  Start Chat
                </Button>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                  <HelpCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Help Center</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Browse our comprehensive help documentation
                </p>
                <Button variant="outline" size="sm">
                  Visit Help Center
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}