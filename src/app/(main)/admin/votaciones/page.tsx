"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/components/language/LanguageContext";
import { SkeletonLoader } from "@/components/ui/dashboard-loader";
import {
  Vote,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  Calendar,
  Users,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { useSearchParams, useRouter } from "next/navigation";

interface VoteOption {
  id: string;
  text: string;
  votes: number;
}

interface Vote {
  id: string;
  title: string;
  description: string;
  category: string;
  endDate: string;
  isActive: boolean;
  isPublic: boolean;
  allowMultipleVotes: boolean;
  maxVotesPerUser?: number;
  requireAuthentication: boolean;
  status: "active" | "closed";
  totalVotes: number;
  totalOptions: number;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  options: VoteOption[];
}

export default function AdminVotesPage() {
  const { data: session } = useSession();
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVote, setSelectedVote] = useState<Vote | null>(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "GENERAL",
    endDate: "",
    isActive: true,
    isPublic: true,
    allowMultipleVotes: false,
    maxVotesPerUser: undefined as number | undefined,
    requireAuthentication: true,
    options: [{ text: "" }, { text: "" }],
  });

  useEffect(() => {
    if (session?.user?.email) {
      fetchVotes();
    }
  }, [session?.user?.email]);

  // Check for create query parameter and open dialog
  useEffect(() => {
    const create = searchParams.get("create");
    if (create === "true" && !isLoading) {
      setIsDialogOpen(true);
      setIsCreating(true);
      // Clean up the URL
      router.replace("/admin/votaciones", { scroll: false });
    }
  }, [searchParams, isLoading, router]);

  const fetchVotes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/votes");
      if (response.ok) {
        const data = await response.json();
        setVotes(data.data || []);
      } else {
        toast.error(t("admin.votaciones.error.loading", "common"));
      }
    } catch (error) {
      console.error("Error fetching votes:", error);
      toast.error(t("admin.votaciones.error.loading", "common"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVote = async () => {
    try {
      setIsCreating(true);
      const response = await fetch("/api/admin/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          endDate: new Date(formData.endDate).toISOString(),
        }),
      });

      if (response.ok) {
        toast.success(t("admin.votaciones.success.created", "common"));
        handleCloseDialog();
        fetchVotes();
      } else {
        const error = await response.json();
        toast.error(
          error.error || t("admin.votaciones.error.creating", "common"),
        );
      }
    } catch (error) {
      console.error("Error creating vote:", error);
      toast.error(t("admin.votaciones.error.creating", "common"));
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateVote = async () => {
    if (!selectedVote) return;

    try {
      setIsEditing(true);
      const response = await fetch("/api/admin/votes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedVote.id,
          ...formData,
          endDate: new Date(formData.endDate).toISOString(),
        }),
      });

      if (response.ok) {
        toast.success(t("admin.votaciones.success.updated", "common"));
        handleCloseDialog();
        fetchVotes();
      } else {
        const error = await response.json();
        toast.error(
          error.error || t("admin.votaciones.error.updating", "common"),
        );
      }
    } catch (error) {
      console.error("Error updating vote:", error);
      toast.error(t("admin.votaciones.error.updating", "common"));
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteVote = async (voteId: string) => {
    try {
      const response = await fetch(`/api/admin/votes?id=${voteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success(t("admin.votaciones.success.deleted", "common"));
        fetchVotes();
      } else {
        const error = await response.json();
        toast.error(
          error.error || t("admin.votaciones.error.deleting", "common"),
        );
      }
    } catch (error) {
      console.error("Error deleting vote:", error);
      toast.error(t("admin.votaciones.error.deleting", "common"));
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "GENERAL",
      endDate: "",
      isActive: true,
      isPublic: true,
      allowMultipleVotes: false,
      maxVotesPerUser: undefined,
      requireAuthentication: true,
      options: [{ text: "" }, { text: "" }],
    });
    setSelectedVote(null);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEditVote = (vote: Vote) => {
    setSelectedVote(vote);
    setFormData({
      title: vote.title,
      description: vote.description || "",
      category: vote.category,
      endDate: format(new Date(vote.endDate), "yyyy-MM-dd'T'HH:mm"),
      isActive: vote.isActive,
      isPublic: vote.isPublic,
      allowMultipleVotes: vote.allowMultipleVotes,
      maxVotesPerUser: vote.maxVotesPerUser,
      requireAuthentication: vote.requireAuthentication,
      options: vote.options.map((opt) => ({ text: opt.text })),
    });
    setIsDialogOpen(true);
  };

  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData((prev) => ({
        ...prev,
        options: [...prev.options, { text: "" }],
      }));
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData((prev) => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }));
    }
  };

  const updateOption = (index: number, text: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? { text } : opt)),
    }));
  };

  const filteredVotes = votes.filter((vote) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && vote.status === "active") ||
      (filter === "closed" && vote.status === "closed");

    const matchesSearch =
      vote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vote.description?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      GENERAL: "bg-gray-100 text-gray-800",
      ACADEMIC: "bg-blue-100 text-blue-800",
      ADMINISTRATIVE: "bg-purple-100 text-purple-800",
      SOCIAL: "bg-green-100 text-green-800",
      FINANCIAL: "bg-yellow-100 text-yellow-800",
      INFRASTRUCTURE: "bg-orange-100 text-orange-800",
      CURRICULUM: "bg-indigo-100 text-indigo-800",
      EVENTS: "bg-pink-100 text-pink-800",
      POLICIES: "bg-red-100 text-red-800",
      OTHER: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors.OTHER;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      GENERAL: t("admin.votaciones.category.general", "admin"),
      ACADEMIC: t("admin.votaciones.category.academic", "admin"),
      ADMINISTRATIVE: t("admin.votaciones.category.administrative", "admin"),
      SOCIAL: t("admin.votaciones.category.social", "admin"),
      FINANCIAL: t("admin.votaciones.category.financial", "admin"),
      INFRASTRUCTURE: t("admin.votaciones.category.infrastructure", "admin"),
      CURRICULUM: t("admin.votaciones.category.curriculum", "admin"),
      EVENTS: t("admin.votaciones.category.events", "admin"),
      POLICIES: t("admin.votaciones.category.policies", "admin"),
      OTHER: t("admin.votaciones.category.other", "admin"),
    };
    return labels[category] || t("admin.votaciones.category.other", "admin");
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <SkeletonLoader variant="list" lines={6} />
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("admin.votaciones.title", "common")}
        </h1>
        <p className="text-gray-600">
          {t("admin.votaciones.description", "common")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Vote className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t("admin.votaciones.stats.total", "common")}
                </p>
                <p className="text-2xl font-bold">{votes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t("admin.votaciones.stats.active", "common")}
                </p>
                <p className="text-2xl font-bold">
                  {votes.filter((v) => v.status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t("admin.votaciones.stats.closed", "common")}
                </p>
                <p className="text-2xl font-bold">
                  {votes.filter((v) => v.status === "closed").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t("admin.votaciones.stats.total_votes", "common")}
                </p>
                <p className="text-2xl font-bold">
                  {votes.reduce((sum, v) => sum + v.totalVotes, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder={t("admin.votaciones.search.placeholder", "common")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue
              placeholder={t("admin.votaciones.filter.placeholder", "common")}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("admin.votaciones.filter.all", "common")}
            </SelectItem>
            <SelectItem value="active">
              {t("admin.votaciones.filter.active", "common")}
            </SelectItem>
            <SelectItem value="closed">
              {t("admin.votaciones.filter.closed", "common")}
            </SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="flex items-center gap-2"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              {t("admin.votaciones.create.button", "common")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedVote
                  ? t("admin.votaciones.edit.title", "common")
                  : t("admin.votaciones.create.title", "common")}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">
                  {t("admin.votaciones.form.title.label", "common")}
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder={t(
                    "admin.votaciones.form.title.placeholder",
                    "common",
                  )}
                />
              </div>

              <div>
                <Label htmlFor="description">
                  {t("admin.votaciones.form.description.label", "common")}
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder={t(
                    "admin.votaciones.form.description.placeholder",
                    "common",
                  )}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">
                    {t("admin.votaciones.form.category.label", "common")}
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL">
                        {t("admin.votaciones.category.general", "admin")}
                      </SelectItem>
                      <SelectItem value="ACADEMIC">
                        {t("admin.votaciones.category.academic", "admin")}
                      </SelectItem>
                      <SelectItem value="ADMINISTRATIVE">
                        {t("admin.votaciones.category.administrative", "admin")}
                      </SelectItem>
                      <SelectItem value="SOCIAL">
                        {t("admin.votaciones.category.social", "admin")}
                      </SelectItem>
                      <SelectItem value="FINANCIAL">
                        {t("admin.votaciones.category.financial", "admin")}
                      </SelectItem>
                      <SelectItem value="INFRASTRUCTURE">
                        {t("admin.votaciones.category.infrastructure", "admin")}
                      </SelectItem>
                      <SelectItem value="CURRICULUM">
                        {t("admin.votaciones.category.curriculum", "admin")}
                      </SelectItem>
                      <SelectItem value="EVENTS">
                        {t("admin.votaciones.category.events", "admin")}
                      </SelectItem>
                      <SelectItem value="POLICIES">
                        {t("admin.votaciones.category.policies", "admin")}
                      </SelectItem>
                      <SelectItem value="OTHER">
                        {t("admin.votaciones.category.other", "admin")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="endDate">
                    {t("admin.votaciones.form.end_date.label", "common")}
                  </Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isActive: checked }))
                    }
                  />
                  <Label htmlFor="isActive">
                    {t("admin.votaciones.form.active", "admin")}
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublic"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isPublic: checked }))
                    }
                  />
                  <Label htmlFor="isPublic">
                    {t("admin.votaciones.form.public", "admin")}
                  </Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowMultipleVotes"
                    checked={formData.allowMultipleVotes}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        allowMultipleVotes: checked,
                      }))
                    }
                  />
                  <Label htmlFor="allowMultipleVotes">
                    {t("admin.votaciones.form.allow_multiple_votes", "admin")}
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireAuthentication"
                    checked={formData.requireAuthentication}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        requireAuthentication: checked,
                      }))
                    }
                  />
                  <Label htmlFor="requireAuthentication">
                    {t("admin.votaciones.form.require_authentication", "admin")}
                  </Label>
                </div>
              </div>

              {formData.allowMultipleVotes && (
                <div>
                  <Label htmlFor="maxVotesPerUser">
                    {t("admin.votaciones.form.max_votes_per_user", "admin")}
                  </Label>
                  <Input
                    id="maxVotesPerUser"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.maxVotesPerUser || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxVotesPerUser: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      }))
                    }
                    placeholder={t("admin.votaciones.form.unlimited", "admin")}
                  />
                </div>
              )}

              <div>
                <Label>
                  {t("admin.votaciones.form.options_label", "admin")}
                </Label>
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={option.text}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`${t("admin.votaciones.form.option_placeholder", "admin")} ${index + 1}`}
                      />
                      {formData.options.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {formData.options.length < 10 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addOption}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("admin.votaciones.form.add_option", "admin")}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={handleCloseDialog}>
                {t("admin.votaciones.form.cancel", "admin")}
              </Button>
              <Button
                onClick={selectedVote ? handleUpdateVote : handleCreateVote}
                disabled={
                  isCreating ||
                  isEditing ||
                  !formData.title ||
                  !formData.endDate ||
                  formData.options.some((opt) => !opt.text)
                }
              >
                {isCreating || isEditing
                  ? t("admin.votaciones.form.saving", "admin")
                  : selectedVote
                    ? t("admin.votaciones.form.update", "admin")
                    : t("admin.votaciones.form.save", "admin")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Votes List */}
      <div className="space-y-4">
        {filteredVotes.map((vote) => (
          <Card key={vote.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{vote.title}</h3>
                    <Badge className={getCategoryColor(vote.category)}>
                      {getCategoryLabel(vote.category)}
                    </Badge>
                    <Badge
                      variant={
                        vote.status === "active" ? "default" : "secondary"
                      }
                    >
                      {vote.status === "active"
                        ? t("admin.votaciones.status.active", "common")
                        : t("admin.votaciones.status.closed", "common")}
                    </Badge>
                  </div>

                  {vote.description && (
                    <p className="text-gray-600 mb-3">{vote.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(vote.endDate), "dd/MM/yyyy HH:mm", {
                        locale: language === "es" ? es : enUS,
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {vote.totalVotes} {t("admin.votaciones.votes", "common")}
                    </div>
                    <div className="flex items-center gap-1">
                      <Vote className="h-4 w-4" />
                      {vote.totalOptions}{" "}
                      {t("admin.votaciones.options", "common")}
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4" />
                      {vote.creator.name}
                    </div>
                  </div>

                  {/* Vote Results Preview */}
                  <div className="mt-4 space-y-2">
                    {vote.options.slice(0, 3).map((option) => {
                      const percentage =
                        vote.totalVotes > 0
                          ? (option.votes / vote.totalVotes) * 100
                          : 0;
                      return (
                        <div
                          key={option.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="truncate flex-1">{option.text}</span>
                          <span className="text-gray-500 ml-2">
                            {option.votes} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      );
                    })}
                    {vote.options.length > 3 && (
                      <p className="text-xs text-gray-400">
                        +{vote.options.length - 3}{" "}
                        {t("admin.votaciones.more_options", "common")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditVote(vote)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t("admin.votaciones.delete.title", "admin")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("admin.votaciones.delete.description", "admin")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {t("admin.votaciones.delete.cancel", "admin")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteVote(vote.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {t("admin.votaciones.delete.confirm", "admin")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredVotes.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Vote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("admin.votaciones.empty.title", "common")}
              </h3>
              <p className="text-gray-500">
                {searchTerm || filter !== "all"
                  ? t("admin.votaciones.empty.search", "common")
                  : t("admin.votaciones.empty.create", "common")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
