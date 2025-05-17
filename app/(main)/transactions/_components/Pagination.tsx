"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

interface PaginationProps {
  currentPage: number;
  totalCnt: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const generateArray = (st: number, end: number) => {
  let length = end - st + 1;
  return Array.from({ length }, (_, idx) => idx + st);
};

const DOTS = -1; // to dentote dots

const Pagination = ({
  currentPage,
  totalCnt,
  pageSize,
  onPageChange,
}: PaginationProps) => {
  const paginationRange = useMemo(() => {
    const totalPagesCnt = Math.ceil(totalCnt / pageSize);
    const totalPageNumbers = 6;
    if (totalPagesCnt <= totalPageNumbers)
      return generateArray(1, totalPagesCnt);

    const leftEnd = Math.max(currentPage - 1, 1);
    const rightEnd = Math.min(currentPage + 1, totalPagesCnt);

    let showLeftDots = false,
      showRightDots = false;

    if (leftEnd > 2) showLeftDots = true;
    if (rightEnd < totalPagesCnt - 2) showRightDots = true;

    if (showLeftDots && showRightDots) {
      const midRange = generateArray(leftEnd, rightEnd);
      return [1, DOTS, ...midRange, DOTS, totalPagesCnt];
    } else if (showLeftDots && !showRightDots) {
      const rightItemsCnt = 5;
      const rightRange = generateArray(
        totalPagesCnt - rightItemsCnt + 1,
        totalPagesCnt
      );
      return [1, DOTS, ...rightRange];
    } else if (!showLeftDots && showRightDots) {
      const leftItemsCnt = 5;
      const leftRange = generateArray(1, leftItemsCnt);
      return [...leftRange, DOTS, totalPagesCnt];
    }
  }, [currentPage, totalCnt, pageSize]);

  const handleMoveToNextPage = () => {
    onPageChange(currentPage + 1);
  };
  const handleMoveToPrevPage = () => {
    onPageChange(currentPage - 1);
  };

  return (
    <div className="w-full flex justify-center items-center space-x-1">
      <button
        onClick={handleMoveToPrevPage}
        className={`p-2 ${currentPage === 1 ? "text-gray-500" : "hover:bg-gray-200 hover:rounded-full"}`}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={18} />
      </button>
      {paginationRange?.map((pageNo, idx) =>
        pageNo !== DOTS ? (
          <button
            key={idx}
            onClick={() => onPageChange(pageNo)}
            className={`px-4 py-2 hover:bg-gray-200 hover:rounded-full ${currentPage === pageNo ? "text-gray-500 bg-gray-200 rounded-full" : ""}`}
          >
            {pageNo}
          </button>
        ) : (
          <div key={idx}>...</div>
        )
      )}
      <button
        className={`p-2 ${currentPage === paginationRange?.[paginationRange.length - 1] ? "text-gray-500" : "hover:bg-gray-200 hover:rounded-fullS"}`}
        onClick={handleMoveToNextPage}
        disabled={currentPage === paginationRange?.[paginationRange.length - 1]}
      >
        <ChevronRight size={18} className={``} />
      </button>
    </div>
  );
};

export default Pagination;
