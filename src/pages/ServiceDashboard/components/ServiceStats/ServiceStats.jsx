// src/pages/ServiceDashboard/components/ServiceStats/ServiceStats.jsx
import Card from "../../../../components/common/Card/Card";
import "./ServiceStats.css";

export default function ServiceStats({ services = [] }) {
    // Обчислення статистики
    const calculateStats = () => {
        if (!services.length) {
            return {
                totalServices: 0,
                totalCost: 0,
                averageCost: 0,
                medianCost: 0,
                minCost: 0,
                maxCost: 0,
                uniqueServiceTypes: 0
            };
        }

        // Фільтруємо послуги, у яких визначена вартість
        const servicesWithCost = services.filter(service => service.estimateCost !== null && service.estimateCost !== undefined);

        // Витягуємо вартості як числа і сортуємо їх
        const costs = servicesWithCost.map(service => parseFloat(service.estimateCost)).sort((a, b) => a - b);

        // Загальна вартість
        const totalCost = costs.reduce((sum, cost) => sum + cost, 0);

        // Середня вартість
        const averageCost = costs.length ? totalCost / costs.length : 0;

        // Медіанна вартість
        let medianCost = 0;
        if (costs.length) {
            const middle = Math.floor(costs.length / 2);
            medianCost = costs.length % 2 === 0
                ? (costs[middle - 1] + costs[middle]) / 2
                : costs[middle];
        }

        // Мінімальна та максимальна вартість
        const minCost = costs.length ? costs[0] : 0;
        const maxCost = costs.length ? costs[costs.length - 1] : 0;

        // Кількість унікальних типів послуг
        const uniqueTypes = new Set(services.map(service => service.serviceType?.id).filter(Boolean));

        return {
            totalServices: services.length,
            totalCost,
            averageCost,
            medianCost,
            minCost,
            maxCost,
            uniqueServiceTypes: uniqueTypes.size
        };
    };

    const stats = calculateStats();

    // Форматування валюти для відображення
    const formatCurrency = (amount) => {
        return `${parseFloat(amount).toFixed(2)}₴`;
    };

    return (
        <Card className="service-stats-card">
            <h2>Статистика по послугах</h2>

            <div className="stats-grid">
                <div className="stat-item">
                    <span className="stat-value">{stats.totalServices}</span>
                    <span className="stat-label">Всього послуг</span>
                </div>

                <div className="stat-item">
                    <span className="stat-value">{stats.uniqueServiceTypes}</span>
                    <span className="stat-label">Типів послуг</span>
                </div>

                <div className="stat-item">
                    <span className="stat-value">{formatCurrency(stats.totalCost)}</span>
                    <span className="stat-label">Сумарна вартість</span>
                </div>

                <div className="stat-item">
                    <span className="stat-value">{formatCurrency(stats.averageCost)}</span>
                    <span className="stat-label">Середня вартість</span>
                </div>

                <div className="stat-item">
                    <span className="stat-value">{formatCurrency(stats.medianCost)}</span>
                    <span className="stat-label">Медіанна вартість</span>
                </div>

                <div className="stat-item">
                    <span className="stat-value">{formatCurrency(stats.minCost)} – {formatCurrency(stats.maxCost)}</span>
                    <span className="stat-label">Діапазон вартості</span>
                </div>
            </div>
        </Card>
    );
}
