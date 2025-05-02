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
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  gstNo: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Customer = {
  id: string;
  name: string;
  address: string;
  gstNo: string | null;
};

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditCustomerPage({ params }: PageProps) {
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
      address: "",
      gstNo: "",
    },
  });

  useEffect(() => {
    const customerId = params.id;
    
    const fetchCustomer = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/customers/${customerId}`);
        
        if (!response.ok) {
          setError("Failed to load customer");
          return;
        }

        const data = await response.json();
        
        reset({
          name: data.customer.name,
          address: data.customer.address,
          gstNo: data.customer.gstNo || "",
        });
      } catch (error) {
        console.error("Error fetching customer:", error);
        setError("Failed to load customer data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();
  }, [params.id, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      setError("");
      setSuccess("");
      setIsSubmitting(true);
      
      const customerId = params.id;

      const response = await fetch(`/api/customers/${customerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update customer");
      }

      setSuccess("Customer updated successfully!");
      
      setTimeout(() => {
        router.push("/customers");
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
        <p>Loading customer data...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Customer</h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <Input
              label="Customer Name"
              {...register("name")}
              error={errors.name?.message}
              disabled={isSubmitting}
            />

            <Input
              label="Address"
              {...register("address")}
              error={errors.address?.message}
              disabled={isSubmitting}
            />

            <Input
              label="GST Number (optional)"
              {...register("gstNo")}
              error={errors.gstNo?.message}
              disabled={isSubmitting}
            />
          </div>

          <FormError message={error} />
          <FormSuccess message={success} />

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/customers")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Update Customer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 