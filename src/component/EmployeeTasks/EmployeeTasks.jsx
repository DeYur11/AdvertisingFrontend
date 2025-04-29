import { useState } from "react";
import { useQuery, gql } from "@apollo/client";
import { useSelector } from "react-redux";
import TaskFilterBar from "./TaskFilterBar";
import ProjectCard from "./ProjectCard";
import Sidebar from "./Sidebar";
import "./EmployeeTasks.css";
import {
    ProjectNameMatchHandler,
    ActiveTaskExistenceHandler,
    ServiceNameMatchHandler,
    ActiveServiceExistenceHandler
} from "../../handlers/employeeTasks";

const GET_TASKS_BY_WORKER = gql`
  query MyQuery($workerId: ID!) {
    tasksByWorker(workerId: $workerId) {
      id
      name
      description
      startDate
      deadline
      endDate
      priority
      value
      taskStatus {
        name
      }
      serviceInProgress {
        id
        startDate
        endDate
        cost
        status {
          name
        }
        projectService {
          service {
            id
            serviceName
            estimateCost
            serviceType {
              name
            }
          }
          project {
            id
            name
            startDate
            endDate
            status {
              name
            }
            projectType {
              name
            }
            client {
              name
            }
            manager {
              name
              surname
            }
          }
        }
      }
    }
  }
`;

export default function EmployeeTasks({ onSelect }) {
    const [expandedProjectId, setExpandedProjectId] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [taskFilter, setTaskFilter] = useState("active");
    const [searchQuery, setSearchQuery] = useState("");

    const user = useSelector(state => state.user);
    const workerId = user.workerId;

    const { loading, error, data } = useQuery(GET_TASKS_BY_WORKER, {
        variables: { workerId: String(workerId) },
        skip: !workerId,
    });

    if (!workerId) return <p>No worker selected.</p>;
    if (loading) return <p>Loading tasks...</p>;
    if (error) return <p>Error loading tasks: {error.message}</p>;

    const tasksByWorker = data.tasksByWorker;

    const groupedProjects = {};

    tasksByWorker.forEach(task => {
        const project = task.serviceInProgress.projectService.project;
        const service = task.serviceInProgress.projectService.service;

        if (!groupedProjects[project.id]) {
            groupedProjects[project.id] = { ...project, services: {} };
        }

        if (!groupedProjects[project.id].services[service.id]) {
            groupedProjects[project.id].services[service.id] = { ...service, tasks: [] };
        }

        groupedProjects[project.id].services[service.id].tasks.push(task);
    });

    const projectsArray = Object.values(groupedProjects);

    function handleItemSelect(item) {
        onSelect(item);
    }

    function toggleProject(id) {
        setExpandedProjectId(prev => (prev === id ? null : id));
    }

    function getVisibleProjectsForActiveTasks(projectsArray) {
        const chain = new ProjectNameMatchHandler(
            searchQuery,
            new ActiveTaskExistenceHandler(
                new ActiveServiceExistenceHandler(searchQuery, null)
            )
        );

        return projectsArray
            .map(project => chain.handle(project))
            .filter(project => project !== null);
    }

    function getVisibleProjectsForAllTasks(projectsArray) {
        const chain = new ProjectNameMatchHandler(
            searchQuery,
            new ServiceNameMatchHandler(
                searchQuery,
                null
            )
        );

        return projectsArray
            .map(project => chain.handle(project))
            .filter(project => project !== null);
    }

    // 🔥 Тут міняємо document.body --> .employee-tasks-wrapper
    function handleSelect(item) {
        if (item.type !== "project") {
            const wrapper = document.querySelector('.employee-tasks-wrapper');
            wrapper?.classList.add("sidebar-open");
            setSelectedItem(item);
        }
    }

    function handleCloseSidebar() {
        const wrapper = document.querySelector('.employee-tasks-wrapper');
        wrapper?.classList.remove("sidebar-open");
        setSelectedItem(null);
    }

    const visibleProjects = taskFilter === "active"
        ? getVisibleProjectsForActiveTasks(projectsArray)
        : getVisibleProjectsForAllTasks(projectsArray);

    return (
        <div className={`employee-tasks-wrapper ${selectedItem && selectedItem.type !== "project" ? "sidebar-open" : ""}`}>
            <div className="employee-tasks-container">
                <TaskFilterBar
                    taskFilter={taskFilter}
                    setTaskFilter={setTaskFilter}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />

                {visibleProjects.map(project => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        expanded={expandedProjectId === project.id}
                        onToggle={() => toggleProject(project.id)}
                        services={project.services}
                        searchQuery={searchQuery}
                        onSelect={handleItemSelect}
                    />
                ))}
            </div>
        </div>
    );
}
