import React, { useState, useEffect } from 'react';
import { Box, Select, MenuItem, FormControl, InputLabel, TextField } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LabelList, Legend } from 'recharts';
import {
  BarChart, Bar, XAxis, YAxis
} from "recharts";
import { CartesianGrid, } from "recharts";
import { getAttendanceSummaryForDepartments } from '../../Services/DashboardService';
import { getServiceDueSummary, getExpenseReport, getMinStockAll } from '../../Services/DashboardService';
import { useSelector } from "react-redux";
const departments = ["IT", "HR", "Operation"];

const DepartmentAttendanceDashboard = () => {
  const [chartData, setChartData] = useState([]);
  const [fromDate, setFromDate] = useState("2025-01-01");
  const [toDate, setToDate] = useState("2025-12-31");
  const officeId = useSelector((state) => state.user.officeId);
  const [minStockData, setMinStockData] = useState([]);
  const [assetServiceSummary, setAssetServiceSummary] = useState({ overdue: 0, upcoming: 0, total: 0 });
  const [expenseData, setExpenseData] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [assetServiceData, setAssetServiceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attendanceChartData, setAttendanceChartData] = useState([]);
  // ✅ Fetch Min Stock API data
  useEffect(() => {
    const fetchMinStock = async () => {
      if (!fromDate || !toDate) return;
      try {
        const result = await getMinStockAll(officeId, fromDate, toDate);
        console.log("Min Stock Data:", result);
        const filtered = result
          .filter(item => item.runningStock < item.minStockLevel)
          .map(item => ({
            itemName: item.itemName,
            runningStock: item.runningStock,
            minStockLevel: item.minStockLevel
          }));
        const latestData = Object.values(
          filtered.reduce((acc, cur) => {
            acc[cur.itemName] = cur;
            return acc;
          }, {})
        );
        setMinStockData(latestData);
      } catch (error) {
        console.error("Error fetching Min Stock data:", error);
        setMinStockData([]);
      }
    };
    fetchMinStock();
  }, [fromDate, toDate, officeId]);

  // Helper function: fromDate–toDate ke beech ke months nikalna
  function getMonthsBetween(fromDate, toDate) {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    let months = [];

    while (start <= end) {
      const monthYear = `${start.getFullYear()}-${String(
        start.getMonth() + 1
      ).padStart(2, "0")}`;
      months.push(monthYear);
      start.setMonth(start.getMonth() + 1);
    }

    return months;
  }

  // --- Attendance Fetch ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        let finalData = [];

        for (let dept of departments) {
          let totalPresent = 0;
          let totalAbsent = 0;
          let totalLeave = 0;

          // ✅ Get all months between fromDate–toDate
          const months = getMonthsBetween(fromDate, toDate);

          for (let month of months) {
            const res = await getAttendanceSummaryForDepartments(
              officeId,
              month,   // 👈 sirf monthYear pass hoga (YYYY-MM)
              dept
            );

            if (res) {
              totalPresent += res.presentCount || 0;
              totalAbsent += res.absentCount || 0;
              totalLeave += res.leaveCount || 0;
            }
          }

          finalData.push({
            name: dept,
            Present: totalPresent,
            Absent: totalAbsent,
            Leave: totalLeave,
          });
        }

        setAttendanceChartData(finalData);
      } catch (err) {
        console.error("Error fetching attendance:", err);
        setAttendanceChartData([]);
      }
    };

    fetchData();
  }, [fromDate, toDate, officeId]);


  useEffect(() => {
    const fetchAssets = async () => {
      if (!fromDate || !toDate) return;
      setLoading(true);
      try {
        const result = await getServiceDueSummary(fromDate, toDate);
        console.log("From:", fromDate, "To:", toDate);
        console.log("Service Due Summary:", result);
        setAssetServiceSummary(result.summary || { overdue: 0, upcoming: 0, total: 0 });
        const formatted = result.data.map(item => ({
          assetName: item.assetName,
          value: 1,
          status: item.status,
          lastServiceDate: item.lastServiceDate,
          nextServiceDate: item.nextServiceDate,
        }));

        setAssetServiceData(formatted);
      } catch (error) {
        console.error("Error fetching assets:", error);
        setAssetServiceData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [fromDate, toDate]);

  // --- useEffect for Expense API Call
  useEffect(() => {
    const fetchExpenses = async () => {
      if (!fromDate || !toDate) return;
      try {
        const result = await getExpenseReport(officeId, fromDate, toDate);

        // Grouping by expenseType
        const grouped = result.reduce((acc, item) => {
          const existing = acc.find((x) => x.name === item.expenseType);
          if (existing) {
            existing.value += item.totalAmount;
            existing.subTypes.push({
              name: item.expenseSubType,
              value: item.totalAmount,
            });
          } else {
            acc.push({
              name: item.expenseType,
              value: item.totalAmount,
              subTypes: [
                { name: item.expenseSubType, value: item.totalAmount },
              ],
            });
          }
          return acc;
        }, []);

        setExpenseData(grouped);
      } catch (error) {
        console.error("Error loading expenses:", error);
        setExpenseData([]);
      }
    };

    fetchExpenses();
  }, [officeId, fromDate, toDate]);

  const renderChart = (title, data) => {
    const words = title.split(" & ");
    return (
      <Box sx={{ textAlign: "center", flex: "1 1 30%", maxWidth: "30%", boxSizing: "border-box" }}>
        <ResponsiveContainer width="100%" height={170}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              startAngle={90}
              endAngle={450}
              paddingAngle={2}
              labelLine={false}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
                const radius = innerRadius + (outerRadius - innerRadius) / 2;
                const RADIAN = Math.PI / 180;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                return (
                  <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="middle" fontSize={10} fontWeight={600}>
                    {value}
                  </text>
                );
              }}
            >
              {data.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              <LabelList dataKey="value" position="inside" fill="#fff" fontSize={10} fontWeight={600} />
            </Pie>
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: "12px", fontWeight: "600", fill: "#333" }}>
              {words.length > 1 ? (
                <>
                  <tspan x="50%" dy="-0.4em">{words[0]}</tspan>
                  <tspan x="50%" dy="1.2em">& {words[1]}</tspan>
                </>
              ) : title}
            </text>
            <Tooltip formatter={(value) => [value, null]} />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    );
  };
  return (
    <Box sx={{ width: '100%', textAlign: 'center' }}>
      {/* Date Filters */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 3 }}>
        <TextField
          size="small"
          type="date"
          label="From Date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ width: "180px" }}
        />
        <TextField
          size="small"
          type="date"
          label="To Date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ width: "180px" }}
        />
      </Box>
      {/* Parent flex box for four sections (2 top + 2 bottom) */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 3 }}>
        {/* --- Attendance --- */}
        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '45%', height: 300 }}>
          <Box sx={{ mb: 1, fontSize: '18px' }}>Attendance</Box>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={attendanceChartData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />   {/* Dept names */}
              <YAxis />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.05)" }}
                formatter={(value, key) => [value, key]}
              />
              <Legend />

              {/* ✅ Stacked Bars with value labels */}
              <Bar dataKey="Present" stackId="a" fill="#34A853">
                <LabelList dataKey="Present" position="top" fontSize={10} />
              </Bar>
              <Bar dataKey="Absent" stackId="a" fill="#EA4335">
                <LabelList dataKey="Absent" position="top" fontSize={10} />
              </Bar>
              <Bar dataKey="Leave" stackId="a" fill="#FFB300">
                <LabelList dataKey="Leave" position="top" fontSize={10} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

        </Box>
        {/* --- Expense Block --- */}
        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '45%', height: 300 }}>
          <Box sx={{ mb: 1, fontSize: '18px' }}>Expense</Box>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"

                labelLine={false}
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={["#4285F4", "#FFB300", "#DB4437", "#34A853", "#00CFFF", "#FF69B4"][index % 6]} />
                ))}
              </Pie>

              {/* Tooltip me subtype details show hoga */}
              <Tooltip
                formatter={(value, name, props) => {
                  const subTypes = expenseData.find((x) => x.name === props.payload.name)?.subTypes || [];
                  return [
                    value,
                    <>
                      <strong>{props.payload.name}</strong>
                      <br />
                      {subTypes.map((s, i) => (
                        <div key={i}>{s.name}: {s.value}</div>
                      ))}
                    </>
                  ];
                }}
              />

              {/* Legend right side vertical */}
              <Legend verticalAlign="middle" align="right" layout="vertical" />
            </PieChart>
          </ResponsiveContainer>
        </Box>
        {/* --- Asset Service Detail --- */}
        <Box
          sx={{
            border: '1px solid #ccc',
            borderRadius: 1,
            p: 2,
            width: '45%',
            height: 300,
            overflow: "hidden",         // ✅ Border ke andar constrain
            display: "flex",
            flexDirection: "column"
          }}
        >
          <Box sx={{ mb: 1, fontSize: '18px' }}>Asset Service Detail</Box>
          <Box sx={{ flex: 1, overflow: "auto" }}>   {/* ✅ Scroll wrapper */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5", textAlign: "left" }}>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>Asset Name</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>Status</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>Last Service Date</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>Next Service Date</th>
                </tr>
              </thead>
              <tbody>
                {assetServiceData.length > 0 ? (
                  assetServiceData.map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.assetName}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", color: item.status === "Overdue" ? "red" : "green" }}>
                        {item.status}
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.lastServiceDate}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.nextServiceDate}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "10px" }}>No Data Available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>

          {loading && <div>Loading...</div>}
        </Box>
        {/* --- Balance Sheet Block (4th) --- */}
        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '45%', height: 300 }}>
          <Box sx={{ mb: 1, fontSize: '18px' }}>Min Stock Level</Box>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={minStockData}
              barSize={20}
              margin={{ top: 20, right: 20, left: 20, bottom: 60 }}  // 👈 extra bottom space
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="itemName"
                interval={0}
                tick={({ x, y, payload }) => {
                  const words = payload.value.split(" ");
                  return (
                    <text
                      x={x}
                      y={y + 10}
                      textAnchor="end"
                      fontSize={10}
                      transform={`rotate(-40, ${x}, ${y + 10})`}
                    >
                      {words.map((word, index) => (
                        <tspan key={index} x={x} dy={index === 0 ? 0 : 12}>
                          {word}
                        </tspan>
                      ))}
                    </text>
                  );
                }}
              />
              <YAxis />
              <Tooltip />
              <Legend verticalAlign="top" align="center" />   {/* 👈 Legend upar chala gaya */}

              {/* ✅ Bars with values on top */}
              <Bar dataKey="runningStock" stackId="a" fill="#4285F4" name="Running Stock">
                <LabelList dataKey="runningStock" position="top" fontSize={10} />
              </Bar>
              <Bar dataKey="minStockLevel" stackId="a" fill="#EA4335" name="Min Stock Level">
                <LabelList dataKey="minStockLevel" position="top" fontSize={10} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>



        </Box>
      </Box>
    </Box>
  );

};

export default DepartmentAttendanceDashboard;
