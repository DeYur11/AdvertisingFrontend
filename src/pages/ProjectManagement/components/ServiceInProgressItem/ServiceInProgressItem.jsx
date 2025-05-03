import Card   from "../../../../components/common/Card/Card";
import Chip   from "../../../../components/common/Chip/Chip";
import InfoRow from "../../../../components/common/InfoRow/InfoRow";
import {
    CalendarMonth, MonetizationOn, ListAlt
} from "@mui/icons-material";

export default function ServiceInProgressItem({ serviceInProgress }) {
    /* підготовка даних – як у попередньому варіанті */
    const status = serviceInProgress.status?.name?.toLowerCase() || "unknown";
    const statusChip = (
        <Chip variant={
            status==="completed"   ? "success":
                status==="in progress" ? "primary":
                    status==="pending"     ? "warning":"default"}
              size="sm"
        >
            {serviceInProgress.status?.name || "Unknown"}
        </Chip>
    );

    /* рендер */
    return (
        <Card variant="outlined" size="md" className={`sip-card status-${status}`}>
            <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:8}}>
                {statusChip}
                <Chip size="sm">{serviceInProgress.projectService?.service?.serviceName ?? "—"}</Chip>
            </div>

            <InfoRow
                icon={<CalendarMonth fontSize="small"/>}
                label="Start – End:"
                value={`${new Date(serviceInProgress.startDate).toLocaleDateString()} — ${
                    serviceInProgress.endDate
                        ? new Date(serviceInProgress.endDate).toLocaleDateString()
                        : "—"}`}
            />

            <InfoRow
                icon={<MonetizationOn fontSize="small"/>}
                label="Cost:"
                value={
                    serviceInProgress.cost!=null
                        ? `$${(+serviceInProgress.cost).toFixed(2)}`
                        : "—"}
            />

            <InfoRow
                icon={<ListAlt fontSize="small"/>}
                label="Tasks:"
                value={serviceInProgress.tasks?.length ?? 0}
            />
        </Card>
    );
}
