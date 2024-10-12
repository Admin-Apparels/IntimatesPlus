import { StatCard } from "../Table/StatCard";
import { columns } from "../Table/columns";
import { DataTable } from "../Table/DataTable";
import { Image, Link } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getAllOrders, getUserOrders } from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import classNames from "classnames";
import logo from "../../assets/icons/logo-full.svg";
import appointments from "../../assets/icons/appointments.svg";
import cancelled from "../../assets/icons/cancelled.svg";
import pending from "../../assets/icons/pending.svg";

const OrdersPage = () => {
  const ADMIN_EMAIL = "intimates_plus@fuckmate.boo";

  const { user } = ChatState();

  const isAdmin = user?.email === ADMIN_EMAIL;

  const [dates, setDates] = useState({
    scheduledCount: 0,
    pendingCount: 0,
    cancelledCount: 0,
    documents: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const ordersData = isAdmin
          ? await getAllOrders(user) // Fetching all orders if the user is an admin
          : await getUserOrders(user); // Fetching specific user's orders if not an admin

        // Calculate the number of orders based on status
        const scheduledCount = ordersData.filter(
          (order) => order.status === "scheduled"
        ).length;
        const pendingCount = ordersData.filter(
          (order) => order.status === "pending"
        ).length;
        const cancelledCount = ordersData.filter(
          (order) => order.status === "cancelled"
        ).length;

        // Set the fetched data into the state
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

    // Call the fetch function
    fetchOrders();
  }, [isAdmin, user]); // Dependency array: refetch data when `isAdmin` or `user` changes

  // Handle loading state
  if (loading) return <p>Loading...</p>;

  // Handle error state
  if (error) return <p>Error: {error}</p>;

  // JSX returned when data is available
  return (
    <div
      className={classNames(
        "min-h-screen",
        "bg-dark-300",
        "font-sans",
        "antialiased",
        "w-full"
      )}
    >
      <header className="admin-header">
        <Link href="/" className="cursor-pointer">
          <Image
            src={logo}
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
          <h1 className="header text-dark-600">Welcome 👋</h1>
          <p className="text-dark-700">Start the day with managing new dates</p>
        </section>

        <section className="admin-stat">
          <StatCard
            type="appointments"
            count={dates.scheduledCount}
            label="Scheduled appointments"
            icon={appointments}
          />
          <StatCard
            type="pending"
            count={dates.pendingCount}
            label="Pending appointments"
            icon={pending}
          />
          <StatCard
            type="cancelled"
            count={dates.cancelledCount}
            label="Cancelled appointments"
            icon={cancelled}
          />
        </section>

        <DataTable columns={columns} data={dates.documents} />
      </main>
    </div>
  );
};

export default OrdersPage;