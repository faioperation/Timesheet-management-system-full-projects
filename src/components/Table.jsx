import { useState } from "react";

export default function Table({ TableHeads, TableRows }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Calculate pagination
  const totalPages = Math.ceil(TableRows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = TableRows.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  return (
    <>
      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse min-w-[600px]">
          {/* ==== TABLE HEADER ==== */}
          <thead>
            <tr className="bg-[#D9DFFF]">
              {TableHeads.map((head, idx) => (
                <th
                  key={idx}
                  className={`text-center font-medium text-[#0C0C0D] py-3 sm:py-4 md:py-[22px] border border-[#F0F0F2] text-xs sm:text-sm md:text-base
                  ${idx === 0 ? "rounded-tl-2xl" : ""}
                  ${idx === TableHeads.length - 1 ? "rounded-tr-2xl" : ""}`}
                  style={{ width: head.width }}
                >
                  {head.Title}
                </th>
              ))}
            </tr>
          </thead>

          {/* ==== TABLE BODY ==== */}
          <tbody className="bg-white">
            {currentItems.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {TableHeads.map((head, headIdx) => (
                  <td
                    key={headIdx}
                    className="border border-[#F0F0F2] py-3 sm:py-4 md:py-[22px] text-center px-2 sm:px-3 text-black text-xs sm:text-sm md:text-base"
                  >
                    {/* If render function exists, use it — otherwise show plain data */}
                    {head.render ? head.render(row, rowIdx) : row[head.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 bg-white px-4 sm:px-6 py-4 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-[#6D6E73]">Show</span>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="border border-[#CED2E5] rounded px-2 sm:px-3 py-1 text-xs sm:text-sm text-black focus:outline-none focus:border-[#5069E5]"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-xs sm:text-sm text-[#6D6E73]">entries</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-[#6D6E73] hover:bg-[#F8F9FA] rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="flex flex-wrap items-center gap-1">
            {[...Array(Math.min(totalPages, 5))].map((_, index) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = index + 1;
              } else if (currentPage <= 3) {
                pageNum = index + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + index;
              } else {
                pageNum = currentPage - 2 + index;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${currentPage === pageNum
                      ? "bg-[#5069E5] text-white"
                      : "text-[#6D6E73] hover:bg-[#F8F9FA]"
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-[#6D6E73] hover:bg-[#F8F9FA] rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>

        <div className="text-xs sm:text-sm text-[#6D6E73] w-full sm:w-auto text-center sm:text-left">
          Showing {startIndex + 1} to {Math.min(endIndex, TableRows.length)} of {TableRows.length} entries
        </div>
      </div>
    </>
  );
}
