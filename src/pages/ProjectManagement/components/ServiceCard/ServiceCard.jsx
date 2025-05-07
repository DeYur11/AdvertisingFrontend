import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { GET_SERVICES_IN_PROGRESS_BY_PS } from "../../graphql/projects.gql";

import Button from "../../../../components/common/Button/Button";
import Card from "../../../../components/common/Card/Card";
import Badge from "../../../../components/common/Badge/Badge";
import ServiceInProgressItem from "../ServiceInProgressItem/ServiceInProgressItem";
import ServiceDetailsView from "../ServiceDetailsView/ServiceDetailsView";

export default function ServiceCard({ projectService, onOpenDetails }) {
    const [open, setOpen] = useState(false);
    const [showDetailsView, setShowDetailsView] = useState(false);
    const [fetchSIP, { data, loading }] = useLazyQuery(
        GET_SERVICES_IN_PROGRESS_BY_PS,
        { variables: { projectServiceId: projectService.id }, fetchPolicy: "cache-first" }
    );

    useEffect(() => { if (open) fetchSIP(); }, [open, fetchSIP]);

    const svc = projectService.service;
    const qty = projectService.amount ?? 1;
    const est = (svc.estimateCost * qty).toFixed(2);
    const sips = data?.servicesInProgressByProjectService ?? [];

    const handleViewDetails = (e) => {
        e.stopPropagation();
        onOpenDetails?.();
    };

    return (
        <>
            <Card className={`service-card ${open ? "expanded" : ""}`}
                  onClick={e => { e.stopPropagation(); setOpen(!open); }}>
                <div className="service-header">
                    <h5>{svc.serviceName}</h5>
                    <Badge size="small">{svc.serviceType?.name}</Badge>
                    <span className="ml-auto">{qty}× · est. ${est}</span>
                    <Button variant="outline" size="small"
                            onClick={handleViewDetails}>Details</Button>
                    <Button variant={open ? "primary" : "outline"} size="small"
                            icon={open ? "▲" : "▼"}
                            onClick={e => { e.stopPropagation(); setOpen(!open); }} />
                </div>

                {open && (
                    <>
                        {loading && <div className="loading-indicator">Loading orders…</div>}
                        {!loading && !sips.length && <div className="no-items-message">No orders.</div>}
                        {sips.map(sip => <ServiceInProgressItem key={sip.id} serviceInProgress={sip} />)}
                    </>
                )}
            </Card>


        </>
    );
}