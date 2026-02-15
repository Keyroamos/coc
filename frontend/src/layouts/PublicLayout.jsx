import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
    return (
        <main className="min-h-screen">
            <Outlet />
        </main>
    );
};

export default PublicLayout;
