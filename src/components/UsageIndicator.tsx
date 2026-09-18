import React, { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { DollarSign, Trash2 } from 'lucide-react';
import { clearUsage, formatCost, getSessionTotalCost, getSessionTotalTokens, getUsageLog, subscribeUsage } from '@/lib/usageTracking';

const UsageIndicator: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [totals, setTotals] = useState({ tokens: getSessionTotalTokens(), costUsd: getSessionTotalCost() });

  useEffect(() => {
    const refresh = () => setTotals({ tokens: getSessionTotalTokens(), costUsd: getSessionTotalCost() });
    refresh();
    return subscribeUsage(refresh);
  }, []);

  const recentEntries = getUsageLog().slice(-5).reverse();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-socr-darkblue dark:text-gray-200 dark:hover:bg-gray-700 flex items-center gap-1"
          title="Estimated API usage this session"
        >
          <DollarSign className="h-4 w-4" />
          <span className="text-xs">{formatCost(totals.costUsd)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium dark:text-gray-100">Estimated session usage</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Rough cost estimate for your OpenAI/Gemini requests this session. Not an exact bill.
            </p>
          </div>
          <div className="flex justify-between text-sm dark:text-gray-200">
            <span>Total tokens</span>
            <span>{totals.tokens.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm font-medium dark:text-gray-100">
            <span>Estimated cost</span>
            <span>{formatCost(totals.costUsd)}</span>
          </div>

          {recentEntries.length > 0 && (
            <div className="border-t pt-2 dark:border-gray-700 space-y-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Recent requests</p>
              {recentEntries.map((e) => (
                <div key={e.id} className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span className="truncate mr-2">{e.tabSource} · {e.model}</span>
                  <span className="shrink-0">{formatCost(e.costUsd)}</span>
                </div>
              ))}
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center gap-1"
            onClick={() => clearUsage()}
          >
            <Trash2 className="h-3.5 w-3.5" /> Reset usage log
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UsageIndicator;
