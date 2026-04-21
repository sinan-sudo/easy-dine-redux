import wineImg from "@/assets/food-wine.png";
import pastaImg from "@/assets/food-pasta.png";
import chickenImg from "@/assets/food-chicken.png";

/**
 * Subtle, fixed-position decorative food images that sit behind page content.
 * - pointer-events: none (never block clicks)
 * - hidden on small screens for performance & clarity
 * - low opacity + blur so text contrast is preserved
 */
export default function FloatingFoodDecor() {
  return (
    <div
      aria-hidden="true"
      className="hidden md:block fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      <img
        src={wineImg}
        alt=""
        loading="lazy"
        width={768}
        height={768}
        className="absolute -top-10 -right-16 w-72 opacity-[0.13] blur-[2px]"
        style={{ animation: "floatDecor 11s ease-in-out infinite" }}
      />
      <img
        src={pastaImg}
        alt=""
        loading="lazy"
        width={768}
        height={768}
        className="absolute top-1/2 -left-20 w-64 opacity-[0.12] blur-[2px]"
        style={{ animation: "floatDecor 13s ease-in-out infinite reverse" }}
      />
      <img
        src={chickenImg}
        alt=""
        loading="lazy"
        width={768}
        height={768}
        className="absolute -bottom-16 right-1/4 w-72 opacity-[0.13] blur-[2px]"
        style={{ animation: "floatDecor 10s ease-in-out infinite" }}
      />
    </div>
  );
}
