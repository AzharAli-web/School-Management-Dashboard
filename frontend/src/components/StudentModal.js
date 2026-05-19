"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function StudentModal({ isOpen, onClose, studentToEdit, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", rollNumber: "", class: "", section: "",
    age: "", gender: "Male", phone: "", address: "", parentName: "", parentPhone: ""
  });

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        ...studentToEdit,
        password: ""
      });
    } else {
      setFormData({
        name: "", email: "", password: "", rollNumber: "", class: "", section: "",
        age: "", gender: "Male", phone: "", address: "", parentName: "", parentPhone: ""
      });
    }
  }, [studentToEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (studentToEdit) {
        await api.put(`/students/${studentToEdit._id}`, formData);
        toast.success("Student updated successfully");
      } else {
        await api.post("/students", formData);
        toast.success("Student created successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle>{studentToEdit ? "Edit Student" : "Add New Student"}</DialogTitle>
          <DialogDescription>
            {studentToEdit ? "Update the student details below." : "Enter the details to enroll a new student and generate their login account."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-1 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={formData.name} onChange={handleChange} required className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={handleChange} required className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
            </div>

            {!studentToEdit && (
              <div className="space-y-2">
                <Label htmlFor="password">Temporary Password</Label>
                <Input id="password" type="password" value={formData.password} onChange={handleChange} required className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="rollNumber">Roll Number</Label>
              <Input id="rollNumber" value={formData.rollNumber} onChange={handleChange} required className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
            </div>


            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
              <Input id="class" value={formData.class} onChange={handleChange} required placeholder="e.g. 10th Grade" className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Input id="section" value={formData.section} onChange={handleChange} required placeholder="e.g. A" className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
            </div>


            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" value={formData.age} onChange={handleChange} required className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={formData.gender} onValueChange={(val) => setFormData({ ...formData, gender: val })}>
                <SelectTrigger className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>


            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={formData.phone} onChange={handleChange} required className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={formData.address} onChange={handleChange} required className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
            </div>


            <div className="space-y-2">
              <Label htmlFor="parentName">Parent/Guardian Name</Label>
              <Input id="parentName" value={formData.parentName} onChange={handleChange} required className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentPhone">Parent/Guardian Phone</Label>
              <Input id="parentPhone" value={formData.parentPhone} onChange={handleChange} required className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-6">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {studentToEdit ? "Save Changes" : "Create Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
