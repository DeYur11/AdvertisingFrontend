import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { GET_PROJECT_SERVICES, GET_PROJECT_PAYMENTS } from "../../graphql/projects.gql";


import Button from "../../../../components/common/Button/Button";
import ServiceCard from "../ServiceCard/ServiceCard";
import Card from "../../../../components/common/Card/Card";
import Badge from "../../../../components/common/Badge/Badge";

export default function ProjectCard({ project, onEdit, onDelete }) {
    const [open, setOpen] = useState(false);
    const [fetchServices, { data, loading }] = useLazyQuery(
        GET_PROJECT_SERVICES,
        { variables: { projectId: project.id }, fetchPolicy: "cache-first" }
    );
    const payments = paymentData?.paymentsByProject ?? [];

    const handleEditPayment = (paymentId) => {
        console.log("Edit payment", paymentId);
        // todo: modal or navigation
    };

    const handleDeletePayment = (paymentId) => {
        console.log("Delete payment", paymentId);
        // todo: mutation
    };

    /* завантажуємо послуги лише при першому відкритті */
    useEffect(() => { if (open){
        fetchServices();
        fetchPayments()
    }  }, [open, fetchServices]);

    const services = data?.projectServicesByProject ?? [];

    const format = (d) => d ? new Date(d).toLocaleDateString() : "—";
    const money  = (v) => v != null ? `$${(+v).toFixed(2)}` : "—";
    const [fetchPayments, { data: paymentData, loading: loadingPayments }] = useLazyQuery(
        GET_PROJECT_PAYMENTS,
        { variables: { projectId: project.id }, fetchPolicy: "cache-first" }
    );

    const handleEdit = (e) => {
        e.stopPropagation();
        if (onEdit) {
            onEdit(project.id);
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(project.id);
        }
    };

    return (
        <Card className={`project-card ${open ? "expanded":""}`} onClick={()=>setOpen(!open)}>
            <div className="project-header">
                <div className="project-title">
                    <h2>{project.name}</h2>
                    {project.status && (
                        <Badge variant={
                            project.status.name.toLowerCase() === "completed" ? "success" :
                                project.status.name.toLowerCase() === "in progress" ? "primary" : "default"
                        }>{project.status.name}</Badge>
                    )}
                </div>

                <div className="project-meta">
                    <span>{project.client?.name}</span> ·
                    <span>{project.projectType?.name}</span> ·
                    <span>{project.manager ? `${project.manager.name} ${project.manager.surname}` : "—"}</span>
                </div>

                <div className="project-stats">
                    <span>{money(project.estimateCost)} est.</span>
                    <span>{money(project.cost)} act.</span>
                </div>

                <div className="project-actions">
                    <Button
                        variant="outline"
                        size="small"
                        icon="✏️"
                        onClick={handleEdit}
                    >
                        Edit
                    </Button>

                    <Button
                        variant="danger"
                        size="small"
                        icon="🗑️"
                        onClick={handleDelete}
                    >
                        Delete
                    </Button>

                    <Button
                        variant={open ? "primary":"outline"}
                        icon={open ? "▲":"▼"}
                        size="small"
                        onClick={(e)=>{e.stopPropagation(); setOpen(!open);}}
                    >
                        {open ? "Collapse":"Expand"}
                    </Button>
                </div>
            </div>

            {open && (
                <>
                    {project.description && (
                        <p className="project-description">{project.description}</p>
                    )}

                    <h4 className="mt-2">Services</h4>
                    {loading && <div className="loading-indicator">Loading services...</div>}
                    {!loading && !services.length && <div className="no-items-message">No services.</div>}
                    {services.map(ps => <ServiceCard key={ps.id} projectService={ps} />)}

                    <h4 className="mt-3">Payments</h4>
                    {loadingPayments && <div className="loading-indicator">Loading payments...</div>}
                    {!loadingPayments && !payments.length && <div className="no-items-message">No payments.</div>}
                    {payments.map(payment => (
                        <Card key={payment.id} className="payment-card">
                            <div className="payment-header">
                                <span>{money(payment.amount)}</span>
                                <span>{format(payment.paymentDate)}</span>
                            </div>
                            <div className="payment-description">{payment.description || "No description"}</div>
                            <div className="payment-actions">
                                <Button size="small" variant="outline" onClick={() => handleEditPayment(payment.id)}>Edit</Button>
                                <Button size="small" variant="danger" onClick={() => handleDeletePayment(payment.id)}>Delete</Button>
                            </div>
                        </Card>
                    ))}
                </>
            )}
        </Card>
    );
}