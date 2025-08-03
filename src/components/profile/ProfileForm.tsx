import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validateInput, sanitizeInput } from '@/utils/securityValidation';
import { useRateLimit } from '@/hooks/useRateLimit';
import { toast } from '@/components/ui/use-toast';
import { User, Phone, MapPin, AlertTriangle } from 'lucide-react';
import backend from '~backend/client';
import type { User as UserType } from '~backend/dapoer/api';

interface ProfileData {
  full_name: string;
  phone: string;
  address: string;
}

export const ProfileForm = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [user, setUser] = useState<UserType | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    phone: '',
    address: ''
  });
  
  const { checkRateLimit, getRemainingAttempts } = useRateLimit(10, 300000);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      // Assuming user with ID 1 is the logged in user since we removed auth
      const { user } = await backend.dapoer.getUser({ id: 1 });
      if (user) {
        setUser(user);
        setProfileData({
          full_name: user.full_name || '',
          phone: user.phone || '',
          address: user.address || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    if (!validateInput(profileData.full_name, 'name')) {
      newErrors.push('Please enter a valid full name (letters, spaces, hyphens, and dots only)');
    }
    if (profileData.phone && !validateInput(profileData.phone, 'phone')) {
      newErrors.push('Please enter a valid phone number');
    }
    if (profileData.address && !validateInput(profileData.address, 'text')) {
      newErrors.push('Please enter a valid address');
    }
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const rateLimitKey = `profile_update_${user.id}`;
    if (!checkRateLimit(rateLimitKey)) {
      setErrors(['Too many update attempts. Please try again later.']);
      return;
    }

    if (!validateForm()) return;

    setSaving(true);
    setErrors([]);

    try {
      const sanitizedData = {
        full_name: sanitizeInput(profileData.full_name),
        phone: sanitizeInput(profileData.phone),
        address: sanitizeInput(profileData.address)
      };

      await backend.dapoer.updateUser({
        id: user.id,
        ...sanitizedData
      });

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setProfileData(sanitizedData);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors(['An unexpected error occurred. Please try again.']);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    const maxLengths = {
      full_name: 100,
      phone: 20,
      address: 500
    };
    if (value.length > maxLengths[field]) return;
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const remainingAttempts = getRemainingAttempts(`profile_update_${user?.id}`);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          Profile Information
        </CardTitle>
        <CardDescription>
          Update your personal information and contact details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              type="text"
              value={profileData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Enter your full name"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                value={profileData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
                className="pl-10"
                maxLength={20}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="address"
                value={profileData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your address"
                className="pl-10 min-h-[100px]"
                maxLength={500}
              />
            </div>
          </div>

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc pl-4 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {remainingAttempts < 10 && remainingAttempts > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {remainingAttempts} update{remainingAttempts !== 1 ? 's' : ''} remaining in this session
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={saving || remainingAttempts === 0}
            className="w-full"
          >
            {saving ? 'Saving...' : 'Update Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
