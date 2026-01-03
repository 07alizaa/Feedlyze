// src/pages/settings/Settings.jsx
import { useState, useEffect } from 'react';
import {
  User,
  Building2,
  Shield,
  CreditCard,
  Plug,
  Save,
  Eye,
  EyeOff,
  LogOut,
  Camera,
} from 'lucide-react';
import { Card, Button, Input, Select } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import toast from 'react-hot-toast';

const INDUSTRIES = [
  { value: 'restaurant', label: 'Restaurant / Food Service' },
  { value: 'retail', label: 'Retail' },
  { value: 'hotel', label: 'Hotel / Hospitality' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'other', label: 'Other' },
];

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'business', label: 'Business', icon: Building2 },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'integrations', label: 'Integrations', icon: Plug },
];

const Settings = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [_loading, _setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    email: '',
    phone: '',
    timezone: 'UTC',
  });

  // Business form
  const [businessForm, setBusinessForm] = useState({
    business_name: '',
    industry: '',
    website: '',
  });

  // Security form
  const [securityForm, setSecurityForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        email: user.email || '',
        phone: user.phone || '',
        timezone: user.timezone || 'UTC',
      });
      setBusinessForm({
        business_name: user.business_name || '',
        industry: user.industry || '',
        website: user.website || '',
      });
    }
  }, [user]);

  const handleProfileSave = async () => {
    try {
      setSaving(true);
      await api.put('/auth/profile', profileForm);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleBusinessSave = async () => {
    try {
      setSaving(true);
      await api.put('/auth/profile', businessForm);
      toast.success('Business details updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update business details');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    // Validation
    if (!securityForm.current_password) {
      toast.error('Please enter your current password');
      return;
    }
    if (securityForm.new_password.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (securityForm.new_password !== securityForm.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setSaving(true);
      await api.put('/auth/change-password', {
        currentPassword: securityForm.current_password,
        newPassword: securityForm.new_password,
      });
      toast.success('Password changed successfully');
      setSecurityForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!confirm('Are you sure you want to logout from all devices?')) return;
    
    toast.success('Logged out from all devices');
    logout();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            {/* Profile Photo */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary-600">
                    {user?.business_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-light-200 hover:bg-light-50">
                  <Camera className="w-4 h-4 text-dark-600" />
                </button>
              </div>
              <div>
                <h3 className="font-semibold text-dark-900">{user?.business_name}</h3>
                <p className="text-dark-500">{user?.email}</p>
              </div>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  disabled
                />
                <p className="text-xs text-dark-400 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Timezone
                </label>
                <Select
                  value={profileForm.timezone}
                  onChange={(e) => setProfileForm({ ...profileForm, timezone: e.target.value })}
                  options={[
                    { value: 'UTC', label: 'UTC' },
                    { value: 'America/New_York', label: 'Eastern Time' },
                    { value: 'America/Chicago', label: 'Central Time' },
                    { value: 'America/Denver', label: 'Mountain Time' },
                    { value: 'America/Los_Angeles', label: 'Pacific Time' },
                    { value: 'Europe/London', label: 'London' },
                    { value: 'Asia/Tokyo', label: 'Tokyo' },
                  ]}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-light-200">
              <Button onClick={handleProfileSave} loading={saving} icon={Save}>
                Save Changes
              </Button>
            </div>
          </div>
        );

      case 'business':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Business Name
                </label>
                <Input
                  value={businessForm.business_name}
                  onChange={(e) => setBusinessForm({ ...businessForm, business_name: e.target.value })}
                  placeholder="Your Business Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Industry
                </label>
                <Select
                  value={businessForm.industry}
                  onChange={(e) => setBusinessForm({ ...businessForm, industry: e.target.value })}
                  options={[
                    { value: '', label: 'Select industry...' },
                    ...INDUSTRIES,
                  ]}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Website URL
                </label>
                <Input
                  type="url"
                  value={businessForm.website}
                  onChange={(e) => setBusinessForm({ ...businessForm, website: e.target.value })}
                  placeholder="https://yourbusiness.com"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-light-200">
              <Button onClick={handleBusinessSave} loading={saving} icon={Save}>
                Save Changes
              </Button>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-dark-900 mb-4">Change Password</h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={securityForm.current_password}
                      onChange={(e) => setSecurityForm({ ...securityForm, current_password: e.target.value })}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
                    >
                      {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={securityForm.new_password}
                      onChange={(e) => setSecurityForm({ ...securityForm, new_password: e.target.value })}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
                    >
                      {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-dark-400 mt-1">
                    Minimum 8 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={securityForm.confirm_password}
                      onChange={(e) => setSecurityForm({ ...securityForm, confirm_password: e.target.value })}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button onClick={handlePasswordChange} loading={saving}>
                  Update Password
                </Button>
              </div>
            </div>

            <div className="pt-6 border-t border-light-200">
              <h3 className="font-medium text-dark-900 mb-4">Sessions</h3>
              <p className="text-dark-500 text-sm mb-4">
                Log out from all devices including this one. You'll need to log in again.
              </p>
              <Button variant="danger" icon={LogOut} onClick={handleLogoutAll}>
                Logout All Devices
              </Button>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <div className="p-6 bg-primary-50 rounded-xl border border-primary-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-primary-700">Free Plan</h3>
                  <p className="text-sm text-primary-600 mt-1">
                    You're currently on the free plan
                  </p>
                </div>
                <Button>Upgrade to Pro</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <h4 className="font-medium text-dark-700 mb-1">Surveys</h4>
                <p className="text-2xl font-bold text-dark-900">5 / 10</p>
                <p className="text-sm text-dark-500">surveys created</p>
              </Card>
              <Card>
                <h4 className="font-medium text-dark-700 mb-1">Responses</h4>
                <p className="text-2xl font-bold text-dark-900">247 / 500</p>
                <p className="text-sm text-dark-500">this month</p>
              </Card>
              <Card>
                <h4 className="font-medium text-dark-700 mb-1">AI Requests</h4>
                <p className="text-2xl font-bold text-dark-900">15 / 50</p>
                <p className="text-sm text-dark-500">this month</p>
              </Card>
            </div>

            <div className="p-4 bg-light-100 rounded-xl text-center">
              <p className="text-dark-500">
                Billing features coming soon. Stay tuned for Pro and Enterprise plans!
              </p>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-light-100 rounded-xl text-center">
              <Plug className="w-12 h-12 text-dark-300 mx-auto mb-3" />
              <h3 className="font-medium text-dark-700 mb-2">Integrations Coming Soon</h3>
              <p className="text-dark-500 text-sm">
                We're working on integrations with Slack, Zapier, Google Sheets, and more.
                Check back soon!
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-900">Settings</h1>
        <p className="text-dark-500 mt-1">
          Manage your account and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <Card padding={false}>
            <nav className="p-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-dark-600 hover:bg-light-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1">
          <Card>
            {renderTabContent()}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
