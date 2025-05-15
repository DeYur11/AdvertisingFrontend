// src/pages/ServiceTracker Page/components/ServiceCard/ServiceCard.jsx
import React from "react";
import Card from "../../../../components/common/Card/Card";
import Badge from "../../../../components/common/Badge/Badge";
import Button from "../../../../components/common/Button/Button";
import LockIcon from '@mui/icons-material/Lock';
import { isProjectLocked } from "../../utils/projectDateUtils";
import { calculateProgress, getMissingCount } from "../../utils/serviceUtils";
import "./ServiceCard.css";

const uk = {
    projectLabel: "Проєкт:",
    clientLabel: "Клієнт:",
    typeLabel: "Тип:",
    costLabel: "Орієнтовна вартість:",
    progressLabel: "Відсоток створених імплементацій",
    createImplementation: "Створити реалізацію",
    viewDetails: "Переглянути деталі",
    projectLocked: "Проект заблоковано"
};

export default function ServiceCard({ service, onCreateService, onViewDetails }) {
    // Check if the project is locked (ended more than 30 days ago)
    const { isLocked } = isProjectLocked(service.project);

    const handleCreateClick = (e) => {
        e.stopPropagation();
        onCreateService(service);
    };

    const handleCardClick = () => {
        onViewDetails(service);
    };

    const progress = calculateProgress(service);
    const missingCount = getMissingCount(service);

    return (
        <Card
            className={`service-card ${
                service.servicesInProgress.length < service.amount ? "incomplete" : "complete"
            } ${isLocked ? "locked" : ""}`}
            onClick={handleCardClick}
        >
            <div className="service-header">
                <h3 className="service-name">{service.service.serviceName}</h3>
                <div className="service-badges">
                    <Badge
                        variant={service.servicesInProgress.length < service.amount ? "warning" : "success"}
                    >
                        {service.servicesInProgress.length} / {service.amount}
                    </Badge>

                    {isLocked && (
                        <Badge variant="danger" className="locked-badge">
                            <LockIcon fontSize="small" /> {uk.projectLocked}
                        </Badge>
                    )}
                </div>
            </div>

            <div className="service-project">
                <span className="label">{uk.projectLabel}</span>
                <span className="value">{service.project.name}</span>
            </div>

            <div className="service-client">
                <span className="label">{uk.clientLabel}</span>
                <span className="value">{service.project.client.name}</span>
            </div>

            <div className="service-type">
                <span className="label">{uk.typeLabel}</span>
                <span className="value">{service.service.serviceType.name}</span>
            </div>

            <div className="service-cost">
                <span className="label">{uk.costLabel}</span>
                <span className="value">
                    ${parseFloat(service.service.estimateCost).toFixed(2)}
                </span>
            </div>

            <div className="progress-container">
                <div className="progress-label">
                    <span>{uk.progressLabel}</span>
                    <span>{progress}%</span>
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="service-actions">
                {missingCount > 0 && (
                    <Button
                        variant="primary"
                        size="small"
                        onClick={handleCreateClick}
                        disabled={isLocked}
                    >
                        {uk.createImplementation}
                    </Button>
                )}
                <Button variant="outline" size="small" onClick={handleCardClick}>
                    {uk.viewDetails}
                </Button>
            </div>
        </Card>
    );
}