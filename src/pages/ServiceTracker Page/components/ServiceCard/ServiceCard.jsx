// src/pages/ServiceTracker Page/components/ServiceCard/ServiceCard.jsx
import Card from "../../../../components/common/Card/Card";
import Badge from "../../../../components/common/Badge/Badge";
import Button from "../../../../components/common/Button/Button";
import { calculateProgress, getMissingCount } from "../../utils/serviceUtils";
import "./ServiceCard.css";

export default function ServiceCard({ service, onCreateService, onViewDetails }) {
    const handleCreateClick = (e) => {
        e.stopPropagation(); // Prevents the card click from triggering
        onCreateService(service);
    };

    const handleCardClick = () => {
        onViewDetails(service);
    };

    const progress = calculateProgress(service);
    const missingCount = getMissingCount(service);

    return (
        <Card
            className={`service-card ${service.servicesInProgress.length < service.amount ? 'incomplete' : 'complete'}`}
            onClick={handleCardClick}
        >
            <div className="service-header">
                <h3 className="service-name">{service.service.serviceName}</h3>
                <Badge
                    variant={service.servicesInProgress.length < service.amount ? 'warning' : 'success'}
                >
                    {service.servicesInProgress.length} / {service.amount}
                </Badge>
            </div>

            <div className="service-project">
                <span className="label">Project:</span>
                <span className="value">{service.project.name}</span>
            </div>

            <div className="service-client">
                <span className="label">Client:</span>
                <span className="value">{service.project.client.name}</span>
            </div>

            <div className="service-type">
                <span className="label">Type:</span>
                <span className="value">{service.service.serviceType.name}</span>
            </div>

            <div className="service-cost">
                <span className="label">Est. Cost:</span>
                <span className="value">${parseFloat(service.service.estimateCost).toFixed(2)}</span>
            </div>

            <div className="progress-container">
                <div className="progress-label">
                    <span>Implementation Progress</span>
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
                    >
                        Create Implementation
                    </Button>
                )}
                <Button
                    variant="outline"
                    size="small"
                    onClick={handleCardClick}
                >
                    View Details
                </Button>
            </div>
        </Card>
    );
}