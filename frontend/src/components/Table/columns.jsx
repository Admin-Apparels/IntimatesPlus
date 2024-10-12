import { StatusBadge } from "./StatusBadge";
import { AppointmentModal } from "./AppointmentModal";
import { Image } from "@chakra-ui/react";

export const columns = [
  {
    header: "#",
    cell: ({ row }) => {
      return <p className="text-14-medium">{row.index + 1}</p>;
    },
  },
  {
    accessorKey: "Date",
    header: "Patient",
    cell: ({ row }) => {
      const appointment = row.original;
      return <p className="text-14-medium">{appointment.patient.name}</p>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <div className="min-w-[115px]">
          <StatusBadge status={appointment.status} />
        </div>
      );
    },
  },
  {
    accessorKey: "schedule",
    header: "Appointment",
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <p className="text-14-regular min-w-[100px]">
          {new Date(appointment.schedule).toLocaleString()}
        </p>
      );
    },
  },
  {
    accessorKey: "primaryPhysician",
    header: "Doctor",
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <div className="flex items-center gap-3">
          <Image
            src=""
            alt="doctor"
            width={100}
            height={100}
            className="size-8"
          />
          <p className="whitespace-nowrap">
            Dr. {appointment.primaryPhysician}
          </p>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="pl-4">Actions</div>,
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <div className="flex gap-1">
          <AppointmentModal
            patientId={appointment.patient._id}
            userId={appointment.userId}
            appointment={appointment}
            type="schedule"
            title="Schedule date"
            description="Please confirm the following details to schedule."
          />
          <AppointmentModal
            patientId={appointment.patient._id}
            userId={appointment.userId}
            appointment={appointment}
            type="cancel"
            title="Cancel date"
            description="Are you sure you want to cancel your date?"
          />
        </div>
      );
    },
  },
];
