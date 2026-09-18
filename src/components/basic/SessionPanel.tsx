import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Save, History, Trash2 } from 'lucide-react';
import { GenerateSessionData, SavedSession, listSessions, deleteSession } from '@/lib/sessionHistory';

interface SessionPanelProps {
  onSave: (name: string) => void;
  onLoad: (data: GenerateSessionData) => void;
  hasResult: boolean;
}

const SessionPanel: React.FC<SessionPanelProps> = ({ onSave, onLoad, hasResult }) => {
  const [saveName, setSaveName] = useState('');
  const [saveOpen, setSaveOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sessions, setSessions] = useState<SavedSession[]>([]);

  const openHistory = (open: boolean) => {
    setHistoryOpen(open);
    if (open) setSessions(listSessions());
  };

  const handleSave = () => {
    onSave(saveName);
    setSaveName('');
    setSaveOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteSession(id);
    setSessions(listSessions());
  };

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardContent className="p-4 flex gap-2">
        <Popover open={saveOpen} onOpenChange={setSaveOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1 flex items-center gap-1 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" disabled={!hasResult}>
              <Save className="h-4 w-4" /> Save Session
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 space-y-2">
            <p className="text-sm font-medium dark:text-gray-200">Name this session</p>
            <Input
              placeholder="e.g. Mtcars regression demo"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <Button size="sm" className="w-full" onClick={handleSave}>Save</Button>
          </PopoverContent>
        </Popover>

        <Popover open={historyOpen} onOpenChange={openHistory}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1 flex items-center gap-1 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
              <History className="h-4 w-4" /> Restore Session
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 max-h-80 overflow-y-auto space-y-2">
            <p className="text-sm font-medium dark:text-gray-200">Saved sessions</p>
            {sessions.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">No saved sessions yet.</p>
            )}
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-2 border rounded-md p-2 dark:border-gray-700">
                <button
                  className="text-left flex-1 min-w-0"
                  onClick={() => { onLoad(s.data); setHistoryOpen(false); }}
                >
                  <p className="text-sm font-medium truncate dark:text-gray-100">{s.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(s.createdAt).toLocaleString()}
                  </p>
                </button>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleDelete(s.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </PopoverContent>
        </Popover>
      </CardContent>
    </Card>
  );
};

export default SessionPanel;
