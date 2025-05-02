import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useQuery, gql } from "@apollo/client";
import Card from "../../components/common/Card/Card";
import Badge from "../../components/common/Badge/Badge";
import Button from "../../components/common/Button/Button";

import { filterMaterials, hasBeenReviewedBy, getStatusBadgeVariant, formatDate } from "./utils/reviewerUtils";
import "./ReviewerDashboard.css";
import MaterialReviewModal from "./components/MaterialReviewModal/MaterialReviewModal";
import ReviewerFilterPanel from "./components/ReviewFilterPanel/ReviewerFilterPanel";

// GraphQL queries
const GET_MATERIALS_FOR_REVIEW = gql`
    query GetMaterialsForReview {
        materials {
            id
            name
            description
            createDatetime
            task {
                id
                name
                priority
                serviceInProgress {
                    projectService {
                        project {
                            id
                            name
                        }
                    }
                }
            }
            status {
                id
                name
            }
            type {
                name
            }
            language {
                name
            }
            keywords {
                id
                name
            }
            reviews{
                id
                suggestedChange
                comments
                createDatetime
                reviewer {
                    id
                    name
                    surname
                }
            }
        }
    }
`;

export default function ReviewerDashboard() {
    const user = useSelector(state => state.user);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [filters, setFilters] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [filterPanelExpanded, setFilterPanelExpanded] = useState(false);

    // Convert UI filters to GraphQL filter input
    const buildFilterInput = () => {
        const filterInput = {};

        // Add search query filter
        if (searchQuery) {
            filterInput.nameContains = searchQuery;
            filterInput.descriptionContains = searchQuery;
        }

        // Add status filters
        if (filters.status && filters.status.length > 0) {
            filterInput.statusIds = filters.status;
        }

        // Add material type filters
        if (filters.materialType && filters.materialType.length > 0) {
            filterInput.materialTypeIds = filters.materialType;
        }

        // Add language filters
        if (filters.language && filters.language.length > 0) {
            filterInput.languageIds = filters.language;
        }

        // Add review status filter
        if (filters.reviewStatus) {
            filterInput.reviewStatus = filters.reviewStatus; // "reviewed", "pending", "all"
        }

        // Add date range filter
        if (filters.dateRange) {
            if (filters.dateRange.from) {
                filterInput.createdFrom = filters.dateRange.from;
            }
            if (filters.dateRange.to) {
                filterInput.createdTo = filters.dateRange.to;
            }
        }

        return filterInput;
    };

    // Query for materials to review
    const { loading, error, data, refetch } = useQuery(GET_MATERIALS_FOR_REVIEW, {
        variables: {
            reviewerId: user.workerId.toString(),
        },
        fetchPolicy: "network-only",
        skip: !user.workerId || !user.isReviewer
    });

    // Handle refresh after review submission
    const handleReviewSubmitted = () => {
        setIsReviewModalOpen(false);
        setSelectedMaterial(null);
        refetch();
    };

    // Check if material has been reviewed by current user
    const hasBeenReviewedByMe = (material) => {
        return material.reviews?.some(review =>
            review.reviewer?.id === user.workerId.toString()
        );
    };

    // Get review status badge variant
    const getStatusBadgeVariant = (material) => {
        if (!material.status) return "default";

        const statusName = material.status.name.toLowerCase();
        if (statusName === "accepted") return "success";
        if (statusName === "rejected") return "danger";
        if (statusName === "pending review") return "warning";
        return "default";
    };

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
                filters={filters}
                setFilters={setFilters}
                expanded={filterPanelExpanded}
                setExpanded={setFilterPanelExpanded}
            />

            {loading ? (
                <div className="loading-message">Loading materials for review...</div>
            ) : error ? (
                <div className="error-message">Error: {error.message}</div>
            ) : (
                <div className="materials-grid">
                    {data?.materials?.length ? (
                        filterMaterials(data.materials, filters, searchQuery, user.workerId).map((material) => (
                            <Card
                                key={material.id}
                                className={`material-card ${hasBeenReviewedByMe(material) ? 'reviewed' : ''}`}
                                hoverable
                            >
                                <div className="material-header">
                                    <h3 className="material-name">{material.name}</h3>
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
                                    <div className="material-description">
                                        {material.description.length > 150
                                            ? `${material.description.substring(0, 150)}...`
                                            : material.description}
                                    </div>
                                )}

                                {material.keywords?.length > 0 && (
                                    <div className="material-keywords">
                                        {material.keywords.slice(0, 5).map(keyword => (
                                            <span key={keyword.id} className="keyword-tag">
                        #{keyword.name}
                      </span>
                                        ))}
                                        {material.keywords.length > 5 && (
                                            <span className="more-keywords">+{material.keywords.length - 5} more</span>
                                        )}
                                    </div>
                                )}

                                <div className="material-footer">
                  <span className="created-date">
                    Created: {new Date(material.createDatetime).toLocaleDateString()}
                  </span>

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