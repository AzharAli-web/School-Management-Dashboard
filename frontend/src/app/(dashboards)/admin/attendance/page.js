"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Calendar,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function AdminAttendancePage() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/attendance/admin/stats");

        const formatted = data.map(item => ({
          name: item._id,
          value: item.count
        }));
        setStats(formatted);
      } catch (error) {
        console.error("Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data } = await api.get("/attendance/admin/export");
      if (!data || data.length === 0) {
        toast.error("No data available to export");
        return;
      }


      const headers = ["Student Name", "Roll Number", "Class", "Date", "Status"];
      const csvData = data.map(record => [
        `"${record.studentId?.name || "N/A"}"`,
        `"${record.studentId?.rollNumber || "N/A"}"`,
        `"${record.class}"`,
        `"${new Date(record.date).toLocaleDateString()}"`,
        `"${record.status}"`
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Report exported successfully");
    } catch (error) {
      toast.error("Failed to export report");
    } finally {
      setExporting(false);
    }
  };

  const COLORS = {
    Present: "#10b981",
    Absent: "#ef4444",
    Late: "#f59e0b"
  };

  const chartData = stats.length > 0 ? stats : [
    { name: 'Present', value: 0 },
    { name: 'Absent', value: 0 },
    { name: 'Late', value: 0 }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Analytics</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Global insights and reports across all classes</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {exporting ? "Exporting..." : "Export Report"}
        </button>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {chartData.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl flex items-center justify-between hover:shadow-lg transition-all duration-300"
          >
            <div>
              <p className="text-zinc-500 font-medium text-sm">{item.name} Total</p>
              <h3 className="text-4xl font-bold mt-2">{item.value}</h3>
            </div>
            <div className={`p-4 rounded-2xl ${item.name === 'Present' ? 'bg-green-50 text-green-600' :
                item.name === 'Absent' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
              }`}>
              {item.name === 'Present' ? <CheckCircle2 className="w-8 h-8" /> :
                item.name === 'Absent' ? <XCircle className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl"
        >
          <h3 className="text-xl font-bold mb-8">Status Distribution</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || "#8884d8"} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>


        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Class-wise Performance</h3>
            <div className="flex gap-2">
              <button className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg"><Filter className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="space-y-6">
            {[
              { class: 'Class 10-A', rate: 94, total: 45 },
              { class: 'Class 10-B', rate: 88, total: 42 },
              { class: 'Class 9-A', rate: 91, total: 38 },
              { class: 'Class 8-C', rate: 76, total: 40 }
            ].map((cls, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span>{cls.class}</span>
                  <span className={cls.rate > 90 ? 'text-green-600' : cls.rate > 80 ? 'text-amber-600' : 'text-red-600'}>
                    {cls.rate}%
                  </span>
                </div>
                <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cls.rate}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className={`h-full rounded-full ${cls.rate > 90 ? 'bg-green-500' : cls.rate > 80 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
