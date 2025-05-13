// src/pages/EmployeeManagement/components/EmployeeDashboard/EmployeeDashboard.jsx
import { useState } from "react";
import { useQuery, gql } from "@apollo/client";
import { BarChart, Bar, PieChart, Pie, ResponsiveContainer, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Card from "../../../../components/common/Card/Card";
import Button from "../../../../components/common/Button/Button";
import "./EmployeeDashboard.css";

// GraphQL queries
const GET_WORKERS = gql`
    query GetWorkers {
        workers {
            id
            name
            surname
            isReviewer
            position {
                id
                name
            }
            office {
                id
                street
                city {
                    id
                    name
                    country {
                        id
                        name
                    }
                }
            }
        }
    }
`;

const GET_POSITIONS = gql`
    query GetPositions {
        positions {
            id
            name
        }
    }
`;

const GET_OFFICES = gql`
    query GetOffices {
        offices {
            id
            street
            city {
                id
                name
                country {
                    id
                    name
                }
            }
        }
    }
`;

const GET_CITIES = gql`
    query GetCities {
        cities {
            id
            name
            country {
                id
                name
            }
        }
    }
`;

const GET_COUNTRIES = gql`
    query GetCountries {
        countries {
            id
            name
        }
    }
`;

// Colors for charts
const COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#ec4899', '#f97316', '#0ea5e9', '#84cc16',
    '#7c3aed', '#d946ef'
];

export default function EmployeeDashboard() {
    const [activeTab, setActiveTab] = useState('overview');

    // GraphQL queries
    const { data: workersData, loading: workersLoading } = useQuery(GET_WORKERS);
    const { data: positionsData, loading: positionsLoading } = useQuery(GET_POSITIONS);
    const { data: officesData, loading: officesLoading } = useQuery(GET_OFFICES);
    const { data: citiesData, loading: citiesLoading } = useQuery(GET_CITIES);
    const { data: countriesData, loading: countriesLoading } = useQuery(GET_COUNTRIES);

    // Data preparation functions
    const prepareOfficeData = () => {
        if (!workersData?.workers || !officesData?.offices) return [];

        const officeCount = {};

        // Count workers by office
        workersData.workers.forEach(worker => {
            if (worker.office?.id) {
                const officeId = worker.office.id;
                officeCount[officeId] = (officeCount[officeId] || 0) + 1;
            }
        });

        // Create data for chart
        return officesData.offices.map(office => ({
            name: `${office.city?.name} - ${office.street}`,
            value: officeCount[office.id] || 0,
            id: office.id
        })).sort((a, b) => b.value - a.value);
    };

    const prepareCityData = () => {
        if (!workersData?.workers || !citiesData?.cities) return [];

        const cityCount = {};

        // Count workers by city
        workersData.workers.forEach(worker => {
            if (worker.office?.city?.id) {
                const cityId = worker.office.city.id;
                cityCount[cityId] = (cityCount[cityId] || 0) + 1;
            }
        });

        // Create data for chart
        return citiesData.cities.map(city => ({
            name: city.name,
            country: city.country?.name,
            value: cityCount[city.id] || 0,
            id: city.id
        })).sort((a, b) => b.value - a.value);
    };

    const prepareCountryData = () => {
        if (!workersData?.workers || !countriesData?.countries) return [];

        const countryCount = {};

        // Count workers by country
        workersData.workers.forEach(worker => {
            if (worker.office?.city?.country?.id) {
                const countryId = worker.office.city.country.id;
                countryCount[countryId] = (countryCount[countryId] || 0) + 1;
            }
        });

        // Create data for chart
        return countriesData.countries.map(country => ({
            name: country.name,
            value: countryCount[country.id] || 0,
            id: country.id
        })).sort((a, b) => b.value - a.value);
    };

    const preparePositionData = () => {
        if (!workersData?.workers || !positionsData?.positions) return [];

        const positionCount = {};

        // Count workers by position
        workersData.workers.forEach(worker => {
            if (worker.position?.id) {
                const positionId = worker.position.id;
                positionCount[positionId] = (positionCount[positionId] || 0) + 1;
            }
        });

        // Create data for chart
        return positionsData.positions.map(position => ({
            name: position.name,
            value: positionCount[position.id] || 0,
            id: position.id
        })).sort((a, b) => b.value - a.value);
    };

    const prepareReviewerData = () => {
        if (!workersData?.workers) return [];

        const reviewerCount = {
            'Reviewers': 0,
            'Regular Employees': 0
        };

        // Count reviewers vs regular employees
        workersData.workers.forEach(worker => {
            if (worker.isReviewer) {
                reviewerCount['Reviewers']++;
            } else {
                reviewerCount['Regular Employees']++;
            }
        });

        // Create data for chart
        return [
            { name: 'Reviewers', value: reviewerCount['Reviewers'] },
            { name: 'Regular Employees', value: reviewerCount['Regular Employees'] }
        ];
    };

    // Prepare data
    const officeData = prepareOfficeData();
    const cityData = prepareCityData();
    const countryData = prepareCountryData();
    const positionData = preparePositionData();
    const reviewerData = prepareReviewerData();

    // Custom tooltip component for charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">{`${payload[0].name || label}: ${payload[0].value} employees`}</p>
                    {payload[0].payload.country && (
                        <p className="tooltip-country">{`Country: ${payload[0].payload.country}`}</p>
                    )}
                </div>
            );
        }
        return null;
    };

    // Get total employee count
    const getTotalEmployeeCount = () => {
        return workersData?.workers?.length || 0;
    };

    // Loading state
    const isLoading = workersLoading || positionsLoading || officesLoading || citiesLoading || countriesLoading;

    if (isLoading) {
        return <div className="loading-indicator">Loading dashboard data...</div>;
    }

    return (
        <div className="employee-dashboard">
            <div className="dashboard-header">
                <h2>Employee Distribution Dashboard</h2>
                <div className="dashboard-tabs">
                    <Button
                        variant={activeTab === 'overview' ? 'primary' : 'outline'}
                        size="small"
                        onClick={() => setActiveTab('overview')}
                    >
                        Загальний огляд
                    </Button>
                    <Button
                        variant={activeTab === 'offices' ? 'primary' : 'outline'}
                        size="small"
                        onClick={() => setActiveTab('offices')}
                    >
                        За офісами
                    </Button>
                    <Button
                        variant={activeTab === 'cities' ? 'primary' : 'outline'}
                        size="small"
                        onClick={() => setActiveTab('cities')}
                    >
                        За містами
                    </Button>
                    <Button
                        variant={activeTab === 'countries' ? 'primary' : 'outline'}
                        size="small"
                        onClick={() => setActiveTab('countries')}
                    >
                        За країнами
                    </Button>
                    <Button
                        variant={activeTab === 'positions' ? 'primary' : 'outline'}
                        size="small"
                        onClick={() => setActiveTab('positions')}
                    >
                        За посадами
                    </Button>
                </div>
            </div>

            <div className="dashboard-content">
                {activeTab === 'overview' && (
                    <div className="overview-grid">
                        <Card className="stats-card">
                            <h3>Quick Stats</h3>
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <span className="stat-value">{getTotalEmployeeCount()}</span>
                                    <span className="stat-label">Всього працівників</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{officesData?.offices?.length || 0}</span>
                                    <span className="stat-label">Офіси</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{citiesData?.cities?.length || 0}</span>
                                    <span className="stat-label">Міста</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{countriesData?.countries?.length || 0}</span>
                                    <span className="stat-label">Країни</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{positionsData?.positions?.length || 0}</span>
                                    <span className="stat-label">Посади</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{reviewerData[0].value}</span>
                                    <span className="stat-label">Рецензенти</span>
                                </div>
                            </div>
                        </Card>

                        <Card className="chart-card">
                            <h3>Працівники за посадами</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={positionData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({name, percent}) =>
                                            percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''
                                        }
                                    >
                                        {positionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip/>}/>
                                    <Legend/>
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>

                        <Card className="chart-card">
                            <h3>Працівники за країнами</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={countryData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({name, percent}) =>
                                            percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''
                                        }
                                    >
                                        {countryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip/>}/>
                                    <Legend/>
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>

                        <Card className="chart-card">
                            <h3>Розподіл рецензентів</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={reviewerData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({name, percent}) =>
                                            `${name} (${(percent * 100).toFixed(0)}%)`
                                        }
                                    >
                                        {reviewerData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#64748b'}/>
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip/>}/>
                                    <Legend/>
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>
                    </div>
                )}

                {activeTab === 'offices' && (
                    <Card className="chart-card">
                        <h3>Розподіл працівників за офісами</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                                data={officeData}
                                margin={{top: 20, right: 30, left: 20, bottom: 120}}
                            >
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis
                                    dataKey="name"
                                    angle={-45}
                                    textAnchor="end"
                                    interval={0}
                                    height={100}
                                />
                                <YAxis/>
                                <Tooltip content={<CustomTooltip/>}/>
                                <Bar dataKey="value" name="Employees" fill="#3b82f6">
                                    {officeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                )}

                {activeTab === 'cities' && (
                    <Card className="chart-card">
                        <h3>Розподіл працівників за містами</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                                data={cityData}
                                margin={{top: 20, right: 30, left: 20, bottom: 100}}
                            >
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis
                                    dataKey="name"
                                    angle={-45}
                                    textAnchor="end"
                                    interval={0}
                                    height={100}
                                />
                                <YAxis/>
                                <Tooltip content={<CustomTooltip/>}/>
                                <Bar dataKey="value" name="Employees" fill="#10b981">
                                    {cityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                )}

                {activeTab === 'countries' && (
                    <Card className="chart-card">
                        <h3>Розподіл працівників за країнами</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                                data={countryData}
                                margin={{top: 20, right: 30, left: 20, bottom: 50}}
                            >
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis
                                    dataKey="name"
                                    angle={-45}
                                    textAnchor="end"
                                    interval={0}
                                    height={50}
                                />
                                <YAxis/>
                                <Tooltip content={<CustomTooltip/>}/>
                                <Bar dataKey="value" name="Employees" fill="#f59e0b">
                                    {countryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                )}

                {activeTab === 'positions' && (
                    <Card className="chart-card">
                        <h3>Розподіл працівників за посадами</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                                data={positionData}
                                margin={{top: 20, right: 30, left: 20, bottom: 80}}
                            >
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis
                                    dataKey="name"
                                    angle={-45}
                                    textAnchor="end"
                                    interval={0}
                                    height={80}
                                />
                                <YAxis/>
                                <Tooltip content={<CustomTooltip/>}/>
                                <Bar dataKey="value" name="Employees" fill="#8b5cf6">
                                    {positionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                )}
            </div>
        </div>
    );
}