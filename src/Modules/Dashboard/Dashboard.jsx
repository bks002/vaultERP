import React, { useState, useEffect } from 'react';
import { Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LabelList } from 'recharts';
import { getAttendanceSummaryForDepartments } from '../../Services/DashboardService';
import { useSelector } from "react-redux";
const monthOptions = ['January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'];
const yearOptions = ['2025'];
const departments = ['HR', 'IT', 'Production'];

const DepartmentAttendanceDashboard = () => {
    const officeId = useSelector((state) => state.user.officeId);
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0]);
  const [selectedYear, setSelectedYear] = useState(yearOptions[0]);
  const [attendanceData, setAttendanceData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const monthNum = ("0" + (monthOptions.indexOf(selectedMonth) + 1)).slice(-2);
        const monthYear = `${selectedYear}-${monthNum}`;
        

        const data = await getAttendanceSummaryForDepartments(officeId, monthYear, departments);
        console.log('Fetched attendance data:', data);
        setAttendanceData(data);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setAttendanceData({});
      }
    };

    fetchData();
  }, [officeId,selectedMonth, selectedYear]);

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
      {/* Month/Year dropdown */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
        <FormControl size="small">
          <InputLabel>Month</InputLabel>
          <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            {monthOptions.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel>Year</InputLabel>
          <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            {yearOptions.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ border: '1px solid #ccc', borderRadius: 1, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '45%' }}>
        <Box sx={{ mb: 1, fontSize: '18px' }}>Attendance</Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 0, flexWrap: 'wrap', width: '100%' }}>
          {attendanceData && Object.keys(attendanceData).map(dept => renderChart(dept, attendanceData[dept]))}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 1, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#f7d142', borderRadius: '50%', mr: 1 }} /> Absent
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#279a83', borderRadius: '50%', mr: 1 }} /> Present
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#f1505c', borderRadius: '50%', mr: 1 }} /> Leave
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DepartmentAttendanceDashboard;
