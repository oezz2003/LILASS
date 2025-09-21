import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

type CoverageProduct = { id: string; name: string; category: string; coverage: number; status: "in" | "out" };
type ForecastProduct = { id: string; name: string; forecastUnits: number };
type RecipeRow = { ingredientId: string; name: string; unit: string; amountPerUnit: number; inStock: number; missing: number };

export default function Stock() {
  const [selected, setSelected] = useState<string | null>(null);
  const [autoOrder, setAutoOrder] = useState(false);
  const qc = useQueryClient();

  const coverageQuery = useQuery({
    queryKey: ["stock-coverage"],
    queryFn: async () => {
      const res = await fetch(`/api/stock/products-coverage`);
      if (!res.ok) throw new Error("Failed to load coverage");
      return (await res.json()) as { products: CoverageProduct[] };
    },
  });

  const forecastQuery = useQuery({
    queryKey: ["stock-forecast", "1d"],
    queryFn: async () => {
      const res = await fetch(`/api/stock/forecast?horizon=1d`);
      if (!res.ok) throw new Error("Failed to load forecast");
      return (await res.json()) as { products: ForecastProduct[] };
    },
  });

  const recipeQuery = useQuery({
    enabled: !!selected,
    queryKey: ["stock-recipe", selected],
    queryFn: async () => {
      const res = await fetch(`/api/stock/product/${selected}/recipe`);
      if (!res.ok) throw new Error("Failed to load recipe");
      return (await res.json()) as { productId: string; variantId: string; recipe: RecipeRow[] };
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ ingredientId, quantity }: { ingredientId: string; quantity: number }) => {
      const res = await fetch(`/api/stock/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredientId, quantity }),
      });
      if (!res.ok) throw new Error("Failed to reorder");
      return res.json();
    },
    onSuccess: async () => {
      toast({ title: "Reordered", description: "Stock updated" });
      await qc.invalidateQueries({ queryKey: ["stock-recipe"] });
      await qc.invalidateQueries({ queryKey: ["stock-coverage"] });
    },
    onError: (e) => toast({ title: "Order failed", description: String(e) }),
  });

  const products = coverageQuery.data?.products ?? [];
  const selectedProduct = products.find((p) => p.id === selected) ?? null;
  const recipeRows = recipeQuery.data?.recipe ?? [];
  const readinessCards = (forecastQuery.data?.products ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    category: products.find((x) => x.id === p.id)?.category ?? "",
    required: p.forecastUnits,
  }));

  return (
    <DashboardLayout title="Stock Management">
      {/* Tomorrow readiness cards (Required only) */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {readinessCards.map((it) => (
          <Card key={it.id}>
            <CardHeader>
              <CardTitle className="text-base">{it.name}</CardTitle>
              <CardDescription>Required for tomorrow</CardDescription>
            </CardHeader>
            <CardContent className="flex items-end justify-between">
              <div className="text-2xl font-semibold text-primary">{it.required}</div>
              <Badge variant="secondary">{it.category}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Product cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => {
          const cover = p.coverage;
          return (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle className="text-base">{p.name} Coverage</CardTitle>
                <CardDescription>{p.category}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-end justify-between">
                <div className="text-2xl font-semibold">{cover}</div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelected(p.id)}
                >
                  Details
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Products table */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>Full-width inventory status</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Coverage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => {
                  const cover = p.coverage;
                  const inStock = cover > 0;
                  return (
                    <TableRow
                      key={p.id}
                      className="cursor-pointer"
                      onClick={() => setSelected(p.id)}
                    >
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell>{cover}</TableCell>
                      <TableCell>
                        {inStock ? (
                          <Badge className="bg-emerald-600">In Stock</Badge>
                        ) : (
                          <Badge className="bg-rose-600">Out</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!inStock ? (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(p.id);
                            }}
                          >
                            View Raw Materials
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Details
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableCaption>
                Click any row to see required raw materials.
              </TableCaption>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Raw materials below products */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Raw Materials</CardTitle>
            <CardDescription>
              {selectedProduct
                ? selectedProduct.name
                : "Select a product to view its recipe"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedProduct ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-muted-foreground">
                    Auto-order missing
                  </div>
                  <Switch checked={autoOrder} onCheckedChange={setAutoOrder} />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead>In Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recipeQuery.isLoading && (
                      <TableRow>
                        <TableCell colSpan={5}>Loading…</TableCell>
                      </TableRow>
                    )}
                    {!recipeQuery.isLoading && recipeRows.map((row) => {
                      const isMissing = row.missing > 0;
                      return (
                        <TableRow key={row.ingredientId}>
                          <TableCell className="font-medium">{row.name}</TableCell>
                          <TableCell>
                            {row.amountPerUnit} {row.unit}
                          </TableCell>
                          <TableCell>
                            {row.inStock} {row.unit}
                          </TableCell>
                          <TableCell>
                            {isMissing ? (
                              <Badge className="bg-amber-600">Missing</Badge>
                            ) : (
                              <Badge className="bg-emerald-600">OK</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {isMissing ? (
                              <Button
                                size="sm"
                                onClick={() =>
                                  reorderMutation.mutate({ ingredientId: row.ingredientId, quantity: row.missing })
                                }
                              >
                                Order Now
                              </Button>
                            ) : (
                              <Button size="sm" variant="secondary" disabled>
                                Ready
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                No product selected.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
