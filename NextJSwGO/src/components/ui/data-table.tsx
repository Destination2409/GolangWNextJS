import React, { ReactNode } from "react";
import { LineWave } from "react-loader-spinner";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface TableColumn {
    key: string;
    label: string;
    className?: string;
    render?: (row: any) => ReactNode;
}

interface TableProps {
    columns: TableColumn[];
    data: any[];
    isLoading: boolean;
    page: number;
    totalPages: number;
    totalRows: number;
    perPage: number;
    searchQuery: string;
    onSearchChange: (val: string) => void;
    onPageChange: (page: number) => void;
    onPerPageChange?: (perPage: number) => void; // Optional if we want fixed sizes later
}

const getPaginationItems = (currentPage: number, totalPages: number) => {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
        return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
        return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
};

export function DataTable({
    columns,
    data,
    isLoading,
    page,
    totalPages,
    totalRows,
    perPage,
    searchQuery,
    onSearchChange,
    onPageChange,
    onPerPageChange,
}: TableProps) {
    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="ค้นหา..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9"
                    />
                </div>
                {onPerPageChange && (
                   <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                       <span>แสดงหน้าละ:</span>
                       <select 
                           value={perPage} 
                           onChange={(e) => onPerPageChange(Number(e.target.value))}
                           className="border border-border rounded-md bg-background px-2 py-1 text-sm outline-none"
                       >
                           <option value="10">10</option>
                           <option value="50">50</option>
                           <option value="100">100</option>
                       </select>
                   </div>
                )}
            </div>

            {/* Table Container */}
            <div className="relative border border-border rounded-lg overflow-hidden bg-card text-card-foreground">
                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="text-xs text-muted-foreground bg-muted/50 border-b border-border uppercase">
                            <tr>
                                {columns.map((col, idx) => (
                                    <th key={col.key || idx} className={`px-4 py-3 font-medium ${col.className || ""}`}>
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {!isLoading && data.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                                        ไม่พบข้อมูล
                                    </td>
                                </tr>
                            ) : (
                                data.map((row, rowIdx) => (
                                    <tr key={row.id || rowIdx} className="hover:bg-muted/30 transition-colors">
                                        {columns.map((col, colIdx) => (
                                            <td key={colIdx} className={`px-4 py-3 ${col.className || ""}`}>
                                                {col.render ? col.render(row) : row[col.key]}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Loading Overlay */}
                {isLoading && (
                    <div className="absolute inset-x-0 inset-y-10 flex items-center justify-center bg-card/60 backdrop-blur-sm z-10 transition-opacity">
                        <div className="flex flex-col items-center justify-center text-primary">
                             <LineWave
                                visible={true}
                                height="100"
                                width="100"
                                color="currentColor"
                                ariaLabel="line-wave-loading"
                             />
                             <span className="text-sm font-medium animate-pulse">กำลังโหลดข้อมูล...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="text-sm text-muted-foreground">
                    แสดงแถว {(page - 1) * perPage + 1} ถึง {Math.min(page * perPage, totalRows)} จากทั้งหมด <span className="font-semibold text-foreground">{totalRows}</span> รายการ
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onPageChange(page - 1)} 
                        disabled={page <= 1}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" /> ก่อนหน้า
                    </Button>
                    
                    <div className="hidden sm:flex items-center gap-1">
                        {getPaginationItems(page, totalPages || 1).map((item, index) => {
                            if (item === "...") {
                                return <span key={index} className="px-2 text-muted-foreground">...</span>;
                            }
                            const pageNumber = item as number;
                            return (
                                <Button
                                    key={index}
                                    variant={page === pageNumber ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => onPageChange(pageNumber)}
                                    className={`w-8 h-8 p-0 ${page === pageNumber ? "pointer-events-none" : ""}`}
                                >
                                    {pageNumber}
                                </Button>
                            );
                        })}
                    </div>
                    
                    {/* Fallback for ultra-small mobile screen so it won't break layout */}
                    <div className="flex sm:hidden text-sm font-medium px-2">
                        หน้า {page} / {totalPages || 1}
                    </div>

                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onPageChange(page + 1)} 
                        disabled={page >= (totalPages || 1)}
                    >
                        ถัดไป <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
