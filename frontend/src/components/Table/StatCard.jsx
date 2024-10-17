import { Image } from "@chakra-ui/react";
import clsx from "clsx";

export const StatCard = ({ count, label, icon, type }) => {
  return (
    <div
      className={clsx("stat-card", {
        "bg-appointments": type === "appointments",
        "bg-pending": type === "pending",
        "bg-cancelled": type === "cancelled",
      })}
    >
      <div className="flex items-center gap-4">
        <Image src={icon} alt={label} className="size-8 w-fit" />
        <h2 className="text-32-bold text-white">{count}</h2>
      </div>

      <p className="text-14-regular text-white">{label}</p>
    </div>
  );
};
