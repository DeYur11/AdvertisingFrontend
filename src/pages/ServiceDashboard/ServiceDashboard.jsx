// src/pages/ServiceDashboard/ServiceDashboard.jsx
import { useState, useEffect } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { toast } from "react-toastify";
import Button from "../../components/common/Button/Button";
import Card from "../../components/common/Card/Card";
import Modal from "../../components/common/Modal/Modal";
import ConfirmationDialog from "../../components/common/ConfirmationDialog/ConfirmationDialog";

import "./ServiceDashboard.css";
import {ChartsContainer, FilterPanel, ServiceForm, ServiceStats, ServiceTable} from "./components";

// GraphQL Queries
const GET_SERVICES = gql`
    query GetServices {
        services {
            id
            serviceName
            estimateCost
            createDatetime
            updateDatetime
            serviceType {
                id
                name
            }
            projectServices {
                id
                amount
            }
        }
    }
`;

const GET_SERVICE_TYPES = gql`
    query GetServiceTypes {
        serviceTypes {
            id
            name
        }
    }
`;

// GraphQL Mutations
const CREATE_SERVICE = gql`
    mutation CreateService($input: CreateServiceInput!) {
        createService(input: $input) {
            id
            serviceName
            estimateCost
            serviceType {
                id
                name
            }
        }
    }
`;

const UPDATE_SERVICE = gql`
    mutation UpdateService($id: ID!, $input: UpdateServiceInput!) {
        updateService(id: $id, input: $input) {
            id
            serviceName
            estimateCost
            serviceType {
                id
                name
            }
        }
    }
`;

const DELETE_SERVICE = gql`
    mutation DeleteService($id: ID!) {
        deleteService(id: $id)
    }
`;

export default function ServiceDashboard() {
    // State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [filters, setFilters] = useState({
        search: "",
        serviceType: "",
        costMin: "",
        costMax: "",
    });

    // Queries
    const {
        data: servicesData,
        loading: servicesLoading,
        error: servicesError,
        refetch: refetchServices
    } = useQuery(GET_SERVICES);

    const {
        data: serviceTypesData,
        loading: serviceTypesLoading
    } = useQuery(GET_SERVICE_TYPES);

    // Mutations
    const [createService] = useMutation(CREATE_SERVICE);
    const [updateService] = useMutation(UPDATE_SERVICE);
    const [deleteService] = useMutation(DELETE_SERVICE);

    // Filter services based on selected filters
    const filteredServices = servicesData?.services
        ? servicesData.services.filter((service) => {
            const matchesSearch = !filters.search ||
                service.serviceName.toLowerCase().includes(filters.search.toLowerCase());

            const matchesType = !filters.serviceType ||
                service.serviceType.id === filters.serviceType;

            const matchesMinCost = !filters.costMin ||
                service.estimateCost >= parseFloat(filters.costMin);

            const matchesMaxCost = !filters.costMax ||
                service.estimateCost <= parseFloat(filters.costMax);

            return matchesSearch && matchesType && matchesMinCost && matchesMaxCost;
        })
        : [];

    // Handlers
    const handleAddService = () => {
        setEditingService(null);
        setIsFormOpen(true);
    };

    const handleEditService = (service) => {
        setEditingService(service);
        setIsFormOpen(true);
    };

    const handleDeleteService = (service) => {
        setServiceToDelete(service);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteService({
                variables: { id: serviceToDelete.id },
            });

            toast.success(`Service "${serviceToDelete.serviceName}" deleted successfully`);
            refetchServices();
        } catch (error) {
            toast.error(`Error deleting service: ${error.message}`);
        } finally {
            setIsDeleteDialogOpen(false);
            setServiceToDelete(null);
        }
    };

    const handleServiceSubmit = async (serviceData) => {
        try {
            if (editingService) {
                // Update existing service
                await updateService({
                    variables: {
                        id: editingService.id,
                        input: {
                            serviceName: serviceData.serviceName,
                            estimateCost: parseFloat(serviceData.estimateCost),
                            serviceTypeId: serviceData.serviceTypeId,
                        },
                    },
                });
                toast.success(`Service "${serviceData.serviceName}" updated successfully`);
            } else {
                // Create new service
                await createService({
                    variables: {
                        input: {
                            serviceName: serviceData.serviceName,
                            estimateCost: parseFloat(serviceData.estimateCost),
                            serviceTypeId: serviceData.serviceTypeId,
                        },
                    },
                });
                toast.success(`Service "${serviceData.serviceName}" created successfully`);
            }

            refetchServices();
            setIsFormOpen(false);
        } catch (error) {
            toast.error(`Error saving service: ${error.message}`);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    if (servicesLoading || serviceTypesLoading) {
        return <div className="loading-message">Loading services data...</div>;
    }

    if (servicesError) {
        return <div className="error-message">Error loading services: {servicesError.message}</div>;
    }

    return (
        <div className="service-dashboard">
            <header className="dashboard-header">
                <h1>Service Dashboard</h1>
                <Button
                    variant="primary"
                    onClick={handleAddService}
                    icon="+"
                >
                    Add Service
                </Button>
            </header>

            <div className="dashboard-content">
                {/* Filters Panel */}
                <FilterPanel
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    serviceTypes={serviceTypesData?.serviceTypes || []}
                />

                {/* Stats and Charts Section */}
                <div className="stats-and-charts">
                    <ServiceStats services={filteredServices} />
                    <ChartsContainer
                        services={servicesData?.services || []}
                        filteredServices={filteredServices}
                    />
                </div>

                {/* Services Table */}
                <Card className="services-table-card">
                    <h2>Services</h2>
                    <ServiceTable
                        services={filteredServices}
                        onEdit={handleEditService}
                        onDelete={handleDeleteService}
                    />
                </Card>
            </div>

            {/* Service Form Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingService ? "Edit Service" : "Add Service"}
                size="medium"
            >
                <ServiceForm
                    service={editingService}
                    serviceTypes={serviceTypesData?.serviceTypes || []}
                    onSubmit={handleServiceSubmit}
                    onCancel={() => setIsFormOpen(false)}
                />
            </Modal>

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Service"
                message={`Are you sure you want to delete the service "${serviceToDelete?.serviceName}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
}