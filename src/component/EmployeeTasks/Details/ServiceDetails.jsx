export default function ServiceDetails({ data }) {
    return (
        <>
            <p><strong>Назва:</strong> {data.serviceName}</p>
            <p><strong>Тип:</strong> {data.serviceType?.name}</p>
            <p><strong>Оціночна вартість:</strong> {data.estimateCost ?? "—"}</p>
            <p><strong>Тривалість:</strong> {data.duration ?? "—"}</p>
        </>
    );
}
