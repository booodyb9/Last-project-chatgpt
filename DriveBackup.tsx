import { memo } from 'react';
import { Cloud } from 'lucide-react';

interface DriveBackupProps {
  isBackingUp: boolean;
  accessToken: string | null;
  backupToDrive: () => void;
}

const DriveBackup = memo(({ isBackingUp, accessToken, backupToDrive }: DriveBackupProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
        <Cloud className="w-6 h-6 text-[#0284C7]" />
        نسخة احتياطية للبيانات
      </h2>
      <p className="text-gray-600 mb-8 max-w-lg mx-auto">
        يمكنك أخذ نسخة احتياطية من جميع الرسائل ومحتوى الموقع وحفظها مباشرة على جهازك.
      </p>
      
      {false ? (
        <div className="bg-orange-50 text-orange-800 p-4 rounded-lg mb-6 max-w-lg mx-auto border border-orange-200">
          يرجى تسجيل الخروج وتسجيل الدخول مرة أخرى لمنح صلاحية الوصول إلى Google Drive.
        </div>
      ) : null}
      
      <button
        onClick={backupToDrive}
        disabled={isBackingUp}
        className="inline-flex items-center gap-2 bg-[#0284C7] text-white px-8 py-3 rounded-md hover:bg-[#0369A1] transition-colors font-bold disabled:opacity-50"
      >
        <Cloud className="w-5 h-5" />
        {isBackingUp ? 'جاري النسخ...' : 'إنشاء نسخة احتياطية الآن'}
      </button>
    </div>
  );
});

DriveBackup.displayName = 'DriveBackup';
export default DriveBackup;
