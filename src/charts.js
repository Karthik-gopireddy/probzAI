import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import html2canvas from 'html2canvas';
import { Modal, Box, Typography } from '@mui/material';
import './charts.css'; // Import the CSS file

const Chart = ({ data, onTimeframeChange }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);

  useEffect(() => {
    setFilteredData(filterData(data, 'daily'));
  }, [data]);

  const filterData = (data, timeframe) => {
    const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
    const now = new Date();

    return data.filter(point => {
      const date = new Date(point.timestamp);
      const diffDays = Math.round(Math.abs((now - date) / oneDay));

      if (timeframe === 'daily') return diffDays <= 1;
      if (timeframe === 'weekly') return diffDays <= 7;
      if (timeframe === 'monthly') return diffDays <= 30;
      return true;
    });
  };

  const handleClick = (data) => {
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
    <div className="chart-container">
      <button onClick={() => onTimeframeChange('daily')}>Daily</button>
      <button onClick={() => onTimeframeChange('weekly')}>Weekly</button>
      <button onClick={() => onTimeframeChange('monthly')}>Monthly</button>
      <button onClick={exportChart}>Export as PNG</button>
      <TransformWrapper>
        <TransformComponent>
          <div id="chart">
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
          <Box className="modalContent">
            <Typography variant="h6">Data Point Details</Typography>
            <p>Timestamp: {selectedDataPoint.timestamp}</p>
            <p>Value: {selectedDataPoint.value}</p>
          </Box>
        </Modal>
      )}
    </div>
  );
};

export default Chart;
