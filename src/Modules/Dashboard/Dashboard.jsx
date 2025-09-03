import React, { useState, useEffect } from 'react';
import { Box, Select, MenuItem, FormControl, InputLabel, TextField  } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LabelList, Legend } from 'recharts';
import {
   
  BarChart, Bar, XAxis, YAxis
} from "recharts";
import {  CartesianGrid, } from "recharts";
import { getAttendanceSummaryForDepartments } from '../../Services/DashboardService';
import { getServiceDueSummary } from '../../Services/DashboardService';
import { useSelector } from "react-redux";


const departments = ["IT", "HR", "Operation"];
const months = ["2025-01","2025-02","2025-03","2025-04","2025-05","2025-06", "2025-07", "2025-08","2025-09","2025-10","2025-11","2025-12"];
const barData = [
  {
    year: "2020",
    currentLiabilities: 8.5,
    nonCurrentLiabilities: 20,
    
  },
  {
    year: "2021",
    currentLiabilities: 8.5,
    nonCurrentLiabilities: 20,
    
  },
  {
    year: "2022",
    currentLiabilities: 7,
    nonCurrentLiabilities: 19,
   
  },
  {
    year: "2023",
     currentLiabilities: 7,
    nonCurrentLiabilities: 19,
   
    
  },
];



const DepartmentAttendanceDashboard = () => {
  const [chartData, setChartData] = useState([]);
 const [fromDate, setFromDate] = useState("2025-01-01");
  const [toDate, setToDate] = useState("2025-12-31");
  const officeId = useSelector((state) => state.user.officeId);
const [assetServiceSummary, setAssetServiceSummary] = useState({ overdue: 0, upcoming: 0, total: 0 });

  const [attendanceData, setAttendanceData] = useState({});
  const [assetServiceData, setAssetServiceData] = useState([]);  
  const [loading, setLoading] = useState(false);
  

  useEffect(() => {
    const fetchData = async () => {
      let finalData = [];
      for (let month of months) {
        let row = { month };
        for (let dept of departments) {
          const res = await getAttendanceSummaryForDepartments(officeId, month, [dept]);
          if (res && res[dept]) {
            // 👇 Example: Only Present count add kar raha hu
            row[dept] = res[dept].reduce((sum, item) => sum + item.value, 0); 

          }
        }
        finalData.push(row);
      }
      setChartData(finalData);
    };
    fetchData();
  }, [officeId]);
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


  const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split("-");
  return `${year}-${month}-${day}`;
};


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
      
      
      <Box sx={{ border: '1px solid #ccc', borderRadius: 1, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '45%', height: 300 }}>
        <Box sx={{ mb: 1, fontSize: '18px' }}>Attendance</Box>
      

  
  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={chartData}>
      <XAxis
        dataKey="month"
        tickFormatter={(month) => {
          const date = new Date(month + "-01");
          return date.toLocaleString("default", { month: "short" }); // Jan, Feb, Mar...
        }}
      />
      <YAxis />
      <Tooltip />
      <Legend verticalAlign="top" height={36} />
      <Bar dataKey="IT" fill="#4285F4" name="IT" />
      <Bar dataKey="HR" fill="#FFB300" name="HR" />
      <Bar dataKey="Operation" fill="#DB4437" name="Operation" />
    </BarChart>
  </ResponsiveContainer>


      </Box>

      {/* --- Expense Block --- */}
      <Box sx={{ border: '1px solid #ccc', borderRadius: 1, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '45%', height: 300 }}>
        <Box sx={{ mb: 1, fontSize: '18px' }}>Expense</Box>
        <ResponsiveContainer width="100%" height="100%">
  <PieChart>
    <Pie
      data={[
        { name: 'Category A', value: 400, color: '#FFB300' },
        { name: 'Category B', value: 600, color: '#4285F4' },
      ]}
      dataKey="value"
      nameKey="name"
      cx="50%"
      cy="50%"
      outerRadius={100}
      label
    >
      {['#FFB300', '#4285F4'].map((color, index) => (
        <Cell key={`inner-${index}`} fill={color} />
      ))}
    </Pie>
    <Tooltip />
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
       <ResponsiveContainer width="100%" height={250}>
  <BarChart data={barData} barSize={20}>
    <XAxis dataKey="year" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="currentAssets" stackId="a" fill="#4285F4" />
    <Bar dataKey="nonCurrentAssets" stackId="a" fill="#FFB300" />
    <Bar dataKey="currentLiabilities" stackId="b" fill="#EA4335" />
    <Bar dataKey="nonCurrentLiabilities" stackId="b" fill="#00CFFF" />
    <Bar dataKey="capitalStock" stackId="c" fill="#34A853" />
    <Bar dataKey="retainedEarning" stackId="c" fill="#FF69B4" />
    <Bar dataKey="treasury" stackId="c" fill="#FF7043" />
  </BarChart>
</ResponsiveContainer>

      </Box>
    </Box>
  </Box>
);

};

export default DepartmentAttendanceDashboard;
