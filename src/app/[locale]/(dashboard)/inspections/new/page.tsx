'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

const ROOF_TYPES = [
  'Asphalt Shingle',
  'Metal',
  'Tile',
  'Wood Shake',
  'Flat',
  'Modified Bitumen',
  'Built-Up',
  'Synthetic',
] as const;

export default function NewInspectionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    roofType: 'Asphalt Shingle',
    inspectorName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.address.trim()) {
      toast.error('Please enter a property address');
      return;
    }

    if (!formData.inspectorName.trim()) {
      toast.error('Please enter the inspector name');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/inspections/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create inspection');
      }

      const data = await response.json();

      toast.success('Inspection created successfully');
      router.push(`/inspections/${data.id}/capture`);
    } catch (error) {
      console.error('Error creating inspection:', error);
      toast.error('Failed to create inspection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-2xl px-4">
      <h1 className="text-3xl font-bold mb-2">New Roof Inspection</h1>
      <p className="text-muted-foreground mb-6">
        Enter property details to start a new roof inspection
      </p>

      <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="address">Property Address *</Label>
            <Input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="123 Roof St, City, State ZIP"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roofType">Roof Type *</Label>
            <select
              id="roofType"
              value={formData.roofType}
              onChange={(e) =>
                setFormData({ ...formData, roofType: e.target.value })
              }
              disabled={isLoading}
              className="w-full p-2 border border-border rounded-md bg-background"
              required
            >
              {ROOF_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inspectorName">Inspector Name *</Label>
            <Input
              id="inspectorName"
              type="text"
              value={formData.inspectorName}
              onChange={(e) =>
                setFormData({ ...formData, inspectorName: e.target.value })
              }
              placeholder="John Doe"
              disabled={isLoading}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Start Photo Checklist'}
          </Button>
        </form>
      </div>
    </div>
  );
}
