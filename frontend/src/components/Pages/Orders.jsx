import { StatCard } from "../Table/StatCard";
import { columns } from "../Table/columns";
import { DataTable } from "../Table/DataTable";
import { Image, Link } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getAllOrders, getUserOrders } from "../config/ChatLogics";

const OrdersPage = async ({ isAdmin, userId }) => {
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const ordersData = isAdmin
          ? await getAllOrders()
          : await getUserOrders(userId);

        // Assuming ordersData returns an array of orders
        const scheduledCount = ordersData.filter(
          (order) => order.status === "scheduled"
        ).length; // Adjust as needed
        const pendingCount = ordersData.filter(
          (order) => order.status === "pending"
        ).length;
        const cancelledCount = ordersData.filter(
          (order) => order.status === "cancelled"
        ).length;

        // Set the state with counts and documents
        setDates({
          scheduledCount,
          pendingCount,
          cancelledCount,
          documents: ordersData,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAdmin, userId]); // Depend on isAdmin and userId

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-14">
      <header className="admin-header">
        <Link href="/" className="cursor-pointer">
          <Image
            src=""
            height={32}
            width={162}
            alt="logo"
            className="h-8 w-fit"
          />
        </Link>

        <p className="text-16-semibold">
          {isAdmin ? "Admin Dashboard " : "Dates"}
        </p>
      </header>

      <main className="admin-main">
        <section className="w-full space-y-4">
          <h1 className="header">Welcome 👋</h1>
          <p className="text-dark-700">Start the day with managing new dates</p>
        </section>

        <section className="admin-stat">
          <StatCard
            type="appointments"
            count={dates.scheduledCount}
            label="Scheduled appointments"
            icon={"/assets/icons/appointments.svg"}
          />
          <StatCard
            type="pending"
            count={dates.pendingCount}
            label="Pending appointments"
            icon={"/assets/icons/pending.svg"}
          />
          <StatCard
            type="cancelled"
            count={dates.cancelledCount}
            label="Cancelled appointments"
            icon={"/assets/icons/cancelled.svg"}
          />
        </section>

        <DataTable columns={columns} data={dates.documents} />
      </main>
    </div>
  );
};

export default OrdersPage;
