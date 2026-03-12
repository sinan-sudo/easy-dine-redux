import { Tables } from "@/integrations/supabase/types";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type RestaurantTable = Tables<"restaurant_tables">;

interface FloorMapProps {
  tables: RestaurantTable[];
  reservedTableIds: string[];
  pendingTableIds: string[];
  selectedTableId: string | null;
  onSelectTable: (table: RestaurantTable) => void;
  partySize: number;
}

export default function FloorMap({
  tables,
  reservedTableIds,
  pendingTableIds,
  selectedTableId,
  onSelectTable,
  partySize,
}: FloorMapProps) {
  const getTableStatus = (table: RestaurantTable) => {
    if (reservedTableIds.includes(table.id)) return "reserved";
    if (pendingTableIds.includes(table.id)) return "pending";
    return "available";
  };

  const getTableColor = (table: RestaurantTable) => {
    const status = getTableStatus(table);
    if (selectedTableId === table.id) return "hsl(30, 52%, 65%)";
    switch (status) {
      case "reserved": return "hsl(350, 70%, 55%)";
      case "pending": return "hsl(38, 92%, 50%)";
      default: return table.capacity >= partySize ? "hsl(152, 60%, 42%)" : "hsl(20, 8%, 30%)";
    }
  };

  const isSelectable = (table: RestaurantTable) => {
    const status = getTableStatus(table);
    return status === "available" && table.capacity >= partySize;
  };

  const availableCount = tables.filter(t => getTableStatus(t) === "available").length;
  const pendingCount = tables.filter(t => getTableStatus(t) === "pending").length;
  const reservedCount = tables.filter(t => getTableStatus(t) === "reserved").length;

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold">Select Your Table</h3>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald inline-block" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-warning inline-block" /> Pending
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose inline-block" /> Reserved
          </span>
        </div>
      </div>

      <div className="relative w-full aspect-[4/3] bg-muted/30 rounded-lg border border-border/50 overflow-hidden">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground uppercase tracking-widest">
          Entrance
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground uppercase tracking-widest">
          Kitchen
        </div>

        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="0" y="0" width="100" height="100" fill="none" stroke="hsl(20, 10%, 20%)" strokeWidth="0.5" rx="2" />

          {tables.map((table) => {
            const selectable = isSelectable(table);
            const isSelected = selectedTableId === table.id;
            const status = getTableStatus(table);
            const size = table.capacity <= 2 ? 5 : table.capacity <= 4 ? 6 : table.capacity <= 6 ? 7 : 8;

            return (
              <Tooltip key={table.id}>
                <TooltipTrigger asChild>
                  <motion.g
                    onClick={() => selectable && onSelectTable(table)}
                    className={selectable ? "cursor-pointer" : "cursor-not-allowed"}
                    whileHover={selectable ? { scale: 1.15 } : {}}
                    whileTap={selectable ? { scale: 0.95 } : {}}
                  >
                    {isSelected && (
                      <circle
                        cx={table.position_x}
                        cy={table.position_y}
                        r={size + 2}
                        fill="none"
                        stroke="hsl(30, 52%, 65%)"
                        strokeWidth="0.5"
                        opacity="0.6"
                        className="animate-pulse-glow"
                      />
                    )}
                    <circle
                      cx={table.position_x}
                      cy={table.position_y}
                      r={size}
                      fill={getTableColor(table)}
                      fillOpacity={selectable || isSelected ? 0.25 : 0.1}
                      stroke={getTableColor(table)}
                      strokeWidth={isSelected ? 1 : 0.5}
                    />
                    <text
                      x={table.position_x}
                      y={table.position_y - 1}
                      textAnchor="middle"
                      fill={getTableColor(table)}
                      fontSize="3.5"
                      fontWeight="600"
                      fontFamily="DM Sans, sans-serif"
                    >
                      {table.table_number}
                    </text>
                    <text
                      x={table.position_x}
                      y={table.position_y + 3}
                      textAnchor="middle"
                      fill="hsl(30, 10%, 55%)"
                      fontSize="2"
                      fontFamily="DM Sans, sans-serif"
                    >
                      {table.capacity} seats
                    </text>
                  </motion.g>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p className="font-semibold">Table {table.table_number}</p>
                  <p>{table.capacity} seats · {status.charAt(0).toUpperCase() + status.slice(1)}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </svg>
      </div>

      {/* Availability summary */}
      <div className="flex gap-6 mt-4 text-xs text-muted-foreground justify-center">
        <span className="text-emerald font-semibold">{availableCount} Available</span>
        <span className="text-amber-warning font-semibold">{pendingCount} Pending</span>
        <span className="text-rose font-semibold">{reservedCount} Reserved</span>
      </div>
    </div>
  );
}
