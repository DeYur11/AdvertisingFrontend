// ServiceCard.jsx
import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { GET_SERVICES_IN_PROGRESS_BY_PS } from "../../graphql/projects.gql";
import {
    Card,
    CardHeader,
    CardContent,
    Collapse,
    Typography,
    Button,
    Badge
} from "../../../../components/common";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ServiceCard({ projectService }) {
    const [open, setOpen] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [fetchSIPs, { data, loading }] = useLazyQuery(GET_SERVICES_IN_PROGRESS_BY_PS, {
        variables: { projectServiceId: projectService.id },
        fetchPolicy: "cache-first"
    });

    useEffect(() => {
        if (open && !loaded) {
            fetchSIPs();
            setLoaded(true);
        }
    }, [open, loaded, fetchSIPs]);

    const sips = data?.servicesInProgressByProjectService ?? [];
    const svc = projectService.service;
    const qty = projectService.amount ?? 1;
    const estCost = svc.estimateCost * qty;
    const actCost = sips.reduce((sum, s) => sum + (+s.cost || 0), 0);

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row justify-between items-start gap-4 cursor-pointer" onClick={() => setOpen(!open)}>
                <div>
                    <Typography variant="h6">{svc.serviceName}</Typography>
                    <Typography variant="muted" className="text-sm">
                        Estimate: ₴{svc.estimateCost} × {qty} = <strong>₴{estCost}</strong><br />
                        Actual: <strong>₴{actCost}</strong>
                    </Typography>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0">
                    {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </Button>
            </CardHeader>

            <Collapse in={open}>
                <CardContent>
                    {loading && <Typography variant="muted">Loading...</Typography>}
                    {!loading && sips.length === 0 && (
                        <Typography variant="muted">No executions found.</Typography>
                    )}
                    {!loading && sips.length > 0 && (
                        <div className="space-y-2">
                            {sips.map((sip) => (
                                <div
                                    key={sip.id}
                                    className="flex items-center justify-between rounded-md border p-2"
                                >
                                    <Badge variant="outline">{sip.status.name}</Badge>
                                    <Typography className="font-medium">₴{sip.cost}</Typography>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Collapse>
        </Card>
    );
}
