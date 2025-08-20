'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { RATING_BANDS } from '@/constants/platform-constants';

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

const prepareChartData = (ratingWiseCount: RatingWiseCount) => {
  const data: Array<{name: string; value: number; color: string}> = [];

  Object.entries(ratingWiseCount).forEach(([key, value]) => {
    if (value && value > 0) {
      const band = RATING_BANDS[key as keyof typeof RATING_BANDS];
      data.push({
        name: band.label,
        value: value as number,
        color: band.color
      });
    }
  });

  return data;
};

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

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.03) return null;
  
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
              innerRadius={0}
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
