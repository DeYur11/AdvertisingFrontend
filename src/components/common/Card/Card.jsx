import './Card.css';

export default function Card({
                                 children,
                                 title,
                                 icon,
                                 actions,
                                 variant = 'default',
                                 className = '',
                                 onClick,
                                 hoverable = true
                             }) {
    return (
        <div
            className={`card ${variant} ${hoverable ? 'hoverable' : ''} ${className} ${onClick ? 'clickable' : ''}`}
            onClick={onClick}
        >
            {(title || actions) && (
                <div className="card-header">
                    {title && (
                        <div className="card-title">
                            {icon && <span className="card-icon">{icon}</span>}
                            <h3>{title}</h3>
                        </div>
                    )}
                    {actions && <div className="card-actions">{actions}</div>}
                </div>
            )}
            <div className="card-content">
                {children}
            </div>
        </div>
    );
}