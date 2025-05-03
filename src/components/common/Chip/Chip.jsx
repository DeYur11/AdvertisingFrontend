import "./Chip.css";

/**
 * variant: 'default' | 'primary' | 'success' | 'warning' | 'danger'
 * size   : 'sm' | 'md'
 */
export default function Chip({
                                 children,
                                 variant = "default",
                                 size = "md",
                                 className = "",
                                 ...props
                             }) {
    return (
        <span className={`chip ${variant} ${size} ${className}`} {...props}>
      {children}
    </span>
    );
}
