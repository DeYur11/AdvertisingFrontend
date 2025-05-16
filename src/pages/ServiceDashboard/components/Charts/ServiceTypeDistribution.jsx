// src/pages/ServiceDashboard/components/Charts/ServiceTypeDistribution.jsx
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import "./Charts.css";

export default function ServiceTypeDistribution({ data = [] }) {
    // Кольори для діаграми
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

    if (!data || data.length === 0) {
        return (
            <div className="chart-placeholder">
                <p>Немає даних для відображення типів послуг</p>
            </div>
        );
    }

    // Кастомний tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="label">{payload[0].name}: {payload[0].value} послуг</p>
                    <p className="percent">
                        {((payload[0].value / data.reduce((sum, entry) => sum + entry.value, 0)) * 100).toFixed(1)}% від загальної кількості
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="chart-wrapper">
            <h3 className="chart-title">Розподіл за типами послуг</h3>
            <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend layout="vertical" align="right" verticalAlign="middle" />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
