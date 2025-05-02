import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import {GET_SERVICES_IN_PROGRESS_BY_PS} from "../../graphql/projects.gql";

import Button from "../../../../components/common/Button/Button";
import Card from "../../../../components/common/Card/Card";
import Badge from "../../../../components/common/Badge/Badge";
import ServiceOrderCard from "../ServiceOrderCard/ServiceOrderCard";


export default function ServiceCard({ projectService }) {
    const [open, setOpen] = useState(false);
    const [fetchSIP, { data, loading }] = useLazyQuery(
        GET_SERVICES_IN_PROGRESS_BY_PS,
        { variables:{ projectServiceId: projectService.id }, fetchPolicy:"cache-first" }
    );
    useEffect(()=>{ if(open) fetchSIP(); },[open,fetchSIP]);

    const sips = data?.servicesInProgressByProjectService ?? [];
    const svc  = projectService.service;
    const qty  = projectService.amount ?? 1;
    const est  = (svc.estimateCost*qty).toFixed(2);

    return (
        <Card className={`service-card ${open?"expanded":""}`} onClick={(e)=>{e.stopPropagation(); setOpen(!open);}}>
            <div className="service-header">
                <h5>{svc.serviceName}</h5>
                <Badge size="small">{svc.serviceType?.name}</Badge>
                <span className="ml-auto">{qty}× · est. ${est}</span>
                <Button
                    variant={open?"primary":"outline"} size="small"
                    icon={open?"▲":"▼"} onClick={(e)=>{e.stopPropagation(); setOpen(!open);}}
                />
            </div>

            {open && (
                <>
                    {loading && <div className="loading-indicator">Loading orders...</div>}
                    {!loading && !sips.length && <div className="no-items-message">No orders.</div>}
                    {sips.map(sip => <ServiceOrderCard key={sip.id} sip={sip} />)}
                </>
            )}
        </Card>
    );
}
