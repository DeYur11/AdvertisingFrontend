import "./InfoRow.css";

/**
 * icon  – будь-який JSX (може бути емодзі або <svg>)
 * label – підпис
 * value – значення
 * gap   – відступ між елементами (px | rem | className)
 */
export default function InfoRow({
                                    icon,
                                    label,
                                    value,
                                    gap = 6,
                                    className = "",
                                    ...props
                                }) {
    return (
        <div className={`info-row ${className}`} style={{ gap }} {...props}>
            {icon && <span className="info-icon">{icon}</span>}
            <span className="info-label">{label}</span>
            <span className="info-value">{value}</span>
        </div>
    );
}
