import { useEffect, useState } from 'react';
import backend from '~backend/client';
import type { Child, Class, Student } from '~backend/dapoer/api';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/ui/pagination-controls';
import ChildForm from '@/components/children/ChildForm';
import ChildCard from '@/components/children/ChildCard';

const ChildrenPage = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [searchNik, setSearchNik] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedChildren,
    goToPage,
    canGoNext,
    canGoPrev,
    startIndex,
    endIndex,
    totalItems
  } = usePagination({
    data: children,
    itemsPerPage: 12
  });

  useEffect(() => {
    fetchChildren();
    fetchClasses();
  }, []);

  const fetchChildren = async () => {
    try {
      const { children } = await backend.dapoer.listChildren({});
      setChildren(children);
    } catch (error) {
      console.error('Error fetching children:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data anak",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const { classes } = await backend.dapoer.listClasses({});
      setClasses(classes);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const searchStudentByNik = async () => {
    if (!searchNik.trim()) {
      setSelectedStudent(null);
      return;
    }

    try {
      const { student } = await backend.dapoer.getStudentByNik({ nik: searchNik.trim() });
      if (student) {
        setSelectedStudent(student);
        toast({
          title: "Siswa Ditemukan!",
          description: `${student.name} - ${student.class_name || 'Belum ada kelas'}`,
        });
      } else {
        toast({
          title: "Tidak Ditemukan",
          description: "Siswa dengan NIK tersebut tidak ditemukan",
          variant: "destructive",
        });
        setSelectedStudent(null);
      }
    } catch (error) {
      console.error('Error searching student:', error);
      setSelectedStudent(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const className = formData.get('className') as string;
    const nik = formData.get('nik') as string;
    const nis = formData.get('nis') as string;

    const processedClassName = className === 'no-class' ? undefined : className;

    if (!nik || nik.length !== 16 || !/^\d{16}$/.test(nik)) {
      toast({
        title: "Error",
        description: "NIK harus berisi tepat 16 digit angka",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingChild) {
        await backend.dapoer.updateChild({
          id: editingChild.id,
          name,
          class_name: processedClassName,
          nik,
          nis: nis || undefined,
        });
        toast({ title: "Berhasil!", description: "Data anak berhasil diperbarui" });
      } else {
        await backend.dapoer.createChild({
          name,
          class_name: processedClassName,
          nik,
          nis: nis || undefined,
          user_id: 1, // Placeholder for current user
        });
        toast({ title: "Berhasil!", description: "Anak berhasil ditambahkan" });
      }

      setIsDialogOpen(false);
      setEditingChild(null);
      setSelectedStudent(null);
      setSearchNik('');
      fetchChildren();
    } catch (error: any) {
      console.error('Error saving child:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan data anak",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (child: Child) => {
    setEditingChild(child);
    setSelectedStudent(null);
    setSearchNik('');
    setIsDialogOpen(true);
  };

  const handleDelete = async (childId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data anak ini?')) return;

    try {
      await backend.dapoer.deleteChild({ id: childId });
      toast({ title: "Berhasil!", description: "Data anak berhasil dihapus" });
      fetchChildren();
    } catch (error: any) {
      console.error('Error deleting child:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus data anak",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingChild(null);
    setSelectedStudent(null);
    setSearchNik('');
    setIsDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Data Anak
          </h1>
          <p className="text-gray-600 mt-2">Kelola data anak untuk pemesanan makanan</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) resetForm();
          setIsDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Anak
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingChild ? 'Edit Data Anak' : 'Tambah Anak Baru'}
              </DialogTitle>
              <DialogDescription>
                {editingChild ? 'Perbarui informasi anak' : 'Masukkan informasi anak atau cari berdasarkan NIK. NIK wajib diisi.'}
              </DialogDescription>
            </DialogHeader>
            
            <ChildForm
              child={editingChild}
              classes={classes}
              searchNik={searchNik}
              selectedStudent={selectedStudent}
              onSubmit={handleSubmit}
              onCancel={resetForm}
              onSearchNikChange={setSearchNik}
              onSearchStudent={searchStudentByNik}
            />
          </DialogContent>
        </Dialog>
      </div>

      {children.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <CardTitle className="text-xl mb-2">Belum Ada Data Anak</CardTitle>
            <CardDescription className="mb-4">
              Tambahkan data anak untuk mulai memesan makanan
            </CardDescription>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Anak Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedChildren.map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                onEdit={handleEdit}
                onDelete={() => handleDelete(child.id)}
              />
            ))}
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            canGoNext={canGoNext}
            canGoPrev={canGoPrev}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={totalItems}
            itemLabel="anak"
          />
        </>
      )}
    </div>
  );
};

export default ChildrenPage;
