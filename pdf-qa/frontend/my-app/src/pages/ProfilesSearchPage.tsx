import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getUsers } from '../lib/firebase';
import type { UserProfile } from '../lib/store';
import { ProfileTemplate } from '../components/profile/ProfileTemplate';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ProfilesSearchPage() {
  console.log('ProfilesSearchPage mounted');
  const query = useQuery();
  const navigate = useNavigate();
  const search = query.get('search') || '';
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        // Fetch all users (could be optimized with backend search)
        const users = (await getUsers({})) as UserProfile[];
        console.log('Fetched users:', users);
        const validUsers = users.filter(u => u && u.name && u.role);
        console.log('Valid users:', validUsers);
        const term = search.toLowerCase();
        const filtered = validUsers.filter((u: UserProfile) =>
          u.name.toLowerCase().includes(term) ||
          (u.tags && u.tags.some(tag => tag.toLowerCase().includes(term))) ||
          (u.skills && u.skills.some(skill => skill.toLowerCase().includes(term))) ||
          (u.companyName && u.companyName.toLowerCase().includes(term))
        );
        console.log('Filtered users:', filtered);
        setProfiles(filtered);
      } catch (e) {
        console.error('Error fetching users:', e);
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    };
    if (search) fetchProfiles();
    else setProfiles([]);
  }, [search]);

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold text-secondary-900 mb-2">Profile Search Results</h1>
      <p className="text-secondary-600 mb-4">{profiles.length} profile{profiles.length !== 1 ? 's' : ''} found for "{search}"</p>
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-secondary-600">Loading profiles...</p>
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-12 text-secondary-600">No profiles found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {profiles.map(profile => (
            <div
              key={profile.id}
              className="bg-white border border-secondary-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md cursor-pointer transition"
              onClick={() => setSelectedProfile(profile)}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                  {profile.profileImageUrl ? (
                    <img src={profile.profileImageUrl} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl text-primary-600 font-bold">{profile.name?.charAt(0) || 'U'}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-900">{profile.name}</h3>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${profile.role === 'recruiter' ? 'bg-primary-100 text-primary-800' : 'bg-success-100 text-success-800'}`}>{profile.role}</span>
                  <div className="text-xs text-secondary-600 mt-1">
                    {profile.role === 'recruiter' && profile.companyName && <span>Company: {profile.companyName}</span>}
                    {profile.role === 'candidate' && profile.skills && profile.skills.length > 0 && <span>Skill: {profile.skills[0]}</span>}
                  </div>
                </div>
              </div>
              <button className="ml-4 text-primary-600 hover:underline text-sm" onClick={e => { e.stopPropagation(); setSelectedProfile(profile); }}>View</button>
            </div>
          ))}
        </div>
      )}
      {/* Modal for full profile */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
            <button className="absolute top-2 right-2 text-secondary-500 hover:text-secondary-900" onClick={() => setSelectedProfile(null)}>&times;</button>
            <ProfileTemplate profile={selectedProfile} />
          </div>
        </div>
      )}
    </div>
  );
} 