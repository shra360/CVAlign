import React from 'react';
import type { UserProfile } from '../../lib/store';

interface ProfileTemplateProps {
  profile: UserProfile;
}

export const ProfileTemplate: React.FC<ProfileTemplateProps> = ({ profile }) => {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md border border-secondary-200 p-8 space-y-6 overflow-hidden">
      <div className="flex items-center space-x-6">
        <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
          {profile.profileImageUrl ? (
            <img
              src={profile.profileImageUrl}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl text-primary-600 font-bold">{profile.name?.charAt(0) || 'U'}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold text-secondary-900 break-words">{profile.name}</h2>
          <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${profile.role === 'recruiter' ? 'bg-primary-100 text-primary-800' : 'bg-success-100 text-success-800'}`}>{profile.role}</span>
          {profile.location && <p className="text-secondary-600 mt-1 break-words">{profile.location}</p>}
        </div>
      </div>

      {profile.bio && (
        <div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-1">Bio</h3>
          <p className="text-secondary-700 whitespace-pre-line break-words">{profile.bio}</p>
        </div>
      )}

      {profile.role === 'recruiter' && (
        <div className="space-y-2">
          {profile.companyName && (
            <div className="break-words">
              <span className="font-medium text-secondary-700">Company:</span> {profile.companyName}
            </div>
          )}
          {profile.designation && (
            <div className="break-words">
              <span className="font-medium text-secondary-700">Designation:</span> {profile.designation}
            </div>
          )}
          {profile.website && (
            <div className="break-words">
              <span className="font-medium text-secondary-700">Website:</span> <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline break-all">{profile.website}</a>
            </div>
          )}
          {profile.tags && profile.tags.length > 0 && (
            <div>
              <span className="font-medium text-secondary-700">Industries/Expertise:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile.tags.map((tag, idx) => (
                  <span key={idx} className="inline-block px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-xs break-words">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {profile.role === 'candidate' && (
        <div className="space-y-2">
          {profile.skills && profile.skills.length > 0 && (
            <div>
              <span className="font-medium text-secondary-700">Skills:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile.skills.map((skill, idx) => (
                  <span key={idx} className="inline-block px-3 py-1 rounded-full bg-success-100 text-success-800 text-xs break-words">{skill}</span>
                ))}
              </div>
            </div>
          )}
          {profile.tags && profile.tags.length > 0 && (
            <div>
              <span className="font-medium text-secondary-700">Tags:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile.tags.map((tag, idx) => (
                  <span key={idx} className="inline-block px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-xs break-words">{tag}</span>
                ))}
              </div>
            </div>
          )}
          {profile.resumeUrl && (
            <div className="break-words">
              <span className="font-medium text-secondary-700">Resume:</span> <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline break-all">View Resume</a>
            </div>
          )}
        </div>
      )}

      {profile.phone && (
        <div className="break-words">
          <span className="font-medium text-secondary-700">Phone:</span> {profile.phone}
        </div>
      )}

      {profile.education && profile.education.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-1">Education</h3>
          <ul className="list-disc list-inside text-secondary-700 space-y-1">
            {profile.education.map((edu: any, idx: number) => (
              <li key={idx} className="break-words">{typeof edu === 'string' ? edu : `${edu.degree || ''} ${edu.institution ? 'at ' + edu.institution : ''}`}</li>
            ))}
          </ul>
        </div>
      )}

      {profile.experience && profile.experience.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-1">Experience</h3>
          <ul className="list-disc list-inside text-secondary-700 space-y-1">
            {profile.experience.map((exp: any, idx: number) => (
              <li key={idx} className="break-words">{typeof exp === 'string' ? exp : `${exp.title || ''} ${exp.company ? 'at ' + exp.company : ''}`}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 