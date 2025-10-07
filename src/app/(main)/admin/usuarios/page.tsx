"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageTransition } from "@/components/ui/page-transition";
import { UserForm } from "@/components/users/UserForm";
import { ParentCreationForm } from "@/components/users/ParentCreationForm";
import { User } from "@/lib/types";
import { ActionLoader } from "@/components/ui/dashboard-loader";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/components/language/LanguageContext";
import { toast } from "sonner";

export default function UsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateParentDialogOpen, setIsCreateParentDialogOpen] =
    useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchUsers();
    }
  }, [session]);

  // Check for create query parameter and open dialog
  useEffect(() => {
    const create = searchParams.get("create");
    if (create === "true" && !loading) {
      setIsCreateDialogOpen(true);
      // Clean up the URL
      router.replace("/admin/usuarios", { scroll: false });
    }
  }, [searchParams, loading, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (_error) {
      console.error("Error fetching users:", _error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCreateUser = async (userData: {
    name: string;
    email: string;
    password: string;
    role: "admin" | "profesor" | "parent";
    isActive: boolean;
  }) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userData,
          role: userData.role.toUpperCase() as "ADMIN" | "PROFESOR" | "PARENT",
        }),
      });

      if (response.ok) {
        const newUser = await response.json();
        setUsers([...users, newUser]);
        setIsCreateDialogOpen(false);
        toast.success(`✅ Usuario ${newUser.name} creado exitosamente`, {
          description: `Email: ${newUser.email} | Rol: ${newUser.role}`,
        });
      }
    } catch (_error) {
      console.error("Error creating user:", _error);
      toast.error("❌ Error al crear el usuario", {
        description: "Por favor verifica los datos e intenta nuevamente",
      });
    }
  };

  const handleCreateParent = async (parentData: any) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parentData,
          role: "PARENT",
          isActive: true,
        }),
      });

      if (response.ok) {
        const newUser = await response.json();
        setUsers([...users, newUser]);
        setIsCreateParentDialogOpen(false);
        toast.success(`✅ Usuario padre creado exitosamente`, {
          description: `Nombre: ${newUser.name} | Estudiante: ${parentData.studentName}`,
        });
      }
    } catch (_error) {
      console.error("Error creating parent user:", _error);
      toast.error("❌ Error al crear usuario padre", {
        description: "Por favor verifica los datos e intenta nuevamente",
      });
    }
  };

  const handleUpdateUser = async (userData: {
    name: string;
    email: string;
    role: "admin" | "profesor" | "parent";
    isActive: boolean;
  }) => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userData,
          role: userData.role.toUpperCase() as "ADMIN" | "PROFESOR" | "PARENT",
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(
          users.map((user) =>
            user.id === selectedUser.id ? updatedUser : user,
          ),
        );
        setIsEditDialogOpen(false);
        setSelectedUser(null);
      }
    } catch (_error) {
      console.error("Error updating user:", _error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(t("users.confirm_delete", "common"))) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUsers(users.filter((user) => user.id !== userId));
      }
    } catch (_error) {
      console.error("Error deleting user:", _error);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-background"
        role="status"
        aria-live="polite"
        aria-label={t("users.loading", "common")}
      >
        <div className="text-center">
          <ActionLoader size="lg" />
          <p className="mt-4 text-lg">{t("users.loading", "common")}</p>
          <span className="sr-only">
            {t("users.loading_description", "common")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <PageTransition skeletonType="page" duration={700}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {t("users.management.title", "common")}
          </h1>
          <p className="text-muted-foreground">
            {t("users.management.description", "common")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl">
                  {t("users.system.title", "common")}
                </CardTitle>
                <CardDescription>
                  {t("users.system.description", "common")}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-primary hover:bg-primary-90 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Usuario
                </Button>
                <Button
                  onClick={() => setIsCreateParentDialogOpen(true)}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Padre
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-50 transform -translate-y-50 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={t("users.search.placeholder", "common")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">
                      {t("users.table.header", "common")}
                    </TableHead>
                    <TableHead className="font-semibold">
                      {t("common.email", "common")}
                    </TableHead>
                    <TableHead className="font-semibold">
                      {t("user.role.label", "common")}
                    </TableHead>
                    <TableHead className="font-semibold">
                      {t("common.status", "common")}
                    </TableHead>
                    <TableHead className="font-semibold text-right">
                      {t("common.options", "common")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted-30">
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "ADMIN"
                              ? "destructive"
                              : user.role === "PROFESOR"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {user.role === "ADMIN"
                            ? t("user.role.admin", "common")
                            : user.role === "PROFESOR"
                              ? t("user.role.profesor", "common")
                              : t("user.role.parent", "common")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.isActive ? "default" : "destructive"}
                        >
                          {user.isActive
                            ? t("users.status.active", "common")
                            : t("users.status.inactive", "common")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm
                    ? t("users.no_results_search", "common")
                    : t("users.no_results", "common")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create User Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("users.create.title", "common")}</DialogTitle>
              <DialogDescription>
                {t("users.create.description", "common")}
              </DialogDescription>
            </DialogHeader>
            <UserForm
              onSubmit={handleCreateUser}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("users.edit.title", "common")}</DialogTitle>
              <DialogDescription>
                {t("users.edit.description", "common")}
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <UserForm
                user={selectedUser}
                onSubmit={handleUpdateUser}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setSelectedUser(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Create Parent Dialog */}
        <Dialog
          open={isCreateParentDialogOpen}
          onOpenChange={setIsCreateParentDialogOpen}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Usuario Padre</DialogTitle>
              <DialogDescription>
                Registra un nuevo usuario padre con información completa del
                estudiante
              </DialogDescription>
            </DialogHeader>
            <ParentCreationForm
              onSubmit={handleCreateParent}
              onCancel={() => setIsCreateParentDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
