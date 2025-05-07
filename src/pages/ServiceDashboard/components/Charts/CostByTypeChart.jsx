// src/pages/ServiceDashboard/components/Charts/CostByTypeChart.jsx
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import "./Charts.css";

export default function CostByTypeChart({ data = [] }) {
    if (!data || data.length === 0) {
        return (
            <div className="chart-placeholder">
                <p>No cost by type data available to display</p>
            </div>
        );
    }

    // Format data to show both total and average cost
    const formattedData = data.map(item => ({
        name: item.name,
        totalCost: Math.round(item.totalCost * 100) / 100,
        averageCost: Math.round(item.averageCost * 100) / 100
    }));

    // Custom tooltip content
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="label">{label}</p>
                    <p className="info">Total Cost: ${payload[0].value.toFixed(2)}</p>
                    <p className="info">Average Cost: ${payload[1].value.toFixed(2)}</p>
                </div>
            );
        }
        return null;
    };

    // Format currency for axis ticks
    const formatCurrency = (value) => {
        return `$${value}`;
    };

    return (
        <div className="chart-wrapper">
            <h3 className="chart-title">Cost by Service Type</h3>
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ bottom: 0 }} />
                    <Bar dataKey="totalCost" name="Total Cost" fill="#3b82f6" />
                    <Bar dataKey="averageCost" name="Average Cost" fill="#10b981" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}