import './Badge.css';

export default function Badge({
                                  children,
                                  variant = 'default',
                                  size = 'medium',
                                  className = ''
                              }) {
    return (
        <span className={`badge ${variant} ${size} ${className}`}>
      {children}
    </span>
    );
}