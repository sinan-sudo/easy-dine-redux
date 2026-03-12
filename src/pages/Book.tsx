import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus, Minus, Check, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import FloorMap from "@/components/FloorMap";
import Navbar from "@/components/Navbar";


type RestaurantTable = Tables<"restaurant_tables">;
type MenuItem = Tables<"menu_items">;

const TIME_SLOTS = [
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00",
];

const OCCASIONS = [
  { value: "none" as const, label: "None" },
  { value: "birthday" as const, label: "🎂 Birthday" },
  { value: "anniversary" as const, label: "💍 Anniversary" },
  { value: "business" as const, label: "💼 Business" },
];

type OtpStatus = "idle" | "sending" | "sent" | "verifying" | "verified" | "failed";

export default function Book() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [date, setDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [reservedIds, setReservedIds] = useState<string[]>([]);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [preOrder, setPreOrder] = useState<Record<string, number>>({});
  const [occasion, setOccasion] = useState<"none" | "birthday" | "anniversary" | "business">("none");
  const [allergyNotes, setAllergyNotes] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [otpStatus, setOtpStatus] = useState<OtpStatus>("idle");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    supabase.from("restaurant_tables").select("*").eq("is_active", true)
      .then(({ data }) => data && setTables(data as any));
  }, []);

  useEffect(() => {
    supabase.from("menu_items").select("*").eq("is_available", true)
      .then(({ data }) => data && setMenuItems(data as any));
  }, []);

  const fetchOccupiedTables = async (dateStr: string, time: string) => {
    const { data } = await supabase.rpc("get_occupied_tables", {
      p_date: dateStr,
      p_time_slot: time,
    });
    if (data) {
      setReservedIds((data as any[]).filter((r: any) => r.status === "confirmed").map((r: any) => r.table_id));
      setPendingIds((data as any[]).filter((r: any) => r.status === "pending").map((r: any) => r.table_id));
    }
  };

  useEffect(() => {
    if (!date || !timeSlot) return;
    fetchOccupiedTables(format(date, "yyyy-MM-dd"), timeSlot);
  }, [date, timeSlot]);

  useEffect(() => {
    const channel = supabase
      .channel("reservations-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, () => {
        if (date && timeSlot) {
          fetchOccupiedTables(format(date, "yyyy-MM-dd"), timeSlot);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [date, timeSlot]);

  useEffect(() => {
    if (otpStatus !== "idle") {
      setOtpStatus("idle");
      setOtp("");
    }
  }, [mobileNumber]);

  const categories = [...new Set(menuItems.map(i => i.category))];
  const preOrderTotal = Object.entries(preOrder).reduce((sum, [id, qty]) => {
    const item = menuItems.find(i => i.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const handleSubmit = async () => {
    if (!user || !date || !timeSlot || !selectedTable) return;
    if (!mobileNumber || mobileNumber.length !== 10) {
      toast({ title: "Mobile required", description: "Please enter a valid 10-digit mobile number.", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    const fullMobile = mobileNumber ? `+91${mobileNumber}` : null;
    const preOrderItems = Object.entries(preOrder)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = menuItems.find(i => i.id === id);
        return { id, name: item?.name, price: item?.price, quantity: qty };
      });

    const { error } = await supabase.from("reservations").insert({
      user_id: user.id,
      table_id: selectedTable.id,
      reservation_date: format(date, "yyyy-MM-dd"),
      time_slot: timeSlot,
      party_size: partySize,
      occasion,
      allergy_notes: allergyNotes || null,
      pre_order_items: preOrderItems,
      mobile_number: fullMobile,
    } as any);

    if (error) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
    } else {
      if (fullMobile) {
        try {
          await supabase.functions.invoke("send-booking-sms", {
            body: {
              mobile_number: fullMobile,
              reservation_date: format(date, "PPP"),
              time_slot: timeSlot,
              party_size: partySize,
              table_number: selectedTable.table_number,
              occasion,
            },
          });
        } catch (e) {
          console.error("SMS send failed:", e);
        }
      }
      toast({ title: "Reservation submitted!", description: "Awaiting confirmation from the restaurant." });
      navigate("/my-reservations");
    }
    setSubmitting(false);
  };

  const canProceedStep0 = date && timeSlot && partySize > 0;
  const canProceedStep1 = selectedTable !== null;
  const stepTitles = ["Date & Party", "Select Table", "Pre-Order", "Confirm"];

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-3xl font-bold mb-2">Reserve Your Table</h1>
          <p className="text-muted-foreground mb-8">Book your perfect dining experience</p>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {stepTitles.map((title, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  onClick={() => { if (i < step) setStep(i); }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors",
                    i === step ? "bg-primary/20 text-primary font-semibold" :
                    i < step ? "text-primary/70 cursor-pointer hover:text-primary" :
                    "text-muted-foreground"
                  )}
                >
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    i === step ? "bg-gradient-gold text-primary-foreground" :
                    i < step ? "bg-primary/30 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {i < step ? <Check className="h-3 w-3" /> : i + 1}
                  </span>
                  <span className="hidden sm:inline">{title}</span>
                </button>
                {i < stepTitles.length - 1 && <div className="w-8 h-px bg-border" />}
              </div>
            ))}
          </div>

          

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Card className="glass-card">
                  <CardContent className="pt-6 space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left", !date && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date()} className="pointer-events-auto" />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>Time Slot</Label>
                        <Select value={timeSlot} onValueChange={setTimeSlot}>
                          <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.map(t => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Party Size</Label>
                      <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => setPartySize(Math.max(1, partySize - 1))}><Minus className="h-4 w-4" /></Button>
                        <span className="text-2xl font-heading font-semibold w-12 text-center">{partySize}</span>
                        <Button variant="outline" size="icon" onClick={() => setPartySize(Math.min(12, partySize + 1))}><Plus className="h-4 w-4" /></Button>
                      </div>
                    </div>
                    <Button className="bg-gradient-gold text-primary-foreground font-semibold gap-2" disabled={!canProceedStep0} onClick={() => setStep(1)}>
                      Continue <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <FloorMap
                  tables={tables}
                  reservedTableIds={reservedIds}
                  pendingTableIds={pendingIds}
                  selectedTableId={selectedTable?.id ?? null}
                  onSelectTable={setSelectedTable}
                  partySize={partySize}
                />
                {selectedTable && (
                  <div className="mt-4 p-4 glass-card rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Table {selectedTable.table_number}</p>
                      <p className="text-sm text-muted-foreground">Seats {selectedTable.capacity} guests</p>
                    </div>
                    <Button className="bg-gradient-gold text-primary-foreground font-semibold gap-2" onClick={() => setStep(2)}>
                      Continue <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <Button variant="ghost" className="mt-4 gap-2" onClick={() => setStep(0)}><ArrowLeft className="h-4 w-4" /> Back</Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="font-heading">Pre-Order Menu</CardTitle>
                    <p className="text-sm text-muted-foreground">Optional — shorten your wait time upon arrival</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {categories.map(cat => (
                      <div key={cat}>
                        <h4 className="font-heading text-primary font-semibold mb-3">{cat}</h4>
                        <div className="space-y-2">
                          {menuItems.filter(i => i.category === cat).map(item => {
                            const qty = preOrder[item.id] || 0;
                            return (
                              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                <div>
                                  <p className="font-medium text-sm">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">{item.description}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-semibold text-primary">${item.price.toFixed(2)}</span>
                                  <div className="flex items-center gap-1">
                                    {qty > 0 && (
                                      <Button variant="ghost" size="icon" className="h-7 w-7"
                                        onClick={() => setPreOrder(p => ({ ...p, [item.id]: Math.max(0, qty - 1) }))}>
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                    )}
                                    {qty > 0 && <span className="text-sm w-5 text-center font-semibold">{qty}</span>}
                                    <Button variant="ghost" size="icon" className="h-7 w-7"
                                      onClick={() => setPreOrder(p => ({ ...p, [item.id]: qty + 1 }))}>
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {preOrderTotal > 0 && (
                      <div className="p-3 rounded-lg bg-primary/10 flex justify-between items-center">
                        <span className="text-sm font-medium">Pre-order Total</span>
                        <span className="font-heading font-bold text-primary text-lg">${preOrderTotal.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <Button variant="ghost" className="gap-2" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4" /> Back</Button>
                      <Button className="bg-gradient-gold text-primary-foreground font-semibold gap-2 flex-1" onClick={() => setStep(3)}>
                        Continue <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="font-heading">Confirm Reservation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-muted-foreground">Date</p>
                        <p className="font-semibold">{date ? format(date, "PPP") : ""}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-muted-foreground">Time</p>
                        <p className="font-semibold">{timeSlot}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-muted-foreground">Party Size</p>
                        <p className="font-semibold">{partySize} guests</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-muted-foreground">Table</p>
                        <p className="font-semibold">Table {selectedTable?.table_number} ({selectedTable?.capacity} seats)</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Occasion</Label>
                      <Select value={occasion} onValueChange={(v: any) => setOccasion(v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {OCCASIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Mobile Number + OTP Verification */}
                    <div className="space-y-3">
                      <Label>Mobile Number *</Label>
                      <div className="flex gap-2">
                        <div className="flex flex-1">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground font-medium">
                            +91
                          </span>
                          <Input
                            type="tel"
                            placeholder="9876543210"
                            value={mobileNumber}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                              setMobileNumber(val);
                            }}
                            maxLength={10}
                            className="bg-muted/50 rounded-l-none"
                            disabled={otpStatus === "verified"}
                          />
                        </div>
                        {mobileNumber.length === 10 && (
                          <Badge className="gap-1 bg-emerald/20 text-emerald border-emerald/30 h-10 px-3">
                            <Check className="h-4 w-4" />
                            Valid
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Enter your 10-digit mobile number</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Allergies or Dietary Requirements *</Label>
                      <Textarea
                        placeholder="e.g., Gluten-free, Nut allergy, Vegan..."
                        value={allergyNotes}
                        onChange={(e) => setAllergyNotes(e.target.value)}
                        className="bg-muted/50"
                      />
                    </div>

                    {preOrderTotal > 0 && (
                      <div>
                        <h4 className="font-heading font-semibold mb-2">Pre-Order Summary</h4>
                        <div className="space-y-1">
                          {Object.entries(preOrder).filter(([,q]) => q > 0).map(([id, qty]) => {
                            const item = menuItems.find(i => i.id === id);
                            return item ? (
                              <div key={id} className="flex justify-between text-sm">
                                <span>{qty}x {item.name}</span>
                                <span className="text-primary">${(item.price * qty).toFixed(2)}</span>
                              </div>
                            ) : null;
                          })}
                          <div className="flex justify-between font-semibold pt-2 border-t border-border">
                            <span>Total</span>
                            <span className="text-primary">${preOrderTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button variant="ghost" className="gap-2" onClick={() => setStep(2)}>
                        <ArrowLeft className="h-4 w-4" /> Back
                      </Button>
                      <Button
                        className="bg-gradient-gold text-primary-foreground font-semibold gap-2 flex-1 h-12"
                        onClick={handleSubmit}
                        disabled={submitting || otpStatus !== "verified"}
                      >
                        {submitting ? "Submitting..." : "Submit Reservation"}
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
