import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  Truck,
  Phone,
  MapPin,
  User,
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { useCart } from '@/contexts/CartContext';
import { useOrders } from '@/contexts/OrderContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

// ✅ Razorpay type fix
declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalAmount, clearCart } = useCart();
  const { addOrder } = useOrders();

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
  });

  const [paymentMethod, setPaymentMethod] =
    useState<'cod' | 'razorpay'>('cod');

  const [isProcessing, setIsProcessing] = useState(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.customerName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your name',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.phone.trim() || formData.phone.length < 10) {
      toast({
        title: 'Error',
        description: 'Please enter a valid phone number',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.address.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your address',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  // ✅ FINAL WORKING FUNCTION
  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    setIsProcessing(true);

    try {
      // ======================
      // ✅ CASH ON DELIVERY
      // ======================
      if (paymentMethod === 'cod') {
        const orderId = await addOrder({
          customerName: formData.customerName,
          phone: formData.phone,
          address: formData.address,
          cartItems: items,
          totalAmount,
          paymentMethod: 'cod',
          paymentStatus: 'pending',
          orderStatus: 'pending',
        });

        clearCart();
        navigate(`/order-success/${orderId}`);
        return;
      }

      // ======================
      // 🔥 RAZORPAY PAYMENT
      // ======================
      const options = {
        key: 'rzp_test_SCq3hRzARbb5aX', 
        amount: totalAmount * 100,
        currency: 'INR',
        name: 'Your Store',
        description: 'Order Payment',

        handler: async function (response: any) {
          const orderId = await addOrder({
            customerName: formData.customerName,
            phone: formData.phone,
            address: formData.address,
            cartItems: items,
            totalAmount,
            paymentMethod: 'razorpay',
            paymentStatus: 'paid',
            orderStatus: 'confirmed',
            razorpayPaymentId: response.razorpay_payment_id,
          });

          clearCart();
          navigate(`/order-success/${orderId}`);
        },

        prefill: {
          name: formData.customerName,
          contact: formData.phone,
        },
        theme: { color: '#000' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Payment Failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Button>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Phone *</Label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Address *</Label>
                  <Textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>

              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) =>
                    setPaymentMethod(v as 'cod' | 'razorpay')
                  }
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    <RadioGroupItem value="cod" />
                    <Label>Cash on Delivery</Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    <RadioGroupItem value="razorpay" />
                    <Label>Pay Online (Razorpay)</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Place Order'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Checkout;
