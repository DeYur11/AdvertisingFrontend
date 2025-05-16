// src/pages/ServiceDashboard/components/Charts/CostDistribution.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import "./Charts.css";

export default function CostDistribution({ data = [] }) {
    if (!data || data.length === 0) {
        return (
            <div className="chart-placeholder">
                <p>Немає даних для відображення розподілу за вартістю</p>
            </div>
        );
    }

    // Кастомний tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="label">{label}</p>
                    <p className="info">{payload[0].value} послуг</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="chart-wrapper">
            <h3 className="chart-title">Розподіл послуг за вартістю</h3>
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
                    <Bar dataKey="value" name="Кількість послуг" fill="#3b82f6" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
