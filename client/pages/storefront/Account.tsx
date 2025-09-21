import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import StoreLayout from "../../components/layout/StoreLayout";
import { useAuth, useMyOrders } from "../../hooks/api";
import { useAuthContext } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Package, 
  MapPin, 
  CreditCard, 
  Settings,
  Eye,
  Calendar,
  DollarSign,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

function OrderCard({ order }: { order: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'processing':
        return <Package className="h-3 w-3" />;
      case 'shipped':
        return <Truck className="h-3 w-3" />;
      case 'delivered':
        return <CheckCircle className="h-3 w-3" />;
      case 'cancelled':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Package className="h-3 w-3" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="font-semibold">
              Order #{order._id.slice(-8).toUpperCase()}
            </h3>
            <p className="text-sm text-muted-foreground">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={getStatusColor(order.status)}>
              {getStatusIcon(order.status)}
              <span className="ml-1 capitalize">{order.status}</span>
            </Badge>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/orders/${order._id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="space-y-3">
          {order.items?.slice(0, 2).map((item: any, index: number) => (
            <div key={index} className="flex gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                {item.product?.images?.[0] ? (
                  <img
                    src={item.product.images[0]}
                    alt={item.product?.title || 'Product'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                    📦
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium line-clamp-1">
                  {item.product?.title || 'Product'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.variant?.title || 'Variant'} × {item.quantity}
                </p>
              </div>
              <div className="text-sm font-medium">
                ${((item.variant?.price || 0) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
          
          {order.items?.length > 2 && (
            <p className="text-sm text-muted-foreground">
              +{order.items.length - 2} more items
            </p>
          )}
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-semibold">${order.total?.toFixed(2) || '0.00'}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function OrdersTab() {
  const { data: ordersData, isLoading, error } = useMyOrders();
  const orders = ordersData?.orders || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, j) => (
                    <div key={j} className="flex gap-3">
                      <Skeleton className="h-12 w-12 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
          <p className="text-muted-foreground mb-6">
            You haven't placed any orders yet. Start shopping to see your orders here.
          </p>
          <Button asChild>
            <Link to="/products">
              Start Shopping
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Order History</h2>
        <Badge variant="outline">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'}
        </Badge>
      </div>
      
      <div className="space-y-4">
        {orders.map((order: any) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>
    </div>
  );
}

function ProfileTab() {
  const { user } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = () => {
    // TODO: Implement profile update
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Profile Information</h2>
        {!isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              ) : (
                <p className="text-sm py-2">{user?.name || 'Not provided'}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              ) : (
                <p className="text-sm py-2">{user?.email || 'Not provided'}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Account Type</Label>
              <p className="text-sm py-2 capitalize">
                {user?.role || 'Customer'}
              </p>
            </div>
            
            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Change Password</h4>
                <p className="text-sm text-muted-foreground">
                  Update your account password
                </p>
              </div>
              <Button variant="outline" size="sm">
                Change
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Download Data</h4>
                <p className="text-sm text-muted-foreground">
                  Download a copy of your account data
                </p>
              </div>
              <Button variant="outline" size="sm">
                Download
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg border-red-200">
              <div>
                <h4 className="font-medium text-red-600">Delete Account</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and data
                </p>
              </div>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AddressesTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Saved Addresses</h2>
        <Button>
          <MapPin className="mr-2 h-4 w-4" />
          Add Address
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-12 text-center">
          <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No saved addresses</h3>
          <p className="text-muted-foreground mb-6">
            Add addresses to make checkout faster in the future.
          </p>
          <Button>
            Add Your First Address
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Account() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'orders';
  const { isAuthenticated, user, isLoading } = useAuthContext();
  
  // Show loading while checking authentication
  if (isLoading) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center">
            <Package className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </StoreLayout>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Sign in required</h2>
              <p className="text-muted-foreground mb-6">
                Please sign in to access your account.
              </p>
              <Button asChild className="w-full">
                <Link to="/auth">
                  Sign In
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Account</h1>
          <p className="text-muted-foreground">
            Manage your orders, profile, and account settings.
          </p>
        </div>
        
        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Addresses
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders">
            <OrdersTab />
          </TabsContent>
          
          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>
          
          <TabsContent value="addresses">
            <AddressesTab />
          </TabsContent>
        </Tabs>
      </div>
    </StoreLayout>
  );
}