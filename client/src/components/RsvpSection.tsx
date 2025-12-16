import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { WEDDING_DATA } from "../../../shared/weddingData";

export default function RsvpSection() {
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(WEDDING_DATA.bank.accountNumber);
    setCopied(true);
    toast.success("Đã sao chép số tài khoản!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const message = formData.get('message') as string;

    try {
      const response = await fetch('/api/submit-wish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, message }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Cảm ơn bạn đã gửi lời chúc!");
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error(data.error || "Có lỗi xảy ra, vui lòng thử lại!");
      }
    } catch (error) {
      console.error('Error submitting wish:', error);
      toast.error("Không thể gửi lời chúc. Vui lòng thử lại sau!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16">
          {/* RSVP Form */}
          <div>
            <h2 className="font-script text-5xl text-primary mb-6">Gửi Lời Chúc</h2>
            <p className="font-serif text-lg text-muted-foreground mb-8">
              Sự hiện diện của bạn là niềm vinh hạnh lớn nhất đối với chúng tôi. Hãy để lại lời chúc phúc nhé!
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-lg border border-border">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và Tên</Label>
                <Input id="name" name="name" required placeholder="Nhập tên của bạn" className="bg-background" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Lời Chúc</Label>
                <Textarea id="message" name="message" required placeholder="Gửi những lời chúc tốt đẹp nhất..." className="bg-background min-h-[120px]" />
              </div>

              <Button type="submit" className="w-full font-serif text-lg" disabled={isSubmitting}>
                {isSubmitting ? "Đang gửi..." : "Gửi Lời Chúc"}
              </Button>
            </form>
          </div>

          {/* Gift Box */}
          <div>
            <h2 className="font-script text-5xl text-primary mb-6">Hộp Mừng Cưới</h2>
            <p className="font-serif text-lg text-muted-foreground mb-8">
              Nếu không thể tham dự, bạn có thể gửi quà mừng qua thông tin bên dưới.
            </p>

            <div className="bg-white p-8 rounded-lg shadow-lg border border-border text-center">
                 <img
                   src="/img/qr_code.jpg"
                   alt="QR Code Chuyển Khoản"
                   className="w-full h-full object-contain"
                 />
              <div className="space-y-2 mb-6">
                <p className="text-muted-foreground uppercase tracking-wide text-sm">Chủ tài khoản</p>
                <p className="font-bold text-xl">{WEDDING_DATA.bank.accountName}</p>
              </div>

              <div className="space-y-2">
                <p className="text-muted-foreground uppercase tracking-wide text-sm">Số tài khoản</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="font-mono text-2xl font-bold tracking-wider">{WEDDING_DATA.bank.accountNumber}</p>
                  <Button size="icon" variant="ghost" onClick={handleCopy} className="h-8 w-8">
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
