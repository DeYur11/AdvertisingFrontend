import { useQuery, gql } from '@apollo/client';
import ProjectCard from './ProjectCard';
import './ProjectsPage.css';

const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      name
      registrationDate
      startDate
      endDate
      cost
      estimateCost
      status { name }
      projectType { name }
      paymentDeadline
      client { name }
      manager { name surname }
      description
      createDatetime
      updateDatetime
    }
  }
`;

export default function ProjectsPage() {
    const { data, loading, error } = useQuery(GET_PROJECTS);

    if (loading) return <div className="loading">Завантаження...</div>;
    if (error) return <div className="error">Помилка завантаження</div>;

    return (
        <div className="page">
            <h1>Мої проєкти</h1>
            <div className="project-list">
                {data.projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </div>
        </div>
    );
}
