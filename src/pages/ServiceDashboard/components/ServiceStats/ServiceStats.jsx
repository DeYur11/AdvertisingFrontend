// src/pages/ServiceDashboard/components/ServiceStats/ServiceStats.jsx
import Card from "../../../../components/common/Card/Card";
import "./ServiceStats.css";

export default function ServiceStats({ services = [] }) {
    // Calculate statistics
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

        // Filter out services with no cost defined
        const servicesWithCost = services.filter(service => service.estimateCost !== null && service.estimateCost !== undefined);

        // Extract costs as numbers and sort them
        const costs = servicesWithCost.map(service => parseFloat(service.estimateCost)).sort((a, b) => a - b);

        // Calculate total cost
        const totalCost = costs.reduce((sum, cost) => sum + cost, 0);

        // Calculate average cost
        const averageCost = costs.length ? totalCost / costs.length : 0;

        // Calculate median cost
        let medianCost = 0;
        if (costs.length) {
            const middle = Math.floor(costs.length / 2);
            medianCost = costs.length % 2 === 0
                ? (costs[middle - 1] + costs[middle]) / 2
                : costs[middle];
        }

        // Find min and max costs
        const minCost = costs.length ? costs[0] : 0;
        const maxCost = costs.length ? costs[costs.length - 1] : 0;

        // Count unique service types
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

    // Format currency for display
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <Card className="service-stats-card">
            <h2>Service Statistics</h2>

            <div className="stats-grid">
                <div className="stat-item">
                    <span className="stat-value">{stats.totalServices}</span>
                    <span className="stat-label">Total Services</span>
                </div>

                <div className="stat-item">
                    <span className="stat-value">{stats.uniqueServiceTypes}</span>
                    <span className="stat-label">Service Types</span>
                </div>

                <div className="stat-item">
                    <span className="stat-value">{formatCurrency(stats.totalCost)}</span>
                    <span className="stat-label">Total Est. Cost</span>
                </div>

                <div className="stat-item">
                    <span className="stat-value">{formatCurrency(stats.averageCost)}</span>
                    <span className="stat-label">Average Cost</span>
                </div>

                <div className="stat-item">
                    <span className="stat-value">{formatCurrency(stats.medianCost)}</span>
                    <span className="stat-label">Median Cost</span>
                </div>

                <div className="stat-item">
                    <span className="stat-value">{formatCurrency(stats.minCost)} - {formatCurrency(stats.maxCost)}</span>
                    <span className="stat-label">Cost Range</span>
                </div>
            </div>
        </Card>
    );
}