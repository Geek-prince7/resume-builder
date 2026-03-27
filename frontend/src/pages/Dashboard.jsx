import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useUser } from '../context/UserContext';
import { getUser, getJobDescriptions } from '../api';

export default function Dashboard() {
  const { userId } = useUser();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [jds, setJds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    Promise.all([getUser(userId), getJobDescriptions(userId)])
      .then(([userRes, jdRes]) => {
        setUser(userRes.data);
        setJds(jdRes.data);
      })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to ResumeAI</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Build tailored resumes powered by AI. Start by creating your profile with your
          professional details.
        </p>
        <Link
          to="/profile"
          className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Create Your Profile
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name || 'User'}
          </h1>
          <p className="text-gray-500 mt-1">{user?.email}</p>
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

      {user && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Experience:</span>{' '}
              <span className="font-medium">
                {user.totalExperience?.years || 0}y {user.totalExperience?.months || 0}m
              </span>
            </div>
            <div>
              <span className="text-gray-500">Skills:</span>{' '}
              <span className="font-medium">{user.skills?.length || 0} listed</span>
            </div>
            <div>
              <span className="text-gray-500">Experiences:</span>{' '}
              <span className="font-medium">{user.experiences?.length || 0} positions</span>
            </div>
          </div>
        </div>
      )}

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
