"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { getAppointmentSchema } from "../../components/config/ChatLogics";
import "react-datepicker/dist/react-datepicker.css";
import CustomFormField, { FormFieldType } from "./CustomFormField";
import SubmitButton from "./SubmitButton";
import { Form } from "./ui/form";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const AppointmentForm = ({
  ordererId,
  orderedDateId,
  type,
  appointment,
  setOpen,
}) => {
  const router = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const AppointmentFormValidation = getAppointmentSchema(type);

  const form = useForm({
    resolver: zodResolver(AppointmentFormValidation),
    defaultValues: {
      schedule: appointment
        ? new Date(appointment?.schedule)
        : new Date(Date.now()),
      reason: appointment ? appointment.reason : "",
      note: appointment?.note || "",
      cancellationReason: appointment?.cancellationReason || "",
    },
  });

  const onSubmit = async (values) => {
    setIsLoading(true);
    let status;
    switch (type) {
      case "schedule":
        status = "scheduled";
        break;
      case "cancel":
        status = "cancelled";
        break;
      default:
        status = "pending";
    }

    try {
      if (type === "create" && orderedDateId) {
        const appointmentData = {
          ordererId,
          orderedDateId,
          schedule: new Date(values.schedule),
          reason: values.reason,
          status,
          note: values.note,
        };

        const { data } = await axios.post("/api/order/create", appointmentData); // API call to your Node backend

        if (data) {
          form.reset();
          router.push(
            `/patients/${ordererId}/new-appointment/success?appointmentId=${data._id}`
          );
        }
      } else {
        const dateToUpdate = {
          ordererId,
          dateId: appointment?._id,
          appointment: {
            schedule: new Date(values.schedule),
            status,
            cancellationReason: values.cancellationReason,
          },
          type,
        };

        const updatedAppointment = await axios.put(
          "/api/order/update",
          dateToUpdate
        ); // API call to your Node backend

        if (updatedAppointment) {
          setOpen && setOpen(false);
          form.reset();
        }
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  let buttonLabel;
  switch (type) {
    case "cancel":
      buttonLabel = "Cancel Appointment";
      break;
    case "schedule":
      buttonLabel = "Schedule Appointment";
      break;
    default:
      buttonLabel = "Submit Appointment";
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-6">
        {type === "create" && (
          <section className="mb-12 space-y-4">
            <h1 className="header">New Date</h1>
            <p className="text-dark-700">Request a new date in 10 seconds.</p>
          </section>
        )}

        {type !== "cancel" && (
          <>
            <CustomFormField
              fieldType={FormFieldType.DATE_PICKER}
              control={form.control}
              name="schedule"
              label="Expected appointment date"
              showTimeSelect
              dateFormat="MM/dd/yyyy - h:mm aa"
            />
            <div
              className={`flex flex-col gap-6 ${
                type === "create" && "xl:flex-row"
              }`}
            >
              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="reason"
                label="Appointment reason"
                placeholder="Annual monthly check-up"
                disabled={type === "schedule"}
              />

              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="note"
                label="Comments/notes"
                placeholder="Prefer afternoon appointments, if possible"
                disabled={type === "schedule"}
              />
            </div>
          </>
        )}

        {type === "cancel" && (
          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="cancellationReason"
            label="Reason for cancellation"
            placeholder="Urgent meeting came up"
          />
        )}

        <SubmitButton
          isLoading={isLoading}
          className={`${
            type === "cancel" ? "shad-danger-btn" : "shad-primary-btn"
          } w-full`}
        >
          {buttonLabel}
        </SubmitButton>
      </form>
    </Form>
  );
};
