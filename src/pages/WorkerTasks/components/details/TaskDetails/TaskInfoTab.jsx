// src/pages/ServiceTrackerPage/components/TaskInfoTab/TaskInfoTab.jsx
import React from "react";
import Card from "../../../../../components/common/Card/Card";
import Badge from "../../../../../components/common/Badge/Badge";

const uk = {
    descriptionTitle: "Опис",
    detailsTitle: "Деталі",
    datesTitle: "Дати",
    priorityLabel: "Пріоритет:",
    valueLabel: "Вартість:",
    startLabel: "Початок:",
    deadlineLabel: "Термін:",
    endLabel: "Завершення:",
    unknownStatus: "Невідомо",
    status: {
        completed: "Виконано",
        "in progress": "В процесі",
        pending: "В очікуванні",
    },
};

export default function TaskInfoTab({ data }) {
    const formatDate = (d) =>
        d ? new Date(d).toLocaleDateString("uk-UA") : "—";

    const priority = parseInt(data.priority || 0, 10);
    const priorityClass =
        priority >= 8
            ? "priority-high"
            : priority >= 4
                ? "priority-medium"
                : "priority-low";

    const statusKey = data.taskStatus?.name?.toLowerCase() || "";
    const badgeText = uk.status[statusKey] || uk.unknownStatus;

    const badgeVariant =
        statusKey === "completed"
            ? "success"
            : statusKey === "in progress"
                ? "primary"
                : statusKey === "pending"
                    ? "danger"
                    : "default";

    return (
        <Card>
            <div className="flex items-center justify-between mb-2">
                <h2>{data.name}</h2>
                <Badge variant={badgeVariant}>
                    {badgeText}
                </Badge>
            </div>

            {data.description && (
                <div className="mb-2">
                    <h3>{uk.descriptionTitle}</h3>
                    <p>{data.description}</p>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h4>{uk.detailsTitle}</h4>
                    <p>
                        {uk.priorityLabel}{" "}
                        <Badge className={priorityClass}>
                            {data.priority || "—"}
                        </Badge>
                    </p>
                    <p>
                        {uk.valueLabel}{" "}
                        {data.value ? `$${data.value}` : "—"}
                    </p>
                </div>
                <div>
                    <h4>{uk.datesTitle}</h4>
                    <p>
                        {uk.startLabel} {formatDate(data.startDate)}
                    </p>
                    <p>
                        {uk.deadlineLabel} {formatDate(data.deadline)}
                    </p>
                    {data.endDate && (
                        <p>
                            {uk.endLabel} {formatDate(data.endDate)}
                        </p>
                    )}
                </div>
            </div>
        </Card>
    );
}
