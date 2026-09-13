import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Property, PropertyInput } from "@/lib/properties-api";

const PROPERTY_TYPES = ["Apartment", "Villa", "Independent House"];
const STATUSES = ["Available", "Sold"];

const empty: PropertyInput = {
  property_name: "",
  location: "",
  price: "",
  property_type: "Apartment",
  status: "Available",
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Property | null;
  saving: boolean;
  onSubmit: (values: PropertyInput) => void;
}

export function PropertyFormDialog({ open, onOpenChange, editing, saving, onSubmit }: Props) {
  const [values, setValues] = useState<PropertyInput>(empty);

  useEffect(() => {
    if (!open) return;
    setValues(
      editing
        ? {
            property_name: editing.PROPERTY_NAME,
            location: editing.LOCATION,
            price: String(editing.PRICE ?? ""),
            property_type: PROPERTY_TYPES.includes(editing.PROPERTY_TYPE)
              ? editing.PROPERTY_TYPE
              : "Apartment",
            status: STATUSES.includes(editing.STATUS) ? editing.STATUS : "Available",
          }
        : empty,
    );
  }, [open, editing]);

  const valid =
    values.property_name.trim() && values.location.trim() && Number(values.price) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit property" : "Add property"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update the details of this listing."
              : "Enter the details of the new listing."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid || saving) return;
            onSubmit({
              ...values,
              property_name: values.property_name.trim(),
              location: values.location.trim(),
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="property_name">Property name</Label>
            <Input
              id="property_name"
              value={values.property_name}
              onChange={(e) => setValues((v) => ({ ...v, property_name: e.target.value }))}
              placeholder="Sunrise Residency"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={values.location}
                onChange={(e) => setValues((v) => ({ ...v, location: e.target.value }))}
                placeholder="Chennai"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                min="1"
                value={values.price}
                onChange={(e) => setValues((v) => ({ ...v, price: e.target.value }))}
                placeholder="7500000"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Property type</Label>
              <Select
                value={values.property_type}
                onValueChange={(val) => setValues((v) => ({ ...v, property_type: val }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={values.status}
                onValueChange={(val) => setValues((v) => ({ ...v, status: val }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!valid || saving}>
              {saving ? "Saving..." : editing ? "Save changes" : "Add property"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
