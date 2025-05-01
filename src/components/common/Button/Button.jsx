import './Button.css';

export default function Button({
                                   children,
                                   variant = 'primary',
                                   size = 'medium',
                                   type = 'button',
                                   onClick,
                                   disabled,
                                   icon,
                                   className = '',
                                   ...props
                               }) {
    return (
        <button
            type={type}
            className={`button ${variant} ${size} ${className} ${icon ? 'with-icon' : ''}`}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {icon && <span className="button-icon">{icon}</span>}
            {children}
        </button>
    );
}