import { StatusBadge } from "./StatusBadge";
import { AppointmentModal } from "./AppointmentModal";
import { Image } from "@chakra-ui/react";

export const columns = (user) => [
  {
    header: "#",
    cell: ({ row }) => {
      return <p className="text-14-medium">{row.index + 1}</p>;
    },
  },
  {
    accessorKey: "Date",
    header: "Date",
    cell: ({ row }) => {
      const date = row.original;

      // Determine if the logged-in user made the request
      const isOrderer = date.orderer._id === user._id;

      // Determine the display name and picture of the person the user is meeting
      const displayName = isOrderer ? date.orderedDate.name : date.orderer.name;
      const displayPic = isOrderer ? date.orderedDate.pic : date.orderer.pic;

      // Use different background color if the user made the request
      const backgroundColor = isOrderer ? "bg-blue-100" : "bg-gray-100";

      return (
        <div className={`flex items-center gap-3 p-2 ${backgroundColor}`}>
          <Image
            src={displayPic}
            alt="pic"
            width={100}
            height={100}
            className="size-8"
          />
          <p className="whitespace-nowrap">{displayName}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const date = row.original;
      return (
        <div className="min-w-[115px]">
          <StatusBadge status={date.status} />
        </div>
      );
    },
  },
  {
    accessorKey: "schedule",
    header: "Meetup",
    cell: ({ row }) => {
      const date = row.original;
      return (
        <p className="text-14-regular min-w-[100px]">
          {new Date(date.schedule).toLocaleString()}
        </p>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="pl-4">Actions</div>,
    cell: ({ row }) => {
      const date = row.original;

      return (
        <div className="flex gap-1">
          <AppointmentModal
            patientId={date.patient._id}
            userId={date.userId}
            date={date}
            type="schedule"
            title="Schedule date"
            description="Please confirm the following details to schedule."
          />
          <AppointmentModal
            patientId={date.patient._id}
            userId={date.userId}
            date={date}
            type="cancel"
            title="Cancel date"
            description="Are you sure you want to cancel your date?"
          />
        </div>
      );
    },
  },
];
