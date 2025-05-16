// src/pages/ServiceDashboard/components/ChartsContainer/ChartsContainer.jsx
import { useState } from "react";
import Card from "../../../../components/common/Card/Card";
import Button from "../../../../components/common/Button/Button";
import ServiceTypeDistribution from "../Charts/ServiceTypeDistribution";
import CostDistribution from "../Charts/CostDistribution";
import CostByTypeChart from "../Charts/CostByTypeChart";
import "./ChartsContainer.css";

export default function ChartsContainer({ services = [], filteredServices = [] }) {
    const [activeTab, setActiveTab] = useState("distribution");

    // Підготовка даних для різних графіків
    const prepareServiceTypeData = (data) => {
        const typeCount = {};

        data.forEach(service => {
            const typeName = service.serviceType?.name || "Невідомо";
            typeCount[typeName] = (typeCount[typeName] || 0) + 1;
        });

        return Object.entries(typeCount).map(([name, count]) => ({
            name,
            value: count
        }));
    };

    const prepareCostBucketData = (data) => {
        const servicesWithCost = data.filter(service =>
            service.estimateCost !== null && service.estimateCost !== undefined
        );

        if (servicesWithCost.length === 0) {
            return [];
        }

        const costs = servicesWithCost.map(s => parseFloat(s.estimateCost));
        const minCost = Math.min(...costs);
        const maxCost = Math.max(...costs);

        const numBuckets = 5;
        const bucketSize = (maxCost - minCost) / numBuckets || 1;
        const buckets = Array(numBuckets).fill(0);

        servicesWithCost.forEach(service => {
            const cost = parseFloat(service.estimateCost);
            const bucketIndex = Math.min(
                Math.floor((cost - minCost) / bucketSize),
                numBuckets - 1
            );
            buckets[bucketIndex]++;
        });

        return buckets.map((count, index) => {
            const lowerBound = minCost + (bucketSize * index);
            const upperBound = minCost + (bucketSize * (index + 1));
            return {
                name: `${lowerBound.toFixed(0)}₴ – ${upperBound.toFixed(0)}₴`,
                value: count
            };
        });
    };

    const prepareCostByTypeData = (data) => {
        const costByType = {};
        const countByType = {};

        data.forEach(service => {
            if (service.estimateCost !== null && service.estimateCost !== undefined) {
                const typeName = service.serviceType?.name || "Невідомо";
                const cost = parseFloat(service.estimateCost);

                costByType[typeName] = (costByType[typeName] || 0) + cost;
                countByType[typeName] = (countByType[typeName] || 0) + 1;
            }
        });

        return Object.entries(costByType).map(([name, totalCost]) => ({
            name,
            totalCost,
            averageCost: totalCost / countByType[name],
            count: countByType[name]
        }));
    };

    // Готуємо дані для графіків
    const serviceTypeData = prepareServiceTypeData(filteredServices);
    const costBucketData = prepareCostBucketData(filteredServices);
    const costByTypeData = prepareCostByTypeData(filteredServices);

    return (
        <Card className="charts-container">
            <div className="charts-header">
                <h2>Аналітика по послугах</h2>
                <div className="chart-tabs">
                    <Button
                        variant={activeTab === "distribution" ? "primary" : "outline"}
                        size="small"
                        onClick={() => setActiveTab("distribution")}
                    >
                        Розподіл за типами
                    </Button>
                    <Button
                        variant={activeTab === "cost" ? "primary" : "outline"}
                        size="small"
                        onClick={() => setActiveTab("cost")}
                    >
                        Розподіл за вартістю
                    </Button>
                    <Button
                        variant={activeTab === "costByType" ? "primary" : "outline"}
                        size="small"
                        onClick={() => setActiveTab("costByType")}
                    >
                        Вартість по типах
                    </Button>
                </div>
            </div>

            <div className="chart-content">
                {activeTab === "distribution" && (
                    <ServiceTypeDistribution data={serviceTypeData} />
                )}
                {activeTab === "cost" && (
                    <CostDistribution data={costBucketData} />
                )}
                {activeTab === "costByType" && (
                    <CostByTypeChart data={costByTypeData} />
                )}
            </div>
        </Card>
    );
}
