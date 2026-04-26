import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useUser } from '../context/UserContext';
import { getUser, getJobDescriptions } from '../api';
import AdSlot from '../components/AdSlot';

export default function Dashboard() {
  const { user: authUser } = useUser();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [jds, setJds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUser(), getJobDescriptions()])
      .then(([userRes, jdRes]) => {
        setProfile(userRes.data);
        setJds(jdRes.data);
      })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {profile?.name || authUser?.name || 'User'}
          </h1>
          <p className="text-gray-500 mt-1">{profile?.email}</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/profile"
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Edit Profile
          </Link>
          <Link
            to="/generate"
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Generate Resume
          </Link>
        </div>
      </div>

      {profile && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Experience:</span>{' '}
              <span className="font-medium">
                {profile.totalExperience?.years || 0}y {profile.totalExperience?.months || 0}m
              </span>
            </div>
            <div>
              <span className="text-gray-500">Skills:</span>{' '}
              <span className="font-medium">{profile.skills?.length || 0} listed</span>
            </div>
            <div>
              <span className="text-gray-500">Experiences:</span>{' '}
              <span className="font-medium">{profile.experiences?.length || 0} positions</span>
            </div>
          </div>
        </div>
      )}

      <AdSlot
        slot={import.meta.env.VITE_ADSENSE_SLOT_DASHBOARD}
        className="bg-white rounded-lg border border-gray-200 p-2 mb-8"
        minHeight={120}
      />

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Job Descriptions</h2>
        {jds.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 mb-4">No job descriptions yet.</p>
            <button
              onClick={() => navigate('/generate')}
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
            >
              Generate your first tailored resume
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {jds.map((jd) => (
              <div
                key={jd._id}
                className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {jd.role || 'Untitled Role'}
                    {jd.company ? ` at ${jd.company}` : ''}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {jd.generatedResumes?.length || 0} resume(s) generated &middot;{' '}
                    <span
                      className={`capitalize ${
                        jd.status === 'processed'
                          ? 'text-green-600'
                          : jd.status === 'failed'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                      }`}
                    >
                      {jd.status}
                    </span>
                  </p>
                </div>
                {jd.generatedResumes?.length > 0 && (
                  <Link
                    to={`/resume/${jd._id}`}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    View Resume
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
