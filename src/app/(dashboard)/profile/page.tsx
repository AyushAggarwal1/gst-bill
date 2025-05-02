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
  firmName: z.string().min(1, "Firm name is required"),
  address: z.string().min(1, "Address is required"),
  gstNo: z.string().min(15, "GST No. must be 15 characters").max(15, "GST No. must be 15 characters"),
  bankName: z.string().min(1, "Bank name is required"),
  accountNo: z.string().min(1, "Account number is required"),
  ifscCode: z.string().min(1, "IFSC code is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firmName: "",
      address: "",
      gstNo: "",
      bankName: "",
      accountNo: "",
      ifscCode: "",
    },
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/user/profile");
        
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        
        reset({
          firmName: data.user.firmName || "",
          address: data.user.address || "",
          gstNo: data.user.gstNo || "",
          bankName: data.user.bankName || "",
          accountNo: data.user.accountNo || "",
          ifscCode: data.user.ifscCode || "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile data");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchUserProfile();
  }, [reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      setError("");
      setSuccess("");
      setIsLoading(true);

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      setSuccess("Profile updated successfully!");
      router.refresh();
    } catch (error: any) {
      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="text-center py-10">
        <p>Loading profile data...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Business Details
          </h2>
          <p className="text-gray-600 text-sm">
            These details will appear on your GST bills.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Firm Name"
              {...register("firmName")}
              error={errors.firmName?.message}
              disabled={isLoading}
            />

            <Input
              label="GST Number"
              {...register("gstNo")}
              error={errors.gstNo?.message}
              disabled={isLoading}
            />

            <div className="md:col-span-2">
              <Input
                label="Address"
                {...register("address")}
                error={errors.address?.message}
                disabled={isLoading}
              />
            </div>

            <Input
              label="Bank Name"
              {...register("bankName")}
              error={errors.bankName?.message}
              disabled={isLoading}
            />

            <Input
              label="Account Number"
              {...register("accountNo")}
              error={errors.accountNo?.message}
              disabled={isLoading}
            />

            <Input
              label="IFSC Code"
              {...register("ifscCode")}
              error={errors.ifscCode?.message}
              disabled={isLoading}
            />
          </div>

          <FormError message={error} />
          <FormSuccess message={success} />

          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 