import { useState } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@apollo/client";
import Card from "../../components/common/Card/Card";
import Badge from "../../components/common/Badge/Badge";
import Button from "../../components/common/Button/Button";
import Pagination from "../../components/common/Pagination/Pagination";

import { formatDate, getStatusBadgeVariant } from "./utils/reviewerUtils";
import "./ReviewerDashboard.css";
import MaterialReviewModal from "./components/MaterialReviewModal/index";
import ReviewerFilterPanel from "./components/ReviewFilterPanel/ReviewerFilterPanel";
import { GET_PAGINATED_MATERIALS_WITH_TOTAL } from "./graphql/reviewerQueries";
import ExportMaterialsModal from "./components/ExportMaterialsModal/ExportMaterialsModal";

export default function ReviewerDashboard() {
    const user = useSelector(state => state.user);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [exportModalOpen, setExportModalOpen] = useState(false);

    // Стан фільтрів та пагінації
    const [filters, setFilters] = useState({
        reviewStatus: 'all'
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [searchType, setSearchType] = useState("both"); // Тип пошуку: name, description, або both
    const [filterPanelExpanded, setFilterPanelExpanded] = useState(false);
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(12);
    const [sortField, setSortField] = useState("createDatetime");
    const [sortDirection, setSortDirection] = useState("DESC");

    // Конвертація UI фільтрів у GraphQL фільтр
    const buildFilterInput = () => {
        const filterInput = {};

        // Додаємо фільтр пошукового запиту на основі типу пошуку
        if (searchQuery) {
            if (searchType === "name" || searchType === "both") {
                filterInput.nameContains = searchQuery;
            }
            if (searchType === "description" || searchType === "both") {
                filterInput.descriptionContains = searchQuery;
            }
        }

        // Додаємо фільтри обмежень використання - забезпечуємо цілі числа
        if (filters.usageRestriction && filters.usageRestriction.length > 0) {
            filterInput.usageRestrictionIds = filters.usageRestriction.map(id => parseInt(id, 10));
        }

        // Додаємо фільтри типу ліцензії - забезпечуємо цілі числа
        if (filters.licenceType && filters.licenceType.length > 0) {
            filterInput.licenceTypeIds = filters.licenceType.map(id => parseInt(id, 10));
        }

        // Додаємо фільтри цільової аудиторії - забезпечуємо цілі числа
        if (filters.targetAudience && filters.targetAudience.length > 0) {
            filterInput.targetAudienceIds = filters.targetAudience.map(id => parseInt(id, 10));
        }

        // Додаємо фільтри статусу - забезпечуємо цілі числа
        if (filters.status && filters.status.length > 0) {
            filterInput.statusIds = filters.status.map(id => parseInt(id, 10));
        }

        // Додаємо фільтри типу матеріалу - забезпечуємо цілі числа
        if (filters.type && filters.type.length > 0) {
            filterInput.typeIds = filters.type.map(id => parseInt(id, 10));
        }

        // Додаємо фільтри мови - забезпечуємо цілі числа
        if (filters.language && filters.language.length > 0) {
            filterInput.languageIds = filters.language.map(id => parseInt(id, 10));
        }

        // Додаємо фільтри завдань - забезпечуємо цілі числа
        if (filters.task && filters.task.length > 0) {
            filterInput.taskIds = filters.task.map(id => parseInt(id, 10));
        }

        // Додаємо фільтри ключових слів - забезпечуємо цілі числа
        if (filters.keywords && filters.keywords.length > 0) {
            filterInput.keywordIds = filters.keywords.map(id => parseInt(id, 10));
        }

        // Особлива обробка статусу "в очікуванні рецензії"
        if (filters.status && filters.status.length > 0) {
            filterInput.statusIds = filters.status.map(id => parseInt(id, 10));
            if (filters.reviewStatus === 'pending') {
                const pendingStatusId = 2;
                if (!filterInput.statusIds.includes(pendingStatusId)) {
                    filterInput.statusIds.push(pendingStatusId);
                }
            }
        } else if (filters.reviewStatus === 'pending') {
            filterInput.statusIds = [2]; // лише Pending Review
        }

        // Фільтри діапазону дат
        if (filters.dateRange) {
            if (filters.dateRange.from) {
                filterInput.createDatetimeFrom = filters.dateRange.from;
            }
            if (filters.dateRange.to) {
                filterInput.createDatetimeTo = filters.dateRange.to;
            }
        }

        return filterInput;
    };

    // Запит на матеріали з пагінацією
    const { loading, error, data, refetch } = useQuery(GET_PAGINATED_MATERIALS_WITH_TOTAL, {
        variables: {
            input: {
                page: page - 1, // Конвертація в 0-індексацію для бекенду
                size,
                sortField,
                sortDirection,
                filter: buildFilterInput()
            }
        },
        fetchPolicy: "network-only",
        skip: !user.isReviewer
    });

    // Обробка оновлення після відправки рецензії
    const handleReviewSubmitted = () => {
        setSelectedMaterial(null);
        refetch();
    };

    // Перевірка, чи матеріал був рецензований поточним користувачем
    const hasBeenReviewedByMe = (material) => {
        return material.reviews?.some(review =>
            review.reviewer?.id === user.workerId.toString()
        );
    };

    // Обробка зміни сортування
    const handleSortChange = (field, direction) => {
        setSortField(field);
        setSortDirection(direction);
    };

    const materials = data?.paginatedMaterials?.content ? data.paginatedMaterials.content : [];
    const pageInfo = data?.paginatedMaterials?.pageInfo;
    const total = pageInfo?.totalElements ?? 0;
    const pages = pageInfo?.totalPages ?? 1;

    // Якщо користувач не є рецензентом, показуємо повідомлення
    if (!user.isReviewer) {
        return (
            <div className="reviewer-dashboard">
                <div className="access-denied">
                    <h2>Доступ заборонено</h2>
                    <p>У вас немає дозволів рецензента для доступу до цієї сторінки.</p>
                </div>
            </div>
        );
    }

    // Допоміжна функція для підсвічування пошукових термінів у тексті
    const highlightSearchTerm = (text, searchTerm) => {
        if (!searchTerm || !text) return text;

        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<mark class="search-highlight">$1</mark>');
    };

    return (
        <div className="reviewer-dashboard">
            <div className="dashboard-header">
                <div className="header-title">
                    <h1>Рецензування матеріалів</h1>
                    <p className="subtitle">Перегляд та надання відгуків на матеріали</p>
                </div>
                <div className="dashboard-actions">
                    <Button
                        variant="outline"
                        size="medium"
                        icon="📊"
                        onClick={() => setExportModalOpen(true)}
                    >
                        Експорт матеріалів
                    </Button>
                </div>
            </div>

            <ReviewerFilterPanel
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchType={searchType}
                setSearchType={setSearchType}
                filters={filters}
                setFilters={setFilters}
                expanded={filterPanelExpanded}
                setExpanded={setFilterPanelExpanded}
                onSortChange={handleSortChange}
                currentSortField={sortField}
                currentSortDirection={sortDirection}
            />

            {loading ? (
                <div className="loading-message">Завантаження матеріалів для рецензування...</div>
            ) : error ? (
                <div className="error-message">Помилка: {error.message}</div>
            ) : (
                <>
                    <div className="materials-grid">
                        {materials.length ? (
                            materials.map(material => (
                                <Card
                                    key={material.id}
                                    className={`material-card ${hasBeenReviewedByMe(material) ? 'reviewed' : ''}`}
                                    hoverable
                                    onClick={() => {
                                        setSelectedMaterial(material);
                                        setIsReviewModalOpen(true);
                                    }}
                                >
                                    <div className="material-header">
                                        <h3
                                            className="material-name"
                                            dangerouslySetInnerHTML={{
                                                __html: searchQuery && (searchType === "name" || searchType === "both")
                                                    ? highlightSearchTerm(material.name, searchQuery)
                                                    : material.name
                                            }}
                                        />
                                        <Badge
                                            variant={getStatusBadgeVariant(material)}
                                            size="small"
                                        >
                                            {material.status?.name || "Невідомо"}
                                        </Badge>
                                    </div>

                                    <div className="material-meta">
                                        <div className="meta-group">
                                            <div className="meta-item">
                                                <span className="meta-label">Тип:</span>
                                                <span className="meta-value">{material.type?.name || "—"}</span>
                                            </div>
                                            {material.language && (
                                                <div className="meta-item">
                                                    <span className="meta-label">Мова:</span>
                                                    <span className="meta-value">{material.language.name}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="meta-group">
                                            <div className="meta-item">
                                                <span className="meta-label">Проект:</span>
                                                <span className="meta-value">
                                                    {material.task?.serviceInProgress?.projectService?.project?.name || "—"}
                                                </span>
                                            </div>
                                            <div className="meta-item">
                                                <span className="meta-label">Завдання:</span>
                                                <span className="meta-value">{material.task?.name || "—"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {material.description && (
                                        <div
                                            className="material-description"
                                            dangerouslySetInnerHTML={{
                                                __html: searchQuery && (searchType === "description" || searchType === "both")
                                                    ? highlightSearchTerm(
                                                        material.description.length > 150
                                                            ? `${material.description.substring(0, 150)}...`
                                                            : material.description,
                                                        searchQuery
                                                    )
                                                    : material.description.length > 150
                                                        ? `${material.description.substring(0, 150)}...`
                                                        : material.description
                                            }}
                                        />
                                    )}

                                    {material.keywords?.length > 0 && (
                                        <div className="material-keywords">
                                            {material.keywords.slice(0, 5).map(keyword => (
                                                <span key={keyword.id} className="keyword-tag">
                                                    #{keyword.name}
                                                </span>
                                            ))}
                                            {material.keywords.length > 5 && (
                                                <span
                                                    className="more-keywords">+{material.keywords.length - 5} більше</span>
                                            )}
                                        </div>
                                    )}

                                    <div className="material-footer">
                                        <span className="created-date">
                                            Створено: {formatDate(material.createDatetime)}
                                        </span>

                                        {material.status?.name === "Accepted" ? (
                                            <Button variant="outline" size="small" disabled>
                                                Не можна рецензувати
                                            </Button>
                                        ) : (
                                            <Button
                                                variant={hasBeenReviewedByMe(material) ? "outline" : "primary"}
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedMaterial(material);
                                                    setIsReviewModalOpen(true);
                                                }}
                                            >
                                                {hasBeenReviewedByMe(material) ? "Переглянути рецензію" : "Рецензувати матеріал"}
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="no-materials">
                                <h3>Матеріали не знайдено</h3>
                                <p>
                                    {Object.keys(filters).length > 0 || searchQuery
                                        ? "Жодні матеріали не відповідають вашим поточним фільтрам. Спробуйте змінити критерії пошуку."
                                        : "На даний момент немає матеріалів для рецензування."}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Пагінація */}
                    {materials.length > 0 && (
                        <Pagination
                            currentPage={page}
                            totalPages={pages}
                            onPageChange={setPage}
                            pageSize={size}
                            onPageSizeChange={(s) => {
                                setPage(1);
                                setSize(s);
                            }}
                            totalItems={total}
                            pageSizeOptions={[6, 12, 24, 48]}
                        />
                    )}
                </>
            )}

            {/* Модальне вікно рецензування матеріалу */}
            {selectedMaterial && (
                <MaterialReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    material={selectedMaterial}
                    onReviewSubmitted={handleReviewSubmitted}
                />
            )}

            {/* Модальне вікно експорту матеріалів */}
            <ExportMaterialsModal
                isOpen={exportModalOpen}
                onClose={() => setExportModalOpen(false)}
                workerId={user.workerId}
                filters={buildFilterInput()}
                currentSortField={sortField}
                currentSortDirection={sortDirection}
            />
        </div>
    );
}