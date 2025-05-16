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
                <p>Немає даних для відображення вартості по типах</p>
            </div>
        );
    }

    // Форматуємо дані для відображення як загальної, так і середньої вартості
    const formattedData = data.map(item => ({
        name: item.name,
        totalCost: Math.round(item.totalCost * 100) / 100,
        averageCost: Math.round(item.averageCost * 100) / 100
    }));

    // Кастомний tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="label">{label}</p>
                    <p className="info">Загальна вартість: {payload[0] ? `${payload[0].value.toFixed(2)}₴` : "—"}</p>
                    <p className="info">Середня вартість: {payload[1] ? `${payload[1].value.toFixed(2)}₴` : "—"}</p>
                </div>
            );
        }
        return null;
    };

    // Форматування валюти для підписів осі
    const formatCurrency = (value) => {
        return `${value}₴`;
    };

    return (
        <div className="chart-wrapper">
            <h3 className="chart-title">Вартість за типами послуг</h3>
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
                    <Bar dataKey="totalCost" name="Загальна вартість" fill="#3b82f6" />
                    <Bar dataKey="averageCost" name="Середня вартість" fill="#10b981" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
