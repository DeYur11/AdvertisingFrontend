// src/pages/EmployeeManagement/components/OfficeManagement/OfficeManagement.jsx
import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import Button from "../../../../components/common/Button/Button";
import Card from "../../../../components/common/Card/Card";
import Modal from "../../../../components/common/Modal/Modal";
import ConfirmationDialog from "../../../../components/common/ConfirmationDialog/ConfirmationDialog";
import "./OfficeManagement.css";

// Import subcomponents
import OfficeForm from "../OfficeForm/OfficeForm";
import CityForm from "../CityForm/CityForm";
import CountryForm from "../CountryForm/CountryForm";

// GraphQL queries
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
            workers {
                id
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
            offices {
                id
            }
        }
    }
`;

const GET_COUNTRIES = gql`
    query GetCountries {
        countries {
            id
            name
            cities {
                id
            }
        }
    }
`;

// Mutations
const CREATE_OFFICE = gql`
    mutation CreateOffice($input: CreateOfficeInput!) {
        createOffice(input: $input) {
            id
            street
            city {
                id
                name
            }
        }
    }
`;

const UPDATE_OFFICE = gql`
    mutation UpdateOffice($id: ID!, $input: UpdateOfficeInput!) {
        updateOffice(id: $id, input: $input) {
            id
            street
            city {
                id
                name
            }
        }
    }
`;

const DELETE_OFFICE = gql`
    mutation DeleteOffice($id: ID!) {
        deleteOffice(id: $id)
    }
`;

const CREATE_CITY = gql`
    mutation CreateCity($input: CreateCityInput!) {
        createCity(input: $input) {
            id
            name
            country {
                id
                name
            }
        }
    }
`;

const UPDATE_CITY = gql`
    mutation UpdateCity($id: ID!, $input: UpdateCityInput!) {
        updateCity(id: $id, input: $input) {
            id
            name
            country {
                id
                name
            }
        }
    }
`;

const DELETE_CITY = gql`
    mutation DeleteCity($id: ID!) {
        deleteCity(id: $id)
    }
`;

const CREATE_COUNTRY = gql`
    mutation CreateCountry($input: CreateCountryInput!) {
        createCountry(input: $input) {
            id
            name
        }
    }
`;

const UPDATE_COUNTRY = gql`
    mutation UpdateCountry($id: ID!, $input: UpdateCountryInput!) {
        updateCountry(id: $id, input: $input) {
            id
            name
        }
    }
`;

const DELETE_COUNTRY = gql`
    mutation DeleteCountry($id: ID!) {
        deleteCountry(id: $id)
    }
`;

export default function OfficeManagement() {
    // Active location tab state
    const [activeLocationTab, setActiveLocationTab] = useState('offices');

    // Modal states
    const [showOfficeForm, setShowOfficeForm] = useState(false);
    const [showCityForm, setShowCityForm] = useState(false);
    const [showCountryForm, setShowCountryForm] = useState(false);

    // Selected items for edit/delete
    const [selectedOffice, setSelectedOffice] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState(null);

    // Confirmation dialog states
    const [showDeleteOfficeConfirm, setShowDeleteOfficeConfirm] = useState(false);
    const [showDeleteCityConfirm, setShowDeleteCityConfirm] = useState(false);
    const [showDeleteCountryConfirm, setShowDeleteCountryConfirm] = useState(false);

    // GraphQL queries
    const {
        data: officesData,
        loading: officesLoading,
        error: officesError,
        refetch: refetchOffices
    } = useQuery(GET_OFFICES);

    const {
        data: citiesData,
        loading: citiesLoading,
        error: citiesError,
        refetch: refetchCities
    } = useQuery(GET_CITIES);

    const {
        data: countriesData,
        loading: countriesLoading,
        error: countriesError,
        refetch: refetchCountries
    } = useQuery(GET_COUNTRIES);

    // Mutations
    const [createOffice] = useMutation(CREATE_OFFICE);
    const [updateOffice] = useMutation(UPDATE_OFFICE);
    const [deleteOffice] = useMutation(DELETE_OFFICE);

    const [createCity] = useMutation(CREATE_CITY);
    const [updateCity] = useMutation(UPDATE_CITY);
    const [deleteCity] = useMutation(DELETE_CITY);

    const [createCountry] = useMutation(CREATE_COUNTRY);
    const [updateCountry] = useMutation(UPDATE_COUNTRY);
    const [deleteCountry] = useMutation(DELETE_COUNTRY);

    // Data preparation
    const offices = officesData?.offices || [];
    const cities = citiesData?.cities || [];
    const countries = countriesData?.countries || [];

    // Handlers for Offices
    const handleAddOffice = () => {
        setSelectedOffice(null);
        setShowOfficeForm(true);
    };

    const handleEditOffice = (office) => {
        setSelectedOffice(office);
        setShowOfficeForm(true);
    };

    const handleDeleteOffice = (office) => {
        setSelectedOffice(office);
        setShowDeleteOfficeConfirm(true);
    };

    const handleOfficeFormSubmit = async (officeData) => {
        try {
            if (officeData.id) {
                // Update existing office
                await updateOffice({
                    variables: {
                        id: officeData.id,
                        input: {
                            street: officeData.street,
                            cityId: parseInt(officeData.cityId)
                        }
                    }
                });
            } else {
                // Create new office
                await createOffice({
                    variables: {
                        input: {
                            street: officeData.street,
                            cityId: parseInt(officeData.cityId)
                        }
                    }
                });
            }

            setShowOfficeForm(false);
            refetchOffices();
        } catch (error) {
            console.error("Error saving office:", error);
            // Show error notification
        }
    };

    const handleDeleteOfficeConfirm = async () => {
        try {
            await deleteOffice({
                variables: {
                    id: selectedOffice.id
                }
            });

            setShowDeleteOfficeConfirm(false);
            refetchOffices();
        } catch (error) {
            console.error("Error deleting office:", error);
            // Show error notification
        }
    };

    // Handlers for Cities
    const handleAddCity = () => {
        setSelectedCity(null);
        setShowCityForm(true);
    };

    const handleEditCity = (city) => {
        setSelectedCity(city);
        setShowCityForm(true);
    };

    const handleDeleteCity = (city) => {
        setSelectedCity(city);
        setShowDeleteCityConfirm(true);
    };

    const handleCityFormSubmit = async (cityData) => {
        try {
            if (cityData.id) {
                // Update existing city
                await updateCity({
                    variables: {
                        id: cityData.id,
                        input: {
                            name: cityData.name,
                            countryId: parseInt(cityData.countryId)
                        }
                    }
                });
            } else {
                // Create new city
                await createCity({
                    variables: {
                        input: {
                            name: cityData.name,
                            countryId: parseInt(cityData.countryId)
                        }
                    }
                });
            }

            setShowCityForm(false);
            refetchCities();
            refetchOffices(); // Refresh offices to show updated city names
        } catch (error) {
            console.error("Error saving city:", error);
            // Show error notification
        }
    };

    const handleDeleteCityConfirm = async () => {
        try {
            await deleteCity({
                variables: {
                    id: selectedCity.id
                }
            });

            setShowDeleteCityConfirm(false);
            refetchCities();
            refetchOffices(); // Refresh offices that may have used this city
        } catch (error) {
            console.error("Error deleting city:", error);
            // Show error notification
        }
    };

    // Handlers for Countries
    const handleAddCountry = () => {
        setSelectedCountry(null);
        setShowCountryForm(true);
    };

    const handleEditCountry = (country) => {
        setSelectedCountry(country);
        setShowCountryForm(true);
    };

    const handleDeleteCountry = (country) => {
        setSelectedCountry(country);
        setShowDeleteCountryConfirm(true);
    };

    const handleCountryFormSubmit = async (countryData) => {
        try {
            if (countryData.id) {
                // Update existing country
                await updateCountry({
                    variables: {
                        id: countryData.id,
                        input: {
                            name: countryData.name
                        }
                    }
                });
            } else {
                // Create new country
                await createCountry({
                    variables: {
                        input: {
                            name: countryData.name
                        }
                    }
                });
            }

            setShowCountryForm(false);
            refetchCountries();
            refetchCities(); // Refresh cities to show updated country names
            refetchOffices(); // Refresh offices to show updated country names
        } catch (error) {
            console.error("Error saving country:", error);
            // Show error notification
        }
    };

    const handleDeleteCountryConfirm = async () => {
        try {
            await deleteCountry({
                variables: {
                    id: selectedCountry.id
                }
            });

            setShowDeleteCountryConfirm(false);
            refetchCountries();
            refetchCities(); // Refresh cities that may have used this country
            refetchOffices(); // Refresh offices that may have been affected
        } catch (error) {
            console.error("Error deleting country:", error);
            // Show error notification
        }
    };

    // Get count of employees in each office
    const getOfficeEmployeeCount = (office) => {
        return office.workers?.length || 0;
    };

    // Get count of offices in each city
    const getCityOfficeCount = (city) => {
        return city.offices?.length || 0;
    };

    // Get count of cities in each country
    const getCountryCityCount = (country) => {
        return country.cities?.length || 0;
    };

    // Renders
    const renderOfficesTab = () => {
        if (officesLoading) return <div className="loading-indicator">Loading offices...</div>;
        if (officesError) return <div className="error-message">Error loading offices: {officesError.message}</div>;

        return (
            <>
                <div className="location-actions">
                    <Button
                        variant="primary"
                        size="small"
                        onClick={handleAddOffice}
                        icon="➕"
                    >
                        Add Office
                    </Button>
                </div>

                {offices.length === 0 ? (
                    <Card className="empty-card">
                        <p>No offices found. Click "Add Office" to create a new office.</p>
                    </Card>
                ) : (
                    <div className="offices-grid">
                        {offices.map(office => (
                            <Card key={office.id} className="office-card">
                                <div className="office-header">
                                    <h3 className="office-name">{office.city?.name} Office</h3>
                                    <div className="office-actions">
                                        <Button
                                            variant="outline"
                                            size="small"
                                            onClick={() => handleEditOffice(office)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="small"
                                            onClick={() => handleDeleteOffice(office)}
                                            disabled={getOfficeEmployeeCount(office) > 0}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>

                                <div className="office-details">
                                    <div className="office-address">
                                        <span className="label">Address:</span>
                                        <span className="value">{office.street}</span>
                                    </div>
                                    <div className="office-location">
                                        <span className="label">Location:</span>
                                        <span className="value">{office.city?.name}, {office.city?.country?.name}</span>
                                    </div>
                                    <div className="office-employees">
                                        <span className="label">Employees:</span>
                                        <span className="value">{getOfficeEmployeeCount(office)}</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </>
        );
    };

    const renderCitiesTab = () => {
        if (citiesLoading) return <div className="loading-indicator">Loading cities...</div>;
        if (citiesError) return <div className="error-message">Error loading cities: {citiesError.message}</div>;

        return (
            <>
                <div className="location-actions">
                    <Button
                        variant="primary"
                        size="small"
                        onClick={handleAddCity}
                        icon="➕"
                    >
                        Add City
                    </Button>
                </div>

                {cities.length === 0 ? (
                    <Card className="empty-card">
                        <p>No cities found. Click "Add City" to create a new city.</p>
                    </Card>
                ) : (
                    <div className="cities-grid">
                        {cities.map(city => (
                            <Card key={city.id} className="city-card">
                                <div className="city-header">
                                    <h3 className="city-name">{city.name}</h3>
                                    <div className="city-actions">
                                        <Button
                                            variant="outline"
                                            size="small"
                                            onClick={() => handleEditCity(city)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="small"
                                            onClick={() => handleDeleteCity(city)}
                                            disabled={getCityOfficeCount(city) > 0}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>

                                <div className="city-details">
                                    <div className="city-country">
                                        <span className="label">Country:</span>
                                        <span className="value">{city.country?.name}</span>
                                    </div>
                                    <div className="city-offices">
                                        <span className="label">Offices:</span>
                                        <span className="value">{getCityOfficeCount(city)}</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </>
        );
    };

    const renderCountriesTab = () => {
        if (countriesLoading) return <div className="loading-indicator">Loading countries...</div>;
        if (countriesError) return <div className="error-message">Error loading countries: {countriesError.message}</div>;

        return (
            <>
                <div className="location-actions">
                    <Button
                        variant="primary"
                        size="small"
                        onClick={handleAddCountry}
                        icon="➕"
                    >
                        Add Country
                    </Button>
                </div>

                {countries.length === 0 ? (
                    <Card className="empty-card">
                        <p>No countries found. Click "Add Country" to create a new country.</p>
                    </Card>
                ) : (
                    <div className="countries-grid">
                        {countries.map(country => (
                            <Card key={country.id} className="country-card">
                                <div className="country-header">
                                    <h3 className="country-name">{country.name}</h3>
                                    <div className="country-actions">
                                        <Button
                                            variant="outline"
                                            size="small"
                                            onClick={() => handleEditCountry(country)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="small"
                                            onClick={() => handleDeleteCountry(country)}
                                            disabled={getCountryCityCount(country) > 0}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>

                                <div className="country-details">
                                    <div className="country-cities">
                                        <span className="label">Cities:</span>
                                        <span className="value">{getCountryCityCount(country)}</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="office-management-container">
            <div className="office-management-header">
                <div className="location-tabs">
                    <button
                        className={`location-tab ${activeLocationTab === 'offices' ? 'active' : ''}`}
                        onClick={() => setActiveLocationTab('offices')}
                    >
                        Offices
                    </button>
                    <button
                        className={`location-tab ${activeLocationTab === 'cities' ? 'active' : ''}`}
                        onClick={() => setActiveLocationTab('cities')}
                    >
                        Cities
                    </button>
                    <button
                        className={`location-tab ${activeLocationTab === 'countries' ? 'active' : ''}`}
                        onClick={() => setActiveLocationTab('countries')}
                    >
                        Countries
                    </button>
                </div>
            </div>

            <div className="office-management-content">
                {activeLocationTab === 'offices' && renderOfficesTab()}
                {activeLocationTab === 'cities' && renderCitiesTab()}
                {activeLocationTab === 'countries' && renderCountriesTab()}
            </div>

            {/* Office Form Modal */}
            {showOfficeForm && (
                <OfficeForm
                    isOpen={showOfficeForm}
                    onClose={() => setShowOfficeForm(false)}
                    onSave={handleOfficeFormSubmit}
                    office={selectedOffice}
                    cities={cities}
                />
            )}

            {/* City Form Modal */}
            {showCityForm && (
                <CityForm
                    isOpen={showCityForm}
                    onClose={() => setShowCityForm(false)}
                    onSave={handleCityFormSubmit}
                    city={selectedCity}
                    countries={countries}
                />
            )}

            {/* Country Form Modal */}
            {showCountryForm && (
                <CountryForm
                    isOpen={showCountryForm}
                    onClose={() => setShowCountryForm(false)}
                    onSave={handleCountryFormSubmit}
                    country={selectedCountry}
                />
            )}

            {/* Confirmation Dialogs */}
            <ConfirmationDialog
                isOpen={showDeleteOfficeConfirm}
                onClose={() => setShowDeleteOfficeConfirm(false)}
                onConfirm={handleDeleteOfficeConfirm}
                title="Delete Office"
                message={`Are you sure you want to delete the ${selectedOffice?.city?.name} office? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />

            <ConfirmationDialog
                isOpen={showDeleteCityConfirm}
                onClose={() => setShowDeleteCityConfirm(false)}
                onConfirm={handleDeleteCityConfirm}
                title="Delete City"
                message={`Are you sure you want to delete ${selectedCity?.name}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />

            <ConfirmationDialog
                isOpen={showDeleteCountryConfirm}
                onClose={() => setShowDeleteCountryConfirm(false)}
                onConfirm={handleDeleteCountryConfirm}
                title="Delete Country"
                message={`Are you sure you want to delete ${selectedCountry?.name}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
}