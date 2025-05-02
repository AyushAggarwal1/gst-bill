"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/ui/FormError";
import { FormSuccess } from "@/components/ui/FormSuccess";

const formSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  hsnCode: z.string().min(1, "HSN code is required"),
  gstPercentage: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 28,
    { message: "GST percentage must be a number between 0 and 28" }
  ),
});

type FormValues = z.infer<typeof formSchema>;

type Item = {
  id: string;
  name: string;
  hsnCode: string;
  gstPercentage: number;
};

export default function EditItemPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      hsnCode: "",
      gstPercentage: "",
    },
  });

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/items/${params.id}`);
        
        if (!response.ok) {
          setError("Failed to load item");
          return;
        }

        const data = await response.json();
        
        reset({
          name: data.item.name,
          hsnCode: data.item.hsnCode,
          gstPercentage: data.item.gstPercentage.toString(),
        });
      } catch (error) {
        console.error("Error fetching item:", error);
        setError("Failed to load item data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [params.id, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      setError("");
      setSuccess("");
      setIsSubmitting(true);

      const response = await fetch(`/api/items/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update item");
      }

      setSuccess("Item updated successfully!");
      
      setTimeout(() => {
        router.push("/items");
        router.refresh();
      }, 1500);
    } catch (error: any) {
      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p>Loading item data...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Item</h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <Input
              label="Item Name"
              {...register("name")}
              error={errors.name?.message}
              disabled={isSubmitting}
            />

            <Input
              label="HSN Code"
              {...register("hsnCode")}
              error={errors.hsnCode?.message}
              disabled={isSubmitting}
            />

            <Input
              label="GST Percentage (%)"
              type="number"
              min="0"
              max="28"
              step="0.01"
              {...register("gstPercentage")}
              error={errors.gstPercentage?.message}
              disabled={isSubmitting}
            />
          </div>

          <FormError message={error} />
          <FormSuccess message={success} />

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/items")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Update Item
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 