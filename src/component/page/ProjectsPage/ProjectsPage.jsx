import { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import ProjectCard from './ProjectCard';
import NewProjectForm from './NewProjectForm';
import Sidebar from './Sidebar';
import './ProjectsPage.css';

const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      name
      startDate
      estimateCost
      projectType { name }
      status { name }
      client { name }
      manager { name surname }
    }
  }
`;

const GET_CLIENTS = gql`
  query GetClients {
    clients {
      id
      name
    }
  }
`;

const GET_PROJECT_TYPES = gql`
  query GetProjectTypes {
    projectTypes {
      id
      name
    }
  }
`;

const GET_MANAGERS = gql`
  query GetManagers {
    workers {
      id
      name
      surname
    }
  }
`;

export default function ProjectsPage() {
    const { data: projectsData, loading, error, refetch } = useQuery(GET_PROJECTS);
    const { data: clientsData } = useQuery(GET_CLIENTS);
    const { data: projectTypesData } = useQuery(GET_PROJECT_TYPES);
    const { data: managersData } = useQuery(GET_MANAGERS);

    const clients = clientsData?.clients.map(client => ({
        value: client.id,
        label: client.name
    }));

    const projectTypes = projectTypesData?.projectTypes.map(type => ({
        value: type.id,
        label: type.name
    }));

    const managers = managersData?.workers.map(worker => ({
        value: worker.id,
        label: `${worker.name} ${worker.surname}`
    }));

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [sidebarContent, setSidebarContent] = useState(null);
    const [sidebarTitle, setSidebarTitle] = useState('');

    const openCreateProject = () => {
        setSidebarTitle('➕ Створити проєкт');
        setSidebarContent(
            <NewProjectForm
                onClose={() => setIsSidebarOpen(false)}
                onSuccess={refetch}
                clients={clients}
                projectTypes={projectTypes}
                managers={managers}
            />
        );
        setIsSidebarOpen(true);
    };

    const openEditProject = (project) => {
        setSidebarTitle('✏️ Редагувати проєкт');
        setSidebarContent(
            <NewProjectForm
                project={project}
                onClose={() => setIsSidebarOpen(false)}
                onSuccess={refetch}
                clients={clients}
                projectTypes={projectTypes}
                managers={managers}
            />
        );
        setIsSidebarOpen(true);
    };

    return (
        <div className="page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1>Мої проєкти</h1>
                <button className="primary-button" onClick={openCreateProject}>
                    ➕ Додати проєкт
                </button>
            </div>

            {loading && <div className="loading">Завантаження...</div>}
            {error && <div className="error">Помилка при завантаженні</div>}

            <div className="project-list">
                {projectsData?.projects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        onEdit={() => openEditProject(project)}
                    />
                ))}
            </div>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} title={sidebarTitle}>
                {sidebarContent}
            </Sidebar>
        </div>
    );
}
