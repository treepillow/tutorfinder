import { useState } from "react";
import { X } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

interface PaymentDialogProps {
  clientSecret: string;
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
}

function CheckoutForm({ amount, onSuccess, onClose }: Omit<PaymentDialogProps, "clientSecret">) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message || "Payment failed");
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-[#EDE9DF] p-4 rounded-xl flex items-center justify-between">
        <span className="text-[#2F3B3D]">Amount</span>
        <span className="text-2xl text-[#7C8D8C]">${amount}</span>
      </div>

      <div className="bg-white p-4 rounded-xl">
        <PaymentElement />
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2.5 px-5 py-2.5 bg-white text-red-400 rounded-full border border-red-200 hover:bg-red-50 hover:text-red-500 transition-all duration-300 text-sm"
        >
          <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0"><X className="w-3 h-3" /></span>
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 px-6 py-3 bg-[#7C8D8C] text-white rounded-full hover:bg-[#2F3B3D] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : `Pay $${amount}`}
        </button>
      </div>
    </form>
  );
}

export function PaymentDialog({ clientSecret, amount, onSuccess, onClose }: PaymentDialogProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-[#F5F3EF] border-[#D6CFBF] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#2F3B3D]">Payment</DialogTitle>
        </DialogHeader>
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
              variables: {
                colorPrimary: "#7C8D8C",
                borderRadius: "12px",
              },
            },
          }}
        >
          <CheckoutForm amount={amount} onSuccess={onSuccess} onClose={onClose} />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}
