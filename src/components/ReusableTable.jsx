import React, { useState } from 'react';

/**
 * Reusable Table Component with Pagination
 * 
 * @param {Array} columns - Array of column definitions
 *   Example: [
 *     { key: 'no', label: 'No', className: 'text-left' },
 *     { key: 'name', label: 'Name', className: 'text-left' },
 *     { key: 'status', label: 'Status', render: (row) => <Badge>{row.status}</Badge> }
 *   ]
 * @param {Array} data - Array of data objects
 * @param {Number} itemsPerPage - Number of items per page (default: 10)
 * @param {Number} totalPages - Total number of pages (optional, calculated from data if not provided)
 * @param {Function} onPageChange - Callback when page changes (optional)
 * @param {String} emptyMessage - Message to show when no data (default: 'No data available')
 * @param {Boolean} showPagination - Whether to show pagination (default: true)
 * @param {String} tableClassName - Additional classes for table wrapper
 * @param {String} headerBgColor - Background color for header (default: 'bg-gray-100')
 * @param {Boolean} stripedRows - Whether to show alternating row colors (default: true)
 */
const ReusableTable = ({
  columns = [],
  data = [],
  itemsPerPage = 10,
  totalPages: propTotalPages,
  onPageChange,
  emptyMessage = 'No data available',
  showPagination = true,
  tableClassName = '',
  headerBgColor = 'bg-gray-100',
  stripedRows = true,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const calculatedTotalPages = propTotalPages || Math.ceil(data.length / itemsPerPage);
  const totalPages = propTotalPages || calculatedTotalPages;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = propTotalPages ? data : data.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      if (onPageChange) {
        onPageChange(page);
      }
    }
  };

  // Get page numbers for pagination display
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push(2);
      if (currentPage > 4) {
        pages.push('...');
      }
      for (let i = Math.max(3, currentPage - 1); i <= Math.min(totalPages - 2, currentPage + 1); i++) {
        if (i > 2 && i < totalPages - 1) {
          pages.push(i);
        }
      }
      if (currentPage < totalPages - 3) {
        pages.push('...');
      }
      if (totalPages > 1) {
        pages.push(totalPages - 1);
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (data.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${tableClassName}`}>
        <p className="text-gray-500 text-center">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${tableClassName}`}>
      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={headerBgColor}>
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={column.key || index}
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                      column.className || ''
                    }`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className={`${
                    stripedRows && rowIndex % 2 === 1 ? 'bg-gray-50' : 'bg-white'
                  } hover:bg-gray-100 transition-colors`}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={column.key || colIndex}
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        column.cellClassName || 'text-gray-700'
                      } ${column.className || ''}`}
                    >
                      {column.render
                        ? column.render(row, rowIndex)
                        : row[column.key] || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center gap-0" aria-label="Pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-l-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {getPageNumbers().map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white"
                  >
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 border border-gray-300 text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-[#5069E5] text-white border-[#5069E5]'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ReusableTable;

