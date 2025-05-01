import './Sidebar.css';

export default function Sidebar({ isOpen, onClose, title, children }) {
    return (
        <>
            {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

            <div className={`sidebar-panel ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h2>{title}</h2>
                    <button className="sidebar-close" onClick={onClose}>×</button>
                </div>
                <div className="sidebar-body">
                    {children}
                </div>
            </div>
        </>
    );
}
