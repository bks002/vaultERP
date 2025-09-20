import React, { useState, useEffect } from 'react';
import { Box, TextField } from '@mui/material';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LabelList, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { getAttendanceSummaryForDepartments, getServiceDueSummary, getExpenseReport, getMinStockAll } from '../../Services/DashboardService';
import { useSelector } from "react-redux";

const departments = ["IT", "HR", "Operation"];

const DepartmentAttendanceDashboard = () => {
  const [fromDate, setFromDate] = useState("2025-01-01");
  const [toDate, setToDate] = useState("2025-12-31");
  const officeId = useSelector((state) => state.user.officeId);
  const [minStockData, setMinStockData] = useState([]);
  const [assetServiceSummary, setAssetServiceSummary] = useState({ overdue: 0, upcoming: 0, total: 0 });
  const [expenseData, setExpenseData] = useState([]);
  const [attendanceChartData, setAttendanceChartData] = useState([]);
  const [assetServiceData, setAssetServiceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wipData, setWipData] = useState([]);

  // --- Fetch Work In Process ---
  useEffect(() => {
    const fetchWIPData = async (officeId) => {
      try {
        const res = await fetch(`https://admin.urest.in:8089/api/WorkInProcess/aggregate-summary/${officeId}`);
        const data = await res.json();
        const formatted = data.map(item => ({
          label: `WO-${item.internalWorkOrder}\n${item.productName}`,
          Target: item.totalTargetAchievedTillDate,
          Deliverable: item.totalDeliverable
        }));
        setWipData(formatted);
      } catch (err) {
        console.error("Error fetching WIP data:", err);
      }
    };
    fetchWIPData(officeId);
  }, [officeId]);

  // --- Fetch Min Stock ---
  useEffect(() => {
    const fetchMinStock = async () => {
      if (!fromDate || !toDate) return;
      try {
        const result = await getMinStockAll(officeId, fromDate, toDate);
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

  // --- Helper: get months between ---
  function getMonthsBetween(fromDate, toDate) {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    let months = [];
    while (start <= end) {
      const monthYear = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;
      months.push(monthYear);
      start.setMonth(start.getMonth() + 1);
    }
    return months;
  }

  // --- Attendance ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        let finalData = [];
        for (let dept of departments) {
          let totalPresent = 0, totalAbsent = 0, totalLeave = 0;
          const months = getMonthsBetween(fromDate, toDate);
          for (let month of months) {
            const res = await getAttendanceSummaryForDepartments(officeId, month, dept);
            if (res) {
              totalPresent += res.presentCount || 0;
              totalAbsent += res.absentCount || 0;
              totalLeave += res.leaveCount || 0;
            }
          }
          finalData.push({ name: dept, Present: totalPresent, Absent: totalAbsent, Leave: totalLeave });
        }
        setAttendanceChartData(finalData);
      } catch (err) {
        console.error("Error fetching attendance:", err);
        setAttendanceChartData([]);
      }
    };
    fetchData();
  }, [fromDate, toDate, officeId]);

  // --- Assets ---
  useEffect(() => {
    const fetchAssets = async () => {
      if (!fromDate || !toDate) return;
      setLoading(true);
      try {
        const result = await getServiceDueSummary(fromDate, toDate);
        setAssetServiceSummary(result.summary || { overdue: 0, upcoming: 0, total: 0 });
        const formatted = result.data.map(item => ({
          assetName: item.assetName,
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

  // --- Expenses ---
  useEffect(() => {
    const fetchExpenses = async () => {
      if (!fromDate || !toDate) return;
      try {
        const result = await getExpenseReport(officeId, fromDate, toDate);
        const grouped = result.reduce((acc, item) => {
          const existing = acc.find((x) => x.name === item.expenseType);
          if (existing) {
            existing.value += item.totalAmount;
            existing.subTypes.push({ name: item.expenseSubType, value: item.totalAmount });
          } else {
            acc.push({
              name: item.expenseType,
              value: item.totalAmount,
              subTypes: [{ name: item.expenseSubType, value: item.totalAmount }],
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

  return (
    <Box sx={{ width: '100%', textAlign: 'center' }}>
      {/* Date Filters */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 3 }}>
        <TextField size="small" type="date" label="From Date" value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          InputLabelProps={{ shrink: true }} sx={{ width: "180px" }} />
        <TextField size="small" type="date" label="To Date" value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          InputLabelProps={{ shrink: true }} sx={{ width: "180px" }} />
      </Box>

      {/* Dashboard Blocks */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 3 }}>
        
        {/* --- Attendance --- */}
        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, p: 2, display: 'flex',
          flexDirection: 'column', alignItems: 'center', width: '45%', height: 300 }}>
          <Box sx={{ width: "100%", textAlign: "center", fontSize: '18px', fontWeight: 600, mb: 1 }}>
            Attendance
          </Box>
          <Box sx={{ flex: 1, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceChartData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(v, k) => [v, k]} />
                <Legend />
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
        </Box>

        {/* --- Expense --- */}
        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, p: 2, display: 'flex',
          flexDirection: 'column', alignItems: 'center', width: '45%', height: 300 }}>
          <Box sx={{ width: "100%", textAlign: "center", fontSize: '18px', fontWeight: 600, mb: 1 }}>
            Expense
          </Box>
          <Box sx={{ flex: 1, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" labelLine={false}>
                  {expenseData.map((entry, index) => (
                    <Cell key={index} fill={["#4285F4", "#FFB300", "#DB4437", "#34A853", "#00CFFF", "#FF69B4"][index % 6]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => {
                  const subTypes = expenseData.find((x) => x.name === props.payload.name)?.subTypes || [];
                  return [value, <>
                    <strong>{props.payload.name}</strong><br />
                    {subTypes.map((s, i) => <div key={i}>{s.name}: {s.value}</div>)}
                  </>];
                }} />
                <Legend verticalAlign="middle" align="right" layout="vertical" />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* --- Work In Process --- */}
        <Box sx={{ border: "1px solid #ccc", borderRadius: 1, p: 2, display: "flex",
          flexDirection: "column", alignItems: "center", width: "45%", height: 300 }}>
          <Box sx={{ width: "100%", textAlign: "center", fontSize: '18px', fontWeight: 600, mb: 1 }}>
            Work In Process
          </Box>
          <Box sx={{ flex: 1, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wipData} barSize={25} margin={{ top: 20, right: 20, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="label" interval={0}
                  tick={({ x, y, payload }) => {
                    const lines = payload.value.split("\n");
                    return (
                      <text x={x} y={y + 10} textAnchor="middle" fontSize={11}>
                        {lines.map((line, i) => (
                          <tspan key={i} x={x} dy={i === 0 ? 0 : 12}>{line}</tspan>
                        ))}
                      </text>
                    );
                  }} />
                <YAxis />
                <Tooltip formatter={(v) => v.toLocaleString()} />
                <Legend verticalAlign="top" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Target" fill="#4285F4" radius={[6, 6, 0, 0]} name="Target Achieved">
                  <LabelList dataKey="Target" position="top" fontSize={11} />
                </Bar>
                <Bar dataKey="Deliverable" fill="#EA4335" radius={[6, 6, 0, 0]} name="Deliverable">
                  <LabelList dataKey="Deliverable" position="top" fontSize={11} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* --- Asset Service Detail --- */}
        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, p: 2, width: '45%', height: 300,
          display: "flex", flexDirection: "column" }}>
          <Box sx={{ width: "100%", textAlign: "center", fontSize: '18px', fontWeight: 600, mb: 1 }}>
            Asset Service Detail
          </Box>
          <Box sx={{ flex: 1, overflow: "auto" }}>
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
                  assetServiceData.map((item, i) => (
                    <tr key={i}>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.assetName}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", color: item.status === "Overdue" ? "red" : "green" }}>{item.status}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.lastServiceDate}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.nextServiceDate}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} style={{ textAlign: "center", padding: "10px" }}>No Data Available</td></tr>
                )}
              </tbody>
            </table>
          </Box>
          {loading && <div>Loading...</div>}
        </Box>

        {/* --- Min Stock Level --- */}
        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, p: 2, display: 'flex',
          flexDirection: 'column', alignItems: 'center', width: '45%', height: 300 }}>
          <Box sx={{ width: "100%", textAlign: "center", fontSize: '18px', fontWeight: 600, mb: 1 }}>
            Min Stock Level
          </Box>
          <Box sx={{ flex: 1, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={minStockData} barSize={20} margin={{ top: 20, right: 20, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="itemName" interval={0}
                  tick={({ x, y, payload }) => {
                    const words = payload.value.split(" ");
                    return (
                      <text x={x} y={y + 10} textAnchor="end" fontSize={10} transform={`rotate(-40, ${x}, ${y + 10})`}>
                        {words.map((word, index) => (
                          <tspan key={index} x={x} dy={index === 0 ? 0 : 12}>{word}</tspan>
                        ))}
                      </text>
                    );
                  }} />
                <YAxis />
                <Tooltip />
                <Legend verticalAlign="top" align="center" />
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
    </Box>
  );
};

export default DepartmentAttendanceDashboard;