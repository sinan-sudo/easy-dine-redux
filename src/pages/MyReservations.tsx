import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Clock, Users, UtensilsCrossed, X } from "lucide-react";
import { format, isBefore, startOfDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

const statusColors: Record<string, string> = {
  pending: "bg-amber-warning/20 text-amber-warning border-amber-warning/30",
  confirmed: "bg-emerald/20 text-emerald border-emerald/30",
  rejected: "bg-destructive/20 text-destructive border-destructive/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export default function MyReservations() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const fetchReservations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("reservations")
      .select("*, restaurant_tables(table_number, capacity)")
      .eq("user_id", user.id)
      .order("reservation_date", { ascending: false });
    setReservations(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReservations();
  }, [user]);

  const handleCancel = async (id: string) => {
    const { error } = await supabase.from("reservations").update({ status: "cancelled" } as any).eq("id", id);
    if (error) {
      toast({ title: "Failed to cancel", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Reservation cancelled" });
      fetchReservations();
    }
  };

  const today = startOfDay(new Date());
  const upcoming = reservations.filter(r => !isBefore(new Date(r.reservation_date), today));
  const past = reservations.filter(r => isBefore(new Date(r.reservation_date), today));
  const filtered = tab === "upcoming" ? upcoming : past;

  const canCancel = (r: any) =>
    tab === "upcoming" && (r.status === "pending" || r.status === "confirmed");

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-3xl font-bold mb-2">My Reservations</h1>
          <p className="text-muted-foreground mb-8">Track and manage your bookings</p>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="bg-muted/50 mb-6">
              <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
            </TabsList>

            <TabsContent value={tab}>
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading...</div>
              ) : filtered.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="py-12 text-center">
                    <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">No {tab} reservations</p>
                    {tab === "upcoming" && (
                      <Button className="bg-gradient-gold text-primary-foreground font-semibold" onClick={() => navigate("/book")}>
                        Book a Table
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filtered.map((r, i) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="glass-card">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Badge className={statusColors[r.status]}>{r.status}</Badge>
                              {r.occasion !== "none" && (
                                <Badge variant="outline" className="text-xs">
                                  {r.occasion === "birthday" ? "🎂" : r.occasion === "anniversary" ? "💍" : "💼"} {r.occasion}
                                </Badge>
                              )}
                            </div>
                            {canCancel(r) && (
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleCancel(r.id)}>
                                <X className="h-4 w-4 mr-1" /> Cancel
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
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
                            <div className="flex items-center gap-2 text-muted-foreground">
                              Table {r.restaurant_tables?.table_number}
                            </div>
                          </div>
                          {r.allergy_notes && (
                            <div className="mt-3 p-2 rounded bg-destructive/10 text-xs">
                              <span className="font-semibold text-destructive">⚠ Allergies:</span> {r.allergy_notes}
                            </div>
                          )}
                          {r.pre_order_items && (r.pre_order_items as any[]).length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                              Pre-order: {(r.pre_order_items as any[]).map((i: any) => `${i.quantity}x ${i.name}`).join(", ")}
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
