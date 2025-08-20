// components/RatingDistributionPieChart.tsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface RatingWiseCount {
  below1000?: number;
  range1000to1199?: number;
  range1200to1399?: number;
  range1400to1599?: number;
  range1600to1799?: number;
  range1800to1999?: number;
  range2000to2199?: number;
  range2200to2399?: number;
  range2400to2599?: number;
  range2600to2799?: number;
  range2800to2999?: number;
  above3000?: number;
  unrated?: number;
}

interface RatingDistributionPieChartProps {
  ratingWiseCount: RatingWiseCount;
  totalSolved: number;
  className?: string;
}

// Helper function to prepare chart data
const prepareChartData = (ratingWiseCount: RatingWiseCount) => {
  // Updated color map with better, more distinct colors
  const colorMap: { [key: string]: string } = {
    below1000: '#94a3b8',        // Light Gray
    range1000to1199: '#10b981',  // Emerald
    range1200to1399: '#059669',  // Dark Emerald  
    range1400to1599: '#06b6d4',  // Cyan
    range1600to1799: '#3b82f6',  // Blue
    range1800to1999: '#8b5cf6',  // Violet
    range2000to2199: '#f59e0b',  // Amber
    range2200to2399: '#d97706',  // Orange
    range2400to2599: '#ea580c',  // Deep Orange
    range2600to2799: '#dc2626',  // Red
    range2800to2999: '#991b1b',  // Dark Red
    above3000: '#7c2d12',        // Darkest Red
    unrated: '#64748b'           // Slate Gray
  };

  const labelMap: { [key: string]: string } = {
    below1000: '< 1000',
    range1000to1199: '1000-1199',
    range1200to1399: '1200-1399',
    range1400to1599: '1400-1599',
    range1600to1799: '1600-1799',
    range1800to1999: '1800-1999',
    range2000to2199: '2000-2199',
    range2200to2399: '2200-2399',
    range2400to2599: '2400-2599',
    range2600to2799: '2600-2799',
    range2800to2999: '2800-2999',
    above3000: '3000+',
    unrated: 'Unrated'
  };

  const data: Array<{name: string; value: number; color: string}> = [];

  Object.entries(ratingWiseCount).forEach(([key, value]) => {
    if (value && value > 0) {
      data.push({
        name: labelMap[key] || key,
        value: value as number,
        color: colorMap[key] || '#64748b'
      });
    }
  });

  return data;
};

// Enhanced tooltip component
const CustomTooltip = ({ active, payload, total }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percentage = ((data.value / total) * 100).toFixed(1);
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl backdrop-blur-sm">
        <p className="text-white font-semibold">{data.name}</p>
        <p className="text-cyan-400 text-sm">
          <span className="font-bold">{data.value}</span> problems
        </p>
        <p className="text-gray-300 text-sm">
          {percentage}% of total
        </p>
      </div>
    );
  }
  return null;
};

// Custom label function for better positioning
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.03) return null; // Don't show labels for very small slices
  
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
      className="drop-shadow-sm"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const RatingDistributionPieChart: React.FC<RatingDistributionPieChartProps> = ({ 
  ratingWiseCount, 
  totalSolved, 
  className = "" 
}) => {
  const chartData = prepareChartData(ratingWiseCount);

  if (chartData.length === 0) {
    return (
      <div className={`text-center text-gray-400 ${className}`}>
        <p>No rating data available</p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="text-center mb-4">
        <span className="text-lg font-semibold text-gray-200">Rating Distribution</span>
        <p className="text-sm text-gray-400 mt-1">Total: {totalSolved} problems</p>
      </div>
      
      <div className="h-80 sm:h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={120}
              innerRadius={0} // Changed to full pie instead of donut
              fill="#8884d8"
              dataKey="value"
              stroke="#1f2937"
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                />
              ))}
            </Pie>
            <Tooltip 
              content={<CustomTooltip total={totalSolved} />}
              cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
            />
            <Legend 
              wrapperStyle={{ 
                fontSize: '13px',
                paddingTop: '20px'
              }}
              iconType="circle"
              formatter={(value, entry: any) => 
                <span style={{ color: entry.color, fontWeight: 500 }}>
                  {value}
                </span>
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RatingDistributionPieChart;
