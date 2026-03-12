import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, CalendarDays, Clock, Users, UtensilsCrossed, AlertTriangle, Armchair } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

const statusColors: Record<string, string> = {
  pending: "bg-amber-warning/20 text-amber-warning border-amber-warning/30",
  confirmed: "bg-emerald/20 text-emerald border-emerald/30",
  rejected: "bg-destructive/20 text-destructive border-destructive/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reservations, setReservations] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate("/");
  }, [user, isAdmin, authLoading, navigate]);

  const fetchReservations = async () => {
    const { data, error } = await supabase
      .from("reservations")
      .select("*, restaurant_tables(table_number, capacity), profiles(full_name, phone, allergy_notes)")
      .order("reservation_date", { ascending: true });
    if (error) {
      toast({ title: "Failed to load reservations", description: error.message, variant: "destructive" });
    }
    setReservations(data || []);
    setLoading(false);
  };

  const fetchTables = async () => {
    const { data } = await supabase.from("restaurant_tables").select("*").eq("is_active", true);
    setTables(data || []);
  };

  useEffect(() => {
    fetchReservations();
    fetchTables();

    const channel = supabase
      .channel("admin-reservations")
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, () => {
        fetchReservations();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStatus = async (id: string, status: "confirmed" | "rejected") => {
    const { error } = await supabase.from("reservations").update({ status } as any).eq("id", id);
    if (error) {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Reservation ${status}` });
      fetchReservations();
    }
  };

  const filtered = reservations.filter(r => {
    if (tab === "pending") return r.status === "pending";
    if (tab === "confirmed") return r.status === "confirmed";
    return true;
  });

  const pendingCount = reservations.filter(r => r.status === "pending").length;
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayConfirmed = reservations.filter(r => r.reservation_date === todayStr && r.status === "confirmed");
  const totalSeats = tables.reduce((s: number, t: any) => s + t.capacity, 0);
  const reservedSeatsToday = todayConfirmed.reduce((s: number, r: any) => s + r.party_size, 0);
  const availableSeats = Math.max(0, totalSeats - reservedSeatsToday);

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-heading text-3xl font-bold">Admin Dashboard</h1>
            {pendingCount > 0 && (
              <Badge className="bg-amber-warning/20 text-amber-warning animate-pulse-glow">
                {pendingCount} pending
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mb-8">Manage reservations and restaurant operations</p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
            {[
              { label: "Today's Bookings", value: todayConfirmed.length, icon: CalendarDays },
              { label: "Pending", value: pendingCount, icon: AlertTriangle },
              { label: "Total Confirmed", value: reservations.filter(r => r.status === "confirmed").length, icon: Check },
              { label: "Available Seats", value: availableSeats, icon: Armchair },
              { label: "Reserved Seats Today", value: reservedSeatsToday, icon: Users },
            ].map((stat, i) => (
              <Card key={i} className="glass-card">
                <CardContent className="p-4">
                  <stat.icon className="h-5 w-5 text-primary mb-2" />
                  <p className="text-2xl font-heading font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="bg-muted/50 mb-6">
              <TabsTrigger value="pending">Pending {pendingCount > 0 && `(${pendingCount})`}</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <TabsContent value={tab}>
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading...</div>
              ) : filtered.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="py-12 text-center">
                    <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No {tab} reservations</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filtered.map((r, i) => (
                    <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <Card className="glass-card">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-semibold">{r.profiles?.full_name || "Guest"}</p>
                              <p className="text-xs text-muted-foreground">{r.profiles?.phone || "No phone"}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={statusColors[r.status]}>{r.status}</Badge>
                              {r.occasion !== "none" && (
                                <Badge variant="outline" className="text-xs">
                                  {r.occasion === "birthday" ? "🎂" : r.occasion === "anniversary" ? "💍" : "💼"} {r.occasion}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <CalendarDays className="h-4 w-4" />
                              {format(new Date(r.reservation_date), "MMM d, yyyy")}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {r.time_slot}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Users className="h-4 w-4" />
                              {r.party_size} guests
                            </div>
                            <div className="text-muted-foreground">
                              Table {r.restaurant_tables?.table_number}
                            </div>
                          </div>

                          {(r.allergy_notes || r.profiles?.allergy_notes) && (
                            <div className="mb-3 p-2 rounded bg-destructive/10 text-xs">
                              <span className="font-semibold text-destructive">⚠ Allergies:</span>{" "}
                              {r.allergy_notes || r.profiles?.allergy_notes}
                            </div>
                          )}

                          {r.pre_order_items && (r.pre_order_items as any[]).length > 0 && (
                            <div className="mb-3 text-xs text-muted-foreground">
                              <span className="font-semibold">Pre-order:</span>{" "}
                              {(r.pre_order_items as any[]).map((i: any) => `${i.quantity}x ${i.name}`).join(", ")}
                            </div>
                          )}

                          {r.status === "pending" && (
                            <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                              <Button size="sm" className="bg-emerald text-primary-foreground gap-1" onClick={() => updateStatus(r.id, "confirmed")}>
                                <Check className="h-4 w-4" /> Accept
                              </Button>
                              <Button size="sm" variant="outline" className="text-destructive border-destructive/30 gap-1" onClick={() => updateStatus(r.id, "rejected")}>
                                <X className="h-4 w-4" /> Reject
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
