import { Outlet } from 'react-router-dom';
import Header from './Header/Header';
import './Layout.css';

export default function Layout() {
    return (
        <div className="app-layout">
            <Header />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}