import toast from 'react-hot-toast';
import Button from './ui/Button.jsx';
import Card from './ui/Card.jsx';
import { copyTextToClipboard } from '../utils/clipboard.js';

export default function GroupMembersCard({ group, isCreator, onRegenerate }) {
  const handleCopyCode = async () => {
    await copyTextToClipboard(group?.groupCode, () => toast.success('Code copied to clipboard'), (message) => toast.error(message));
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Members ({group?.members?.length})</h3>
          <div className="space-y-3">
            {group?.members?.map((member) => (
              <div key={member._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
                  {member.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="text-sm text-slate-900">
                  {member.name}
                  {group.createdBy?._id === member._id && (
                    <span className="ml-2 text-xs text-slate-500">(Creator)</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Group Code</h4>
          <div className="flex gap-2 items-center mb-3">
            <div className="flex-1 bg-slate-100 rounded-lg p-4 text-center">
              <code className="text-2xl font-mono font-bold text-slate-900">{group?.groupCode}</code>
            </div>
            <Button variant="secondary" size="md" onClick={handleCopyCode}>
              Copy
            </Button>
          </div>
          {isCreator && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={onRegenerate}
            >
              Generate New Code
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
