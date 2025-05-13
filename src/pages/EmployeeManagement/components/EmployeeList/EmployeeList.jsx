// src/pages/EmployeeManagement/components/EmployeeList/EmployeeList.jsx
import Card from "../../../../components/common/Card/Card";
import Badge from "../../../../components/common/Badge/Badge";
import Button from "../../../../components/common/Button/Button";
import "./EmployeeList.css";

export default function EmployeeList({
                                         employees = [],
                                         onEdit,
                                         onDelete,
                                         onManageAccount,
                                         sortField,
                                         sortDirection,
                                         onSortChange
                                     }) {
    const handleEditClick = (e, employee) => {
        e.stopPropagation();
        onEdit(employee);
    };

    const handleDeleteClick = (e, employee) => {
        e.stopPropagation();
        onDelete(employee);
    };

    const handleManageAccountClick = (e, employee) => {
        e.stopPropagation();
        onManageAccount(employee);
    };

    return (
        <div className="employee-list-container">
            <div className="employee-list-header">
                <div
                    className={`header-cell employee-name ${sortField === 'surname' ? 'sorted' : ''}`}
                    onClick={() => onSortChange('surname')}
                >
                    Ім’я працівника
                    {sortField === 'surname' && (
                        <span className="sort-indicator">{sortDirection === 'ASC' ? '↑' : '↓'}</span>
                    )}
                </div>
                <div
                    className={`header-cell employee-position ${sortField === 'position.name' ? 'sorted' : ''}`}
                    onClick={() => onSortChange('position.name')}
                >
                    Посада
                    {sortField === 'position.name' && (
                        <span className="sort-indicator">{sortDirection === 'ASC' ? '↑' : '↓'}</span>
                    )}
                </div>
                <div
                    className={`header-cell employee-office ${sortField === 'office.city.name' ? 'sorted' : ''}`}
                    onClick={() => onSortChange('office.city.name')}
                >
                    Офіс
                    {sortField === 'office.city.name' && (
                        <span className="sort-indicator">{sortDirection === 'ASC' ? '↑' : '↓'}</span>
                    )}
                </div>
                <div
                    className={`header-cell employee-contact ${sortField === 'email' ? 'sorted' : ''}`}
                    onClick={() => onSortChange('email')}
                >
                    Контакти
                    {sortField === 'email' && (
                        <span className="sort-indicator">{sortDirection === 'ASC' ? '↑' : '↓'}</span>
                    )}
                </div>
                <div className="header-cell employee-actions">
                    Дії
                </div>
            </div>

            {employees.length === 0 ? (
                <Card className="empty-list-card">
                    <div className="empty-message">Працівників не знайдено. Натисніть кнопку "Додати працівника", щоб створити нового.</div>
                </Card>
            ) : (
                <div className="employee-list">
                    {employees.map(employee => (
                        <Card key={employee.id} className="employee-card">
                            <div className="employee-info">
                                <div className="employee-name-cell">
                                    <div className="employee-name-wrapper">
                                        <span className="employee-name">{employee.surname}, {employee.name}</span>
                                        {employee.isReviewer && (
                                            <Badge variant="primary" size="small" className="reviewer-badge">Рецензент</Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="employee-position-cell">
                                    <span className="position-name">{employee.position?.name || "—"}</span>
                                </div>
                                <div className="employee-office-cell">
                                    <div className="office-location">
                                        <span className="city-name">{employee.office?.city?.name || "—"}</span>
                                        {employee.office?.city?.country && (
                                            <span className="country-name">{employee.office.city.country.name}</span>
                                        )}
                                    </div>
                                    {employee.office?.street && (
                                        <div className="office-address">{employee.office.street}</div>
                                    )}
                                </div>
                                <div className="employee-contact-cell">
                                    <div className="employee-email">{employee.email}</div>
                                    {employee.phoneNumber && (
                                        <div className="employee-phone">{employee.phoneNumber}</div>
                                    )}
                                </div>
                                <div className="employee-actions-cell">
                                    <Button
                                        variant="primary"
                                        size="small"
                                        onClick={(e) => handleManageAccountClick(e, employee)}
                                    >
                                        Акаунт
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="small"
                                        onClick={(e) => handleEditClick(e, employee)}
                                    >
                                        Редагувати
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="small"
                                        onClick={(e) => handleDeleteClick(e, employee)}
                                    >
                                        Видалити
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );

}