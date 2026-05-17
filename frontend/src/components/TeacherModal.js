"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/axios";

const EMPTY = {
  name: "", email: "", password: "", subject: "",
  assignedClasses: "", phone: "", address: "",
  qualification: "", experience: "",
};

export default function TeacherModal({ isOpen, onClose, teacherToEdit, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(EMPTY);

  useEffect(() => {
    if (teacherToEdit) {
      setFormData({
        ...teacherToEdit,
        assignedClasses: teacherToEdit.assignedClasses?.join(", ") || "",
        password: "",
      });
    } else {
      setFormData(EMPTY);
    }
  }, [teacherToEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Convert comma-separated classes to array
    const payload = {
      ...formData,
      assignedClasses: formData.assignedClasses
        ? formData.assignedClasses.split(",").map((c) => c.trim()).filter(Boolean)
        : [],
      experience: Number(formData.experience),
    };

    try {
      if (teacherToEdit) {
        await api.put(`/teachers/${teacherToEdit._id}`, payload);
        toast.success("Teacher updated successfully");
      } else {
        await api.post("/teachers", payload);
        toast.success("Teacher created successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { id: "name", label: "Full Name", type: "text", placeholder: "Dr. John Smith", required: true },
    { id: "email", label: "Email", type: "email", placeholder: "teacher@school.com", required: true, hideOnEdit: false },
    { id: "password", label: "Temporary Password", type: "password", placeholder: "••••••••", required: !teacherToEdit, hideOnEdit: true },
    { id: "subject", label: "Subject", type: "text", placeholder: "e.g. Mathematics", required: true },
    { id: "phone", label: "Phone", type: "text", placeholder: "+1 234 567 8900", required: true },
    { id: "qualification", label: "Qualification", type: "text", placeholder: "e.g. M.Sc. Mathematics", required: true },
    { id: "experience", label: "Years of Experience", type: "number", placeholder: "e.g. 5", required: true },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle>
            {teacherToEdit ? "Edit Teacher" : "Add New Teacher"}
          </DialogTitle>
          <DialogDescription>
            {teacherToEdit
              ? "Update the teacher's details below."
              : "Fill in the details to onboard a new teacher and create their login account."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto px-1 py-2 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => {
              if (field.hideOnEdit && teacherToEdit) return null;
              return (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>{field.label}</Label>
                  <Input
                    id={field.id}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.id]}
                    onChange={handleChange}
                    required={field.required}
                    className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                  />
                </div>
              );
            })}

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="123 Main St, City"
                value={formData.address}
                onChange={handleChange}
                required
                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="assignedClasses">
                Assigned Classes <span className="text-zinc-400 text-xs">(comma-separated, e.g. 10A, 11B)</span>
              </Label>
              <Input
                id="assignedClasses"
                placeholder="10A, 11B, 12C"
                value={formData.assignedClasses}
                onChange={handleChange}
                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {teacherToEdit ? "Save Changes" : "Create Teacher"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
