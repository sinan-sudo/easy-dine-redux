import { Mail } from "lucide-react";

export default function SupportBanner() {
  return (
    <div className="py-4 text-center text-xs text-muted-foreground">
      <Mail className="inline h-3 w-3 mr-1 -mt-0.5" />
      Need help?{" "}
      <a
        href="mailto:sinukp1405@gmail.com?subject=EasyDine%20Support%20Request"
        className="text-primary hover:underline"
      >
        Email our support team
      </a>
    </div>
  );
}
