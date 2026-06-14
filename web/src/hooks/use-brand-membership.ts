import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { Membership } from "@/types/brand-memberships";

export const useBrandMembership = (targetBrandId?: string) => {
    const { user } = useAuth();
    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!user?.id) {
            setIsLoading(false);
            return;
        }

        const fetchMemberships = async () => {
            try {
                setIsLoading(true);
                const token = localStorage.getItem("token");

                const response = await fetch(
                    `/api/v1/users/${user.id}/brand_memberships`,
                    {
                        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                    }
                );

                if (!response.ok) throw new Error("Fetch error");
                const data = await response.json();

                setMemberships(data);
            } catch (err) {
                setError(err instanceof Error ? err : new Error("Unknown error"));
            } finally {
                setIsLoading(false);
            }
        };

        fetchMemberships();
    }, [user?.id]);

    const isAnyBrandManager = memberships.some(
        (m) => m.role === 'admin' || m.role === 'owner'
    );

    const isCurrentBrandManager = targetBrandId
        ? memberships.some(
            (m) => m.brand_id === Number(targetBrandId) && (m.role === 'admin' || m.role === 'owner')
        )
        : false;

    return {
        memberships,
        isLoading,
        error,
        isAnyBrandManager,
        isCurrentBrandManager
    };
};