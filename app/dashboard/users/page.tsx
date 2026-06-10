'use client';

import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { RecruitMemberForm } from '@/components/recruit-member-form';
import { MembersTable } from '@/components/members-table';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function UsersContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRecruitSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
              <p className="text-gray-600 mt-1">
                Recruit and manage team members
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-4">
            Director: {user?.name} ({user?.email})
          </p>
          <p className="text-gray-700">
            Use this page to recruit new team members. Provide their name, email, and a temporary password. They can use these credentials to log in to the system.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recruitment Form - Takes 1/3 of the space */}
          <div className="lg:col-span-1">
            <RecruitMemberForm onSuccess={handleRecruitSuccess} />
          </div>

          {/* Members Table - Takes 2/3 of the space */}
          <div className="lg:col-span-2">
            <MembersTable refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={['director']}>
      <UsersContent />
    </ProtectedRoute>
  );
}
