import { useState } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@apollo/client";
import Card from "../../components/common/Card/Card";
import Badge from "../../components/common/Badge/Badge";
import Button from "../../components/common/Button/Button";
import Pagination from "../../components/common/Pagination/Pagination";

import { formatDate, getStatusBadgeVariant } from "./utils/reviewerUtils";
import "./ReviewerDashboard.css";
import MaterialReviewModal from "./components/MaterialReviewModal";
import ReviewerFilterPanel from "./components/ReviewFilterPanel/ReviewerFilterPanel";
import { GET_PAGINATED_MATERIALS_WITH_TOTAL } from "./graphql/reviewerQueries";

export default function ReviewerDashboard() {
    const user = useSelector(state => state.user);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    // Filter and pagination state
    const [filters, setFilters] = useState({
        reviewStatus: 'all'
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [searchType, setSearchType] = useState("both"); // Track search type: name, description, or both
    const [filterPanelExpanded, setFilterPanelExpanded] = useState(false);
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(12);
    const [sortField, setSortField] = useState("createDatetime");
    const [sortDirection, setSortDirection] = useState("DESC");

    // Convert UI filters to GraphQL filter input
    const buildFilterInput = () => {
        const filterInput = {};

        // Add search query filter based on searchType
        if (searchQuery) {
            if (searchType === "name" || searchType === "both") {
                filterInput.nameContains = searchQuery;
            }
            if (searchType === "description" || searchType === "both") {
                filterInput.descriptionContains = searchQuery;
            }
        }

        // Add usageRestriction filters - ensure integers
        if (filters.usageRestriction && filters.usageRestriction.length > 0) {
            filterInput.usageRestrictionIds = filters.usageRestriction.map(id => parseInt(id, 10));
        }

// Add licenceType filters - ensure integers
        if (filters.licenceType && filters.licenceType.length > 0) {
            filterInput.licenceTypeIds = filters.licenceType.map(id => parseInt(id, 10));
        }

// Add targetAudience filters - ensure integers
        if (filters.targetAudience && filters.targetAudience.length > 0) {
            filterInput.targetAudienceIds = filters.targetAudience.map(id => parseInt(id, 10));
        }


        // Add status filte rs - ensure integers
        if (filters.status && filters.status.length > 0) {
            filterInput.statusIds = filters.status.map(id => parseInt(id, 10));
        }

        // Add material type filters - ensure integers
        if (filters.type && filters.type.length > 0) {
            filterInput.typeIds = filters.type.map(id => parseInt(id, 10));
        }

        // Add language filters - ensure integers
        if (filters.language && filters.language.length > 0) {
            filterInput.languageIds = filters.language.map(id => parseInt(id, 10));
        }

        // Add task filters - ensure integers
        if (filters.task && filters.task.length > 0) {
            filterInput.taskIds = filters.task.map(id => parseInt(id, 10));
        }

        // Add keyword filters - ensure integers
        if (filters.keywords && filters.keywords.length > 0) {
            filterInput.keywordIds = filters.keywords.map(id => parseInt(id, 10));
        }

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
        // Date range filters are handled in post-query filtering

        return filterInput;
    };

    // Query for materials with pagination
    const { loading, error, data, refetch } = useQuery(GET_PAGINATED_MATERIALS_WITH_TOTAL, {
        variables: {
            input: {
                page: page - 1, // Convert to 0-based for backend
                size,
                sortField,
                sortDirection,
                filter: buildFilterInput()
            }
        },
        fetchPolicy: "network-only",
        skip: !user.isReviewer
    });

    // Handle refresh after review submission
    const handleReviewSubmitted = () => {
        setSelectedMaterial(null);
        refetch();
    };

    // Check if material has been reviewed by current user
    const hasBeenReviewedByMe = (material) => {
        return material.reviews?.some(review =>
            review.reviewer?.id === user.workerId.toString()
        );
    };

    // Handle sort change
    const handleSortChange = (field, direction) => {
        setSortField(field);
        setSortDirection(direction);
    };

    const materials = data?.paginatedMaterials?.content ? data.paginatedMaterials.content : [];
    const pageInfo = data?.paginatedMaterials?.pageInfo;
    const total = pageInfo?.totalElements ?? 0;
    const pages = pageInfo?.totalPages ?? 1;

    // If user is not a reviewer, show message
    if (!user.isReviewer) {
        return (
            <div className="reviewer-dashboard">
                <div className="access-denied">
                    <h2>Access Denied</h2>
                    <p>You don't have reviewer permissions to access this page.</p>
                </div>
            </div>
        );
    }

    // Helper function to highlight search terms in text
    const highlightSearchTerm = (text, searchTerm) => {
        if (!searchTerm || !text) return text;

        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<mark class="search-highlight">$1</mark>');
    };

    return (
        <div className="reviewer-dashboard">
            <div className="dashboard-header">
                <div className="header-title">
                    <h1>Material Reviews</h1>
                    <p className="subtitle">Review and provide feedback on materials</p>
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
                <div className="loading-message">Loading materials for review...</div>
            ) : error ? (
                <div className="error-message">Error: {error.message}</div>
            ) : (
                <>
                    <div className="materials-grid">
                        {materials.length ? (
                            materials.map(material => (
                                <Card
                                    key={material.id}
                                    className={`material-card ${hasBeenReviewedByMe(material) ? 'reviewed' : ''}`}
                                    hoverable
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
                                            {material.status?.name || "Unknown"}
                                        </Badge>
                                    </div>

                                    <div className="material-meta">
                                        <div className="meta-group">
                                            <div className="meta-item">
                                                <span className="meta-label">Type:</span>
                                                <span className="meta-value">{material.type?.name || "—"}</span>
                                            </div>
                                            {material.language && (
                                                <div className="meta-item">
                                                    <span className="meta-label">Language:</span>
                                                    <span className="meta-value">{material.language.name}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="meta-group">
                                            <div className="meta-item">
                                                <span className="meta-label">Project:</span>
                                                <span className="meta-value">
                                                    {material.task?.serviceInProgress?.projectService?.project?.name || "—"}
                                                </span>
                                            </div>
                                            <div className="meta-item">
                                                <span className="meta-label">Task:</span>
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
                                                    className="more-keywords">+{material.keywords.length - 5} more</span>
                                            )}
                                        </div>
                                    )}

                                    <div className="material-footer">

                                        {material.status?.name === "Accepted" ? (
                                            <Button variant="outline" size="small" disabled>
                                                Cannot Review
                                            </Button>
                                        ) : (
                                            <Button
                                                variant={hasBeenReviewedByMe(material) ? "outline" : "primary"}
                                                size="small"
                                                onClick={() => {
                                                    setSelectedMaterial(material);
                                                    setIsReviewModalOpen(true);
                                                }}
                                            >
                                                {hasBeenReviewedByMe(material) ? "View Review" : "Review Material"}
                                            </Button>
                                        )}
                                    </div>

                                </Card>
                            ))
                        ) : (
                            <div className="no-materials">
                                <h3>No materials found</h3>
                                <p>
                                    {Object.keys(filters).length > 0 || searchQuery
                                        ? "No materials match your current filters. Try adjusting your search criteria."
                                        : "There are no materials available for review at this time."}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
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

            {/* Material Review Modal */}
            {selectedMaterial && (
                <MaterialReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    material={selectedMaterial}
                    onReviewSubmitted={handleReviewSubmitted}
                />
            )}
        </div>
    );
}