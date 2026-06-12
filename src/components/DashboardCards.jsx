import {
  Users,
  UserCheck,
  Wallet,
  CalendarClock,
  BadgeIndianRupee,
  ClipboardList,
  CalendarDays,
  BellRing,
  AlertTriangle,
  BarChart3,
  FileDown,
  Snowflake,
} from "lucide-react";

export default function DashboardCards({ role, stats, setActiveSection }) {
  const formatMoney = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  const adminCards = [
    {
      title: "Total Customers",
      value: stats.totalCustomers || 0,
      key: "customers",
      icon: <Users size={34} />,
    },
    {
      title: "Live Memberships",
      value: stats.liveMemberships || 0,
      key: "live-memberships",
      icon: <UserCheck size={34} />,
    },
    {
      title: "Expired Memberships",
      value: stats.expiredMemberships || 0,
      key: "expired-memberships",
      icon: <AlertTriangle size={34} />,
    },
    {
      title: "Frozen Memberships",
      value: stats.frozenMemberships || 0,
      key: "frozen-memberships",
      icon: <Snowflake size={34} />,
    },
    {
      title: "Expiring 1–3 Days",
      value: stats.expiring1to3 || 0,
      key: "expiring-1-3",
      icon: <CalendarClock size={34} />,
    },
    {
      title: "Expiring 4–7 Days",
      value: stats.expiring4to7 || 0,
      key: "expiring-4-7",
      icon: <CalendarDays size={34} />,
    },
    {
      title: "Expiring 8–15 Days",
      value: stats.expiring8to15 || 0,
      key: "expiring-8-15",
      icon: <CalendarDays size={34} />,
    },
    {
      title: "Today Attendance",
      value: stats.todayAttendance || 0,
      key: "attendance",
      icon: <ClipboardList size={34} />,
    },
    {
      title: "Due Amount",
      value: formatMoney(stats.dueAmount),
      key: "dues",
      icon: <Wallet size={34} />,
    },
    {
      title: "Today Collection",
      value: formatMoney(stats.todayCollection),
      key: "today-collection",
      icon: <BadgeIndianRupee size={34} />,
    },
    {
      title: "Total Collection",
      value: formatMoney(stats.totalCollection),
      key: "total-collection",
      icon: <BadgeIndianRupee size={34} />,
    },
    {
      title: "Expenses",
      value: formatMoney(stats.expenses),
      key: "expenses",
      icon: <Wallet size={34} />,
    },
    {
      title: "Balance Sheet",
      value: "View",
      key: "balance-sheet",
      icon: <BarChart3 size={34} />,
    },
    {
      title: "Enquiries",
      value: stats.enquiries || 0,
      key: "enquiries",
      icon: <BellRing size={34} />,
    },
    {
      title: "Reports",
      value: "Export",
      key: "reports",
      icon: <FileDown size={34} />,
    },
  ];

  const trainerCards = [
    {
      title: "Total Customers",
      value: stats.totalCustomers || 0,
      key: "customers",
      icon: <Users size={34} />,
    },
    {
      title: "Live Memberships",
      value: stats.liveMemberships || 0,
      key: "live-memberships",
      icon: <UserCheck size={34} />,
    },
    {
      title: "Expired Memberships",
      value: stats.expiredMemberships || 0,
      key: "expired-memberships",
      icon: <AlertTriangle size={34} />,
    },
    {
      title: "Frozen Memberships",
      value: stats.frozenMemberships || 0,
      key: "frozen-memberships",
      icon: <Snowflake size={34} />,
    },
    {
      title: "Expiring 1–3 Days",
      value: stats.expiring1to3 || 0,
      key: "expiring-1-3",
      icon: <CalendarClock size={34} />,
    },
    {
      title: "Expiring 4–7 Days",
      value: stats.expiring4to7 || 0,
      key: "expiring-4-7",
      icon: <CalendarDays size={34} />,
    },
    {
      title: "Expiring 8–15 Days",
      value: stats.expiring8to15 || 0,
      key: "expiring-8-15",
      icon: <CalendarDays size={34} />,
    },
    {
      title: "Today Attendance",
      value: stats.todayAttendance || 0,
      key: "attendance",
      icon: <ClipboardList size={34} />,
    },
    {
      title: "Enquiries",
      value: stats.enquiries || 0,
      key: "enquiries",
      icon: <BellRing size={34} />,
    },
    {
      title: "Reports",
      value: "Export",
      key: "reports",
      icon: <FileDown size={34} />,
    },
  ];

  const cards = role === "admin" ? adminCards : trainerCards;

  return (
    <div className="dashboard-cards-grid">
      {cards.map((card) => (
        <button
          key={card.key}
          type="button"
          className="dashboard-card"
          onClick={() => setActiveSection(card.key)}
        >
          <div className="dashboard-card-icon">{card.icon}</div>

          <div className="dashboard-card-content">
            <h3>{card.title}</h3>
            <p>{card.value}</p>
          </div>
        </button>
      ))}
    </div>
  );
}