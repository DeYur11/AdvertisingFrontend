export default function ProjectServiceCard({ projectService }) {
    const { servicesInProgress = [] } = projectService;

    return (
        <div className="project-service-card">
            {servicesInProgress.length === 0 ? (
                <div className="text-muted">⛔ Немає виконань</div>
            ) : (
                servicesInProgress.map((sip) => (
                    <div key={sip.id} className="sip-entry">
                        <div><strong>📌 Статус:</strong> {sip.status?.name || 'Невідомо'}</div>
                        <div><strong>📅 Початок:</strong> {sip.startDate}</div>
                        <div><strong>🏁 Завершення:</strong> {sip.endDate || '—'}</div>
                        <div><strong>💰 Вартість:</strong> {sip.cost ?? '—'} грн</div>
                        <div><strong>📋 Кількість завдань:</strong> {sip.tasks?.length || 0}</div>
                    </div>
                ))
            )}
        </div>
    );
}
