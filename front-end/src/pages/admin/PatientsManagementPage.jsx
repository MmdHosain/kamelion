import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, AlertTriangle } from 'lucide-react';
import PatientsList from '../../components/admin/patients/PatientsList';
import UrgentPatientsQueue from '../../components/admin/patients/urgent/UrgentPatientsQueue';
import { useUrgentPatientsStore } from '../../store/urgentPatientsStore';
import { toPersianDigits } from '../../utils/jalaliDateUtils';

export const PatientsManagementPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') === 'urgent' ? 'urgent' : 'all';

  const { urgentCount, fetchUrgentCount } = useUrgentPatientsStore();

  useEffect(() => {
    fetchUrgentCount();
  }, [fetchUrgentCount]);

  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Tab Bar */}
      <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
        <button
          type="button"
          onClick={() => handleTabChange('all')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
            currentTab === 'all'
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'bg-white/80 text-textDark/70 hover:bg-primary/10 hover:text-primary'
          }`}
        >
          <Users size={16} />
          <span>همه بیماران</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('urgent')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
            currentTab === 'urgent'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
              : 'bg-white/80 text-rose-700 hover:bg-rose-50'
          }`}
        >
          <AlertTriangle size={16} />
          <span>صف بیماران اورژانسی</span>
          {urgentCount > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                currentTab === 'urgent'
                  ? 'bg-white text-rose-700'
                  : 'bg-rose-600 text-white animate-pulse'
              }`}
            >
              {toPersianDigits(urgentCount)}
            </span>
          )}
        </button>
      </div>

      {/* Tab Panels */}
      {currentTab === 'urgent' ? <UrgentPatientsQueue /> : <PatientsList />}
    </div>
  );
};

export default PatientsManagementPage;

