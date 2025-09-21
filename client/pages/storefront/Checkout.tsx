import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import StoreLayout from "../../components/layout/StoreLayout";
import { useCart } from "../../contexts/CartContext";
import { useCreateOrder, useCreatePaymentIntent } from "../../hooks/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, CreditCard, Lock, Truck, Shield } from "lucide-react";
import { Address } from "../../../shared/types";

// Form schemas
const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  company: z.string().optional(),
  address1: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().optional(),
});

const checkoutSchema = z.object({
  customerEmail: z.string().email("Valid email is required"),
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  sameAsShipping: z.boolean().default(true),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

// Helper function to convert form address data to Address type
const toAddress = (formAddress: z.infer<typeof addressSchema>): Address => ({
  firstName: formAddress.firstName || '',
  lastName: formAddress.lastName || '',
  company: formAddress.company,
  address1: formAddress.address1 || '',
  address2: formAddress.address2,
  city: formAddress.city || '',
  state: formAddress.state || '',
  postalCode: formAddress.postalCode || '',
  country: formAddress.country || '',
  phone: formAddress.phone,
});

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

interface CheckoutStepProps {
  step: number;
  title: string;
  isActive: boolean;
  isCompleted: boolean;
}

function CheckoutStep({ step, title, isActive, isCompleted }: CheckoutStepProps) {
  return (
    <div className="flex items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
        isCompleted ? 'bg-green-500 text-white' :
        isActive ? 'bg-primary text-primary-foreground' :
        'bg-muted text-muted-foreground'
      }`}>
        {isCompleted ? '✓' : step}
      </div>
      <span className={`ml-2 text-sm font-medium ${
        isActive ? 'text-foreground' : 'text-muted-foreground'
      }`}>
        {title}
      </span>
    </div>
  );
}

interface PaymentFormProps {
  total: number;
  onPaymentSuccess: (orderId: string) => void;
  onBack: () => void;
  orderData: {
    items: Array<{ productId: string; variantId: string; quantity: number }>;
    customerEmail: string;
    shippingAddress: Address;
    billingAddress: Address;
  };
}

function PaymentForm({ total, onPaymentSuccess, onBack, orderData }: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const createOrder = useCreateOrder();
  const createPaymentIntent = useCreatePaymentIntent();

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // 1. Create order
      const orderResponse = await createOrder.mutateAsync(orderData);
      const orderId = orderResponse.order._id;

      // 2. Create payment intent (would normally use Stripe here)
      // For demo purposes, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      toast({
        title: "Payment successful!",
        description: "Your order has been placed successfully.",
      });

      onPaymentSuccess(orderId);
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stripe Elements would go here in production */}
          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
            <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Stripe Payment Integration</h3>
            <p className="text-sm text-muted-foreground mb-4">
              In production, this would be the Stripe Elements payment form.
            </p>
            <Badge variant="outline">Demo Mode</Badge>
          </div>

          {/* Security info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            <Lock className="h-4 w-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${total.toFixed(2)}</div>
          <p className="text-sm text-muted-foreground">Including tax and shipping</p>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} disabled={isProcessing}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shipping
        </Button>
        <Button 
          onClick={handlePayment} 
          disabled={isProcessing}
          className="flex-1"
          size="lg"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            `Complete Order - $${total.toFixed(2)}`
          )}
        </Button>
      </div>
    </div>
  );
}

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [orderData, setOrderData] = useState<CheckoutFormData | null>(null);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerEmail: "",
      sameAsShipping: true,
      shippingAddress: {
        firstName: "",
        lastName: "",
        company: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "US",
        phone: "",
      },
      billingAddress: {
        firstName: "",
        lastName: "",
        company: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "US",
        phone: "",
      },
    },
  });

  const sameAsShipping = form.watch("sameAsShipping");

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.items.length === 0) {
      navigate("/cart");
    }
  }, [cart.items.length, navigate]);

  const onSubmit = (data: CheckoutFormData) => {
    // If same as shipping, copy shipping address to billing
    if (data.sameAsShipping) {
      data.billingAddress = { ...data.shippingAddress };
    }

    // Convert form data to proper Address types
    const orderFormData = {
      ...data,
      shippingAddress: toAddress(data.shippingAddress),
      billingAddress: toAddress(data.billingAddress),
    };

    setOrderData(orderFormData);
    setCurrentStep(2);
  };

  const handlePaymentSuccess = (orderId: string) => {
    clearCart();
    navigate(`/orders/${orderId}`);
  };

  const handleBackToShipping = () => {
    setCurrentStep(1);
  };

  if (cart.items.length === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Checkout</h1>
          
          {/* Progress steps */}
          <div className="flex items-center gap-8">
            <CheckoutStep 
              step={1} 
              title="Shipping & Billing" 
              isActive={currentStep === 1} 
              isCompleted={currentStep > 1} 
            />
            <div className="flex-1 h-px bg-border"></div>
            <CheckoutStep 
              step={2} 
              title="Payment" 
              isActive={currentStep === 2} 
              isCompleted={false} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {currentStep === 1 ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Customer Email */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="customerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Shipping Address */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Shipping Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="shippingAddress.firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="shippingAddress.lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="shippingAddress.company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company (optional)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="shippingAddress.address1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="shippingAddress.address2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Apartment, suite, etc. (optional)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="shippingAddress.city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="shippingAddress.state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select state" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {US_STATES.map((state) => (
                                    <SelectItem key={state} value={state}>
                                      {state}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="shippingAddress.postalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP Code</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="shippingAddress.phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (optional)</FormLabel>
                            <FormControl>
                              <Input type="tel" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Billing Address */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Billing Address</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="sameAsShipping"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Same as shipping address
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      {!sameAsShipping && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="billingAddress.firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="billingAddress.lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          {/* ... rest of billing address fields (similar to shipping) */}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Button type="submit" size="lg" className="w-full">
                    Continue to Payment
                  </Button>
                </form>
              </Form>
            ) : (
              <PaymentForm
                total={cart.total}
                onPaymentSuccess={handlePaymentSuccess}
                onBack={handleBackToShipping}
                orderData={{
                  items: cart.items.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity
                  })),
                  customerEmail: orderData!.customerEmail,
                  shippingAddress: toAddress(orderData!.shippingAddress),
                  billingAddress: toAddress(orderData!.billingAddress),
                }}
              />
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart items */}
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div key={`${item.productId}-${item.variantId}`} className="flex gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        {item.product.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                            📦
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{item.product.title}</p>
                        <p className="text-xs text-muted-foreground">{item.variant.title}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium">
                        ${(item.variant.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${cart.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>
                      {cart.shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `$${cart.shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${cart.tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${cart.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Security badges */}
                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    <span>256-bit SSL encryption</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}