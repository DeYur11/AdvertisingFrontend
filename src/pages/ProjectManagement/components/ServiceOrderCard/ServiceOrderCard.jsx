import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import {GET_SERVICE_TASKS} from "../../graphql/projects.gql";
import Card from "../../../../components/common/Card/Card";
import Badge from "../../../../components/common/Badge/Badge";
export default function ServiceOrderCard({ sip }) {
    const [open, setOpen] = useState(false);
    const [fetchTasks, { data, loading }] = useLazyQuery(
        GET_SERVICE_TASKS,
        { variables:{ serviceInProgressId: sip.id }, fetchPolicy:"cache-first" }
    );
    useEffect(()=>{ if(open) fetchTasks(); },[open,fetchTasks]);

    const tasks = data?.serviceInProgress?.tasks ?? [];
    const money = sip.cost != null ? `$${(+sip.cost).toFixed(2)}` : "—";
    const fmt   = (d)=>d?new Date(d).toLocaleDateString():"—";

    return (
        <Card className={`service-in-progress-card ${open?"selected":""}`} onClick={(e)=>{e.stopPropagation(); setOpen(!open);}}>
            <div className="sip-header">
                <Badge variant={
                    sip.status.name.toLowerCase()==="completed" ? "success" :
                        sip.status.name.toLowerCase()==="in progress" ? "primary" : "default"
                }>{sip.status.name}</Badge>
                <span>{fmt(sip.startDate)} → {fmt(sip.endDate)}</span>
                <span className="ml-auto">{money}</span>
            </div>

            {open && (
                <>
                    {loading && <div className="loading-indicator">Loading tasks...</div>}
                    {!loading && !tasks.length && <div className="no-items-message">No tasks.</div>}
                    {tasks.map(t=>(
                        <div key={t.id} className="task-item">
                            <span>{t.name}</span>
                            <Badge size="small" variant={
                                t.taskStatus.name.toLowerCase()==="completed" ? "success" :
                                    t.taskStatus.name.toLowerCase()==="in progress" ? "primary" : "default"
                            }>{t.taskStatus.name}</Badge>
                        </div>
                    ))}
                </>
            )}
        </Card>
    );
}
