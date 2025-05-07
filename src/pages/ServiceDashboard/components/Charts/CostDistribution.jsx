// src/pages/ServiceDashboard/components/Charts/CostDistribution.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import "./Charts.css";

export default function CostDistribution({ data = [] }) {
    if (!data || data.length === 0) {
        return (
            <div className="chart-placeholder">
                <p>No cost distribution data available to display</p>
            </div>
        );
    }

    // Custom tooltip content
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="label">{label}</p>
                    <p className="info">{payload[0].value} services</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="chart-wrapper">
            <h3 className="chart-title">Service Cost Distribution</h3>
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Number of Services" fill="#3b82f6" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}