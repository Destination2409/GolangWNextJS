// src/components/setting/products/index_data.tsx
import { useState, useEffect, useCallback } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { DataTable, TableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus, Download, Edit, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { AddProductModal } from "./add_modal";
import { EditProductModal } from "./edit_modal";
import { ImportProductModal } from "./import_modal";

export function ProductsIndexData() {
    // โหลดติ้ง state
    const [isLoading, setIsLoading] = useState(true);
    
    // pagination state
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [totalRows, setTotalRows] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // modal state
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    
    // edit modal state
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/products?page=${page}&per_page=${perPage}&search=${encodeURIComponent(debouncedSearch)}`);
            const json = await res.json();
            
            if (res.ok && json.data) {
                setData(json.data);
                setTotalRows(json.total || 0);
                setTotalPages(json.last_page || Math.ceil((json.total || 0) / perPage));
            } else {
                // mock blank data on 404 or empty
                setData([]);
                setTotalRows(0);
                setTotalPages(1);
            }
        } catch (err) {
            console.error(err);
            toast.error("ไม่สามารถเชื่อมต่อดึงข้อมูลสินค้าได้");
        } finally {
            setIsLoading(false);
        }
    }, [page, perPage, debouncedSearch]);

    // ดีเลย์ search (debounce) รอ 500ms หลังพิมพ์เสร็จ
    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timeout);
    }, [search]);

    // ยิง API ทันทีเมื่อ page, perPage หรือ debouncedSearch อย่างใดอย่างหนึ่งเปลี่ยน
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handle Delete Action with SweetAlert
    const handleDelete = (id: number, title: string) => {
        Swal.fire({
            title: "ยืนยันการลบ?",
            text: `คุณต้องการลบสินค้า "${title}" หรือไม่? การกระทำนี้ไม่สามารถกู้คืนได้`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "ลบสินค้า",
            cancelButtonText: "ยกเลิก"
        }).then(async (result) => {
            if (result.isConfirmed) {
                // ยิง API Delete
                try {
                    const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
                        method: "DELETE",
                    });

                    if (res.ok) {
                        toast.success("ลบสินค้าสำเร็จ!");
                        fetchData(); // reload table
                    } else {
                        const json = await res.json();
                        throw new Error(json.error || "ลบสินค้าล้มเหลว");
                    }
                } catch (err: any) {
                    toast.error(err.message);
                }
            }
        });
    };

    // Columns Definition
    const columns: TableColumn[] = [
        { key: "id", label: "ID", className: "w-16 text-center" },
        { key: "external_id", label: "รหัสสินค้า" },
        { key: "title", label: "ชื่อสินค้า" },
        { 
            key: "price", 
            label: "ราคา", 
            className: "text-right",
            render: (row) => row.price ? Number(row.price).toLocaleString('th-TH', { style: 'currency', currency: 'THB' }) : "-"
        },
        { 
            key: "stock", 
            label: "สต็อก", 
            className: "text-center",
            render: (row) => <span className={`font-medium ${row.stock <= 5 ? 'text-destructive' : 'text-emerald-600'}`}>{row.stock}</span>
        },
        {
            key: "status",
            label: "สถานะ",
            className: "text-center",
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                    {row.status?.toUpperCase()}
                </span>
            )
        },
        {
            key: "actions",
            label: "จัดการ",
            className: "text-center w-24",
            render: (row) => (
                <div className="flex items-center justify-center gap-2">
                    <button 
                        onClick={() => { setSelectedProduct(row); setIsEditOpen(true); }}
                        className="p-1.5 text-amber-500 hover:bg-amber-100 rounded-md transition-colors"
                        title="แก้ไข"
                    >
                        <Edit className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={() => handleDelete(row.id, row.title)}
                        className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors"
                        title="ลบ"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <>
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Action Buttons Top Bar */}
            <div className="flex items-center justify-end gap-3 flex-wrap">
                <Button variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700" onClick={() => setIsImportOpen(true)}>
                    <Download className="h-4 w-4 mr-2" /> นำเข้า (CSV)
                </Button>
                <Button onClick={() => setIsAddOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> เพิ่มสินค้า
                </Button>
            </div>

            {/* Reusable Data Table */}
            <DataTable 
                columns={columns}
                data={data}
                isLoading={isLoading}
                page={page}
                perPage={perPage}
                searchQuery={search}
                totalPages={totalPages}
                totalRows={totalRows}
                onPageChange={setPage}
                onPerPageChange={(val) => { setPerPage(val); setPage(1); }}
                onSearchChange={(val) => { setSearch(val); setPage(1); }}
            />
            </div>

            {/* Modals Rendering */}
            <AddProductModal 
                isOpen={isAddOpen} 
                onClose={() => setIsAddOpen(false)} 
                onSuccess={fetchData} 
            />
            
            <EditProductModal 
                isOpen={isEditOpen} 
                product={selectedProduct}
                onClose={() => { setIsEditOpen(false); setSelectedProduct(null); }} 
                onSuccess={fetchData} 
            />

            <ImportProductModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                onSuccess={fetchData}
            />
        </>
    );
}
