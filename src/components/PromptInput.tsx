
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PromptInputProps {
  placeholder?: string;
  demoPrompts?: { value: string; label: string }[];
  onSubmit: (prompt: string) => void;
  buttonText?: string;
  rows?: number;
  selectLabel?: string;
}

const PromptInput: React.FC<PromptInputProps> = ({
  placeholder = 'Enter your prompt here...',
  demoPrompts = [],
  onSubmit,
  buttonText = 'Submit',
  rows = 4,
  selectLabel = 'Select example prompt'
}) => {
  const [prompt, setPrompt] = useState('');

  const handleSelectChange = (value: string) => {
    // Find the selected demo prompt
    const selected = demoPrompts.find(item => item.value === value);
    if (selected) {
      setPrompt(selected.label);
    }
  };

  const handleSubmit = () => {
    if (prompt.trim()) {
      onSubmit(prompt);
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-none"
      />
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          {demoPrompts.length > 0 && (
            <Select onValueChange={handleSelectChange}>
              <SelectTrigger>
                <SelectValue placeholder={selectLabel} />
              </SelectTrigger>
              <SelectContent>
                {demoPrompts.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <Button 
          onClick={handleSubmit} 
          className="bg-socr-blue hover:bg-socr-darkblue"
          disabled={!prompt.trim()}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export default PromptInput;
