// src/components/common/Pagination/Pagination.jsx
import React from 'react';
import './Pagination.css';
import Button from '../Button/Button';

export default function Pagination({
                                       currentPage,
                                       totalPages,
                                       onPageChange,
                                       pageSize,
                                       onPageSizeChange,
                                       totalItems = 0,
                                       pageSizeOptions = [10, 25, 50, 100]
                                   }) {
    // Generate page numbers to display
    const getPageNumbers = () => {
        const pageNumbers = [];
        // Always show first page
        if (currentPage > 3) {
            pageNumbers.push(1);
            if (currentPage > 4) {
                pageNumbers.push('...');
            }
        }

        // Show pages around current page
        for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages, currentPage + 1); i++) {
            pageNumbers.push(i);
        }

        // Always show last page
        if (currentPage < totalPages - 2) {
            if (currentPage < totalPages - 3) {
                pageNumbers.push('...');
            }
            pageNumbers.push(totalPages);
        }

        return pageNumbers;
    };

    const pageNumbers = getPageNumbers();

    // Calculate displayed items
    const startItem = totalItems ? (currentPage - 1) * pageSize + 1 : 0;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className="pagination-container">
            <div className="pagination-info">
                {totalItems > 0 && (
                    <span className="pagination-summary">
                        Showing {startItem}-{endItem} of {totalItems} items
                    </span>
                )}

                <div className="page-size-selector">
                    <span className="page-size-label">Items per page:</span>
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="page-size-select"
                    >
                        {pageSizeOptions.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="pagination-controls">
                <Button
                    variant="outline"
                    size="small"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    aria-label="Previous page"
                >
                    &laquo;
                </Button>

                {pageNumbers.map((page, index) => (
                    page === '...' ? (
                        <span key={`ellipsis-${index}`} className="ellipsis">...</span>
                    ) : (
                        <Button
                            key={page}
                            variant={currentPage === page ? "primary" : "outline"}
                            size="small"
                            onClick={() => onPageChange(page)}
                            aria-label={`Page ${page}`}
                            aria-current={currentPage === page ? "page" : undefined}
                        >
                            {page}
                        </Button>
                    )
                ))}

                <Button
                    variant="outline"
                    size="small"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    aria-label="Next page"
                >
                    &raquo;
                </Button>
            </div>
        </div>
    );
}