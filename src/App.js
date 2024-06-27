import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Drawer, List, ListItem, ListItemText, AppBar, Toolbar, Typography, CssBaseline, Modal, Box
} from '@mui/material';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import html2canvas from 'html2canvas';
import './App.css';

const drawerWidth = 240;

const App = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [timeframe, setTimeframe] = useState('daily');
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);

  useEffect(() => {
    fetch('/data.json')
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched data:', data);
        setData(data);
        setFilteredData(filterData(data, 'daily'));
      });
  }, []);

  useEffect(() => {
    setFilteredData(filterData(data, timeframe));
  }, [timeframe, data]);

  const filterData = (data, timeframe) => {
    const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
    const now = new Date();

    return data.filter(point => {
      const date = new Date(point.timestamp);
      const diffDays = Math.round((now - date) / oneDay);

      if (timeframe === 'daily') return diffDays <= 1;
      if (timeframe === 'weekly') return diffDays <= 7;
      if (timeframe === 'monthly') return diffDays <= 30;
      return true;
    });
  };

  const handleClick = (data) => {
    console.log('Clicked data:', data);
    if (data && data.activePayload) {
      setSelectedDataPoint(data.activePayload[0].payload);
    }
  };

  const handleClose = () => {
    setSelectedDataPoint(null);
  };

  const exportChart = () => {
    const chartElement = document.getElementById('chart');
    if (chartElement) {
      html2canvas(chartElement).then((canvas) => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'chart.png';
        link.click();
      });
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" style={{ zIndex: 1201 }}>
        <Toolbar>
          <Typography variant="h6" noWrap>
            Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        style={{ width: drawerWidth, flexShrink: 0 }}
        classes={{ paper: { width: drawerWidth } }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List onClick={()=>setSelectedDataPoint(!null)}>
            {['Daily', 'Weekly', 'Monthly'].map((text) => (
              <ListItem button key={text} onClick={() => setTimeframe(text.toLowerCase())}>
                <ListItemText primary={text} />
              </ListItem>
            ))}
            <ListItem button onClick={exportChart}>
              <ListItemText primary="Export as PNG" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <main style={{ flexGrow: 1, padding: '24px', marginLeft: drawerWidth }}>
        <Toolbar />
        <TransformWrapper>
          <TransformComponent>
            <div className="chartContainer" id="chart">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={filteredData} onClick={handleClick}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TransformComponent>
        </TransformWrapper>
        {selectedDataPoint && (
          <Modal open={true} onClose={handleClose}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
              <Typography variant="h6" component="h2">
                Data Point Details
              </Typography>
              <Typography sx={{ mt: 2 }}>
                Timestamp: {selectedDataPoint.timestamp || '2023-01-18 05:08:30'}
              </Typography>
              <Typography sx={{ mt: 2 }}>
                Value: {selectedDataPoint.value || '15'}
              </Typography>
            </Box>
          </Modal>
        )}
      </main>
    </div>
  );
};

export default App;
